import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL } = process.env;

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends an email. If SMTP is not configured, logs the link to the server console
 * and returns { devLink } so the API can surface it in non-production only.
 */
export async function sendMail({ to, subject, text, html, link }) {
  const mailer = getTransporter();
  const from = SMTP_FROM || `Grand Restaurant & Cafe <${SMTP_USER || 'no-reply@localhost'}>`;

  if (!mailer) {
    console.log(`\n[mailer] SMTP not configured — email to ${to}:`);
    console.log(`[mailer] subject: ${subject}`);
    console.log(`[mailer] ${text}\n`);
    return { dev: true, link: link || null };
  }

  await mailer.sendMail({ from, to, subject, text, html });
  return { dev: false, link: null };
}

export function appUrl(path = '/') {
  const base = (APP_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${base}${path}`;
}

export async function sendVerificationEmail(user, token) {
  const link = appUrl(`/verify-email?token=${token}`);
  return sendMail({
    to: user.email,
    subject: 'Verify your email — Grand Restaurant & Cafe',
    text: `Hi ${user.name},\n\nConfirm your email for Grand Restaurant & Cafe:\n${link}\n\nThis link is valid for 24 hours.`,
    html: `<p>Hi ${user.name},</p><p>Confirm your email for <strong>Grand Restaurant &amp; Cafe</strong>:</p><p><a href="${link}">${link}</a></p><p>This link is valid for 24 hours.</p>`,
    link,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const link = appUrl(`/reset-password?token=${token}`);
  return sendMail({
    to: user.email,
    subject: 'Reset your password — Grand Restaurant & Cafe',
    text: `Hi ${user.name},\n\nReset your password (valid for 1 hour):\n${link}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hi ${user.name},</p><p>Reset your password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    link,
  });
}
