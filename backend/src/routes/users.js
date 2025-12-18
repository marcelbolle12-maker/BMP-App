import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { listUsers, createUser, updateStatus, updateModules } from '../controllers/userController.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/status', updateStatus);
router.patch('/:id/modules', updateModules);

export default router;
