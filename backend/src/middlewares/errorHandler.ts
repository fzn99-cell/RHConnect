// middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

type ExpressError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
};

export const errorHandler = (
  err: ExpressError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  try {
    logger.error({
      event: "UNHANDLED_ERROR",
      timestamp: new Date().toISOString(),

      // Request context
      method: req.method,
      path: req.path,
      url: req.originalUrl,
      ip: req.ip,
      status,

      // Request data
      params:
        typeof req.params === "object" && req.params !== null
          ? req.params
          : null,
      query:
        typeof req.query === "object" && req.query !== null ? req.query : null,
      body: typeof req.body === "object" && req.body !== null ? req.body : null,

      headers: req.headers,

      // Error detail
      error: {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack,
        details: err.details,
      },
    });
  } catch (logErr) {
    console.error("Logging failed:", logErr);
  }

  res.status(status).json({
    message: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_ERROR",
  });
};
