import express from "express";
import { isAuthenticated, authorizeRoles } from "../middlewares/authMiddleware";
import { getUserById, updateUser } from "../controllers/userController.js";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/:userId", isAuthenticated, authorizeRoles(Role.admin, Role.tl, Role.nurse), getUserById);
router.patch("/:userId", isAuthenticated, updateUser);

export default router;
