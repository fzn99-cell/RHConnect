import express from "express";
import * as controller from "../controllers/selfController";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = express.Router();

// All /self routes require an authenticated user
router.use(isAuthenticated);

// Get My Profile
// GET /api/self/profile
// Returns the authenticated user's profile
router.get("/profile", controller.getMyProfile);

// Update My Profile
// PATCH /api/self/profile
// Updates editable fields in the user's profile
router.patch("/profile", controller.patchMyProfile);

// Change My Password
// PATCH /api/self/change-password
// Validates old password and sets a new one
router.patch("/change-password", controller.changeMyPassword);

// Get My Requests
// GET /api/self/requests
// Fetches paginated requests submitted by the authenticated user
router.get("/requests", controller.getMyRequests);

// Get My Request By ID
// GET /api/self/requests/:requestId
// Get a request belongs to the user
router.get("/requests/:requestId", controller.patchMyRequest);

// Patch My Request
// PATCH /api/self/requests/:requestId
// Updates an existing request created by the user
router.patch("/requests/:requestId", controller.patchMyRequest);

// Delete My Request
// DELETE /api/self/requests/:requestId
// Deletes a request created by the user
router.delete("/requests/:requestId", controller.deleteMyRequest);

export default router;
