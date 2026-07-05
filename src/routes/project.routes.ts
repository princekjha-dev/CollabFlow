import { Router } from 'express';
import { z } from 'zod';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
});

router.get('/', authenticate, projectController.list);
router.post('/', authenticate, validateBody(createProjectSchema), projectController.create);
router.get('/:projectId', authenticate, projectController.getById);
router.patch('/:projectId', authenticate, validateBody(updateProjectSchema), projectController.update);
router.delete('/:projectId', authenticate, projectController.remove);
router.post('/:projectId/invite', authenticate, validateBody(inviteMemberSchema), projectController.inviteMember);

export default router;
