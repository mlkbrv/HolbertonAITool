from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from api.models import (
    ChatMessage,
    CorporateOffer,
    DashboardInsight,
    DetectiveSession,
    GiftCategory,
    GiftSet,
    Interest,
    Occasion,
    PersonalityProfile,
    PersonalityTag,
    Recipient,
    RecipientGiftMatch,
    SavedGift,
)


class Command(BaseCommand):
    help = 'Populate database with mock data matching the frontend demo'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        for model in [
            ChatMessage,
            DetectiveSession,
            SavedGift,
            RecipientGiftMatch,
            Interest,
            PersonalityTag,
            PersonalityProfile,
            Occasion,
            GiftSet,
            GiftCategory,
            Recipient,
            CorporateOffer,
            DashboardInsight,
        ]:
            model.objects.all().delete()

        today = date.today()
        year = today.year

        mom = Recipient.objects.create(name='Mom', relationship='mom')
        partner = Recipient.objects.create(name='Partner', relationship='partner')
        colleague = Recipient.objects.create(name='Colleague', relationship='colleague')
        sarah = Recipient.objects.create(name='Sarah', relationship='friend')
        michael = Recipient.objects.create(name='Michael', relationship='friend')

        luxury = GiftCategory.objects.create(slug='luxury', name='Luxury')
        wellness = GiftCategory.objects.create(slug='wellness', name='Wellness')
        experience = GiftCategory.objects.create(slug='experience', name='Experience')
        gourmet = GiftCategory.objects.create(slug='gourmet', name='Gourmet')

        gifts = [
            GiftSet(
                title='Artisan Morning Ritual',
                subtitle='Luxe Edition',
                description='Curated pour-over essentials for the slow morning ritualist.',
                price=Decimal('145.00'),
                image_url='https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop',
                category=gourmet,
                edition_label='Luxe Edition',
                match_percent=98,
                is_curated=True,
            ),
            GiftSet(
                title='Midnight Serenity Box',
                subtitle='Best Seller',
                description='Organic oils and artisan ceramics for ultimate peace.',
                price=Decimal('88.00'),
                image_url='https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
                category=wellness,
                edition_label='Best Seller',
                match_percent=92,
                is_best_seller=True,
                is_curated=True,
            ),
            GiftSet(
                title="The Curator's Desk",
                subtitle='Executive',
                description='Premium desk accessories for the executive workspace.',
                price=Decimal('210.00'),
                image_url='https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800&auto=format&fit=crop',
                category=luxury,
                edition_label='Executive',
                match_percent=85,
                is_curated=True,
            ),
            GiftSet(
                title='Serene Lavender Ritual Set',
                subtitle='Mom Wellness',
                description='Hand-selected organic oils and artisan ceramics for ultimate peace.',
                price=Decimal('120.00'),
                image_url='https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=600&auto=format&fit=crop',
                category=wellness,
                match_percent=98,
            ),
            GiftSet(
                title='Artisan Pour-Over Collection',
                subtitle='Mom Gourmet',
                description='For the connoisseur who appreciates the slow art of morning brew.',
                price=Decimal('185.00'),
                image_url='https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop',
                category=gourmet,
                match_percent=92,
            ),
            GiftSet(
                title='Hand-Painted Silk Scarf',
                subtitle='Mom Fashion',
                description='A wearable piece of art, hand-finished in the Italian Lake District.',
                price=Decimal('210.00'),
                image_url='https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=600&auto=format&fit=crop',
                category=luxury,
                match_percent=85,
            ),
            GiftSet(
                title='The Literary Discovery Box',
                subtitle='Recommended',
                description='A curated collection of rare finds for the avid reader.',
                price=Decimal('145.00'),
                image_url='https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop',
                category=experience,
                match_percent=96,
                is_featured=True,
            ),
            GiftSet(
                title='Kyoto Ceramic Set',
                subtitle='Mom Home',
                description='Minimalist ceramics inspired by Japanese craft traditions.',
                price=Decimal('88.00'),
                image_url='https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop',
                category=luxury,
                match_percent=79,
            ),
            GiftSet(
                title='Artisan Picnic Set',
                description='Perfect for outdoor celebrations and sunny afternoons.',
                price=Decimal('124.00'),
                image_url='https://images.unsplash.com/photo-1544256428-251d5c2ee0cb?q=80&w=200&auto=format&fit=crop',
                category=experience,
                match_percent=98,
            ),
            GiftSet(
                title='Vantage Tech Pro',
                description='Premium tech accessories for the modern professional.',
                price=Decimal('299.00'),
                image_url='https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=200&auto=format&fit=crop',
                category=luxury,
                match_percent=94,
            ),
            GiftSet(
                title='The Nordic Morning Set',
                description='Scandinavian-inspired breakfast ritual collection.',
                price=Decimal('124.00'),
                image_url='https://images.unsplash.com/photo-1544256428-251d5c2ee0cb?q=80&w=600&auto=format&fit=crop',
                category=gourmet,
                match_percent=94,
            ),
        ]
        GiftSet.objects.bulk_create(gifts)
        gift_map = {g.title: g for g in GiftSet.objects.all()}

        RecipientGiftMatch.objects.bulk_create([
            RecipientGiftMatch(recipient=mom, gift_set=gift_map['Serene Lavender Ritual Set'], match_percent=98, label='Mom Wellness'),
            RecipientGiftMatch(recipient=mom, gift_set=gift_map['Artisan Pour-Over Collection'], match_percent=92, label='Mom Gourmet'),
            RecipientGiftMatch(recipient=sarah, gift_set=gift_map['Artisan Picnic Set'], match_percent=98, label='For Sarah'),
            RecipientGiftMatch(recipient=michael, gift_set=gift_map['Vantage Tech Pro'], match_percent=94, label='For Michael'),
            RecipientGiftMatch(recipient=sarah, gift_set=gift_map['The Nordic Morning Set'], match_percent=94, label='Top Match'),
        ])

        def near(days):
            return today + timedelta(days=days)

        Occasion.objects.bulk_create([
            Occasion(
                title="Mom's 60th Birthday",
                recipient=mom,
                occasion_type='birthday',
                date=near(3),
                status='gift_ready',
                progress_percent=100,
            ),
            Occasion(
                title='Wedding Anniversary',
                recipient=partner,
                occasion_type='anniversary',
                date=near(12),
                status='analysis_required',
                progress_percent=33,
            ),
            Occasion(
                title="Sarah's Housewarming",
                recipient=sarah,
                occasion_type='milestone',
                date=date(year, today.month, 1) if today.day > 1 else near(0),
                status='shipped',
                progress_percent=100,
            ),
            Occasion(
                title='Team Appreciation',
                recipient=colleague,
                occasion_type='milestone',
                date=date(year, today.month, 4) if today.month <= 12 else near(4),
                status='planned',
                progress_percent=40,
            ),
            Occasion(
                title="Michael's Promotion",
                recipient=michael,
                occasion_type='milestone',
                date=date(year, today.month, 9) if today.day <= 9 else near(5),
                status='ready',
                progress_percent=80,
            ),
        ])

        SavedGift.objects.bulk_create([
            SavedGift(
                gift_set=gift_map['Artisan Picnic Set'],
                recipient=sarah,
                occasion_date=near(3) if near(3).month == (today + timedelta(days=3)).month else date(year, 10, 24),
                match_percent=98,
            ),
            SavedGift(
                gift_set=gift_map['Vantage Tech Pro'],
                recipient=michael,
                occasion_date=date(year, 11, 2),
                match_percent=94,
            ),
        ])

        profile = PersonalityProfile.objects.create(
            recipient=sarah,
            confidence_percent=68,
            trait='Minimalist',
            mood='Thoughtful',
        )
        Interest.objects.bulk_create([
            Interest(profile=profile, name='Specialty Coffee', level='high', score_percent=90, sort_order=1),
            Interest(profile=profile, name='Sustainable Living', level='medium', score_percent=45, sort_order=2),
            Interest(profile=profile, name='Nordic Design', level='high', score_percent=80, sort_order=3),
        ])
        PersonalityTag.objects.bulk_create([
            PersonalityTag(profile=profile, label='Minimalist'),
            PersonalityTag(profile=profile, label='Coffee'),
            PersonalityTag(profile=profile, label='Wanderlust'),
        ])

        session = DetectiveSession.objects.create(
            recipient=sarah,
            title='Gift Detective — Sarah',
            is_active=True,
        )
        ChatMessage.objects.bulk_create([
            ChatMessage(
                session=session,
                role='ai',
                text="Hello! I've analyzed Sarah's social footprint. She seems to love **specialty coffee** and **minimalist design**. Shall we explore artisan coffee sets or experiential gifts?",
                time_label='10:02 AM',
            ),
            ChatMessage(
                session=session,
                role='user',
                text="Let's focus on coffee — something premium but not too flashy.",
                time_label='10:03 AM',
            ),
            ChatMessage(
                session=session,
                role='ai',
                text="Perfect. Based on her profile, I'd recommend a **pour-over ritual set** or a **Nordic morning collection**. Which direction feels right?",
                time_label='10:04 AM',
                options=['Pour-over ritual', 'Nordic morning set'],
            ),
        ])

        CorporateOffer.objects.create(
            title='Q4 Enterprise Gifting',
            description='Volume pricing for teams of 50+ with white-glove delivery.',
            is_new=True,
        )

        DashboardInsight.objects.create(
            readiness_percent=72,
            quote="You're 72% ready for October. Consider finalizing Sarah's picnic set before the 24th.",
            is_active=True,
        )

        self.stdout.write(self.style.SUCCESS('Mock data seeded successfully.'))
        self.stdout.write(f'  Recipients: {Recipient.objects.count()}')
        self.stdout.write(f'  Gift sets: {GiftSet.objects.count()}')
        self.stdout.write(f'  Occasions: {Occasion.objects.count()}')
