import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    mobile_number = models.CharField(
        max_length=15,
        unique=True,
        db_index=True
    )

    profile_image = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    REQUIRED_FIELDS = ["email", "mobile_number"]

    def __str__(self):
        return f"{self.username} ({self.mobile_number})"


class Wallet(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="wallet"
    )

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=5000.00
    )

    pin = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Wallet - {self.user.username} - ₹{self.balance}"


class BankAccount(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bank_accounts"
    )

    account_holder_name = models.CharField(
        max_length=150
    )

    bank_name = models.CharField(
        max_length=100
    )

    account_number = models.CharField(
        max_length=30,
        unique=True
    )

    ifsc_code = models.CharField(
        max_length=20
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"


class Transaction(models.Model):

    MOBILE_TRANSFER = "MOBILE_TRANSFER"
    BANK_TRANSFER = "BANK_TRANSFER"

    TRANSACTION_TYPES = (
        (MOBILE_TRANSFER, "Mobile Transfer"),
        (BANK_TRANSFER, "Bank Transfer"),
    )

    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"

    STATUS_CHOICES = (
        (SUCCESS, "Success"),
        (FAILED, "Failed"),
        (PENDING, "Pending"),
    )

    reference_id = models.CharField(
        max_length=50,
        unique=True,
        default=uuid.uuid4,
        editable=False
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_transactions",
        null=True,
        blank=True
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_transactions",
        null=True,
        blank=True
    )

    recipient_account_number = models.CharField(
        max_length=30,
        blank=True,
        null=True
    )

    recipient_ifsc = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=SUCCESS
    )

    date_time = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-date_time"]

    def __str__(self):
        return (
            f"{self.reference_id} | "
            f"{self.transaction_type} | "
            f"₹{self.amount} | "
            f"{self.status}"
        )


class Contact(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="contacts"
    )

    contact_name = models.CharField(
        max_length=150
    )

    mobile_number = models.CharField(
        max_length=15
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "mobile_number"],
                name="unique_user_contact"
            )
        ]

        ordering = ["contact_name"]

    def __str__(self):
        return f"{self.contact_name} ({self.mobile_number})"


class Notification(models.Model):

    GENERAL = "GENERAL"
    TRANSACTION_SENT = "TRANSACTION_SENT"
    TRANSACTION_RECEIVED = "TRANSACTION_RECEIVED"
    TRANSACTION_FAILED = "TRANSACTION_FAILED"

    NOTIFICATION_TYPES = (
        (GENERAL, "General"),
        (TRANSACTION_SENT, "Transaction Sent"),
        (TRANSACTION_RECEIVED, "Transaction Received"),
        (TRANSACTION_FAILED, "Transaction Failed"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    message = models.TextField()

    type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES,
        default=GENERAL
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.message[:40]}"