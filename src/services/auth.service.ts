import { AppError } from '../middleware/errorHandler';
import { prisma } from '../prisma/client';
import { compareToken, hashToken, signAccessToken, signRefreshToken } from '../utils/jwt';
import type { AuthResponse } from '../types/api';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RefreshInput {
  refreshToken: string;
}

interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('A user with that email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError('Invalid credentials', 401);
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async refresh(input: RefreshInput): Promise<AuthResponse> {
    const payload = this.getPayloadFromToken(input.refreshToken);
    if (!payload) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        refreshTokenHash: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user?.refreshTokenHash) {
      throw new AppError('Refresh token revoked', 401);
    }

    const matches = await compareToken(input.refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new AppError('Refresh token revoked', 401);
    }

    return this.issueTokens(user);
  }

  async getProfile(userId: string) {
    return prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.email) {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing && existing.id !== userId) {
        throw new AppError('A user with that email already exists', 409);
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private async issueTokens(user: { id: string; email: string; name: string; createdAt: Date; updatedAt: Date }) {
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshTokenHash = await hashToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
      user,
    } satisfies AuthResponse;
  }

  private getPayloadFromToken(token: string) {
    try {
      return jwt.decode(token) as { sub: string } | null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
