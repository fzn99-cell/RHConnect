// src/controllers/userController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        avatar: true,
        phone: true,
        country: true,
        city: true,
        hireDate: true,
        notificationPreference: true,
        confidentialityPreference: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,

        // Optional for admin audit / debug purposes (exclude password)
        resetToken: true,
        resetTokenExpiresAt: true,
        verificationToken: true,
        verificationTokenExpiresAt: true,

        // Optionally include counts or relations
        _count: {
          select: {
            requests: true,
            notifications: true,
            audits: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Erreur lors de la récupération d'un utilisateur:", error);
    res.status(500).json({ error: "Impossible de récupérer l'utilisateur." });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    if ((req as any).user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Accès interdit: réservé aux admins." });
    }

    const { userId } = req.params;
    const updateData = { ...req.body };

    delete updateData.id;

    if (updateData.firstName || updateData.lastName) {
      const existingUser = await prisma.user.findUnique({
        where: { id: Number(userId) },
      });
      updateData.fullName = `${
        updateData.firstName || existingUser?.firstName || ""
      } ${updateData.lastName || existingUser?.lastName || ""}`.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updateData,
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
    });

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'un utilisateur:", error);
    res
      .status(500)
      .json({ error: "Impossible de mettre à jour l'utilisateur." });
  }
};
