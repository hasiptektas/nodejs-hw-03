import nodemailer from 'nodemailer';
import { HttpError } from '../utils/errors.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("error", error);
      throw new HttpError(500, 'Failed to send the email, please try again later.');
    }
};

