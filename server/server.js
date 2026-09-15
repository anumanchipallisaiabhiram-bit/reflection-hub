const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const journalRoutes = require("./routes/journalRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Connect Database
connectDB();

// CORS Configuration
const allowedOrigins = [
  "https://reflection-hub-rouge.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelDomain = origin.endsWith(".vercel.app");

    if (isExplicitlyAllowed || isVercelDomain) {
      return callback(null, true);
    }

    // Default fallback to allow reflecting origin in response
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  optionsSuccessStatus: 200,
};

// Enable CORS for all incoming requests including preflight OPTIONS
app.use(cors(corsOptions));

// Explicit fast handler for preflight OPTIONS requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());

// Routes (supporting both /api/... and root-level aliases for resilience)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/journals", journalRoutes);
app.use("/journals", journalRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Reflection Hub API Running 🚀");
});

// Protected Test Route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You accessed a protected route!",
    user: req.user,
  });
});

// Start Server & Export for Vercel / Serverless
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;