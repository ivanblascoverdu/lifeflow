import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { generateAccessToken, generateRefreshToken } from '../config/jwt';
import { ApiError } from '../middleware/errorHandler';
import { UserCreateDTO, UserResponseDTO } from '../types';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, timezone } = req.body as UserCreateDTO;

    // Validar datos
    if (!email || !password || !firstName || !lastName) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, timezone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, timezone, notifications_enabled, created_at`,
      [email, passwordHash, firstName, lastName, timezone || 'Europe/Madrid']
    );

    const user = result.rows[0];

    // Generar tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const userResponse: UserResponseDTO = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      timezone: user.timezone,
      notificationsEnabled: user.notifications_enabled,
    };

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Buscar usuario
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const user = result.rows[0];

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generar tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const userResponse: UserResponseDTO = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      timezone: user.timezone,
      notificationsEnabled: user.notifications_enabled,
    };

    res.json({
      success: true,
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.userId;

    const result = await query(
      'SELECT id, email, first_name, last_name, avatar_url, timezone, notifications_enabled FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    const user = result.rows[0];

    const userResponse: UserResponseDTO = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      timezone: user.timezone,
      notificationsEnabled: user.notifications_enabled,
    };

    res.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    next(error);
  }
};
