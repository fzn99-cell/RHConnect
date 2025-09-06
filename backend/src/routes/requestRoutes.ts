import express from "express";
import {
  submitRequest,
  getRequestById,
  getAllRequests,
  getRequestsByUserId,
  getAllPendingRequestCounts,
  reviewRequest,
} from "../controllers/requestController";

import { authorizeRoles, isAuthenticated } from "../middlewares/authMiddleware";
import { fileProcessor, uploadFiles } from "../middlewares/upload";
import { Role } from "@prisma/client";

const router = express.Router();
router.use(isAuthenticated);

// Submit a new request
// POST /api/requests
// Accepts request data + optional file attachment
router.post("/", uploadFiles, fileProcessor, submitRequest);

// Get all requests
// GET /api/requests
// Returns paginated list with filters by role
router.get(
  "/",
  authorizeRoles(Role.admin, Role.tl, Role.nurse, Role.hr),
  getAllRequests
);

// GET /api/requests/pending-counts
// Grouped pending request counts by type
router.get(
  "/pending-counts",
  authorizeRoles(Role.admin, Role.tl, Role.nurse, Role.hr),
  getAllPendingRequestCounts
);

// Get all requests
// GET /api/requests
// Returns paginated list with filters by role
router.get(
  "/user/:userId",
  authorizeRoles(Role.admin, Role.tl, Role.hr, Role.nurse),
  getRequestsByUserId
);

// Get request by ID
// GET /api/requests/:requestId
// Returns full request details (includes files, audits, etc.)
router.get("/:requestId", getRequestById);

// Update request status
// POST /api/requests/:requestId/review
// Used by approvers to change request status
router.post("/:requestId/review", uploadFiles, fileProcessor, reviewRequest);

export default router;
