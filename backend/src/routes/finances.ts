import { Router } from 'express';
import { financeController } from '../controllers/financeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', financeController.getUserFinances);
router.get('/monthly', financeController.getMonthlyStatement);
router.post('/', financeController.addTransaction);
router.delete('/:id', financeController.deleteTransaction);

export default router;
