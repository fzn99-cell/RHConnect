import { createLogger, format, transports, addColors } from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// --- Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, "..", "..", "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// --- Custom log levels and colors
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const customColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

addColors(customColors);

// --- Logger instance
const logger = createLogger({
  levels: customLevels,
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${stack || message}`;
        })
      ),
    }),

    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      handleExceptions: true,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),

    new transports.File({
      filename: path.join(logDir, "combined.log"),
      format: format.combine(format.timestamp(), format.json()),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

export default logger;
