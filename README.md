# Electronics Store E-commerce Platform

A professional, full-stack e-commerce application designed specifically for an electronics retailer. Built using the MERN stack (MongoDB, Express, React, Node.js), this platform delivers a secure shopping experience for customers and a robust management system for administrators.

## 🚀 Features

### Customer Storefront
*   **User Authentication**: Secure login and registration functionality using JWT.
*   **Product Discovery**: Comprehensive product listings with detailed specifications and images.
*   **Shopping Cart & Checkout**: Seamless cart management and a streamlined checkout process.
*   **Online Payments**: Integrated **Razorpay** gateway for secure and reliable transactions.
*   **Order Tracking**: Visual status timeline for customers to track orders from **Pending** → **Processing** → **Shipped** → **Delivered**.
*   **Ratings & Reviews**: Exclusive review system allowing only verified purchasers to rate products.

### Backend & Business Logic
*   **Tax Calculation**: Automated GST calculation logic implemented on the server side.
*   **Stock Management**: Real-time inventory updates triggered automatically after successful payments.
*   **Invoicing**: Automated order confirmation emails sent to customers with attached invoices.

### Admin Dashboard
*   **Order Management**: Tools to view orders, manage workflows, and update delivery statuses.
*   **Analytics**: Dashboard providing insights into order trends and sales performance.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Axios
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB, Mongoose
*   **Authentication**: JSON Web Tokens (JWT)
*   **Payment Gateway**: Razorpay

## 📂 Project Structure

The solution is architected into three distinct applications:

*   **`Ecomas-backend-main/`**: The RESTful API server handling business logic, database interactions, authentication, and payment processing.
*   **`ecomus-frontend-new-main/`**: The customer-facing React application.
*   **`ecomusAdmin-main/`**: The administrative React dashboard for store operations.

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js & npm
*   MongoDB (Local or Atlas)
*   Razorpay Account credentials

### 1. Backend Setup
```bash
cd Ecomas-backend-main
npm install
# Configure your .env file
npm start
```

### 2. Frontend (Store) Setup
```bash
cd ecomus-frontend-new-main
npm install
npm start
```

### 3. Admin Panel Setup
```bash
cd ecomusAdmin-main
npm install
npm start
```

## 🔐 Environment Variables

Create a `.env` file in the `Ecomas-backend-main` directory with the following keys:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST=your_email_host
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

## 📡 API Overview

The backend exposes RESTful endpoints covering:
*   **Authentication**: User registration and login.
*   **Products**: Retrieval of product details and categories.
*   **Orders**: Order creation, status updates, and history.
*   **Payments**: Razorpay order generation and verification.
*   **Reviews**: Submission and retrieval of product ratings.

## 📸 Screenshots

*(Placeholders for project screenshots)*

*   **Home Page**
*   **Product Details & Reviews**
*   **Cart & Checkout**
*   **Order Tracking Timeline**
*   **Admin Dashboard**

## 🔮 Future Improvements

*   Advanced product filtering and search optimization.
*   Multi-currency support.
*   Mobile application integration.
