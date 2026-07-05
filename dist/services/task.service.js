"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = exports.TaskService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("../prisma/client");
const userSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
};
class TaskService {
    async createTask(userId, input) {
        const project = await client_1.prisma.project.findUnique({
            where: { id: input.projectId },
            include: { members: true },
        });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        const isMember = project.members.some((member) => member.userId === userId) || project.ownerId === userId;
        if (!isMember) {
            throw new errorHandler_1.AppError('You are not a member of this project', 403);
        }
        if (input.assigneeId) {
            const assigneeMember = await client_1.prisma.projectMember.findUnique({
                where: { userId_projectId: { userId: input.assigneeId, projectId: input.projectId } },
            });
            if (!assigneeMember) {
                throw new errorHandler_1.AppError('Assignee must be a project member', 400);
            }
        }
        return client_1.prisma.task.create({
            data: {
                title: input.title,
                description: input.description ?? null,
                status: input.status ?? 'TODO',
                priority: input.priority ?? 'MEDIUM',
                dueDate: input.dueDate ? new Date(input.dueDate) : null,
                projectId: input.projectId,
                createdById: userId,
                assigneeId: input.assigneeId ?? null,
            },
            include: {
                assignee: { select: userSelect },
                createdBy: { select: userSelect },
                comments: {
                    include: {
                        author: { select: userSelect },
                    },
                },
            },
        });
    }
    async listTasks(userId, projectId) {
        const whereClause = projectId ? { projectId, project: { members: { some: { userId } } } } : { project: { members: { some: { userId } } } };
        return client_1.prisma.task.findMany({
            where: whereClause,
            include: {
                assignee: { select: userSelect },
                createdBy: { select: userSelect },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTask(taskId, userId) {
        const task = await client_1.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignee: { select: userSelect },
                createdBy: { select: userSelect },
                comments: {
                    include: {
                        author: { select: userSelect },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!task) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        const membership = await client_1.prisma.projectMember.findFirst({
            where: {
                projectId: task.projectId,
                userId,
            },
        });
        if (!membership) {
            throw new errorHandler_1.AppError('You do not have access to this task', 403);
        }
        return task;
    }
    async updateTask(taskId, userId, input) {
        const task = await client_1.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        const project = await client_1.prisma.project.findUnique({
            where: { id: task.projectId },
            include: { members: true },
        });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        const isMember = project.members.some((member) => member.userId === userId) || project.ownerId === userId;
        if (!isMember) {
            throw new errorHandler_1.AppError('You are not a member of this project', 403);
        }
        if (input.assigneeId) {
            const assigneeMember = await client_1.prisma.projectMember.findUnique({
                where: { userId_projectId: { userId: input.assigneeId, projectId: task.projectId } },
            });
            if (!assigneeMember) {
                throw new errorHandler_1.AppError('Assignee must be a project member', 400);
            }
        }
        const data = { ...input };
        if (input.dueDate !== undefined) {
            data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        }
        if (input.status) {
            data.status = input.status;
        }
        if (input.priority) {
            data.priority = input.priority;
        }
        return client_1.prisma.task.update({
            where: { id: taskId },
            data,
            include: {
                assignee: { select: userSelect },
                createdBy: { select: userSelect },
                comments: {
                    include: {
                        author: { select: userSelect },
                    },
                },
            },
        });
    }
    async deleteTask(taskId, userId) {
        const task = await client_1.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        const project = await client_1.prisma.project.findUnique({ where: { id: task.projectId }, include: { members: true } });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        const isOwner = project.ownerId === userId;
        if (!isOwner) {
            throw new errorHandler_1.AppError('Only project owners can delete tasks', 403);
        }
        await client_1.prisma.task.delete({ where: { id: taskId } });
        return task;
    }
    async addComment(taskId, userId, input) {
        const task = await client_1.prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            throw new errorHandler_1.AppError('Task not found', 404);
        }
        const membership = await client_1.prisma.projectMember.findFirst({
            where: {
                projectId: task.projectId,
                userId,
            },
        });
        if (!membership) {
            throw new errorHandler_1.AppError('You do not have access to this task', 403);
        }
        return client_1.prisma.taskComment.create({
            data: {
                content: input.content,
                taskId,
                authorId: userId,
            },
            include: {
                author: { select: userSelect },
                task: {
                    select: {
                        projectId: true,
                    },
                },
            },
        });
    }
}
exports.TaskService = TaskService;
exports.taskService = new TaskService();
