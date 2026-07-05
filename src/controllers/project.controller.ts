import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import { projectService } from '../services/project.service';
import { type Server as SocketIOServer } from 'socket.io';
import { emitToProject } from '../utils/socket';

export class ProjectController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(req.user!.id, req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.listProjects(req.user!.id);
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const project = await projectService.getProject(projectId, req.user!.id);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const project = await projectService.updateProject(projectId, req.user!.id, req.body);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, projectId, 'project:updated', project);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      await projectService.deleteProject(projectId, req.user!.id);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, projectId, 'project:deleted', { projectId });
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const project = await projectService.inviteMember(projectId, req.user!.id, req.body);
      const io = req.app.get('io') as SocketIOServer;
      emitToProject(io, projectId, 'project:member-added', project);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
