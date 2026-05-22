from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .commerce_views import (
    CartClearView,
    CartItemDetailView,
    CartView,
    CheckoutGiftsView,
    CheckoutSubscriptionView,
    LoginView,
    LogoutView,
    MeView,
    OrdersView,
    PlansView,
    RegisterView,
)
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
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('auth/me/', MeView.as_view()),
    path('cart/', CartView.as_view()),
    path('cart/clear/', CartClearView.as_view()),
    path('cart/items/<int:item_id>/', CartItemDetailView.as_view()),
    path('plans/', PlansView.as_view()),
    path('checkout/gifts/', CheckoutGiftsView.as_view()),
    path('checkout/subscription/', CheckoutSubscriptionView.as_view()),
    path('orders/', OrdersView.as_view()),
    path('', include(router.urls)),
]
