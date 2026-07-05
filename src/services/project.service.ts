import { AppError } from '../middleware/errorHandler';
import { prisma } from '../prisma/client';

interface CreateProjectInput {
  name: string;
  description?: string | null;
}

interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}

interface InviteMemberInput {
  email: string;
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ProjectService {
  async createProject(userId: string, input: CreateProjectInput) {
    return prisma.project.create({
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

  async listProjects(userId: string) {
    return prisma.project.findMany({
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

  async getProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
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
      throw new AppError('Project not found', 404);
    }

    const isMember = project.members.some((member) => member.userId === userId);
    if (!isMember) {
      throw new AppError('You are not a member of this project', 403);
    }

    return project;
  }

  async updateProject(projectId: string, userId: string, input: UpdateProjectInput) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      throw new AppError('Only project owners can update the project', 403);
    }

    return prisma.project.update({
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

  async deleteProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.ownerId !== userId) {
      throw new AppError('Only project owners can delete the project', 403);
    }

    await prisma.project.delete({ where: { id: projectId } });
  }

  async inviteMember(projectId: string, userId: string, input: InviteMemberInput) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const ownerOrAdmin = project.members.find((member) => member.userId === userId && member.role === 'OWNER') || project.ownerId === userId;
    if (!ownerOrAdmin) {
      throw new AppError('Only project owners can invite members', 403);
    }

    const invitedUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (!invitedUser) {
      throw new AppError('No user found with that email', 404);
    }

    const isAlreadyMember = project.members.some((member) => member.userId === invitedUser.id);
    if (isAlreadyMember) {
      throw new AppError('User is already a member of this project', 409);
    }

    const member = await prisma.projectMember.create({
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

export const projectService = new ProjectService();
