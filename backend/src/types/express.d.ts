// types/express.d.ts
declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      role: string;
      department: string;
      email: string;
    };
    id?: string;
    lang?: string;
    t?: (key: string, vars?: Record<string, string>) => string;
    processedFiles?: {
      originalname: string;
      filename: string;
      path: string;
    }[];
  }
}
