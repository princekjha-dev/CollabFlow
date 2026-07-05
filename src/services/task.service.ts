import { AppError } from '../middleware/errorHandler';
import { prisma } from '../prisma/client';

interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | Date | null;
  projectId: string;
  assigneeId?: string | null;
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | Date | null;
  assigneeId?: string | null;
}

interface CommentInput {
  content: string;
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class TaskService {
  async createTask(userId: string, input: CreateTaskInput) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      include: { members: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isMember = project.members.some((member) => member.userId === userId) || project.ownerId === userId;
    if (!isMember) {
      throw new AppError('You are not a member of this project', 403);
    }

    if (input.assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: input.assigneeId, projectId: input.projectId } },
      });

      if (!assigneeMember) {
        throw new AppError('Assignee must be a project member', 400);
      }
    }

    return prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        status: (input.status as any) ?? 'TODO',
        priority: (input.priority as any) ?? 'MEDIUM',
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

  async listTasks(userId: string, projectId?: string) {
    const whereClause = projectId ? { projectId, project: { members: { some: { userId } } } } : { project: { members: { some: { userId } } } };

    return prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: userSelect },
        createdBy: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
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
      throw new AppError('Task not found', 404);
    }

    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId,
      },
    });

    if (!membership) {
      throw new AppError('You do not have access to this task', 403);
    }

    return task;
  }

  async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: true },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isMember = project.members.some((member) => member.userId === userId) || project.ownerId === userId;
    if (!isMember) {
      throw new AppError('You are not a member of this project', 403);
    }

    if (input.assigneeId) {
      const assigneeMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: input.assigneeId, projectId: task.projectId } },
      });

      if (!assigneeMember) {
        throw new AppError('Assignee must be a project member', 400);
      }
    }

    const data: Record<string, unknown> = { ...input };
    if (input.dueDate !== undefined) {
      data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    if (input.status) {
      data.status = input.status;
    }

    if (input.priority) {
      data.priority = input.priority;
    }

    return prisma.task.update({
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

  async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await prisma.project.findUnique({ where: { id: task.projectId }, include: { members: true } });
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      throw new AppError('Only project owners can delete tasks', 403);
    }

    await prisma.task.delete({ where: { id: taskId } });
    return task;
  }

  async addComment(taskId: string, userId: string, input: CommentInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId,
      },
    });

    if (!membership) {
      throw new AppError('You do not have access to this task', 403);
    }

    return prisma.taskComment.create({
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

export const taskService = new TaskService();
