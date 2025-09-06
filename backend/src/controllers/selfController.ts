import { Request, Response } from "express";
import { PrismaClient, RequestStatus, RequestType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Get My Profile
// GET /api/self/profile
// Returns the authenticated user's profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user?.userId);
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        notificationPreference: true,
        confidentialityPreference: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.status(200).json({
      message: "Profil récupéré avec succès.",
      user,
    });
  } catch (error) {
    console.error("Erreur dans getMyProfile:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Patch My Profile
// PATCH /api/self/profile
// Updates editable fields in the user's profile
export const patchMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user?.userId);
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const forbiddenFields = [
      "password",
      "role",
      "department",
      "email",
      "status",
    ];
    const data: Record<string, any> = {};

    for (const key in req.body) {
      if (!forbiddenFields.includes(key)) {
        data[key] = req.body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "Aucune donnée valide à mettre à jour." });
    }

    if (data.firstName || data.lastName) {
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      data.fullName =
        `${data.firstName || existingUser?.firstName || ""} ${data.lastName || existingUser?.lastName || ""}`.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
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
      message: "Profil mis à jour avec succès.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur dans patchMyProfile:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Change My Password
// PATCH /api/self/change-password
// Validates old password and sets a new one
export const changeMyPassword = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user?.userId);
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Les champs oldPassword et newPassword sont requis.",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Ancien mot de passe incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ message: "Mot de passe changé avec succès." });
  } catch (error) {
    console.error("Erreur dans changeMyPassword:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get My Requests
// GET /api/self/requests
// Fetches paginated requests submitted by the authenticated user
export const getMyRequests = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId);
  if (!userId) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  const { status, requestType, page = 1, limit = 10 } = req.query;
  const filters: any = { userId };

  if (status && Object.values(RequestStatus).includes(status as any))
    filters.status = status;
  if (requestType && Object.values(RequestType).includes(requestType as any))
    filters.requestType = requestType;

  try {
    const requests = await prisma.request.findMany({
      where: filters,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { submittedAt: "desc" },
      include: {
        files: true, // <-- include files
        leaveRequest: true,
        sickLeaveRequest: true,
        payslipRequest: true,
        workCertificateRequest: true,
        medicalFileUpdateRequest: true,
      },
    });

    // Add downloadUrl for each file
    const host = process.env.HOST_URL || "http://localhost:3000";
    const updatedRequests = requests.map((r) => ({
      ...r,
      files: r.files.map((f) => ({
        ...f,
        downloadUrl: `${host}/uploads/${f.filePath}`,
      })),
    }));

    const total = await prisma.request.count({ where: filters });

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      requests: updatedRequests,
    });
  } catch (err) {
    console.error("Erreur dans getMyRequests:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Get My Request By ID
// GET /api/self/requests/:requestId
// Get a request belongs to the user
export const getMyRequestById = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId);
  if (!userId)
    return res.status(401).json({ message: "Utilisateur non authentifié." });

  const { requestId } = req.params;

  try {
    const request = await prisma.request.findUnique({
      where: { id: Number(requestId) },
      include: {
        files: true,
        leaveRequest: true,
        sickLeaveRequest: true,
        payslipRequest: true,
        workCertificateRequest: true,
        medicalFileUpdateRequest: true,
      },
    });

    if (!request || request.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Requête non autorisée ou introuvable." });
    }

    // Add downloadUrl
    const host = process.env.HOST_URL || "http://localhost:3000";
    const requestWithUrls = {
      ...request,
      files: request.files.map((f) => ({
        ...f,
        downloadUrl: `${host}/uploads/${f.filePath}`,
      })),
    };

    return res.json({
      message: "Requête récupérée avec succès.",
      request: requestWithUrls,
    });
  } catch (err) {
    console.error("Erreur dans getMyRequestById:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Patch My Request
// PATCH /api/self/requests/:requestId
// Updates a request if it's in 'pending' state and belongs to the user
export const patchMyRequest = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId);
  if (!userId) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  const { requestId } = req.params;

  try {
    const existing = await prisma.request.findUnique({
      where: { id: Number(requestId) },
    });

    if (!existing || existing.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Requête non autorisée ou introuvable." });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({
        message: "Impossible de modifier une requête non en attente.",
      });
    }

    const { requestType, description } = req.body;

    const updated = await prisma.request.update({
      where: { id: Number(requestId) },
      data: { requestType, description },
    });

    return res.json({
      message: "Requête mise à jour avec succès.",
      request: updated,
    });
  } catch (err) {
    console.error("Erreur dans patchMyRequest:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// Delete My Request
// DELETE /api/self/requests/:requestId
// Deletes a user's request if it is still 'pending'
export const deleteMyRequest = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId);
  if (!userId) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  const { requestId } = req.params;

  try {
    const existing = await prisma.request.findUnique({
      where: { id: Number(requestId) },
    });

    if (!existing || existing.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Requête non autorisée ou introuvable." });
    }

    if (existing.status !== "pending") {
      return res.status(400).json({
        message: "Impossible de supprimer une requête non en attente.",
      });
    }

    await prisma.request.delete({ where: { id: Number(requestId) } });

    return res.json({ message: "Requête supprimée avec succès." });
  } catch (err) {
    console.error("Erreur dans deleteMyRequest:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
