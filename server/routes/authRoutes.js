const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
} = require("../controllers/authController");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Google Sign-In
router.post("/google", googleLogin);

module.exports = router;