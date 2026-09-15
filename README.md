# 📖 Reflection Hub — AI-Powered Mindful Journaling Platform

**Reflection Hub** is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed as a private, mindful digital sanctuary for personal journaling, mood tracking, and AI-powered reflections. 

---

## ✨ Features

- **🔐 Dual Authentication**: Email & password authentication with secure password hashing (`bcryptjs`) + Real **Google Sign-In** OAuth 2.0 with backend token verification (`google-auth-library`).
- **📝 Journal Management (CRUD)**: Create, view, edit, and delete private reflections with custom titles, content, and emotional mood badges (😊 Happy, 🌿 Calm, 😐 Neutral, ⚡ Excited, 🌧️ Sad, 🌋 Angry).
- **✍️ Interactive Writing Assistant**: Live dynamic writing tips based on word count along with real-time word and character counters.
- **🔍 Search, Filter & Sort**: Live instant search across titles and content, mood filtering dropdown, and chronological sorting (Newest / Oldest).
- **📊 Emotional Balance & Insights**: Non-AI analytics breakdown highlighting total reflections, most recent mood, most common mood, and a visual mood distribution progress bar.
- **✨ AI Reflections (Google Gemini)**: Generate structured emotional insights, key takeaways, and guided reflection questions for each individual journal entry.
- **🤖 AI Journal Companion Chat**: Dedicated AI assistant that conversationally answers questions strictly based on the authenticated user's private journal entries with safe Markdown rendering (`react-markdown`).
- **📱 Responsive & Premium UI**: Built with a calm indigo/purple aesthetic, soft gradients, glassmorphism navbar, and mobile navigation drawer.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 19** + **Vite**
- **React Router v7** for SPA routing and protected route guards
- **@react-oauth/google** for Google Sign-In button and authentication flow
- **react-markdown** for safe, rich markdown rendering
- **Custom CSS Design System** with CSS variables, smooth transitions, and responsive grid layouts

### Backend (`server/`)
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose** (User & Journal schemas with indexing and ownership validation)
- **JSON Web Tokens (JWT)** for secure session handling (7-day validity)
- **Google Auth Library (`google-auth-library`)** for server-side Google ID token verification
- **Google Gen AI SDK (`@google/genai`)** using the `gemini-3.6-flash` model
- **CORS** & **Dotenv** configuration

---

## 📂 Project Structure

```
reflection-hub/
├── client/                     # Frontend Vite + React application
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProtectedRoute
│   │   ├── context/            # AuthContext (login, register, googleLogin, logout)
│   │   ├── pages/              # Dashboard, CreateJournal, EditJournal, JournalDetails, AIChat, Login, Register, NotFound
│   │   ├── services/           # api.js (apiFetch, authService, journalService)
│   │   ├── App.jsx             # React Router route definitions
│   │   ├── index.css           # Global design system and component styling
│   │   └── main.jsx            # GoogleOAuthProvider & React root mount
│   ├── .env.example            # Frontend environment variable template
│   └── package.json
│
├── server/                     # Backend Express & Node.js API
│   ├── config/                 # db.js (MongoDB Mongoose connection)
│   ├── controllers/            # authController.js, journalController.js
│   ├── middleware/             # authMiddleware.js (JWT Bearer token verification)
│   ├── models/                 # User.js (supports local & Google auth), Journal.js
│   ├── routes/                 # authRoutes.js, journalRoutes.js
│   ├── server.js               # Express app instance, CORS & port listener
│   ├── vercel.json             # Serverless deployment configuration for Vercel
│   ├── .env.example            # Backend environment variable template
│   └── package.json
│
└── README.md
```

---

## 🚀 Local Setup Guide

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/reflection-hub.git
cd reflection-hub

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### 2. Environment Variables Configuration

#### Backend (`server/.env`)
Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/reflectionhub?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

### 3. Setting Up Google Cloud OAuth (Google Sign-In)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `Reflection Hub`).
3. Navigate to **APIs & Services > OAuth consent screen**:
   - Choose **External** user type.
   - Enter your App Name, User support email, and Developer contact email.
4. Navigate to **APIs & Services > Credentials**:
   - Click **+ Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for local development)
     - `https://your-frontend-domain.vercel.app` (for production)
   - Click **Create**.
5. Copy the generated **Client ID** and paste it into:
   - `server/.env` as `GOOGLE_CLIENT_ID`
   - `client/.env` as `VITE_GOOGLE_CLIENT_ID`

---

### 4. Running Locally

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🌐 Production Deployment (Vercel)

### Backend Deployment
1. Deploy the `server/` folder to Vercel or Render.
2. Set Environment Variables in your hosting dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `CLIENT_URL` (set to your production frontend URL)

### Frontend Deployment
1. Deploy the `client/` folder to Vercel.
2. Set Environment Variables:
   - `VITE_API_URL` (set to `https://your-backend.vercel.app/api`)
   - `VITE_GOOGLE_CLIENT_ID`
3. Add your production frontend domain to **Authorized JavaScript origins** in Google Cloud Console.

---

## 🔒 Security Best Practices

- **Strict User Isolation**: All journal endpoints enforce `user: req.user.id` on MongoDB queries.
- **Server-Side Google Verification**: Google credentials are authenticated server-side with `google-auth-library` before issuing session JWT tokens.
- **Zero Secrets in Client**: No API keys, database credentials, or secret keys are exposed to the client bundle.
- **Environment Isolation**: All credentials are systematically excluded via `.gitignore`.
