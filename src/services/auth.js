import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors.js';
import { sendEmail } from '../utils/sendMail.js';
import bcrypt from "bcrypt";
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMPLATES_DIR } from '../constants/index.js';
import { getEncryptedPassword } from '../utils/getEncryptedPassword.js';

const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new HttpError(409, 'Email in use');
  }

  const user = await User.create(userData);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  // Eski oturumları sil
  await Session.deleteMany({ userId: user._id });

  // Token'ları oluştur
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });

  // Yeni oturum oluştur
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};

const logout = async (refreshToken) => {
  try {
    // Refresh token'a göre oturumu sil
    const deletedSession = await Session.findOneAndDelete({ refreshToken });
    
    // Eğer oturum bulunamazsa hata fırlatma (zaten logout sayılır)
    if (!deletedSession) {
      return false;
    }

    return true;
  } catch (error) {
    throw new HttpError(500, 'Logout failed', { cause: error });
  }
};

const refresh = async (refreshToken) => {
  // 1. Refresh token'ı doğrula
  // let decoded;
  // try {
  //   decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  // } catch (error) {
  //   throw HttpError(401, 'Invalid refresh token');
  // }

  // 2. Veritabanında oturumu kontrol et
  const session = await Session.findOne({ 
    refreshToken,
    refreshTokenValidUntil: { $gt: new Date() }
  }).populate('userId');

  if (!session) {
    throw new HttpError(401, 'Session expired or not found');
  }

  // 3. Eski oturumu sil
  await Session.findByIdAndDelete(session._id);

  // 4. Yeni token'lar oluştur
  const newAccessToken = jwt.sign({ id: session.userId._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const newRefreshToken = jwt.sign({ id: session.userId._id }, process.env.REFRESH_SECRET, { expiresIn: '30d' });

  // 5. Yeni oturum oluştur
  await Session.create({
    userId: session.userId._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 dakika
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      _id: session.userId._id,
      name: session.userId.name,
      email: session.userId.email,
    }
  };
};

const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(404, "User Not Found");
  }

  const resetToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${process.env.APP_DOMAIN}/auth/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (token, password) => {

  console.log("Gelen token:", token);
  console.log("Decoded token:", jwt.verify(token, process.env.JWT_SECRET));
  let userId;
  try {
    const decoded  = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
    console.log("userData", userId);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'Token is expired or invalid.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, 'Token is invalid.');
    }
    throw error;
  }

  const user = await User.findById({
    _id: userId
  });

  if (!user) {
    throw new HttpError(404, 'User not found!');
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { password: await getEncryptedPassword(password) } },
  );

  await Session.findOneAndDelete({ userId: user._id });
};

// authService export'una refresh'i eklemeyi unutmayın
export const authService = {
  register,
  login,
  logout,
  refresh,
  requestResetToken,
  resetPassword
};