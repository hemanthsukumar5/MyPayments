import re
from decimal import Decimal

from django.contrib.auth.hashers import make_password

from rest_framework import serializers

from .models import (
    User,
    Wallet,
    BankAccount,
    Transaction,
    Contact,
    Notification,
)


class RegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "username",
            "mobile_number",
            "password",
            "confirm_password",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True,
                "min_length": 6,
            },
        }

    def validate_username(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must contain at least 3 characters."
            )

        if not re.match(r"^[A-Za-z ]+$", value):
            raise serializers.ValidationError(
                "Username can contain only letters and spaces."
            )

        if User.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_mobile_number(self, value):
        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Mobile number must contain only digits."
            )

        if len(value) != 10:
            raise serializers.ValidationError(
                "Mobile number must contain exactly 10 digits."
            )

        if User.objects.filter(
            mobile_number=value
        ).exists():
            raise serializers.ValidationError(
                "Mobile number already registered."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password":
                    "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=validated_data["username"],
            mobile_number=validated_data["mobile_number"],
            password=password
        )

        Wallet.objects.create(
            user=user,
            balance=Decimal("5000.00")
        )

        Notification.objects.create(
            user=user,
            message=(
                "Welcome to MyPayments! "
                "Your wallet has been credited with ₹5,000.00."
            )
        )

        return user


class LoginSerializer(serializers.Serializer):

    mobile_number = serializers.CharField(
        required=True
    )

    password = serializers.CharField(
        required=True,
        write_only=True
    )

    def validate_mobile_number(self, value):
        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Mobile number must contain only digits."
            )

        return value


class ForgotPasswordVerifySerializer(serializers.Serializer):

    mobile_number = serializers.CharField(
        required=True
    )

    username = serializers.CharField(
        required=True
    )

    def validate(self, attrs):

        mobile = attrs["mobile_number"].strip()
        username = attrs["username"].strip()

        user = User.objects.filter(
            mobile_number=mobile,
            username__iexact=username
        ).first()

        if not user:
            raise serializers.ValidationError(
                "Mobile number and username do not match."
            )

        attrs["user"] = user

        return attrs


class ForgotPasswordResetSerializer(serializers.Serializer):

    mobile_number = serializers.CharField(
        required=True
    )

    username = serializers.CharField(
        required=True
    )

    new_password = serializers.CharField(
        min_length=6,
        write_only=True
    )

    confirm_password = serializers.CharField(
        min_length=6,
        write_only=True
    )

    def validate(self, attrs):

        mobile = attrs["mobile_number"].strip()
        username = attrs["username"].strip()

        user = User.objects.filter(
            mobile_number=mobile,
            username__iexact=username
        ).first()

        if not user:
            raise serializers.ValidationError(
                "Mobile number and username do not match."
            )

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password":
                    "Passwords do not match."
            })

        attrs["user"] = user

        return attrs


class UserProfileSerializer(serializers.ModelSerializer):

    wallet_balance = serializers.SerializerMethodField()
    has_pin = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "mobile_number",
            "profile_image",
            "wallet_balance",
            "has_pin",
            "created_at",
        ]

    def get_wallet_balance(self, obj):
        if hasattr(obj, "wallet") and obj.wallet:
            return obj.wallet.balance
        return Decimal("0.00")

    def get_has_pin(self, obj):
        return bool(
            hasattr(obj, "wallet")
            and obj.wallet
            and obj.wallet.pin
        )


class WalletSerializer(serializers.ModelSerializer):

    class Meta:
        model = Wallet
        fields = [
            "balance",
            "created_at"
        ]


class SetupPinSerializer(serializers.Serializer):

    pin = serializers.CharField(
        min_length=4,
        max_length=4
    )

    confirm_pin = serializers.CharField(
        min_length=4,
        max_length=4
    )

    def validate(self, attrs):

        if not attrs["pin"].isdigit():
            raise serializers.ValidationError({
                "pin": "PIN must contain only digits."
            })

        if attrs["pin"] != attrs["confirm_pin"]:
            raise serializers.ValidationError({
                "confirm_pin":
                    "PINs do not match."
            })

        return attrs


class VerifyPinSerializer(serializers.Serializer):

    pin = serializers.CharField(
        min_length=4,
        max_length=4
    )


class MobileTransferSerializer(serializers.Serializer):

    receiver_mobile = serializers.CharField(
        required=True
    )

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("1.00")
    )

    def validate_receiver_mobile(self, value):

        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Receiver mobile number must contain digits only."
            )

        if len(value) != 10:
            raise serializers.ValidationError(
                "Receiver mobile number must contain 10 digits."
            )

        return value


class BankTransferSerializer(serializers.Serializer):

    account_number = serializers.CharField(
        max_length=30
    )

    ifsc_code = serializers.CharField(
        max_length=20
    )

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("1.00")
    )

    def validate_account_number(self, value):

        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Account number must contain digits only."
            )

        return value

    def validate_ifsc_code(self, value):

        value = value.strip().upper()

        if not re.match(
            r"^[A-Z]{4}0[A-Z0-9]{6}$",
            value
        ):
            raise serializers.ValidationError(
                "Invalid IFSC code."
            )

        return value


class BankAccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = BankAccount

        fields = [
            "id",
            "account_holder_name",
            "bank_name",
            "account_number",
            "ifsc_code",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at"
        ]

    def validate_account_number(self, value):

        value = value.strip()

        if not value.isdigit():
            raise serializers.ValidationError(
                "Account number must contain digits only."
            )

        if BankAccount.objects.filter(
            account_number=value
        ).exists():
            raise serializers.ValidationError(
                "Bank account already exists."
            )

        return value

    def validate_ifsc_code(self, value):

        value = value.strip().upper()

        if not re.match(
            r"^[A-Z]{4}0[A-Z0-9]{6}$",
            value
        ):
            raise serializers.ValidationError(
                "Invalid IFSC code."
            )

        return value


class TransactionSerializer(serializers.ModelSerializer):

    sender_username = serializers.SerializerMethodField()
    receiver_username = serializers.SerializerMethodField()
    sender_mobile = serializers.SerializerMethodField()
    receiver_mobile = serializers.SerializerMethodField()
    is_sender = serializers.SerializerMethodField()

    class Meta:
        model = Transaction

        fields = [
            "id",
            "reference_id",
            "sender_username",
            "sender_mobile",
            "receiver_username",
            "receiver_mobile",
            "recipient_account_number",
            "recipient_ifsc",
            "amount",
            "transaction_type",
            "status",
            "date_time",
            "is_sender",
        ]

    def get_sender_username(self, obj):
        return (
            obj.sender.username
            if obj.sender else "External"
        )

    def get_sender_mobile(self, obj):
        return (
            obj.sender.mobile_number
            if obj.sender else "N/A"
        )

    def get_receiver_username(self, obj):
        return (
            obj.receiver.username
            if obj.receiver
            else obj.recipient_account_number or "Bank"
        )

    def get_receiver_mobile(self, obj):
        return (
            obj.receiver.mobile_number
            if obj.receiver else "N/A"
        )

    def get_is_sender(self, obj):
        request = self.context.get("request")

        return bool(
            request
            and request.user.is_authenticated
            and obj.sender_id == request.user.id
        )


class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact

        fields = [
            "id",
            "contact_name",
            "mobile_number",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at"
        ]

    def validate_mobile_number(self, value):

        value = value.strip()

        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "Enter a valid 10-digit mobile number."
            )

        return value


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification

        fields = [
            "id",
            "message",
            "type",
            "is_read",
            "created_at",
        ]