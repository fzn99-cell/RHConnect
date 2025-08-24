import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail";

const prisma = new PrismaClient();
const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
const TOKEN_EXPIRY = (process.env.TOKEN_EXPIRY as any) || "7d";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Entrée invalide." });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        role: true,
        password: true,
        department: true,
        failedLoginAttempts: true,
        lockUntil: true,
      },
    });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        message: "Votre compte est verrouillé. Veuillez contacter votre équipe Admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed attempts
      let failedAttempts = user.failedLoginAttempts + 1;
      let lockUntil = null;

      if (failedAttempts >= 3) {
        // Lock account for 15 minutes
        lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        failedAttempts = 0; // reset attempts after locking
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockUntil,
        },
      });

      return res.status(401).json({ message: "Identifiants invalides." });
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockUntil: null,
        },
      });
    }

    // Create token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        department: user.department,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Connexion réussie.",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Mot de passe oublié
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Entrée invalide." });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    const verificationToken = crypto.randomInt(100000, 999999).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 3600 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verificationToken, verificationTokenExpiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}`;
    const subject = "Réinitialisation du mot de passe";
    const html = `
      <p>Bonjour ${user.firstName || "utilisateur"},</p>
      <p>Voici votre code pour réinitialiser votre mot de passe :</p>
      <p><strong>Code : ${verificationToken}</strong></p>
      <p>Ou cliquez sur le lien suivant :</p>
      <a href="${resetUrl}">Réinitialiser le mot de passe</a>
      <p>Ce code expire dans une heure.</p>
    `;

    await sendEmail({ to: email, subject, html });
    return res.status(200).json({ message: "Code envoyé par e-mail." });
  } catch (error) {
    console.error("Erreur mot de passe oublié :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Entrée invalide." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || user.verificationToken !== token || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
      return res.status(400).json({
        message: "Token invalide ou expiré.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        password: hashedPassword,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur réinitialisation mot de passe :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Déconnexion
export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // same as login
      sameSite: "lax", // same as login
      path: "/", // make sure path matches
    });
    return res.status(200).json({ message: "Déconnexion réussie." });
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};
