\# Unfazed – Therapist Practice Management SaaS



Unfazed is a full-stack therapist practice management SaaS platform designed to help independent therapists and mental health professionals manage their practice from a single platform.



It provides tools for client management, appointment scheduling, public booking, clinical notes, payments, invoices, notifications, and practice analytics.



\---



\## 🚀 Key Features



\### 🔐 Authentication \& Security

\- JWT-based therapist authentication

\- Secure password hashing using bcrypt

\- Protected API routes

\- Therapist-level data isolation

\- Environment-based configuration for sensitive credentials



\### 👤 Client Management

\- Add and manage clients

\- Client contact information

\- Client status management

\- Intake and consent tracking

\- Automatic client creation through public bookings

\- Duplicate-client prevention based on email



\### 📅 Appointment Management

\- Create and manage appointments

\- Public appointment booking

\- Therapist availability management

\- Multiple session durations

\- Appointment status tracking

\- Overlap and availability validation

\- Date and time handling



\### 📝 Clinical Notes

\- Create and manage clinical notes

\- Client-specific clinical records

\- Protected therapist access to clinical information



\### 💳 Payments

\- Payment transaction management

\- Razorpay integration

\- Payment verification

\- Payment status tracking

\- Support for Razorpay, UPI and Cash



\### 🧾 Invoices

\- Create invoices for clients

\- Invoice number generation

\- Invoice status management

\- Due date support

\- Invoice details and copying



\### 📊 Practice Analytics

\- Total clients

\- Total bookings

\- Completed sessions

\- Cancelled bookings

\- Revenue tracking

\- Monthly revenue analysis

\- Booking statistics

\- Client statistics

\- Subscription-based feature entitlements



\### 🔔 Notifications

\- Therapist notifications

\- Read/unread notification tracking

\- Mark notifications as read

\- Notification filtering



\### 💬 Chat

\- Lightweight therapist communication/chat functionality

\- Message creation and retrieval



\### 🌐 Public Therapist Profile

\- Public therapist profile

\- Therapist specialization and language information

\- Public booking flow

\- Availability-based session selection



\---



\## 🛠️ Technology Stack



\### Frontend

\- React.js

\- React Router

\- Axios

\- Lucide React

\- Vite

\- HTML5

\- CSS3



\### Backend

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT

\- bcryptjs

\- Express Validator



\### Payments

\- Razorpay



\### Development Tools

\- Git

\- GitHub

\- VS Code

\- Postman



\---



\## 🏗️ System Architecture



```text

React.js Frontend

&#x20;      │

&#x20;      │ REST API

&#x20;      ▼

Express.js Backend

&#x20;      │

&#x20;      ├───────────────┬────────────────┐

&#x20;      ▼               ▼                ▼

&#x20;  MongoDB          Razorpay           JWT

&#x20;  Database         Payments       Authentication



Unfazed/

│

├── unfazed-backend/

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── models/

│   │   ├── routes/

│   │   └── services/

│   │

│   ├── .env.example

│   ├── app.js

│   ├── server.js

│   ├── package.json

│   └── package-lock.json

│

├── unfazed-frontend/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   ├── context/

│   │   ├── layouts/

│   │   ├── pages/

│   │   └── services/

│   │

│   ├── index.html

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

└── README.md



Public Therapist Profile

&#x20;         │

&#x20;         ▼

&#x20;  Select Date \& Time

&#x20;         │

&#x20;         ▼

&#x20;   Book Appointment

&#x20;         │

&#x20;         ▼

&#x20;    Client Created

&#x20;         │

&#x20;         ▼

&#x20;  Appointment Created

&#x20;         │

&#x20;         ├──────────────┐

&#x20;         ▼              ▼

&#x20;     Payments        Invoices

&#x20;         │              │

&#x20;         └──────┬───────┘

&#x20;                ▼

&#x20;         Practice Analytics



\---



\## 🔑 Environment Configuration



Create a `.env` file inside the backend directory.



Example:



```env

PORT=5000

MONGODB\_CONNECTION\_URL=your\_mongodb\_connection\_string

JWT\_SECRET=your\_jwt\_secret

RAZORPAY\_KEY\_ID=your\_razorpay\_key

RAZORPAY\_KEY\_SECRET=your\_razorpay\_secret



⚙️ Installation \& Setup

1\. Clone the Repository

git clone https://github.com/Kavyapoojar26/Unfazed.git

cd Unfazed

2\. Setup Backend

cd unfazed-backend

npm install



Create your .env file using .env.example.



Start the development server:



npm run dev



The backend runs on:



http://localhost:5000

3\. Setup Frontend



Open another terminal:



cd unfazed-frontend

npm install



Start the frontend:



npm run dev



The frontend will be available at:



http://localhost:5173

🔒 Security



Unfazed implements several security practices:



JWT authentication

Password hashing with bcrypt

Protected backend routes

Therapist-level authorization

Tenant/data isolation

Environment variables for sensitive credentials

Validation of appointment availability

Protected clinical data access

📌 API Modules



The backend provides REST APIs for:



Authentication

Therapist Profiles

Availability

Bookings

Clients

Clinical Notes

Payments

Invoices

Packages

Analytics

Notifications

Chat

Entitlements

💡 Highlights

Full-stack SaaS architecture

Public therapist booking experience

Therapist dashboard

Client CRM

Appointment scheduling

Clinical record management

Payment and invoice management

Practice analytics

Subscription-based feature entitlements

RESTful backend architecture

MongoDB-based data persistence

Responsive React frontend

🎯 Project Objective



The objective of Unfazed is to simplify the daily operations of independent therapists by bringing appointment management, client records, payments, invoicing, communication, and analytics into one centralized platform.



👩‍💻 Author



Kavya Poojar



Information Science \& Engineering



GitHub:

https://github.com/Kavyapoojar26

s

LinkedIn:

https://www.linkedin.com/in/kavyapoojar



📄 License



This project was developed as a software project and is intended for educational, portfolio, and demonstration purposes.



