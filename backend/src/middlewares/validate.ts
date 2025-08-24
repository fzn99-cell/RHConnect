import { ZodSchema, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

type ZodAny = ZodSchema<any, any>;

export const validateBody = (schema: ZodAny) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body = schema.parse(req.body) as any;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation Error (body)',
        issues: err.issues,
      });
    }
    next(err);
  }
};

export const validateParams = (schema: ZodAny) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.params = schema.parse(req.params) as any;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation Error (params)',
        issues: err.issues,
      });
    }
    next(err);
  }
};

export const validateQuery = (schema: ZodAny) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.query = schema.parse(req.query) as any;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation Error (query)',
        issues: err.issues,
      });
    }
    next(err);
  }
};
