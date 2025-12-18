# Ecomus Electronics Store

A MERN-stack e-commerce platform for electronics with secure payments, end-to-end order management, and post-purchase tracking. This README documents the implemented features as they exist today—no future or unbuilt items are listed.

## Overview
- **Frontends**: Customer storefront and Admin dashboard (React, Axios)
- **Backend**: Node.js + Express.js (REST APIs)
- **Database**: MongoDB with Mongoose models
- **Payments**: Razorpay for online payments
- **Auth**: JWT-based authentication
- **Domain**: Electronics retail (products, cart, checkout, orders)

## Features (Implemented)
- User authentication (login/register) via JWT
- Product listing and product detail pages
- Shopping cart and checkout
- Order placement with online payment using Razorpay
- GST calculation on backend
- Order confirmation email with invoice
- Stock management after successful payment
- Admin order management
- Order analytics dashboard
- Ratings & reviews (only for users who purchased)
- Order tracking with status timeline (Pending → Processing → Shipped → Delivered)

## Tech Stack
- **Frontend**: React.js, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Payments**: Razorpay
- **Auth**: JWT

## Installation & Setup
1) Clone the repository and install dependencies for each app:
```bash
# Backend
cd Ecomas-backend-main
npm install

# Frontend (customer)
cd ../ecomus-frontend-new-main
npm install

# Admin dashboard
cd ../ecomusAdmin-main
npm install
```
2) Configure environment variables (see examples below).
3) Run backend, then start the frontends on their respective ports.

## Environment Variables (examples)
Backend (`Ecomas-backend-main/.env`):
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ecomus
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_pass
BASE_URL=http://localhost:8000
```
Frontend (`ecomus-frontend-new-main/.env`):
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_API_IMAGE_URL=http://localhost:8000
```
Admin (`ecomusAdmin-main/.env`):
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## Folder Structure (high level)
- `Ecomas-backend-main/` – Node/Express API, routes, controllers, models, middlewares
- `ecomus-frontend-new-main/` – Customer-facing React app
- `ecomusAdmin-main/` – Admin React dashboard

## API Overview (basic)
- Auth: login, register
- Products: list, single product
- Cart: add/update/remove items
- Orders: create order, process payment (Razorpay), update status, tracking data
- Reviews: add reviews for purchased products
- Admin: manage orders and view analytics

## Screenshots
(Place your screenshots here)
- ![Storefront Screenshot](./screenshots/storefront-placeholder.png)
- ![Product Detail Screenshot](./screenshots/product-placeholder.png)
- ![Order Tracking Screenshot](./screenshots/tracking-placeholder.png)
- ![Admin Dashboard Screenshot](./screenshots/admin-placeholder.png)

## Future Improvements (optional)
- Performance tuning and caching
- Enhanced reporting for admins
- Additional payment methods

## License
Add your chosen license here.
