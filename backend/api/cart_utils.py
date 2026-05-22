import uuid

from django.contrib.auth.models import User

from .models import Cart, CartItem, SubscriptionPlan, UserProfile


CART_SESSION_COOKIE = 'cart_session'


def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart, False

    session_key = request.COOKIES.get(CART_SESSION_COOKIE)
    if session_key:
        cart = Cart.objects.filter(session_key=session_key, user__isnull=True).first()
        if cart:
            return cart, False

    session_key = uuid.uuid4().hex
    cart = Cart.objects.create(session_key=session_key)
    return cart, True


def get_user_plan(user):
    if not user.is_authenticated:
        free = SubscriptionPlan.objects.filter(slug='free').first()
        return free, free.cart_limit if free else 3

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if not profile.plan_id:
        free = SubscriptionPlan.objects.filter(slug='free').first()
        if free:
            profile.plan = free
            profile.save(update_fields=['plan'])
    plan = profile.plan
    limit = plan.cart_limit if plan else 3
    return plan, limit


def cart_item_count(cart):
    return CartItem.objects.filter(cart=cart).count()
