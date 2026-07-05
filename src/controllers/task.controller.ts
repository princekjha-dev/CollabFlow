import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { taskService } from '../services/task.service';
import { type Server as SocketIOServer } from 'socket.io';
import { emitToProject } from '../utils/socket';

export class TaskController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.user!.id, req.body);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, task.projectId, 'task:created', task);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.listTasks(req.user!.id, req.query.projectId as string | undefined);
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const task = await taskService.getTask(taskId, req.user!.id);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const task = await taskService.updateTask(taskId, req.user!.id, req.body);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, task.projectId, 'task:updated', task);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const task = await taskService.deleteTask(taskId, req.user!.id);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, task.projectId, 'task:deleted', { taskId });
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const comment = await taskService.addComment(taskId, req.user!.id, req.body);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, comment.task.projectId, 'task:commented', comment);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
