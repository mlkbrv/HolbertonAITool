from django.contrib import admin

from .models import (
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

admin.site.register(Recipient)
admin.site.register(GiftCategory)
admin.site.register(GiftSet)
admin.site.register(RecipientGiftMatch)
admin.site.register(Occasion)
admin.site.register(SavedGift)
admin.site.register(PersonalityProfile)
admin.site.register(Interest)
admin.site.register(PersonalityTag)
admin.site.register(DetectiveSession)
admin.site.register(ChatMessage)
admin.site.register(CorporateOffer)
admin.site.register(DashboardInsight)
