import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import sendMail from "../utils/sendEmail";

const prisma = new PrismaClient();

const allowedRolesForCreation = [Role.hr, Role.tl, Role.nurse, Role.employee];

// Get all users
export const adminGetAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: "insensitive" } },
        { lastName: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          fullName: true,
          avatar: true,
          phone: true,
          department: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({ error: "Impossible de récupérer les utilisateurs." });
  }
};

// Create a new user
export const adminCreateUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      avatar,
      phone,
      department = "none",
      role = Role.employee,
      status = "active",
      notificationPreference = true,
      confidentialityPreference = true,
      country,
      city,
    } = req.body;

    if (!Object.values(Role).includes(role)) {
      return res.status(400).json({ error: "Rôle invalide." });
    }

    if (role === Role.admin) {
      const adminExists = await prisma.user.findFirst({
        where: { role: Role.admin },
      });
      if (adminExists) {
        return res.status(400).json({ error: "Un administrateur existe déjà." });
      }
    } else if (!allowedRolesForCreation.includes(role)) {
      return res.status(400).json({ error: "Création de ce rôle non autorisée." });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Un utilisateur avec cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
        avatar,
        phone,
        department,
        role,
        status,
        notificationPreference,
        confidentialityPreference,
        country,
        city,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        phone: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Send welcome email with plaintext password
    try {
      await sendMail({
        to: newUser.email,
        subject: "Bienvenue dans l'application - Vos identifiants",
        text: `Bonjour ${newUser.fullName || ""},\n\nVotre compte a été créé avec succès.\nVoici vos identifiants pour vous connecter:\n\nEmail: ${newUser.email}\nMot de passe: ${password}\n\nMerci de changer votre mot de passe après votre première connexion.`,
      });
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email:", emailError);
    }

    // Create notification for new user (info type)
    try {
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: "Compte créé",
          message: "Votre compte utilisateur a été créé avec succès.",
        },
      });
    } catch (notifError) {
      console.error("Erreur lors de la création de notification:", notifError);
      // non-blocking, log and continue
    }

    return res.status(201).json({
      message: "Utilisateur créé avec succès.",
      user: newUser,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Reset user password
export const adminResetUserPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const { userId } = req.params;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Le mot de passe est trop court (min. 8 caractères)." });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!targetUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Patch user
export const adminPatchUser = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    const { userId } = req.params;

    const forbiddenFields = ["id", "email", "password"];
    const sanitizedUpdates: Record<string, any> = {};

    for (const key in updates) {
      if (!forbiddenFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({ error: "Aucun champ valide à mettre à jour." });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!targetUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Auto-update fullName if firstName or lastName is being updated
    const firstName = sanitizedUpdates.firstName ?? targetUser.firstName ?? "";
    const lastName = sanitizedUpdates.lastName ?? targetUser.lastName ?? "";
    sanitizedUpdates.fullName = `${firstName} ${lastName}`.trim();

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: sanitizedUpdates,
      select: {
        id: true,
        fullName: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        country: true,
        city: true,
        notificationPreference: true,
        confidentialityPreference: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Utilisateur mis à jour avec succès.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Delete user
export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const deletedUser = await prisma.user.delete({
      where: { id: Number(userId) },
    });

    return res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
