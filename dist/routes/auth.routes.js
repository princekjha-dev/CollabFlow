"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2),
    password: zod_1.z.string().min(8),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10),
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
});
router.post('/register', (0, validate_1.validateBody)(registerSchema), auth_controller_1.authController.register);
router.post('/login', (0, validate_1.validateBody)(loginSchema), auth_controller_1.authController.login);
router.post('/logout', auth_1.authenticate, auth_controller_1.authController.logout);
router.post('/refresh', (0, validate_1.validateBody)(refreshSchema), auth_controller_1.authController.refresh);
router.get('/me', auth_1.authenticate, auth_controller_1.authController.getProfile);
router.patch('/me', auth_1.authenticate, (0, validate_1.validateBody)(updateProfileSchema), auth_controller_1.authController.updateProfile);
exports.default = router;
