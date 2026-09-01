import { createApp } from './app.js';
import { prisma } from './db.js';
import { env } from './env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`CoinFlow API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
