from datetime import date

from rest_framework import serializers

from django.contrib.auth.models import User

from .models import (
    CartItem,
    ChatMessage,
    CorporateOffer,
    DashboardInsight,
    DetectiveSession,
    GiftCategory,
    GiftSet,
    Interest,
    Occasion,
    Order,
    OrderItem,
    PersonalityProfile,
    PersonalityTag,
    Recipient,
    RecipientGiftMatch,
    SavedGift,
    SubscriptionPlan,
    UserProfile,
)


class RecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = ['id', 'name', 'relationship', 'avatar_url']


class GiftCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCategory
        fields = ['id', 'slug', 'name']


class GiftSetSerializer(serializers.ModelSerializer):
    category = GiftCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=GiftCategory.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True,
    )
    recipient_label = serializers.SerializerMethodField()

    class Meta:
        model = GiftSet
        fields = [
            'id',
            'title',
            'subtitle',
            'description',
            'price',
            'image_url',
            'category',
            'category_id',
            'edition_label',
            'match_percent',
            'is_featured',
            'is_best_seller',
            'is_curated',
            'recipient_label',
        ]

    def get_recipient_label(self, obj):
        match = obj.recipient_matches.select_related('recipient').first()
        return match.label if match else ''


class OccasionSerializer(serializers.ModelSerializer):
    recipient = RecipientSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipient.objects.all(),
        source='recipient',
        write_only=True,
        required=False,
        allow_null=True,
    )
    days_until = serializers.SerializerMethodField()
    month_label = serializers.SerializerMethodField()
    day_label = serializers.SerializerMethodField()

    class Meta:
        model = Occasion
        fields = [
            'id',
            'title',
            'recipient',
            'recipient_id',
            'occasion_type',
            'date',
            'status',
            'progress_percent',
            'notes',
            'days_until',
            'month_label',
            'day_label',
        ]

    def get_days_until(self, obj):
        delta = (obj.date - date.today()).days
        return max(delta, 0)

    def get_month_label(self, obj):
        return obj.date.strftime('%b')

    def get_day_label(self, obj):
        return obj.date.strftime('%d')


class SavedGiftSerializer(serializers.ModelSerializer):
    gift_set = GiftSetSerializer(read_only=True)
    recipient = RecipientSerializer(read_only=True)

    class Meta:
        model = SavedGift
        fields = [
            'id',
            'gift_set',
            'recipient',
            'occasion_date',
            'match_percent',
        ]


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name', 'level', 'score_percent', 'sort_order']


class PersonalityTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalityTag
        fields = ['id', 'label']


class PersonalityProfileSerializer(serializers.ModelSerializer):
    recipient = RecipientSerializer(read_only=True)
    interests = InterestSerializer(many=True, read_only=True)
    tags = PersonalityTagSerializer(many=True, read_only=True)
    top_match = serializers.SerializerMethodField()

    class Meta:
        model = PersonalityProfile
        fields = [
            'id',
            'recipient',
            'confidence_percent',
            'trait',
            'mood',
            'interests',
            'tags',
            'top_match',
        ]

    def get_top_match(self, obj):
        match = (
            RecipientGiftMatch.objects.filter(recipient=obj.recipient)
            .select_related('gift_set')
            .order_by('-match_percent')
            .first()
        )
        if not match:
            return None
        return {
            'gift_set': GiftSetSerializer(match.gift_set).data,
            'match_percent': match.match_percent,
        }


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'text', 'time_label', 'options', 'created_at']


class DetectiveSessionSerializer(serializers.ModelSerializer):
    recipient = RecipientSerializer(read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = DetectiveSession
        fields = ['id', 'title', 'recipient', 'is_active', 'messages', 'created_at']


class CorporateOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorporateOffer
        fields = ['id', 'title', 'description', 'is_new']


class DashboardInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardInsight
        fields = ['readiness_percent', 'quote']


class DashboardSerializer(serializers.Serializer):
    upcoming_occasions = OccasionSerializer(many=True)
    curated_gift_sets = GiftSetSerializer(many=True)
    corporate_offers = CorporateOfferSerializer(many=True)
    calendar_insight = DashboardInsightSerializer(allow_null=True)


class OccasionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occasion
        fields = ['title', 'recipient_id', 'occasion_type', 'date', 'status', 'notes']

    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipient.objects.all(),
        source='recipient',
        required=False,
        allow_null=True,
    )


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id',
            'slug',
            'name',
            'price_monthly',
            'description',
            'features',
            'cart_limit',
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name']
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    name = serializers.CharField(max_length=120, required=False, allow_blank=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CartItemSerializer(serializers.ModelSerializer):
    gift_set = GiftSetSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'gift_set', 'quantity', 'line_total']

    def get_line_total(self, obj):
        return str(obj.gift_set.price * obj.quantity)


class CartSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    item_count = serializers.IntegerField()


class OrderItemSerializer(serializers.ModelSerializer):
    gift_set_title = serializers.CharField(source='gift_set.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'gift_set_title', 'quantity', 'unit_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    plan_name = serializers.SerializerMethodField()

    def get_plan_name(self, obj):
        return obj.plan.name if obj.plan_id else None

    class Meta:
        model = Order
        fields = [
            'id',
            'order_type',
            'status',
            'total',
            'plan_name',
            'items',
            'created_at',
        ]


class MeSerializer(serializers.Serializer):
    user = UserSerializer()
    plan = SubscriptionPlanSerializer(allow_null=True)
