from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from .models import SurplusItem, PickupHistory
from .serializers import SurplusItemSerializer, RegisterSerializer, PickupHistorySerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

User = get_user_model()


class SurplusItemViewSet(viewsets.ModelViewSet):
    queryset = SurplusItem.objects.all().order_by('-created_at')
    serializer_class = SurplusItemSerializer

    def get_permissions(self):
        if self.action in ['create', 'pick_up']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        # Set the donator to the logged-in user when creating a surplus item
        serializer.save(donator=self.request.user)

    @action(detail=True, methods=['patch'])
    def pick_up(self, request, pk=None):
        item = self.get_object()
        user = request.user

        if not hasattr(user, 'role') or user.role != 'volunteer':
            return Response({'error': 'Only volunteers can pick up surplus items'}, status=status.HTTP_403_FORBIDDEN)

        picked_qty = request.data.get('quantity')
        if picked_qty is None:
            return Response({'error': 'quantity field is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            picked_qty = int(picked_qty)
        except ValueError:
            return Response({'error': 'quantity must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        if picked_qty <= 0:
            return Response({'error': 'quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        if picked_qty > item.quantity:
            return Response({'error': 'picked quantity exceeds available quantity'}, status=status.HTTP_400_BAD_REQUEST)

        # Update quantity only, original_quantity stays intact
        item.quantity -= picked_qty
        if item.quantity == 0:
            item.picked_up = True
        item.save()

        # Create PickupHistory record
        PickupHistory.objects.create(
            item=item,
            volunteer=user,
            picked_quantity=picked_qty
        )

        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    role = serializers.CharField(write_only=True)

    def validate(self, attrs):
        role = attrs.pop('role', None)
        data = super().validate(attrs)

        user = self.user
        if role and user.role != role:
            raise serializers.ValidationError('Role mismatch. Please select the correct role.')

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# Pickup history for volunteers (unchanged)
class PickupHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'volunteer':
            pickups = PickupHistory.objects.filter(volunteer=user).order_by('-picked_at')
            serializer = PickupHistorySerializer(pickups, many=True)
            return Response(serializer.data)
        return Response({"detail": "Only volunteers have pickup history."}, status=403)


# NEW: Donator's order history view (shows original_quantity and current quantity)
class DonatorOrderHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'donator':
            return Response({"detail": "Only donators have order history."}, status=403)

        items = SurplusItem.objects.filter(donator=user).order_by('-created_at')
        serializer = SurplusItemSerializer(items, many=True)
        return Response(serializer.data)
