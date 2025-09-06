// middlewares/langMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { t as translate } from "../utils/i18n";

export const setLang = (req: Request, res: Response, next: NextFunction) => {
  const lang = req.headers["accept-language"]?.split(",")[0]?.toLowerCase().startsWith("fr") ? "fr" : "en";

  (req as any).lang = lang;

  // Inject t() function bound to lang
  (req as any).t = (key: string, vars: Record<string, string> = {}) => {
    return translate(key, lang, vars);
  };

  next();
};
