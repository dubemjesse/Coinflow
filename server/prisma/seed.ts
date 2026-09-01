import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// The demo data that used to live hard-coded in js/app.js.
const DEMO_TRANSACTIONS = [
  { title: 'Lunch At Mama Oyinye', amountMinor: 850_000n, category: 'food', occurredAt: '2025-09-15T14:30:00' },
  { title: 'Airtime Recharge', amountMinor: 500_000n, category: 'bills', occurredAt: '2025-09-15T14:30:00' },
  { title: 'Chicken from Supermarket', amountMinor: 1_400_000n, category: 'shopping', occurredAt: '2025-09-15T11:45:00' },
  { title: 'Fuel for Car', amountMinor: 2_500_000n, category: 'bills', occurredAt: '2025-09-14T18:15:00' },
  { title: 'Drugs for Malaria', amountMinor: 250_000n, category: 'health', occurredAt: '2025-09-14T15:20:00' },
  { title: 'Bus Ride From Nsukka', amountMinor: 220_000n, category: 'transport', occurredAt: '2025-09-14T08:00:00' },
  { title: 'Electricity Bill', amountMinor: 2_500_000n, category: 'bills', occurredAt: '2025-09-13T16:45:00' },
  { title: "Vee's Supermarket", amountMinor: 3_500_000n, category: 'shopping', occurredAt: '2025-09-13T10:15:00' },
  { title: 'Coffee From Enugu City Mall', amountMinor: 350_000n, category: 'food', occurredAt: '2025-09-12T14:45:00' },
] as const;

const DEMO_BUDGETS = [
  { category: 'food', amountMinor: 8_500_000n },
  { category: 'transport', amountMinor: 10_000_000n },
  { category: 'shopping', amountMinor: 10_000_000n },
  { category: 'bills', amountMinor: 9_000_000n },
  { category: 'health', amountMinor: 3_000_000n },
  { category: 'entertainment', amountMinor: 2_000_000n },
] as const;

async function main() {
  const email = 'demo@coinflow.app';
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: 'Jesse Odoh',
      monthlyIncomeMinor: 51_200_000n,
      currency: 'NGN',
    },
  });

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.createMany({
    data: DEMO_TRANSACTIONS.map((t) => ({
      ...t,
      occurredAt: new Date(t.occurredAt),
      userId: user.id,
    })),
  });

  for (const b of DEMO_BUDGETS) {
    await prisma.budget.upsert({
      where: { userId_category_period: { userId: user.id, category: b.category, period: 'monthly' } },
      update: { amountMinor: b.amountMinor },
      create: { ...b, period: 'monthly', userId: user.id },
    });
  }

  console.log(`Seeded ${DEMO_TRANSACTIONS.length} transactions for ${email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
