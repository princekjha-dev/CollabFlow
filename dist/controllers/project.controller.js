"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectController = exports.ProjectController = void 0;
const project_service_1 = require("../services/project.service");
const socket_1 = require("../utils/socket");
class ProjectController {
    async create(req, res, next) {
        try {
            const project = await project_service_1.projectService.createProject(req.user.id, req.body);
            res.status(201).json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const projects = await project_service_1.projectService.listProjects(req.user.id);
            res.json({ success: true, data: projects });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const project = await project_service_1.projectService.getProject(projectId, req.user.id);
            res.json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const project = await project_service_1.projectService.updateProject(projectId, req.user.id, req.body);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, projectId, 'project:updated', project);
            res.json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    }
    async remove(req, res, next) {
        try {
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            await project_service_1.projectService.deleteProject(projectId, req.user.id);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, projectId, 'project:deleted', { projectId });
            res.json({ success: true, message: 'Project deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    async inviteMember(req, res, next) {
        try {
            const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
            const project = await project_service_1.projectService.inviteMember(projectId, req.user.id, req.body);
            const io = req.app.get('io');
            (0, socket_1.emitToProject)(io, projectId, 'project:member-added', project);
            res.status(201).json({ success: true, data: project });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProjectController = ProjectController;
exports.projectController = new ProjectController();
