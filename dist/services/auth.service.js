"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("../prisma/client");
const jwt_1 = require("../utils/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    async register(input) {
        const existing = await client_1.prisma.user.findUnique({ where: { email: input.email } });
        if (existing) {
            throw new errorHandler_1.AppError('A user with that email already exists', 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
        const user = await client_1.prisma.user.create({
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
    async login(input) {
        const user = await client_1.prisma.user.findUnique({
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
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        const passwordMatches = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!passwordMatches) {
            throw new errorHandler_1.AppError('Invalid credentials', 401);
        }
        return this.issueTokens(user);
    }
    async logout(userId) {
        await client_1.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash: null },
        });
    }
    async refresh(input) {
        const payload = this.getPayloadFromToken(input.refreshToken);
        if (!payload) {
            throw new errorHandler_1.AppError('Invalid or expired refresh token', 401);
        }
        const user = await client_1.prisma.user.findUnique({
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
            throw new errorHandler_1.AppError('Refresh token revoked', 401);
        }
        const matches = await (0, jwt_1.compareToken)(input.refreshToken, user.refreshTokenHash);
        if (!matches) {
            throw new errorHandler_1.AppError('Refresh token revoked', 401);
        }
        return this.issueTokens(user);
    }
    async getProfile(userId) {
        return client_1.prisma.user.findUniqueOrThrow({
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
    async updateProfile(userId, input) {
        if (input.email) {
            const existing = await client_1.prisma.user.findUnique({ where: { email: input.email } });
            if (existing && existing.id !== userId) {
                throw new errorHandler_1.AppError('A user with that email already exists', 409);
            }
        }
        return client_1.prisma.user.update({
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
    async issueTokens(user) {
        const accessToken = (0, jwt_1.signAccessToken)(user);
        const refreshToken = (0, jwt_1.signRefreshToken)(user);
        const refreshTokenHash = await (0, jwt_1.hashToken)(refreshToken);
        await client_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshTokenHash },
        });
        return {
            accessToken,
            refreshToken,
            user,
        };
    }
    getPayloadFromToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
