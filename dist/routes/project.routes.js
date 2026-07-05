"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const project_controller_1 = require("../controllers/project.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional().nullable(),
});
const updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional().nullable(),
});
const inviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
router.get('/', auth_1.authenticate, project_controller_1.projectController.list);
router.post('/', auth_1.authenticate, (0, validate_1.validateBody)(createProjectSchema), project_controller_1.projectController.create);
router.get('/:projectId', auth_1.authenticate, project_controller_1.projectController.getById);
router.patch('/:projectId', auth_1.authenticate, (0, validate_1.validateBody)(updateProjectSchema), project_controller_1.projectController.update);
router.delete('/:projectId', auth_1.authenticate, project_controller_1.projectController.remove);
router.post('/:projectId/invite', auth_1.authenticate, (0, validate_1.validateBody)(inviteMemberSchema), project_controller_1.projectController.inviteMember);
exports.default = router;
