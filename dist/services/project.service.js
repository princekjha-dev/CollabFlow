"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectService = exports.ProjectService = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const client_1 = require("../prisma/client");
const userSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
    updatedAt: true,
};
class ProjectService {
    async createProject(userId, input) {
        return client_1.prisma.project.create({
            data: {
                name: input.name,
                description: input.description ?? null,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: { select: userSelect },
                    },
                },
                tasks: true,
            },
        });
    }
    async listProjects(userId) {
        return client_1.prisma.project.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    include: {
                        user: { select: userSelect },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getProject(projectId, userId) {
        const project = await client_1.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: {
                        user: { select: userSelect },
                    },
                },
                tasks: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        assignee: { select: userSelect },
                        createdBy: { select: userSelect },
                    },
                },
            },
        });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        const isMember = project.members.some((member) => member.userId === userId);
        if (!isMember) {
            throw new errorHandler_1.AppError('You are not a member of this project', 403);
        }
        return project;
    }
    async updateProject(projectId, userId, input) {
        const project = await client_1.prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        const isOwner = project.ownerId === userId;
        if (!isOwner) {
            throw new errorHandler_1.AppError('Only project owners can update the project', 403);
        }
        return client_1.prisma.project.update({
            where: { id: projectId },
            data: input,
            include: {
                members: {
                    include: {
                        user: { select: userSelect },
                    },
                },
            },
        });
    }
    async deleteProject(projectId, userId) {
        const project = await client_1.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        if (project.ownerId !== userId) {
            throw new errorHandler_1.AppError('Only project owners can delete the project', 403);
        }
        await client_1.prisma.project.delete({ where: { id: projectId } });
    }
    async inviteMember(projectId, userId, input) {
        const project = await client_1.prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        const ownerOrAdmin = project.members.find((member) => member.userId === userId && member.role === 'OWNER') || project.ownerId === userId;
        if (!ownerOrAdmin) {
            throw new errorHandler_1.AppError('Only project owners can invite members', 403);
        }
        const invitedUser = await client_1.prisma.user.findUnique({ where: { email: input.email } });
        if (!invitedUser) {
            throw new errorHandler_1.AppError('No user found with that email', 404);
        }
        const isAlreadyMember = project.members.some((member) => member.userId === invitedUser.id);
        if (isAlreadyMember) {
            throw new errorHandler_1.AppError('User is already a member of this project', 409);
        }
        const member = await client_1.prisma.projectMember.create({
            data: {
                projectId,
                userId: invitedUser.id,
                role: 'MEMBER',
            },
            include: {
                user: { select: userSelect },
            },
        });
        return {
            ...project,
            members: [...project.members, member],
        };
    }
}
exports.ProjectService = ProjectService;
exports.projectService = new ProjectService();
