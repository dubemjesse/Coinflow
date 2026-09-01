import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { HttpError } from '../middleware/error.js';
import {
  AUTH_COOKIE,
  COOKIE_MAX_AGE,
  hashPassword,
  requireAuth,
  signToken,
  verifyPassword,
} from '../lib/auth.js';
import { toUserDTO } from '../lib/serialize.js';

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: COOKIE_MAX_AGE,
  path: '/',
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
  monthlyIncomeMinor: z.number().int().nonnegative().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/register', async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new HttpError(409, 'An account with that email already exists');

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: await hashPassword(body.password),
      name: body.name,
      monthlyIncomeMinor: BigInt(body.monthlyIncomeMinor ?? 0),
    },
  });

  res.cookie(AUTH_COOKIE, signToken(user.id), cookieOptions);
  res.status(201).json({ user: toUserDTO(user) });
});

authRouter.post('/login', async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  res.cookie(AUTH_COOKIE, signToken(user.id), cookieOptions);
  res.json({ user: toUserDTO(user) });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new HttpError(401, 'Account not found');
  res.json({ user: toUserDTO(user) });
});
