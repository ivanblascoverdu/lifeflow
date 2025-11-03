import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
import { Router } from 'express';
import {
  getAllHabits,
  createHabit,
  getHabitById,
  updateHabit,
  deleteHabit,
  logHabit,
  getHabitLogs,
} from '../controllers/habits.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', getAllHabits);
router.post('/', createHabit);
router.get('/:id', getHabitById);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/log', logHabit);
router.get('/:id/logs', getHabitLogs);

export default router;
