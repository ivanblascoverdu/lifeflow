import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { HabitCreateDTO, HabitLogCreateDTO } from '../types';

export const getAllHabits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    const result = await query(
      `SELECT h.*,
        COALESCE(
          (SELECT COUNT(*)
           FROM habit_logs hl
           WHERE hl.habit_id = h.id AND hl.completed = true
           ORDER BY hl.logged_date DESC
           LIMIT 1), 0
        ) as current_streak
       FROM habits h
       WHERE h.user_id = $1
       ORDER BY h.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createHabit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { name, description, category, frequency, targetDays, color, icon } = req.body as HabitCreateDTO;

    if (!name || !category || !frequency) {
      throw new ApiError(400, 'Missing required fields');
    }

    const result = await query(
      `INSERT INTO habits (user_id, name, description, category, frequency, target_days, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, description, category, frequency, targetDays || 7, color, icon]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM habits WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Habit not found');
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateHabit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    const result = await query(
      `UPDATE habits
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           frequency = COALESCE($4, frequency),
           target_days = COALESCE($5, target_days),
           color = COALESCE($6, color),
           icon = COALESCE($7, icon),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [updates.name, updates.description, updates.category, updates.frequency, 
       updates.targetDays, updates.color, updates.icon, id, userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Habit not found');
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHabit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Habit not found');
    }

    res.json({
      success: true,
      message: 'Habit deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logHabit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { loggedDate, completed, notes, intensity } = req.body as HabitLogCreateDTO;

    const result = await query(
      `INSERT INTO habit_logs (habit_id, user_id, logged_date, completed, notes, intensity)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (habit_id, logged_date)
       DO UPDATE SET completed = $4, notes = $5, intensity = $6
       RETURNING *`,
      [id, userId, loggedDate, completed, notes, intensity || 3]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getHabitLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let queryText = `
      SELECT * FROM habit_logs
      WHERE habit_id = $1 AND user_id = $2
    `;
    const params: any[] = [id, userId];

    if (startDate) {
      params.push(startDate);
      queryText += ` AND logged_date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      queryText += ` AND logged_date <= $${params.length}`;
    }

    queryText += ' ORDER BY logged_date DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
