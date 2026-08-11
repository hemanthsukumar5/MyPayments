# MyPayments 💳

A full-stack digital payment application built with **React.js, Vite, Django REST Framework, JWT Authentication, and SQL**.

MyPayments provides a secure and modern wallet experience where users can register using their mobile number, authenticate with JWT, manage their wallet, set a security PIN, transfer money to other users, add bank accounts, manage contacts, view transaction history, and receive notifications.

---

## 🚀 Features

### 🔐 Authentication

* Mobile-number based registration
* Unique mobile number validation
* Password and confirm-password validation
* JWT-based authentication
* Secure password hashing using Django's password hashing system
* Protected frontend routes
* Login and logout
* Persistent authentication using JWT tokens

### 👤 User Profile

* User profile drawer
* Username and mobile number
* Account information
* Logout functionality
* Personalized greeting:

```text
Hello, Username 👋
```

### 💰 Digital Wallet

* Automatic wallet creation after registration
* Initial testing balance of **₹5,000**
* Secure wallet balance management
* Balance deduction after sending money
* Balance credit after receiving money
* Atomic transaction processing

> **Note:** The ₹5,000 initial balance is a test/demo feature and should not be treated as real money.

### 🔒 Security PIN

* Four-digit wallet security PIN
* PIN setup before checking wallet balance
* Secure PIN hashing using Django's password-hashing mechanisms
* PIN verification before revealing balance
* PIN is never stored as plain text

### 💸 Money Transfer

#### Mobile Number Transfer

Users can send money to another registered MyPayments user using their mobile number.

Example:

```text
Sender Balance:    ₹5,000
Transfer Amount:   ₹1,000

After Transfer:

Sender Balance:    ₹4,000
Receiver Balance:  ₹6,000
```

The transfer is processed atomically so that the sender deduction and receiver credit happen together.

#### Bank Account Transfer

Users can also transfer money to a registered bank account.

Features include:

* Bank account number
* Account holder name
* Bank name
* IFSC code validation
* Balance availability validation
* Transaction record creation

### 🏦 Bank Accounts

* Add bank accounts
* Validate account details
* Validate IFSC code
* View linked bank accounts
* Manage multiple bank accounts

IFSC validation follows:

```text
^[A-Z]{4}0[A-Z0-9]{6}$
```

### 👥 Contacts

* Add contacts
* View saved contacts
* Save mobile numbers
* Quickly select contacts for transfers
* One-click transfer flow

### 📜 Transaction History

Users can view:

* Sent transactions
* Received transactions
* Mobile transfers
* Bank transfers
* Transaction amount
* Transaction status
* Reference ID
* Date and time

### 🔔 Notifications

* Notification drawer
* Transaction notifications
* Account notifications
* Read/unread notification status
* Mark notifications as read

### 📱 Responsive UI

The application uses a modern fintech-inspired interface with:

* Glassmorphism
* Dark-mode aesthetic
* Indigo/teal accents
* Responsive cards
* Smooth animations
* Mobile-friendly navigation
* Bottom navigation
* Responsive layouts

---

# 🛠️ Technology Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* React.js
* React Router
* Vite
* Axios

## Backend

* Python
* Django
* Django REST Framework
* JWT Authentication

## Database

* SQLite for development
* SQL-compatible architecture
* Can be configured for PostgreSQL/MySQL for production

## Development Tools

* VS Code
* Git
* GitHub
* Python Virtual Environment
* npm

---

# 📁 Project Structure

```text
MyPayments/
│
├── backend/
│   │
│   ├── manage.py
│   │
│   ├── mypayments_backend/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   ├── utils.py
│   │   └── tests.py
│   │
│   ├── requirements.txt
│   └── db.sqlite3
│
├── frontend/
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   └── src/
│       │
│       ├── api/
│       │   └── axios.js
│       │
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── BottomNav.jsx
│       │   ├── Profile.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── Logo.jsx
│       │
│       ├── pages/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── Home/
│       │   ├── SendMoney/
│       │   ├── Transactions/
│       │   ├── AddBankAccount/
│       │   ├── CheckBalance/
│       │   └── Contacts/
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── README.md
```

