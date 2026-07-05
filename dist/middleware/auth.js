"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const errorHandler_1 = require("./errorHandler");
const jwt_1 = require("../utils/jwt");
const client_1 = require("../prisma/client");
async function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next(new errorHandler_1.AppError('Missing bearer token', 401));
    }
    const token = authHeader.split(' ')[1];
    const payload = (0, jwt_1.verifyAccessToken)(token);
    if (!payload) {
        return next(new errorHandler_1.AppError('Invalid or expired access token', 401));
    }
    const user = await client_1.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true },
    });
    if (!user) {
        return next(new errorHandler_1.AppError('User no longer exists', 401));
    }
    req.user = user;
    next();
}
