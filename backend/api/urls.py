from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    ForgotPasswordVerifyView,
    ForgotPasswordResetView,
    CheckBalanceView,
    SetupPinView,
    VerifyPinView,
    SendMobileMoneyView,
    SendBankMoneyView,
    TransactionListView,
    AddBankAccountView,
    ContactListCreateView,
    NotificationListView,
    MarkNotificationsReadView,
    LogoutView,
)


urlpatterns = [

    # Authentication
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile"
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout"
    ),

    # Forgot password
    path(
        "forgot-password/verify/",
        ForgotPasswordVerifyView.as_view(),
        name="forgot-password-verify"
    ),

    path(
        "forgot-password/reset/",
        ForgotPasswordResetView.as_view(),
        name="forgot-password-reset"
    ),

    # Wallet
    path(
        "balance/",
        CheckBalanceView.as_view(),
        name="balance"
    ),

    path(
        "setup-pin/",
        SetupPinView.as_view(),
        name="setup-pin"
    ),

    path(
        "verify-pin/",
        VerifyPinView.as_view(),
        name="verify-pin"
    ),

    # Transfers
    path(
        "send-mobile-money/",
        SendMobileMoneyView.as_view(),
        name="send-mobile-money"
    ),

    path(
        "send-bank-money/",
        SendBankMoneyView.as_view(),
        name="send-bank-money"
    ),

    # Transactions
    path(
        "transactions/",
        TransactionListView.as_view(),
        name="transactions"
    ),

    # Bank accounts
    path(
        "bank-accounts/",
        AddBankAccountView.as_view(),
        name="bank-accounts"
    ),

    # Contacts
    path(
        "contacts/",
        ContactListCreateView.as_view(),
        name="contacts"
    ),

    # Notifications
    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notifications"
    ),

    path(
        "notifications/mark-read/",
        MarkNotificationsReadView.as_view(),
        name="notifications-mark-read"
    ),
]