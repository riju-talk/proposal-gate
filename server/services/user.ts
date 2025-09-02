import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { profiles, userSessions } from '@shared/schema';
import { generateToken } from '../utils/jwt';
import { addDays } from 'date-fns';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  role: string;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Omit<UserProfile, 'createdAt' | 'updatedAt'>;
  token: string;
}
/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const [user] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  return user || null;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const [user] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return user || null;
};

/**
 * Create a new user session
 */
export const createUserSession = async (userId: string, userAgent?: string, ipAddress?: string) => {
  const token = generateToken({ userId });
  const expiresAt = addDays(new Date(), 7); // 7 days session

  await db.insert(userSessions).values({
    userId,
    token,
    userAgent: userAgent || null,
    ipAddress: ipAddress || null,
    expiresAt,
  });

  return { token, expiresAt };
};

/**
 * End a user session
 */
export const endUserSession = async (token: string) => {
  await db
    .update(userSessions)
    .set({ expiresAt: new Date() })
    .where(eq(userSessions.token, token));
};

/**
 * Update user's last login time
 */
export const updateLastLogin = async (userId: string) => {
  await db
    .update(profiles)
    .set({ lastLoginAt: new Date() })
    .where(eq(profiles.id, userId));
};

/**
 * Get user profile with sensitive data filtered out
 */
export const getUserProfile = async (userId: string): Promise<Omit<UserProfile, 'password' | 'refreshToken'> | null> => {
  const [user] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      username: profiles.username,
      fullName: profiles.fullName,
      role: profiles.role,
      isEmailVerified: profiles.isEmailVerified,
      lastLoginAt: profiles.lastLoginAt,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return user || null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    username?: string;
    fullName?: string | null;
    isEmailVerified?: boolean;
  }
): Promise<UserProfile> => {
  const [updatedUser] = await db
    .update(profiles)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

/**
 * Verify user email
 */
export const verifyUserEmail = async (email: string): Promise<void> => {
  await db
    .update(profiles)
    .set({ 
      isEmailVerified: true,
      updatedAt: new Date() 
    })
    .where(eq(profiles.email, email));
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<Omit<UserProfile, 'password'>[]> => {
  const users = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      username: profiles.username,
      fullName: profiles.fullName,
      role: profiles.role,
      isEmailVerified: profiles.isEmailVerified,
      lastLoginAt: profiles.lastLoginAt,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles);

  return users;
};

/**
 * Delete a user (admin only)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await db.delete(profiles).where(eq(profiles.id, userId));
};
