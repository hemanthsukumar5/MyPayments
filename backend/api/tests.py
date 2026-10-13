from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Wallet, BankAccount, Transaction, Contact, Notification


class AuthAndWalletTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.profile_url = reverse('profile')

        self.user_data_1 = {
            "username": "Alice",
            "mobile_number": "9876543210",
            "password": "Password123",
            "confirm_password": "Password123"
        }
        self.user_data_2 = {
            "username": "Bob",
            "mobile_number": "9123456789",
            "password": "Password123",
            "confirm_password": "Password123"
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data_1, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(User.objects.filter(mobile_number="9876543210").count(), 1)

        user = User.objects.get(mobile_number="9876543210")
        self.assertTrue(hasattr(user, 'wallet'))
        self.assertEqual(user.wallet.balance, Decimal('5000.00'))

    def test_duplicate_mobile_number(self):
        self.client.post(self.register_url, self.user_data_1, format='json')
        # Try registering with same mobile number
        dup_data = self.user_data_2.copy()
        dup_data['mobile_number'] = "9876543210"
        response = self.client.post(self.register_url, dup_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], "Mobile number already registered")

    def test_user_login(self):
        self.client.post(self.register_url, self.user_data_1, format='json')
        login_response = self.client.post(self.login_url, {
            "mobile_number": "9876543210",
            "password": "Password123"
        }, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)

        # Invalid password
        bad_response = self.client.post(self.login_url, {
            "mobile_number": "9876543210",
            "password": "WrongPassword"
        }, format='json')
        self.assertEqual(bad_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(bad_response.data['detail'], "Invalid mobile number or password")


class ForgotPasswordAndLookupTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username="Alice", mobile_number="9876543210", password="OldPassword123")
        self.verify_url = reverse('forgot-password-verify')
        self.reset_url = reverse('forgot-password-reset')
        self.lookup_url = reverse('lookup-user')

    def test_forgot_password_verification(self):
        # Match mobile and username
        resp = self.client.post(self.verify_url, {"mobile_number": "9876543210", "username": "Alice"}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['valid'])

        # Mismatch
        resp_bad = self.client.post(self.verify_url, {"mobile_number": "9876543210", "username": "WrongName"}, format='json')
        self.assertEqual(resp_bad.status_code, status.HTTP_400_BAD_REQUEST)

    def test_forgot_password_reset(self):
        # Reset password
        reset_resp = self.client.post(self.reset_url, {
            "mobile_number": "9876543210",
            "username": "Alice",
            "new_password": "NewSecurePassword123",
            "confirm_password": "NewSecurePassword123"
        }, format='json')

        self.assertEqual(reset_resp.status_code, status.HTTP_200_OK)

        # Login with new password
        login_resp = self.client.post(reverse('login'), {
            "mobile_number": "9876543210",
            "password": "NewSecurePassword123"
        }, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_lookup_user(self):
        self.client.force_authenticate(user=self.alice)
        resp = self.client.get(f"{self.lookup_url}?mobile_number=9876543210")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['registered'])
        self.assertEqual(resp.data['username'], "Alice")

        resp_not_found = self.client.get(f"{self.lookup_url}?mobile_number=9999999999")
        self.assertEqual(resp_not_found.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(resp_not_found.data['registered'])
