# 🍔 CraveBite: Next-Gen Online Food Ordering System

CraveBite is a premium, full-stack food delivery platform built with a cutting-edge tech stack. It features a futuristic "Liquid Glass" design system, real-time synchronization, and AI-driven user experiences.

![CraveBite Banner](https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070)

## ✨ Features

- **🚀 Premium UI/UX**: Built with Next.js 15, Tailwind CSS v4, and Framer Motion for ultra-smooth animations and glassmorphism effects.
- **🧠 AI Food Mood Selector**: Discover food based on your current vibe using our intelligent mood-based recommendation engine.
- **🎙️ Voice-Activated Search**: Search for your favorite dishes hands-free with integrated voice recognition.
- **⚡ Real-time Updates**: Live order tracking and instant admin notifications powered by Socket.io.
- **🛡️ Secure & Scalable**: Production-ready backend with JWT authentication, rate limiting, and Redis caching.
- **📊 Admin Dashboard**: Full control over menu management, order fulfillment, and user analytics.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Caching**: [Redis](https://redis.io/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Security**: Helmet, HPP, Rate-Limit, Express-Validator

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis server (Optional for local development)

### 2. Clone the Repository
```bash
git clone https://github.com/Prince-410/Online-Food-Ordering-System.git
cd Online-Food-Ordering-System
```

### 3. Setup Backend
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_uri
# JWT_SECRET=your_secret_key
# REDIS_URL=your_redis_url
npm run dev
```

### 4. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

The application will be running at `http://localhost:3000`.

---

## 📂 Project Structure

```text
.
├── backend/            # Express TypeScript Server
│   ├── src/            # Source files
│   ├── models/         # Mongoose schemas
│   ├── controllers/    # Business logic
│   └── routes/         # API endpoints
├── client/             # Next.js Application
│   ├── src/app/        # App router and components
│   ├── src/components/ # Shared UI components
│   └── src/store/      # Zustand state management
└── README.md           # This file
```

## 📜 License
This project is licensed under the MIT License.

---

Built with ❤️ by [Prince](https://github.com/Prince-410)
