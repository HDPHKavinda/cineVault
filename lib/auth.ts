import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const getUserFromToken = (token: string): User | null => {
  const payload = verifyToken(token);
  if (!payload) return null;

  // In a real app, you'd fetch the user from the database
  // For now, return basic user info from token
  return {
    id: payload.userId,
    email: payload.email,
  };
};