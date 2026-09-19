const express = require("express");
const router = express.Router();
const { login, pinLogin, getMe } = require("../controllers/authController");

// Public routes
router.post("/operator/login", login);
router.post("/operator/pin-login", pinLogin);
router.post("/login", login);
router.post("/pin-login", pinLogin);

// Protected routes
router.get("/operator/me", getMe);
router.get("/me", getMe);

module.exports = router;