---

# 🏗️ System Architecture

```text
                   ┌──────────────────────┐
                   │      React.js        │
                   │      Frontend        │
                   └──────────┬───────────┘
                              │
                              │ Axios / REST API
                              ▼
                   ┌──────────────────────┐
                   │      Django REST     │
                   │       Backend        │
                   └──────────┬───────────┘
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       Authentication      Wallet          Transfers
             │                │                │
             ▼                ▼                ▼
          JWT Auth        PIN Security     Transactions
                              │
                              ▼
                     ┌────────────────┐
                     │   SQL Database │
                     └────────────────┘
```

---

# 🗄️ Database Models

The backend contains the following major models.

## CustomUser

Stores application user information.

```text
CustomUser
├── username
├── mobile_number
├── password
└── account information
```

The mobile number is unique.

---

## Wallet

Each user has one wallet.

```text
Wallet
├── user
├── balance
└── pin
```

A wallet is automatically created when a user registers.

Initial testing balance:

```text
₹5,000
```

---

## BankAccount

Stores linked bank account information.

```text
BankAccount
├── user
├── account_holder_name
├── bank_name
├── account_number
└── ifsc_code
```

---

## Transaction

Stores payment transactions.

```text
Transaction
├── sender
├── receiver
├── amount
├── transaction_type
├── status
├── reference_id
└── date_time
```

Transaction types:

```text
MOBILE
BANK
```

Transaction statuses:

```text
SUCCESS
FAILED
```

---

## Contact

Stores saved contacts.

```text
Contact
├── user
├── contact_name
└── mobile_number
```

---

## Notification

Stores user notifications.

```text
Notification
├── user
├── message
├── is_read
└── created_at
```

---

# 🔑 Authentication Flow

```text
User
 │
 ▼
Register
 │
 ▼
Validate Mobile Number
 │
 ├── Already Exists → Error
 │
 └── Valid
       │
       ▼
Create User
       │
       ▼
Create Wallet
       │
       ▼
Initial Balance ₹5,000
       │
       ▼
Login
       │
       ▼
JWT Token
       │
       ▼
Protected Home
```

---

# 🔐 JWT Authentication

The frontend uses Axios to communicate with the Django API.

Example:

```javascript
import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/"
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});

export default API;
```

The JWT token is attached automatically to authenticated requests.

---

# 💸 Transfer Flow

## Mobile Transfer

```text
User enters recipient mobile number
              │
              ▼
Check recipient exists
              │
              ▼
Check transfer amount
              │
              ▼
Check sender balance
              │
              ▼
Deduct sender wallet
              │
              ▼
Credit receiver wallet
              │
              ▼
Create transaction
              │
              ▼
Create notification
              │
              ▼
Return success response
```

The transfer should use a database transaction to prevent partial updates.

---

# 💰 Balance Example

Suppose:

```text
User A = ₹5,000
User B = ₹3,000
```

User A sends:

```text
₹1,500
```

The resulting balances are:

```text
User A = ₹3,500
User B = ₹4,500
```

The transaction history records:

```text
Sender: User A
Receiver: User B
Amount: ₹1,500
Type: MOBILE
Status: SUCCESS
```

---

# 🏦 Bank Transfer Flow

```text
Select Bank Account
        │
        ▼
Enter Amount
        │
        ▼
Validate Bank Details
        │
        ▼
Validate IFSC
        │
        ▼
Check Wallet Balance
        │
        ▼
Process Transfer
        │
        ▼
Create Transaction
        │
        ▼
Create Notification
```

---

# 🔒 PIN Security Flow

Before checking the wallet balance:

