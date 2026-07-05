"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const task_controller_1 = require("../controllers/task.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).optional(),
    projectId: zod_1.z.string().min(1),
    assigneeId: zod_1.z.string().nullable().optional(),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: zod_1.z.union([zod_1.z.string(), zod_1.z.date(), zod_1.z.null()]).optional(),
    assigneeId: zod_1.z.string().nullable().optional(),
});
const commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1),
});
router.get('/', auth_1.authenticate, task_controller_1.taskController.list);
router.post('/', auth_1.authenticate, (0, validate_1.validateBody)(createTaskSchema), task_controller_1.taskController.create);
router.get('/:taskId', auth_1.authenticate, task_controller_1.taskController.getById);
router.patch('/:taskId', auth_1.authenticate, (0, validate_1.validateBody)(updateTaskSchema), task_controller_1.taskController.update);
router.delete('/:taskId', auth_1.authenticate, task_controller_1.taskController.remove);
router.post('/:taskId/comments', auth_1.authenticate, (0, validate_1.validateBody)(commentSchema), task_controller_1.taskController.addComment);
exports.default = router;
