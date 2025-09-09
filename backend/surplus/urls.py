# surplus/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SurplusItemViewSet, RegisterView, CustomTokenObtainPairView, PickupHistoryView


# Create a router and register the SurplusItem viewset
router = DefaultRouter()
router.register(r'surplus', SurplusItemViewSet, basename='surplus')

# Define all URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Surplus CRUD endpoints

    # Custom JWT Authentication endpoint with role validation
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login with role check
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),       # Token refresh endpoint

    # Registration endpoint
    path('register/', RegisterView.as_view(), name='register'),  # User registration
    path('pickup-history/', PickupHistoryView.as_view(), name='pickup-history'),

]
