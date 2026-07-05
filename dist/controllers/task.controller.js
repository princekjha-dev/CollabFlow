"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = exports.TaskController = void 0;
const task_service_1 = require("../services/task.service");
const socket_1 = require("../utils/socket");
class TaskController {
    async create(req, res, next) {
        try {
            const task = await task_service_1.taskService.createTask(req.user.id, req.body);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, task.projectId, 'task:created', task);
            res.status(201).json({ success: true, data: task });
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const tasks = await task_service_1.taskService.listTasks(req.user.id, req.query.projectId);
            res.json({ success: true, data: tasks });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
            const task = await task_service_1.taskService.getTask(taskId, req.user.id);
            res.json({ success: true, data: task });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
            const task = await task_service_1.taskService.updateTask(taskId, req.user.id, req.body);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, task.projectId, 'task:updated', task);
            res.json({ success: true, data: task });
        }
        catch (error) {
            next(error);
        }
    }
    async remove(req, res, next) {
        try {
            const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
            const task = await task_service_1.taskService.deleteTask(taskId, req.user.id);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, task.projectId, 'task:deleted', { taskId });
            res.json({ success: true, message: 'Task deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    async addComment(req, res, next) {
        try {
            const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
            const comment = await task_service_1.taskService.addComment(taskId, req.user.id, req.body);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, comment.task.projectId, 'task:commented', comment);
            res.status(201).json({ success: true, data: comment });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TaskController = TaskController;
exports.taskController = new TaskController();
