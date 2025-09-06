// middlewares/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (handler: AsyncRouteHandler): RequestHandler => {
  return function wrappedHandler(req, res, next) {
    handler(req, res, next).catch((err) => {
      console.error(`[${new Date().toISOString()}] Async Error:`, {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body,
      });
      next(err);
    });
  };
};
