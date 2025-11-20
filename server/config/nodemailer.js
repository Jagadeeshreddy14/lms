import nodemailer from 'nodemailer';

// Use environment variables for SMTP configuration so switching providers is easy.
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const smtpSecure = typeof process.env.SMTP_SECURE !== 'undefined'
  ? process.env.SMTP_SECURE === 'true'
  : smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // In production we should reject unauthorized certs. In dev this can be relaxed.
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
  logger: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
});

export default transporter;