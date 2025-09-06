import { Request, Response } from "express";
import {
  PrismaClient,
  RequestType,
  RequestStatus,
  Role,
  Department,
} from "@prisma/client";
import sendMail from "../utils/sendEmail"; // adjust path

const prisma = new PrismaClient();

// Submit a new request
// POST /api/requests
// Accepts request data + optional file attachment
export const submitRequest = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId);

  if (!userId) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  const {
    requestType,
    description,
    subRequestData: rawSubRequestData,
  } = req.body;

  let subRequestData: any = {};
  if (typeof rawSubRequestData === "string") {
    try {
      subRequestData = JSON.parse(rawSubRequestData);
    } catch {
      return res.status(400).json({
        error: "Le champ subRequestData est invalide (JSON attendu).",
      });
    }
  } else {
    subRequestData = rawSubRequestData || {};
  }

  if (!userId || !requestType || !description) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  if (!Object.values(RequestType).includes(requestType)) {
    return res.status(400).json({ error: "Type de demande invalide." });
  }

  try {
    const baseRequest = await prisma.request.create({
      data: {
        userId,
        requestType,
        description,
        status: RequestStatus.pending,
      },
    });

    switch (requestType) {
      case RequestType.leave:
        if (!subRequestData.startDate || !subRequestData.endDate) {
          return res
            .status(400)
            .json({ error: "Les dates de congé sont requises." });
        }
        await prisma.leaveRequest.create({
          data: {
            requestId: baseRequest.id,
            startDate: new Date(subRequestData.startDate),
            endDate: new Date(subRequestData.endDate),
          },
        });
        break;

      case RequestType.sickLeave:
        if (!subRequestData.startDate || !subRequestData.endDate) {
          return res
            .status(400)
            .json({ error: "Les dates d'arrêt maladie sont requises." });
        }
        await prisma.sickLeaveRequest.create({
          data: {
            requestId: baseRequest.id,
            startDate: new Date(subRequestData.startDate),
            endDate: new Date(subRequestData.endDate),
            sickDays: subRequestData.sickDays || null,
          },
        });
        break;

      case RequestType.payslip:
        if (!subRequestData.deliveryMode) {
          return res.status(400).json({ error: "Mode de livraison requis." });
        }
        await prisma.payslipRequest.create({
          data: {
            requestId: baseRequest.id,
            deliveryMode: subRequestData.deliveryMode,
          },
        });
        break;

      case RequestType.workCertificate:
        await prisma.workCertificateRequest.create({
          data: {
            requestId: baseRequest.id,
            purpose: subRequestData?.purpose || null,
          },
        });
        break;

      case RequestType.medicalFileUpdate:
        await prisma.medicalFileUpdateRequest.create({
          data: {
            requestId: baseRequest.id,
            mrid: subRequestData?.mrid,
            notes: subRequestData?.notes || null,
          },
        });
        break;

      case RequestType.complaint:
        break;

      default:
        return res.status(400).json({ error: "Type de demande non supporté." });
    }

    if (req.processedFiles && req.processedFiles.length === 1) {
      const file = req.processedFiles[0];

      await prisma.file.deleteMany({ where: { requestId: baseRequest.id } });

      await prisma.file.create({
        data: {
          requestId: baseRequest.id,
          originalName: file.originalname,
          storedName: file.filename,
          filePath: file.filename,
        },
      });
    }

    // --- Dynamic Notification Logic ---
    let notifyRoles: Role[] = [];

    switch (requestType) {
      case RequestType.leave:
      case RequestType.sickLeave:
        // Notify Team Leaders (tl) for leave requests
        notifyRoles.push(Role.tl);
        break;

      case RequestType.medicalFileUpdate:
        // Notify Nurses (nurse) for medical updates
        notifyRoles.push(Role.nurse);
        break;

      case RequestType.payslip:
      case RequestType.workCertificate:
      case RequestType.complaint:
        // Notify HR for other requests
        notifyRoles.push(Role.hr);
        break;

      default:
        // Optionally, add a default case or log an error
        console.warn(
          "No specific notification role found for request type:",
          requestType
        );
        break;
    }

    // Always notify admins
    notifyRoles.push(Role.admin);

    const notifyUsers = await prisma.user.findMany({
      where: {
        role: { in: notifyRoles },
        id: { not: userId },
      },
    });

    const notificationPromises = notifyUsers.map(async (notifyUser) => {
      const title = "Nouvelle demande soumise";
      const message = `Une nouvelle demande (${requestType}) a été soumise par un utilisateur.`;

      // Create DB notification
      await prisma.notification.create({
        data: {
          userId: notifyUser.id,
          requestId: baseRequest.id,
          title,
          message,
        },
      });

      // Send email
      try {
        await sendMail({
          to: notifyUser.email,
          subject: title,
          text: `Bonjour ${notifyUser.fullName || ""},\n\n${message}\n\nDescription: ${description}\n\nMerci.`,
        });
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'email de notification:",
          emailError
        );
      }
    });

    await Promise.all(notificationPromises);

    return res.status(201).json({
      message: "Demande créée avec succès.",
      requestId: baseRequest.id,
    });
  } catch (error) {
    console.error("submitRequestWithFile error:", error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Get all requests
// GET /api/requests
// Returns paginated list with filters by role
export const getAllRequests = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Non autorisé." });

  const {
    status,
    requestType,
    userId,
    page = 1,
    limit = 10,
    sortField = "submittedAt",
    sortOrder = "desc",
  } = req.query;

  const ALLOWED_SORT_FIELDS = [
    "submittedAt",
    "updatedAt",
    "status",
    "requestType",
  ];
  const safeSortField = ALLOWED_SORT_FIELDS.includes(sortField as string)
    ? (sortField as string)
    : "submittedAt";

  const where: any = {};

  switch (user.role) {
    case "admin":
      // admin can see all
      break;
    case "hr":
      where.requestType = { in: ["workCertificate", "payslip", "complaint"] };
      break;
    case "tl":
      where.requestType = { in: ["leave", "sickLeave"] };
      break;
    case "nurse":
      where.requestType = "medicalFileUpdate";
      break;
    default:
      return res.status(403).json({ error: "Accès refusé." });
  }

  if (status && Object.values(RequestStatus).includes(status as any)) {
    where.status = status;
  }

  if (userId) {
    where.userId = Number(userId);
  }

  try {
    const total = await prisma.request.count({ where });

    const requests = await prisma.request.findMany({
      where,
      include: {
        user: true,
        files: true,
        leaveRequest: true,
        sickLeaveRequest: true,
        payslipRequest: true,
        workCertificateRequest: true,
        medicalFileUpdateRequest: true,
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { [safeSortField]: sortOrder as any },
    });

    // Add downloadUrl to each file
    const host = process.env.HOST_URL || "http://localhost:3000";
    const updatedRequests = requests.map((req) => ({
      ...req,
      files: req.files.map((file) => ({
        ...file,
        downloadUrl: `${host}/uploads/${file.filePath}`,
      })),
    }));

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      requests: updatedRequests,
    });
  } catch (err) {
    console.error("getAllRequests error:", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// GET /api/requests/pending-counts
// Grouped pending request counts by type
export const getAllPendingRequestCounts = async (
  req: Request,
  res: Response
) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Non autorisé." });

  const {
    // requestType,
    userId,
  } = req.query;

  const where: any = { status: "pending" };

  switch (user.role) {
    case "admin":
      break;
    case "hr":
      where.requestType = { in: ["workCertificate", "payslip", "complaint"] };
      break;
    case "tl":
      where.requestType = { in: ["leave", "sickLeave"] };
      where.user = { department: user.department };
      break;
    case "nurse":
      where.requestType = "medicalFileUpdate";
      break;
    default:
      return res.status(403).json({ error: "Accès refusé." });
  }

  // if (
  //   requestType &&
  //   Object.values(RequestType).includes(requestType as any) &&
  //   user.role === "admin" &&
  //   ["workCertificate", "payslip", "complaint"].includes(requestType as string)
  // ) {
  //   where.requestType = requestType;
  // }

  if (userId) {
    where.userId = Number(userId);
  }

  try {
    const counts = await prisma.request.groupBy({
      by: ["requestType"],
      _count: true,
      where,
    });

    const result = counts.reduce(
      (acc, item) => {
        acc[item.requestType] = item._count;
        return acc;
      },
      {} as Record<RequestType, number>
    );

    return res.json(result);
  } catch (err) {
    console.error("getAllPendingRequestCounts error:", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Get requests by userId
// GET /api/requests/user/:userId
// Only allowed for admin, tl roles
export const getRequestsByUserId = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "ID utilisateur invalide." });
  }

  try {
    const requests = await prisma.request.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { submittedAt: "desc" },
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("getRequestsBySpecificUser error:", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

// Get request by ID
// GET /api/requests/:requestId
// Returns full request details (includes files, audits, etc.)
export const getRequestById = async (req: Request, res: Response) => {
  const id = Number(req.params.requestId);
  if (isNaN(id)) return res.status(400).json({ error: "ID invalide." });

  try {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: true,
        files: true,
        audits: true,
        notifications: true,
        leaveRequest: true,
        sickLeaveRequest: true,
        payslipRequest: true,
        workCertificateRequest: true,
        medicalFileUpdateRequest: true, // Note: spelling/casing matters
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Demande introuvable." });
    }

    return res.json(request);
  } catch (err) {
    console.error("getRequestById error:", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

export const reviewRequest = async (req: Request, res: Response) => {
  const userId = Number((req as any).user?.userId);
  const { requestId } = req.params;
  const { newStatus, comment } = req.body;
  const intRequestId = Number(requestId);

  try {
    if (!Object.values(RequestStatus).includes(newStatus)) {
      return res.status(400).json({ error: "Statut invalide." });
    }

    const request = await prisma.request.findUnique({
      where: { id: intRequestId },
      include: {
        user: true,
        payslipRequest: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Demande introuvable." });
    }

    const updates: any = {
      status: newStatus,
    };

    if (comment?.trim()) {
      updates.comment = comment.trim();
    } // Check for file attachment and specific request type

    if (
      newStatus === RequestStatus.approved &&
      request.requestType === RequestType.payslip
    ) {
      if (!req.processedFiles || req.processedFiles.length === 0) {
        return res.status(400).json({
          error:
            "Un fichier PDF ou PNG est requis pour valider une demande de bulletin de salaire.",
        });
      }

      const file = req.processedFiles[0]; // Delete any existing files to prevent duplicates

      await prisma.file.deleteMany({ where: { requestId: request.id } }); // Create the new file record in the database
      await prisma.file.create({
        data: {
          requestId: request.id,
          originalName: file.originalname,
          storedName: file.filename,
          filePath: file.filename,
        },
      });
    }

    await prisma.request.update({
      where: { id: intRequestId },
      data: updates,
    });

    await prisma.audit.create({
      data: {
        requestId: intRequestId,
        field: "status",
        oldValue: request.status,
        newValue: newStatus,
        changedBy: userId,
      },
    });

    if (comment?.trim() && comment.trim() !== request.comment) {
      await prisma.audit.create({
        data: {
          requestId: intRequestId,
          field: "comment",
          oldValue: request.comment,
          newValue: comment.trim(),
          changedBy: userId,
        },
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: request.userId,
        requestId: intRequestId,
        title: "Demande traitée",
        message: `Votre demande a été ${newStatus === "approved" ? "approuvée" : "rejetée"}.`,
      },
    });
    try {
      await sendMail({
        to: request.user.email,
        subject: `Traitement de votre demande - ${notification.title}`,
        text: `Bonjour ${request.user.fullName || ""},

Demande traitée avec succès

Détails de la demande :
${comment}

Merci de votre patience.`.trim(),
      });
    } catch (emailError) {
      console.error(
        "Erreur lors de l'envoi de l'email de notification:",
        emailError
      );
    }

    return res.status(200).json({ message: "Demande traitée avec succès." });
  } catch (err) {
    console.error("reviewRequest error:", err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
};
