import express from "express";
import * as controller from "../controllers/authController";

const router = express.Router();

// Login
// POST /api/auth/login
// Authenticates user credentials and issues a JWT cookie
router.post("/login", controller.login);

// Forgot Password
// POST /api/auth/forgot-password
// Sends a token to user's email for password reset verification
router.post("/forgot-password", controller.forgotPassword);

// Reset Password
// POST /api/auth/reset-password
// Verifies token and updates the user's password
router.post("/reset-password", controller.resetPassword);

// Logout
// POST /api/auth/logout
// Clears the auth token cookie and logs the user out
router.post("/logout", controller.logout);

export default router;
