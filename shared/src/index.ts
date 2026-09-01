/**
 * Shared DTOs for the CoinFlow API — imported by both `client` and `server`
 * so request/response shapes stay in sync.
 *
 * Money is always represented in integer MINOR units (kobo for NGN) to avoid
 * floating-point rounding. Format for display only at the edge.
 */

export const CATEGORY_KEYS = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'health',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  icon: string; // Font Awesome class
  color: string; // hex
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  food: { key: 'food', label: 'Food & Drinks', icon: 'fas fa-utensils', color: '#F59E0B' },
  transport: { key: 'transport', label: 'Transportation', icon: 'fas fa-bus', color: '#3B82F6' },
  shopping: { key: 'shopping', label: 'Shopping', icon: 'fas fa-shopping-bag', color: '#EC4899' },
  bills: { key: 'bills', label: 'Bills & Utilities', icon: 'fas fa-bolt', color: '#10B981' },
  entertainment: { key: 'entertainment', label: 'Entertainment', icon: 'fas fa-film', color: '#8B5CF6' },
  health: { key: 'health', label: 'Health', icon: 'fas fa-pills', color: '#EF4444' },
};

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  title: string;
  amountMinor: number;
  type: TransactionType;
  category: CategoryKey;
  occurredAt: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export type TransactionInput = Pick<
  Transaction,
  'title' | 'amountMinor' | 'category' | 'occurredAt'
> & { type?: TransactionType };

export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReminderCategory =
  | 'bills'
  | 'income'
  | 'investment'
  | 'savings'
  | 'subscription'
  | 'other';

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  category: ReminderCategory;
  dueAt: string; // ISO 8601
  repeat: ReminderRepeat;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReminderInput = Pick<Reminder, 'title' | 'dueAt'> &
  Partial<Pick<Reminder, 'description' | 'category' | 'repeat' | 'completed'>>;

export interface Budget {
  category: CategoryKey;
  amountMinor: number;
  period: 'monthly';
}

export interface User {
  id: string;
  email: string;
  name: string;
  monthlyIncomeMinor: number;
  currency: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
