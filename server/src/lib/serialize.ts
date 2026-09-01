import type { Transaction, User } from '@prisma/client';
import type { Transaction as TransactionDTO, User as UserDTO } from '@coinflow/shared';

export function toUserDTO(u: User): UserDTO {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    monthlyIncomeMinor: Number(u.monthlyIncomeMinor),
    currency: u.currency,
    createdAt: u.createdAt.toISOString(),
  };
}

export function toTransactionDTO(t: Transaction): TransactionDTO {
  return {
    id: t.id,
    title: t.title,
    amountMinor: Number(t.amountMinor),
    type: t.type,
    category: t.category,
    occurredAt: t.occurredAt.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}
