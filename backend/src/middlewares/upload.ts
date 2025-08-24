import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE = 10 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

console.log("UPLOAD_DIR:", path.join(process.cwd(), "uploads"));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${file.fieldname}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

// FIXED: Use `.single('file')` to match frontend FormData field name
export const uploadFiles = upload.single("file");

export const fileProcessor = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    req.processedFiles = [
      {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
      },
    ];
  }
  next();
};
