import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// TODO: Implementar controladores de goals
router.get('/', (req, res) => res.json({ message: 'Get all goals' }));
router.post('/', (req, res) => res.json({ message: 'Create goal' }));
router.get('/:id', (req, res) => res.json({ message: 'Get goal by id' }));
router.put('/:id', (req, res) => res.json({ message: 'Update goal' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete goal' }));
router.post('/:id/progress', (req, res) => res.json({ message: 'Add progress' }));
router.get('/:id/progress', (req, res) => res.json({ message: 'Get progress history' }));

export default router;
