# 🛍️ Nikhil E-Commerce Web

A full-stack, multi-role e-commerce platform built with **Next.js 14** (App Router), **Node.js + Express**, **MongoDB**, **Razorpay**, and **Cloudinary**.

---

## 📁 Project Structure

```
Nikhil E-Commerce Web/
├── frontend/          # Next.js 14 + Tailwind CSS + Redux Toolkit
└── backend/           # Express + TypeScript + Mongoose
```

---

## ✨ Features

| Area | Features |
|---|---|
| **Auth** | JWT + Refresh tokens, bcrypt passwords, role-based access (Customer / Seller / Admin) |
| **Products** | CRUD, Cloudinary image upload, search, filter, sort, pagination, reviews & ratings |
| **Cart & Wishlist** | Real-time sync, quantity controls, Redux state |
| **Orders** | Razorpay payment, HMAC verification, stock deduction, status tracking |
| **Email** | Order confirmation, password reset, welcome emails (Nodemailer) |
| **Seller Dashboard** | Product management, order fulfilment, revenue stats |
| **Admin Dashboard** | User approve/block, product activate/deactivate, platform stats |
| **Frontend** | Navbar with badges, checkout, order history+detail, profile settings |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

#### `backend/.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shopx
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

CLIENT_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

#### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Run Development Servers

```bash
# Backend (from /backend)
npm run dev    # Starts on http://localhost:5000

# Frontend (from /frontend)
npm run dev    # Starts on http://localhost:3000
```

---

## 🗺️ API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login + get tokens |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/products` | — | List products (search/filter/sort) |
| GET | `/api/products/:slug` | — | Product detail + reviews |
| POST | `/api/products` | seller | Create product |
| GET | `/api/cart` | customer | Get cart |
| POST | `/api/cart` | customer | Add item to cart |
| POST | `/api/orders/create` | customer | Create Razorpay order |
| POST | `/api/orders/verify` | customer | Verify payment + confirm order |
| GET | `/api/orders/my` | customer | My order history |
| GET | `/api/seller/stats` | seller | Seller dashboard stats |
| GET | `/api/admin/stats` | admin | Admin dashboard stats |
| PATCH | `/api/admin/users/:id/approve` | admin | Approve seller |
| PATCH | `/api/admin/users/:id/block` | admin | Block/unblock user |

---

## 🌐 Deployment

### Backend → [Render](https://render.com)
1. Connect this GitHub repo to Render
2. Choose **Web Service**, root dir = `backend`
3. Build: `npm install && npm run build`  
   Start: `node dist/server.js`
4. Set all env vars from `backend/.env` in the Render dashboard
5. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → [Vercel](https://vercel.com)
1. Import the repo on Vercel, set root dir to `frontend`
2. Add env vars:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL + `/api`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` → your Razorpay key

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Redux Toolkit · Axios · react-hot-toast  
**Backend:** Node.js · Express · TypeScript · Mongoose · JWT · Zod  
**Services:** MongoDB Atlas · Cloudinary · Razorpay · Nodemailer (Gmail SMTP)  
**Deploy:** Vercel (frontend) · Render (backend)

---

Built by **Nikhil K** 🚀
