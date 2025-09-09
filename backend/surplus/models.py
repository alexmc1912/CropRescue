from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


# Custom user model
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('donator', 'Donator'),
        ('volunteer', 'Volunteer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donator')


class SurplusItem(models.Model):
    restaurant = models.CharField(max_length=255)
    description = models.TextField()
    address = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    quantity = models.IntegerField()
    original_quantity = models.IntegerField(default=0)  # 👈 Add this
    picked_up = models.BooleanField(default=False)
    donator = models.ForeignKey('CustomUser', on_delete=models.CASCADE, default=1)  # already added

    def save(self, *args, **kwargs):
        # When creating a new item, set original_quantity = quantity
        if not self.pk:
            self.original_quantity = self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.restaurant} - {self.description} ({self.quantity})"


# Pickup history model
class PickupHistory(models.Model):
    item = models.ForeignKey(SurplusItem, on_delete=models.CASCADE, related_name='pickup_histories')
    volunteer = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    picked_quantity = models.PositiveIntegerField()
    picked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pickup {self.id} from {self.item.restaurant} - {self.item.description} ({self.picked_quantity}) by {self.volunteer.username}"
