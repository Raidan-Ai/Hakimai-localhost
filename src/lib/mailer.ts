import nodemailer from 'nodemailer';

/**
 * Hakim AI - Secure SMTP Email Utility
 * 
 * This utility handles system notifications, password resets, and OTPs.
 * It uses environment variables for secure credential management.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.raidan.pro',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL, // hakim@raidan.pro
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Sends a system email from Hakim AI.
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param htmlBody - HTML content of the email
 */
export async function sendSystemEmail(to: string, subject: string, htmlBody: string) {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('[MAILER] SMTP credentials missing. Email not sent.');
    return { success: false, error: 'Credentials missing' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Hakim AI by RaidanPro" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html: htmlBody,
    });

    console.log(`[MAILER] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAILER] Error sending email:', error);
    return { success: false, error };
  }
}

export default { sendSystemEmail };
