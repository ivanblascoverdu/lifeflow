import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// TODO: Implementar controladores de analytics
router.get('/dashboard', (req, res) => res.json({ message: 'Get dashboard stats' }));
router.get('/weekly-report', (req, res) => res.json({ message: 'Get weekly report' }));
router.get('/monthly-report', (req, res) => res.json({ message: 'Get monthly report' }));

export default router;
