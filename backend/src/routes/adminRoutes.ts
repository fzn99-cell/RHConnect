import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/authMiddleware";
import * as controller from "../controllers/adminController";

const router = express.Router();

// Admin Routes — all require authenticated admin
router.use(isAuthenticated, authorizeRoles("admin"));

// Get all users
// GET /api/admin/users
// Returns a list of all registered users
router.get("/users", controller.adminGetAllUsers);

// Create a new user
// POST /api/admin/users
// Registers a user with specified role and info
router.post("/users", controller.adminCreateUser);

// Reset a user's password
// PATCH /api/admin/users/:userId/change-password
// Allows admin to force-reset a user's password
router.patch("/users/:userId/change-password", controller.adminResetUserPassword);

// Patch user profile
// PATCH /api/admin/users/:userId/change-role
// Admin can update user fields (excluding password/email)
router.patch("/users/:userId", controller.adminPatchUser);

// Delete user account
// DELETE /api/admin/users/:userId/delete-user
// Permanently removes the specified user from the system
router.delete("/users/:userId", controller.adminDeleteUser);

export default router;
