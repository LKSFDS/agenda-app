import { taskController } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import { Router } from 'express';

const router = Router();

router.use(authMiddleware); // todas as rotas abaixo exigem login

router.get('/', taskController.getUserTasks);
router.post('/', taskController.createTask);
router.patch('/:id/complete', taskController.completeTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);


export default router;