```text
Check Balance
      │
      ▼
PIN Setup?
 ┌────┴────┐
 │         │
Yes       No
 │         │
 ▼         ▼
Enter PIN  Verify PIN
 │         │
 ▼         ▼
Hash PIN   Correct?
 │         │
 ▼       ┌─┴─┐
Save     │   │
         Yes No
          │   │
          ▼   ▼
       Show  Error
       Balance
```

The PIN should never be stored as plain text.

---

# 📡 API Endpoints

Base URL:

```text
http://127.0.0.1:8000/api/
```

## Authentication

| Method | Endpoint     | Description       |
| ------ | ------------ | ----------------- |
| POST   | `/register/` | Register new user |
| POST   | `/login/`    | Login user        |
| GET    | `/profile/`  | Get profile       |

## Wallet

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/balance/`    | Check wallet balance |
| POST   | `/setup-pin/`  | Create wallet PIN    |
| POST   | `/verify-pin/` | Verify wallet PIN    |

## Transfers

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| POST   | `/send-mobile/` | Send money to mobile |
| POST   | `/send-bank/`   | Send money to bank   |

## Bank Accounts

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| POST   | `/bank-accounts/` | Add bank account   |
| GET    | `/bank-accounts/` | List bank accounts |

## Contacts

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| POST   | `/contacts/` | Add contact   |
| GET    | `/contacts/` | List contacts |

## Transactions

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/transactions/` | Transaction history |

## Notifications

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/notifications/`           | Get notifications         |
| PATCH  | `/notifications/<id>/read/` | Mark notification as read |

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MyPayments
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Create an admin user:

```bash
python manage.py createsuperuser
```

Start Django:

```bash
python manage.py runserver 8000
```

Backend:

```text
http://127.0.0.1:8000/
```

API:

```text
http://127.0.0.1:8000/api/
```

Admin:

```text
http://127.0.0.1:8000/admin/
```

---

# ⚛️ Frontend Setup

Open a new terminal.

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173/
```

---

# 📦 Recommended Backend Requirements

Your `requirements.txt` should contain the packages required by your implementation, for example:

```text
Django
djangorestframework
djangorestframework-simplejwt
django-cors-headers
```

Install them with:

```bash
pip install -r requirements.txt
```

---

# 🧪 Testing

Run backend tests:

```bash
python manage.py test api
```

Test the following scenarios:

### Registration

* Valid registration
* Duplicate mobile number
* Invalid mobile number
* Password mismatch
* Missing required fields

### Login

* Valid credentials
* Invalid password
* Invalid mobile number
* JWT token generation

### Wallet

* Wallet automatically created
* Initial ₹5,000 balance
* PIN setup
* Correct PIN
* Incorrect PIN
* Balance retrieval

### Mobile Transfer

* Valid recipient
* Invalid recipient
* Sufficient balance
* Insufficient balance
* Sender balance deduction
* Receiver balance credit
* Transaction creation

### Bank Transfer

* Valid bank account
* Invalid account details
* Invalid IFSC
* Insufficient balance
* Transaction creation

### Contacts

* Add contact
* List contacts
* Duplicate contact validation

### Notifications

* Notification creation
* Notification listing
* Mark notification as read

---

# ▶️ Running the Complete Application

Open **two terminals**.

### Terminal 1 — Django

```bash
cd backend
venv\Scripts\activate
python manage.py runserver 8000
```

### Terminal 2 — React

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173/
```

---

# 🖥️ Application Flow

```text
                    MyPayments
                        │
                        ▼
                   Login Page
                  /           \
                 /             \
          Existing User      New User
                │                │
                │                ▼
                │          Register Page
                │                │
                │                ▼
                │          Create Account
                │                │
                │                ▼
                │          Create Wallet
                │                │
                │                ▼
                │         ₹5,000 Test Balance
                │                │
                └───────┬────────┘
                        ▼
                     Login
                        │
                        ▼
                    JWT Token
                        │
                        ▼
                  Home Dashboard
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
   Send Money      Check Balance    Bank Account
        │               │                │
        ▼               ▼                ▼
 Mobile / Bank      PIN Verify       Add Account
        │               │
        ▼               ▼
 Transaction        Balance
        │
        ▼
 Notifications
        │
        ▼
 Transaction History
