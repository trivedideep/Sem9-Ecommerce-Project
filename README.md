# Ecomus E-commerce Platform

A comprehensive full-stack e-commerce solution built using the MERN stack (MongoDB, Express, React, Node.js). This project consists of three main components: a robust backend API, a responsive customer storefront, and a feature-rich admin dashboard.

## 📂 Project Structure

The workspace is organized into three main directories:

*   **`Ecomas-backend-main/`**: The server-side application built with Node.js and Express. It handles API requests, database interactions (MongoDB), authentication, and business logic.
*   **`ecomus-frontend-new-main/`**: The client-side application for customers. Built with React, it allows users to browse products, manage their cart, place orders, and track shipments.
*   **`ecomusAdmin-main/`**: The administrative control panel. Built with React, it enables administrators to manage inventory, process orders, update banners, and oversee user activity.

## 🚀 Features

### Customer Storefront
*   **Product Browsing**: View products with details, images, and reviews.
*   **Search & Filter**: Find products by category, brand, or keywords.
*   **Shopping Cart**: Add items, update quantities, and manage cart.
*   **Checkout & Orders**: Secure checkout process and order history tracking.
*   **User Account**: Profile management, address book, and wishlist.
*   **Order Tracking**: Real-time status updates for placed orders.

### Admin Dashboard
*   **Dashboard Overview**: Analytics on sales, orders, and customers.
*   **Product Management**: Add, edit, and delete products, variants, and categories.
*   **Order Management**: View and update order statuses (Placed, Shipped, Delivered).
*   **Content Management**: Manage banners, sliders, and website information.
*   **User Management**: View and manage registered users.

### Backend API
*   **RESTful Architecture**: Organized routes for resources (Products, Users, Orders).
*   **Authentication**: Secure user and admin authentication (likely JWT).
*   **Database**: MongoDB schemas for structured data storage.
*   **Image Handling**: Upload and management of product and banner images.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Redux (State Management), CSS/Bootstrap.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB, Mongoose.
*   **Tools**: npm, Git.

## ⚙️ Installation & Setup

To run the project locally, follow these steps for each component:

### 1. Backend Setup
```bash
cd Ecomas-backend-main
npm install
# Ensure you have a .env file configured with your MongoDB URI and other secrets
npm start
```

### 2. Frontend (Store) Setup
```bash
cd ecomus-frontend-new-main
npm install
npm start
```
The application will typically run on `http://localhost:3000`.

### 3. Admin Panel Setup
```bash
cd ecomusAdmin-main
npm install
npm start
```
The admin panel will typically run on a separate port (e.g., `http://localhost:3001` or similar).

## 🤝 Contributing

Feel free to submit issues and enhancement requests.

## 📄 License

[Your License Here]
