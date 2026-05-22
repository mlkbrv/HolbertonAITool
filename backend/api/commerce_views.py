from decimal import Decimal

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .cart_utils import CART_SESSION_COOKIE, cart_item_count, get_or_create_cart, get_user_plan
from .models import Cart, CartItem, GiftSet, Order, OrderItem, SubscriptionPlan, UserProfile
from .serializers import (
    CartItemSerializer,
    CartSerializer,
    LoginSerializer,
    MeSerializer,
    OrderSerializer,
    RegisterSerializer,
    SubscriptionPlanSerializer,
    UserSerializer,
)


def _cart_response(cart):
    items = cart.items.select_related('gift_set', 'gift_set__category').all()
    total = sum(item.gift_set.price * item.quantity for item in items)
    return {
        'items': CartItemSerializer(items, many=True).data,
        'total': total,
        'item_count': items.count(),
    }


def _me_response(user):
    profile, _ = UserProfile.objects.select_related('plan').get_or_create(user=user)
    if not profile.plan_id:
        free = SubscriptionPlan.objects.filter(slug='free').first()
        if free:
            profile.plan = free
            profile.save(update_fields=['plan'])
    return {
        'user': UserSerializer(user).data,
        'plan': SubscriptionPlanSerializer(profile.plan).data if profile.plan else None,
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        if User.objects.filter(username=email).exists():
            return Response({'detail': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        name = serializer.validated_data.get('name', '')
        user = User.objects.create_user(
            username=email,
            email=email,
            password=serializer.validated_data['password'],
            first_name=name,
        )
        free = SubscriptionPlan.objects.filter(slug='free').first()
        UserProfile.objects.create(user=user, plan=free)
        login(request, user)
        return Response(_me_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()
        user = authenticate(
            request,
            username=email,
            password=serializer.validated_data['password'],
        )
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response(_me_response(user))


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Logged out'})


class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            free = SubscriptionPlan.objects.filter(slug='free').first()
            return Response({
                'user': None,
                'plan': SubscriptionPlanSerializer(free).data if free else None,
            })
        return Response(_me_response(request.user))


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart, new_session = get_or_create_cart(request)
        data = _cart_response(cart)
        response = Response(CartSerializer(data).data)
        if new_session:
            response.set_cookie(CART_SESSION_COOKIE, cart.session_key, max_age=60 * 60 * 24 * 30, samesite='Lax')
        return response

    def post(self, request):
        gift_set_id = request.data.get('gift_set_id')
        quantity = int(request.data.get('quantity', 1))
        if not gift_set_id:
            return Response({'detail': 'gift_set_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            gift_set = GiftSet.objects.get(pk=gift_set_id)
        except GiftSet.DoesNotExist:
            return Response({'detail': 'Gift not found'}, status=status.HTTP_404_NOT_FOUND)

        cart, new_session = get_or_create_cart(request)
        plan, limit = get_user_plan(request.user)
        existing = CartItem.objects.filter(cart=cart, gift_set=gift_set).first()

        if not existing and limit is not None and cart_item_count(cart) >= limit:
            return Response(
                {'detail': f'Cart limit reached ({limit} items). Upgrade your plan.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if existing:
            existing.quantity += quantity
            existing.save(update_fields=['quantity'])
        else:
            CartItem.objects.create(cart=cart, gift_set=gift_set, quantity=quantity)

        data = _cart_response(cart)
        response = Response(CartSerializer(data).data, status=status.HTTP_201_CREATED)
        if new_session:
            response.set_cookie(CART_SESSION_COOKIE, cart.session_key, max_age=60 * 60 * 24 * 30, samesite='Lax')
        return response


class CartItemDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, item_id):
        cart, _ = get_or_create_cart(request)
        try:
            item = CartItem.objects.get(pk=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        quantity = int(request.data.get('quantity', item.quantity))
        if quantity < 1:
            item.delete()
        else:
            item.quantity = quantity
            item.save(update_fields=['quantity'])
        return Response(CartSerializer(_cart_response(cart)).data)

    def delete(self, request, item_id):
        cart, _ = get_or_create_cart(request)
        CartItem.objects.filter(pk=item_id, cart=cart).delete()
        return Response(CartSerializer(_cart_response(cart)).data)


class CartClearView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cart, _ = get_or_create_cart(request)
        cart.items.all().delete()
        return Response(CartSerializer(_cart_response(cart)).data)


class PlansView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        plans = SubscriptionPlan.objects.all()
        return Response(SubscriptionPlanSerializer(plans, many=True).data)


class CheckoutGiftsView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = list(cart.items.select_related('gift_set'))
        if not items:
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(i.gift_set.price * i.quantity for i in items)
        order = Order.objects.create(
            user=request.user,
            order_type='gift',
            status='completed',
            total=total,
        )
        for item in items:
            OrderItem.objects.create(
                order=order,
                gift_set=item.gift_set,
                quantity=item.quantity,
                unit_price=item.gift_set.price,
            )
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class CheckoutSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        slug = request.data.get('plan_slug')
        if not slug:
            return Response({'detail': 'plan_slug required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(slug=slug)
        except SubscriptionPlan.DoesNotExist:
            return Response({'detail': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.plan = plan
        profile.save(update_fields=['plan'])

        order = Order.objects.create(
            user=request.user,
            order_type='subscription',
            status='completed',
            total=plan.price_monthly,
            plan=plan,
        )
        return Response({
            'order': OrderSerializer(order).data,
            'me': _me_response(request.user),
        })


class OrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related('items', 'plan')
        return Response(OrderSerializer(orders, many=True).data)
