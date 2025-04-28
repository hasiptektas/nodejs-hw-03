import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors.js';
import bcrypt from "bcrypt";

const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw HttpError(409, 'Email in use');
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
    throw HttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw HttpError(401, 'Invalid credentials');
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
    throw HttpError(500, 'Logout failed', { cause: error });
  }
};

export const authService = {
  register,
  login,
  logout,
};