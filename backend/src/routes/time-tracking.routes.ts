import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// TODO: Implementar controladores de time-tracking
router.get('/time-blocks', (req, res) => res.json({ message: 'Get time blocks' }));
router.post('/time-blocks', (req, res) => res.json({ message: 'Create time block' }));
router.put('/time-blocks/:id', (req, res) => res.json({ message: 'Update time block' }));
router.delete('/time-blocks/:id', (req, res) => res.json({ message: 'Delete time block' }));

router.get('/activities', (req, res) => res.json({ message: 'Get activities' }));
router.post('/activities', (req, res) => res.json({ message: 'Log activity' }));

export default router;
