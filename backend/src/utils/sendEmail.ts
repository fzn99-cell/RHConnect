import nodemailer from "nodemailer";
import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM_EMAIL,
  SMTP_FROM_NAME,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  logger.error("Missing SMTP configuration in environment variables");
}

// TypeScript: define the shape of the input
interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Nodemailer transport config
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // true for 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export default async function sendMail({
  to,
  subject,
  text,
  html,
}: SendMailOptions): Promise<void> {
  if (!to || !subject || (!text && !html)) {
    logger.error("Missing required fields: to, subject, and text or html");
    throw new Error("Missing required fields for email.");
  }

  const mailOptions = {
    from: SMTP_FROM_NAME
      ? `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`
      : SMTP_FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err}`);
    throw err;
  }
}
