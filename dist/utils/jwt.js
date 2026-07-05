"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.hashToken = hashToken;
exports.compareToken = compareToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const jwtOptions = { expiresIn: env_1.env.jwtAccessExpiresIn };
function signAccessToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, name: user.name, type: 'access' }, env_1.env.jwtAccessSecret, jwtOptions);
}
function signRefreshToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, name: user.name, type: 'refresh' }, env_1.env.jwtRefreshSecret, { expiresIn: env_1.env.jwtRefreshExpiresIn });
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
    }
    catch {
        return null;
    }
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwtRefreshSecret);
    }
    catch {
        return null;
    }
}
async function hashToken(token) {
    return bcryptjs_1.default.hash(token, 10);
}
async function compareToken(token, hashedToken) {
    return bcryptjs_1.default.compare(token, hashedToken);
}
