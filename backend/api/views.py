from datetime import date, timedelta

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from .csrf import csrf_enforce
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
    RecipientGiftMatch,
    SavedGift,
)
from .groq_service import (
    analyze_instagram_profile,
    generate_detective_reply,
    get_last_groq_error,
    is_groq_configured,
    ping_groq,
)
from .profile_analysis import apply_instagram_analysis
from .social_sources import fetch_instagram_public_hints, parse_instagram_username
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


@csrf_enforce
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


@csrf_enforce
class DetectiveSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DetectiveSession.objects.select_related('recipient').prefetch_related('messages')
    serializer_class = DetectiveSessionSerializer

    def _get_or_create_active_session(self):
        session = (
            self.get_queryset().filter(is_active=True).order_by('-created_at').first()
        )
        if session:
            return session
        recipient = Recipient.objects.first()
        if not recipient:
            return None
        return DetectiveSession.objects.create(
            recipient=recipient,
            title='Gift Detective Session',
            is_active=True,
        )

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        session = self.get_object()
        if request.method == 'GET':
            msgs = session.messages.all()
            return Response(ChatMessageSerializer(msgs, many=True).data)

        text = (request.data.get('text') or '').strip()
        if not text:
            return Response({'detail': 'text is required'}, status=status.HTTP_400_BAD_REQUEST)

        recipient_name = session.recipient.name
        ai_payload = generate_detective_reply(session, text)
        if ai_payload:
            ai_text = ai_payload['text']
            ai_options = ai_payload['options']
        else:
            ai_text = (
                f"Thanks! I'm analyzing that against {recipient_name}'s profile. "
                "Would you prefer something **practical** or **experiential**?"
            )
            ai_options = ['Practical & Daily', 'Experiential & Unique']

        time_label = timezone.now().strftime('%I:%M %p').lstrip('0')
        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            text=text,
            time_label='Just now',
        )
        ai_msg = ChatMessage.objects.create(
            session=session,
            role='ai',
            text=ai_text,
            time_label=time_label,
            options=ai_options,
        )
        return Response(
            ChatMessageSerializer([user_msg, ai_msg], many=True).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        session = self._get_or_create_active_session()
        if not session:
            return Response({'detail': 'No recipients in database'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DetectiveSessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def analyze_instagram(self, request, pk=None):
        session = self.get_object()
        url = (request.data.get('url') or request.data.get('text') or '').strip()
        username = parse_instagram_username(url)
        if not username:
            return Response(
                {'detail': 'Invalid Instagram URL or @username'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hints = fetch_instagram_public_hints(username)
        gifts = GiftSet.objects.all().order_by('-match_percent')[:16]
        catalog = '\n'.join(
            f"- id={g.id} | {g.title} | ${g.price} | {g.description[:100]}"
            for g in gifts
        )
        analysis = analyze_instagram_profile(
            username,
            f'https://www.instagram.com/{username}/',
            hints,
            catalog or '- id=1 | Demo gift',
        )

        if analysis:
            ai_text = str(analysis['text']).strip()
            ai_options = [str(o) for o in (analysis.get('options') or [])[:4] if o]
            apply_instagram_analysis(session.recipient, analysis)
        else:
            hint_note = (
                f' Public page hints: {hints[:200]}...'
                if hints
                else ' Could not read public page (private/login wall).'
            )
            err = get_last_groq_error()
            ai_text = (
                f"I found **@{username}** on Instagram.{hint_note}\n\n"
                'Based on typical lifestyle signals, I would look at **wellness**, '
                '**coffee ritual**, or **experience** gifts.'
            )
            if err:
                ai_text += f'\n\n_(AI: {err})_'
            elif not is_groq_configured():
                ai_text += '\n\n_Set **GROQ_API_KEY** on the server for deeper analysis._'
            ai_options = ['Wellness gift', 'Coffee & home', 'Experience']
            profile, _ = PersonalityProfile.objects.get_or_create(recipient=session.recipient)
            if hints:
                profile.confidence_percent = min(85, profile.confidence_percent + 10)
                profile.save(update_fields=['confidence_percent'])

        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            text=f'Analyze Instagram: https://www.instagram.com/{username}/',
            time_label='Just now',
        )
        ai_msg = ChatMessage.objects.create(
            session=session,
            role='ai',
            text=ai_text,
            time_label=timezone.now().strftime('%I:%M %p').lstrip('0'),
            options=ai_options,
        )

        profile = (
            PersonalityProfile.objects.filter(recipient=session.recipient)
            .select_related('recipient')
            .prefetch_related('interests', 'tags')
            .first()
        )
        top_match = (
            RecipientGiftMatch.objects.filter(recipient=session.recipient)
            .select_related('gift_set')
            .order_by('-match_percent')
            .first()
        )
        suggested = []
        if top_match:
            suggested.append(
                {
                    'gift_set': GiftSetSerializer(top_match.gift_set).data,
                    'match_percent': top_match.match_percent,
                }
            )
        for m in (
            RecipientGiftMatch.objects.filter(recipient=session.recipient, label='Instagram match')
            .select_related('gift_set')
            .order_by('-match_percent')[:3]
        ):
            if top_match and m.gift_set_id == top_match.gift_set_id:
                continue
            suggested.append(
                {'gift_set': GiftSetSerializer(m.gift_set).data, 'match_percent': m.match_percent}
            )

        return Response(
            {
                'username': username,
                'public_hints': hints,
                'messages': ChatMessageSerializer([user_msg, ai_msg], many=True).data,
                'profile': PersonalityProfileSerializer(profile).data if profile else None,
                'suggested_gifts': suggested,
            },
            status=status.HTTP_201_CREATED,
        )


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


@csrf_enforce
class HealthView(APIView):
    def get(self, request):
        configured = is_groq_configured()
        groq_ok = None
        groq_error = get_last_groq_error()
        if configured and request.query_params.get('groq_ping') == '1':
            groq_ok, groq_error = ping_groq()
        return Response({
            'status': 'ok',
            'service': 'giftai',
            'app': 'giftly-django',
            'ai_enabled': configured,
            'groq_ok': groq_ok,
            'groq_error': groq_error,
            'groq_model': getattr(settings, 'GROQ_MODEL', ''),
        })
