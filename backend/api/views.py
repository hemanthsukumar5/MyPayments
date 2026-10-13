from decimal import Decimal

from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from django.db.models import Q

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User,
    Wallet,
    BankAccount,
    Transaction,
    Contact,
    Notification,
)

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    WalletSerializer,
    SetupPinSerializer,
    VerifyPinSerializer,
    MobileTransferSerializer,
    BankTransferSerializer,
    BankAccountSerializer,
    TransactionSerializer,
    ContactSerializer,
    NotificationSerializer,
    ForgotPasswordVerifySerializer,
    ForgotPasswordResetSerializer,
)


def get_or_create_wallet(user):
    wallet, created = Wallet.objects.get_or_create(
        user=user,
        defaults={
            "balance": Decimal("5000.00")
        }
    )

    return wallet


class RegisterView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    authentication_classes = []

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail": "Registration failed.",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = serializer.save()

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message":
                        "Registration successful.",
                    "access":
                        str(refresh.access_token),
                    "refresh":
                        str(refresh),
                    "user":
                        UserProfileSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:

            return Response(
                {
                    "detail":
                        "Unable to create account.",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    authentication_classes = []

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Validation error in login request format.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        mobile = serializer.validated_data[
            "mobile_number"
        ]

        password = serializer.validated_data[
            "password"
        ]

        user = User.objects.filter(
            mobile_number=mobile
        ).first()

        if not user:

            return Response(
                {
                    "detail":
                        "Invalid mobile number or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):

            return Response(
                {
                    "detail":
                        "Invalid mobile number or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        wallet = get_or_create_wallet(user)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message":
                    "Login successful.",

                "access":
                    str(refresh.access_token),

                "refresh":
                    str(refresh),

                "user":
                    UserProfileSerializer(user).data
            },
            status=status.HTTP_200_OK
        )


class ForgotPasswordVerifyView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    authentication_classes = []

    def post(self, request):

        serializer = ForgotPasswordVerifySerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Mobile number and username do not match.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data["user"]

        return Response(
            {
                "valid": True,
                "message":
                    "Identity verified successfully.",
                "username":
                    user.username,
                "mobile_number":
                    user.mobile_number
            },
            status=status.HTTP_200_OK
        )


class ForgotPasswordResetView(APIView):

    permission_classes = [
        permissions.AllowAny
    ]

    authentication_classes = []

    def post(self, request):

        serializer = ForgotPasswordResetSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Password reset failed.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data["user"]

        new_password = serializer.validated_data[
            "new_password"
        ]

        user.set_password(new_password)

        user.save(
            update_fields=["password"]
        )

        Notification.objects.create(
            user=user,
            message="Your password was changed successfully."
        )

        return Response(
            {
                "message":
                    "Password changed successfully."
            },
            status=status.HTTP_200_OK
        )


class ProfileView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        wallet = get_or_create_wallet(
            request.user
        )

        data = UserProfileSerializer(
            request.user
        ).data

        data["unread_notifications"] = (
            Notification.objects.filter(
                user=request.user,
                is_read=False
            ).count()
        )

        return Response(data)


class CheckBalanceView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        wallet = get_or_create_wallet(
            request.user
        )

        if not wallet.pin:

            return Response(
                {
                    "has_pin": False,
                    "balance": None
                }
            )

        return Response(
            {
                "has_pin": True,
                "balance": None
            }
        )


class SetupPinView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        serializer = SetupPinSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Invalid PIN.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        wallet = get_or_create_wallet(
            request.user
        )

        wallet.pin = make_password(
            serializer.validated_data["pin"]
        )

        wallet.save(
            update_fields=["pin"]
        )

        return Response(
            {
                "message":
                    "Security PIN created successfully.",
                "has_pin": True
            }
        )


class VerifyPinView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        serializer = VerifyPinSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Enter a valid 4-digit PIN."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        wallet = get_or_create_wallet(
            request.user
        )

        if not wallet.pin:

            return Response(
                {
                    "detail":
                        "Please setup your PIN first.",
                    "has_pin": False
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not check_password(
            serializer.validated_data["pin"],
            wallet.pin
        ):

            return Response(
                {
                    "detail":
                        "Incorrect PIN."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "valid": True,
                "balance": wallet.balance
            }
        )


class SendMobileMoneyView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        serializer = MobileTransferSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Invalid transfer details.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        receiver_mobile = (
            serializer.validated_data[
                "receiver_mobile"
            ]
        )

        amount = serializer.validated_data[
            "amount"
        ]

        if receiver_mobile == request.user.mobile_number:

            return Response(
                {
                    "detail":
                        "You cannot send money to yourself."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        receiver = User.objects.filter(
            mobile_number=receiver_mobile
        ).first()

        if not receiver:

            return Response(
                {
                    "detail":
                        "Receiver mobile number is not registered."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():

            sender_wallet = Wallet.objects.select_for_update().get(
                user=request.user
            )

            receiver_wallet = Wallet.objects.select_for_update().get_or_create(
                user=receiver,
                defaults={
                    "balance":
                        Decimal("5000.00")
                }
            )[0]

            if sender_wallet.balance < amount:

                return Response(
                    {
                        "detail":
                            f"Insufficient balance. "
                            f"Available ₹{sender_wallet.balance:.2f}"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            sender_wallet.balance -= amount
            receiver_wallet.balance += amount

            sender_wallet.save(
                update_fields=["balance"]
            )

            receiver_wallet.save(
                update_fields=["balance"]
            )

            txn = Transaction.objects.create(
                sender=request.user,
                receiver=receiver,
                amount=amount,
                transaction_type=Transaction.MOBILE_TRANSFER,
                status=Transaction.SUCCESS
            )

            Notification.objects.create(
                user=request.user,
                message=(
                    f"₹{amount:.2f} sent to "
                    f"{receiver.username}."
                ),
                type=Notification.TRANSACTION_SENT
            )

            Notification.objects.create(
                user=receiver,
                message=(
                    f"₹{amount:.2f} received from "
                    f"{request.user.username}."
                ),
                type=Notification.TRANSACTION_RECEIVED
            )

        return Response(
            {
                "message":
                    "Money transferred successfully.",
                "reference_id":
                    str(txn.reference_id),
                "amount":
                    amount,
                "sender_balance":
                    sender_wallet.balance
            }
        )


class SendBankMoneyView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        serializer = BankTransferSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Invalid bank transfer.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        account_number = serializer.validated_data[
            "account_number"
        ]

        ifsc = serializer.validated_data[
            "ifsc_code"
        ]

        amount = serializer.validated_data[
            "amount"
        ]

        with transaction.atomic():

            wallet = Wallet.objects.select_for_update().get(
                user=request.user
            )

            if wallet.balance < amount:

                return Response(
                    {
                        "detail":
                            "Insufficient wallet balance."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            wallet.balance -= amount

            wallet.save(
                update_fields=["balance"]
            )

            txn = Transaction.objects.create(
                sender=request.user,
                recipient_account_number=account_number,
                recipient_ifsc=ifsc,
                amount=amount,
                transaction_type=Transaction.BANK_TRANSFER,
                status=Transaction.SUCCESS
            )

        return Response(
            {
                "message":
                    "Bank transfer successful.",
                "reference_id":
                    str(txn.reference_id),
                "sender_balance":
                    wallet.balance
            }
        )


class TransactionListView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        transactions = Transaction.objects.filter(
            Q(sender=request.user)
            | Q(receiver=request.user)
        )

        serializer = TransactionSerializer(
            transactions,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


class AddBankAccountView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        accounts = BankAccount.objects.filter(
            user=request.user
        )

        serializer = BankAccountSerializer(
            accounts,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = BankAccountSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Invalid bank details.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        account = serializer.save(
            user=request.user
        )

        return Response(
            {
                "message":
                    "Bank account added successfully.",
                "bank_account":
                    BankAccountSerializer(account).data
            },
            status=status.HTTP_201_CREATED
        )


class ContactListCreateView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        contacts = Contact.objects.filter(
            user=request.user
        )

        serializer = ContactSerializer(
            contacts,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = ContactSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "detail":
                        "Invalid contact.",
                    "errors":
                        serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        mobile = serializer.validated_data[
            "mobile_number"
        ]

        if Contact.objects.filter(
            user=request.user,
            mobile_number=mobile
        ).exists():

            return Response(
                {
                    "detail":
                        "Contact already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        contact = serializer.save(
            user=request.user
        )

        return Response(
            {
                "message":
                    "Contact added successfully.",
                "contact":
                    ContactSerializer(contact).data
            },
            status=status.HTTP_201_CREATED
        )


class NotificationListView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get(self, request):

        notifications = Notification.objects.filter(
            user=request.user
        )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response(
            {
                "message":
                    "Notifications marked as read."
            }
        )


class MarkNotificationsReadView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True
        )

        return Response(
            {
                "message":
                    "Notifications marked as read."
            }
        )


class LogoutView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        if refresh_token:

            try:
                token = RefreshToken(
                    refresh_token
                )

                token.blacklist()

            except Exception:
                pass

        return Response(
            {
                "message":
                    "Logged out successfully."
            }
        )