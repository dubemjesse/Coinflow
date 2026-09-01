import { Router } from 'express';
import { Category, TransactionType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/error.js';
import { requireAuth } from '../lib/auth.js';
import { toTransactionDTO } from '../lib/serialize.js';

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

const categoryEnum = z.nativeEnum(Category);
const typeEnum = z.nativeEnum(TransactionType);

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  amountMinor: z.number().int().positive(),
  category: categoryEnum,
  occurredAt: z.coerce.date(),
  type: typeEnum.optional().default('expense'),
});

const updateSchema = createSchema.partial();

const listQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  category: categoryEnum.optional(),
  type: typeEnum.optional(),
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().positive().max(500).default(200),
  offset: z.coerce.number().int().nonnegative().default(0),
});

transactionsRouter.get('/', async (req, res) => {
  const q = listQuerySchema.parse(req.query);
  const where = {
    userId: req.userId,
    ...(q.category ? { category: q.category } : {}),
    ...(q.type ? { type: q.type } : {}),
    ...(q.search ? { title: { contains: q.search, mode: 'insensitive' as const } } : {}),
    ...(q.from || q.to
      ? { occurredAt: { ...(q.from ? { gte: q.from } : {}), ...(q.to ? { lte: q.to } : {}) } }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: q.limit,
      skip: q.offset,
    }),
    prisma.transaction.count({ where }),
  ]);
  res.json({ items: items.map(toTransactionDTO), total });
});

transactionsRouter.post('/', async (req, res) => {
  const body = createSchema.parse(req.body);
  const created = await prisma.transaction.create({
    data: {
      userId: req.userId!,
      title: body.title,
      amountMinor: BigInt(body.amountMinor),
      category: body.category,
      type: body.type,
      occurredAt: body.occurredAt,
    },
  });
  res.status(201).json(toTransactionDTO(created));
});

const importSchema = z.object({
  transactions: z.array(createSchema).max(1000),
});

// One-time migration of transactions from the old localStorage client.
transactionsRouter.post('/import', async (req, res) => {
  const { transactions } = importSchema.parse(req.body);
  const result = await prisma.transaction.createMany({
    data: transactions.map((t) => ({
      userId: req.userId!,
      title: t.title,
      amountMinor: BigInt(t.amountMinor),
      category: t.category,
      type: t.type,
      occurredAt: t.occurredAt,
    })),
  });
  res.status(201).json({ imported: result.count });
});

async function ownedTransaction(userId: string | undefined, id: string) {
  const tx = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!tx) throw new HttpError(404, 'Transaction not found');
  return tx;
}

transactionsRouter.get('/:id', async (req, res) => {
  const tx = await ownedTransaction(req.userId, req.params.id);
  res.json(toTransactionDTO(tx));
});

transactionsRouter.patch('/:id', async (req, res) => {
  await ownedTransaction(req.userId, req.params.id);
  const body = updateSchema.parse(req.body);
  const updated = await prisma.transaction.update({
    where: { id: req.params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.amountMinor !== undefined ? { amountMinor: BigInt(body.amountMinor) } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.occurredAt !== undefined ? { occurredAt: body.occurredAt } : {}),
    },
  });
  res.json(toTransactionDTO(updated));
});

transactionsRouter.delete('/:id', async (req, res) => {
  await ownedTransaction(req.userId, req.params.id);
  await prisma.transaction.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