```

---

# 🎨 UI Design

The application follows a modern fintech design system.

### Design Characteristics

* Dark-mode inspired interface
* Glassmorphism cards
* Indigo and teal accent colors
* Rounded cards
* Responsive design
* Mobile-friendly bottom navigation
* Smooth hover effects
* Modern icons
* Clear transaction status indicators

### Main Header

```text
┌─────────────────────────────────────────────┐
│ 👤       MyPayments / DHS          🔔       │
│                                             │
│          Hello, Username 👋                 │
└─────────────────────────────────────────────┘
```

### Main Dashboard

```text
┌─────────────────────────────────────────────┐
│                                             │
│              Wallet Balance                 │
│                 ₹5,000                      │
│                                             │
│           [ Send Money ]                    │
│                                             │
│       [ Mobile ]     [ Bank ]               │
│                                             │
│             Contacts                        │
│                                             │
│         Recent Transactions                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Bottom Navigation

```text
┌─────────────────────────────────────────────┐
│  Transactions   Bank   Balance   Contacts   │
└─────────────────────────────────────────────┘
```

---

# 🔐 Security Considerations

The project follows several security practices:

* JWT authentication
* Django password hashing
* Hashed wallet PIN
* Protected API endpoints
* Protected React routes
* Unique mobile numbers
* Input validation
* IFSC validation
* Balance validation
* Atomic money transfers
* Transaction records
* Authentication middleware
* CORS configuration

For production deployment:

* Use HTTPS
* Store secrets in environment variables
* Use PostgreSQL/MySQL instead of SQLite
* Configure secure JWT expiration
* Add rate limiting
* Add OTP provider integration
* Never expose Django secret keys
* Never store passwords or PINs in frontend local storage
* Add proper audit logging

---

# ⚠️ Important Demo Limitation

This project is a **software/educational payment application prototype**.

The initial wallet balance of ₹5,000 is test data.

The application does **not automatically move real money between real bank accounts** unless a regulated payment gateway/banking API is integrated.

For a production payment application, integration with appropriate payment providers, banking APIs, KYC, compliance, fraud prevention, encryption, audit logging, and regulatory requirements would be necessary.

---

# 🔮 Future Enhancements

Possible future improvements:

* Real OTP/SMS integration
* QR code payments
* UPI ID support
* Payment gateway integration
* Real bank API integration
* KYC verification
* Biometric authentication
* Two-factor authentication
* Payment receipts
* PDF transaction statements
* Transaction search and filters
* Spending analytics
* Scheduled payments
* Recurring payments
* Multi-language support
* Dark/light theme switch
* Email notifications
* Push notifications
* Docker support
* CI/CD pipeline
* Cloud deployment

---

# 📊 Example Transaction

```text
Transaction ID: MP202608101234
Type: Mobile Transfer
From: User A
To: User B
Amount: ₹1,000
Status: SUCCESS
Date: 10 August 2026
```

---

# 🎯 Project Objective

The objective of **MyPayments** is to build a complete full-stack digital payment platform demonstrating:

* Modern React frontend development
* REST API development with Django
* JWT authentication
* Secure user management
* Wallet management
* Database relationships
* Atomic financial transactions
* Payment validation
* PIN-based security
* Responsive fintech UI
* Full-stack frontend/backend integration

---

# 👨‍💻 Author

**MyPayments**

A full-stack digital payment application developed using:

```text
React.js
JavaScript
HTML5
CSS3
Python
Django
Django REST Framework
JWT
Axios
SQL
Vite
```

---

# 📄 License

This project is intended for **educational, demonstration, and portfolio purposes**.
