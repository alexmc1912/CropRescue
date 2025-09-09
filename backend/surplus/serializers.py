from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SurplusItem, PickupHistory

User = get_user_model()

class PickupHistorySerializer(serializers.ModelSerializer):
    volunteer_username = serializers.CharField(source='volunteer.username', read_only=True)
    item = serializers.SerializerMethodField()

    class Meta:
        model = PickupHistory
        fields = ['id', 'item', 'volunteer', 'volunteer_username', 'picked_quantity', 'picked_at']

    def get_item(self, obj):
        # Return minimal item details needed for frontend display
        return {
            'id': obj.item.id,
            'restaurant': obj.item.restaurant,
            'description': obj.item.description,
            'address': obj.item.address,
        }

class SurplusItemSerializer(serializers.ModelSerializer):
    pickup_histories = PickupHistorySerializer(many=True, read_only=True)

    class Meta:
        model = SurplusItem
        fields = ['id', 'restaurant', 'description', 'address', 'created_at', 'quantity', 'picked_up', 'pickup_histories', 'original_quantity']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'volunteer')
        )
        return user
