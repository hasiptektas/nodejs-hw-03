import bcrypt from 'bcrypt';

export const getEncryptedPassword = async (password) =>
  await bcrypt.hash(password, 10);