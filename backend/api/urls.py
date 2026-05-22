from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CorporateOfferViewSet,
    DashboardView,
    DetectiveSessionViewSet,
    GiftCategoryViewSet,
    GiftSetViewSet,
    HealthView,
    OccasionViewSet,
    PersonalityProfileViewSet,
    RecipientViewSet,
    SavedGiftViewSet,
)

router = DefaultRouter()
router.register('recipients', RecipientViewSet)
router.register('categories', GiftCategoryViewSet)
router.register('gift-sets', GiftSetViewSet, basename='giftset')
router.register('occasions', OccasionViewSet, basename='occasion')
router.register('saved-gifts', SavedGiftViewSet, basename='savedgift')
router.register('profiles', PersonalityProfileViewSet, basename='profile')
router.register('detective/sessions', DetectiveSessionViewSet, basename='detectivesession')
router.register('corporate-offers', CorporateOfferViewSet, basename='corporateoffer')

urlpatterns = [
    path('health/', HealthView.as_view(), name='health'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
