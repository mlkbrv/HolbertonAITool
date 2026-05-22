from datetime import date, timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ChatMessage,
    CorporateOffer,
    DashboardInsight,
    DetectiveSession,
    GiftCategory,
    GiftSet,
    Occasion,
    PersonalityProfile,
    Recipient,
    SavedGift,
)
from .serializers import (
    ChatMessageSerializer,
    CorporateOfferSerializer,
    DashboardSerializer,
    DetectiveSessionSerializer,
    GiftCategorySerializer,
    GiftSetSerializer,
    OccasionCreateSerializer,
    OccasionSerializer,
    PersonalityProfileSerializer,
    RecipientSerializer,
    SavedGiftSerializer,
)


class RecipientViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Recipient.objects.all()
    serializer_class = RecipientSerializer


class GiftCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GiftCategory.objects.all()
    serializer_class = GiftCategorySerializer
    lookup_field = 'slug'


class GiftSetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GiftSet.objects.select_related('category').prefetch_related('recipient_matches')
    serializer_class = GiftSetSerializer
    filterset_fields = ['category__slug', 'is_curated', 'is_featured']
    search_fields = ['title', 'description', 'subtitle']

    def get_queryset(self):
        qs = super().get_queryset()
        recipient_id = self.request.query_params.get('recipient')
        if recipient_id:
            qs = qs.filter(recipient_matches__recipient_id=recipient_id).distinct()
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs

    @action(detail=False, methods=['get'])
    def curated(self, request):
        items = self.get_queryset().filter(is_curated=True)[:6]
        return Response(GiftSetSerializer(items, many=True).data)


class OccasionViewSet(viewsets.ModelViewSet):
    queryset = Occasion.objects.select_related('recipient')
    http_method_names = ['get', 'post', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return OccasionCreateSerializer
        return OccasionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        upcoming = self.request.query_params.get('upcoming')
        if upcoming in ('1', 'true', 'yes'):
            qs = qs.filter(date__gte=date.today()).order_by('date')[:10]
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month and year:
            qs = qs.filter(date__month=int(month), date__year=int(year))
        return qs

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        today = date.today()
        start = today.replace(day=1)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end = start.replace(month=start.month + 1, day=1) - timedelta(days=1)
        items = self.get_queryset().filter(date__gte=start, date__lte=end)
        return Response(OccasionSerializer(items, many=True).data)


class SavedGiftViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SavedGift.objects.select_related('gift_set', 'recipient')
    serializer_class = SavedGiftSerializer


class PersonalityProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PersonalityProfile.objects.select_related('recipient').prefetch_related(
        'interests', 'tags'
    )
    serializer_class = PersonalityProfileSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        recipient_id = self.request.query_params.get('recipient')
        if recipient_id:
            qs = qs.filter(recipient_id=recipient_id)
        return qs


class DetectiveSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DetectiveSession.objects.select_related('recipient').prefetch_related('messages')
    serializer_class = DetectiveSessionSerializer

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        session = self.get_object()
        if request.method == 'GET':
            msgs = session.messages.all()
            return Response(ChatMessageSerializer(msgs, many=True).data)

        text = (request.data.get('text') or '').strip()
        if not text:
            return Response({'detail': 'text is required'}, status=status.HTTP_400_BAD_REQUEST)

        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            text=text,
            time_label='Just now',
        )
        ai_msg = ChatMessage.objects.create(
            session=session,
            role='ai',
            text=(
                "Thanks! I'm analyzing that against Sarah's profile. "
                "Would you prefer something **practical** or **experiential**?"
            ),
            time_label=timezone.now().strftime('%I:%M %p').lstrip('0'),
            options=['Practical & Daily', 'Experiential & Unique'],
        )
        return Response(
            ChatMessageSerializer([user_msg, ai_msg], many=True).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        session = (
            self.get_queryset().filter(is_active=True).order_by('-created_at').first()
        )
        if not session:
            return Response({'detail': 'No active session'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DetectiveSessionSerializer(session).data)


class CorporateOfferViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CorporateOffer.objects.all()
    serializer_class = CorporateOfferSerializer


class DashboardView(APIView):
    def get(self, request):
        today = date.today()
        payload = {
            'upcoming_occasions': Occasion.objects.filter(date__gte=today).order_by('date')[:5],
            'curated_gift_sets': GiftSet.objects.filter(is_curated=True).order_by('-match_percent')[:6],
            'corporate_offers': CorporateOffer.objects.all()[:3],
            'calendar_insight': DashboardInsight.objects.filter(is_active=True).first(),
        }
        return Response(DashboardSerializer(payload).data)


class HealthView(APIView):
    def get(self, request):
        return Response({'status': 'ok', 'service': 'giftai-api'})
