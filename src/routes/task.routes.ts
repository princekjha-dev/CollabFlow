import { Router } from 'express';
import { z } from 'zod';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  projectId: z.string().min(1),
  assigneeId: z.string().nullable().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.union([z.string(), z.date(), z.null()]).optional(),
  assigneeId: z.string().nullable().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1),
});

router.get('/', authenticate, taskController.list);
router.post('/', authenticate, validateBody(createTaskSchema), taskController.create);
router.get('/:taskId', authenticate, taskController.getById);
router.patch('/:taskId', authenticate, validateBody(updateTaskSchema), taskController.update);
router.delete('/:taskId', authenticate, taskController.remove);
router.post('/:taskId/comments', authenticate, validateBody(commentSchema), taskController.addComment);

export default router;
