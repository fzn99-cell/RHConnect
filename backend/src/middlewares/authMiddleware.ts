import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.userId ||
      !decoded.department ||
      !decoded.email ||
      !decoded.role
    ) {
      throw new Error("Invalid token payload");
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      department: decoded.department,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ message: "User role not found." });
    }

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions." });
    }

    next();
  };
};
