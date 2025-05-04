import path from 'path';
import { PrismaClient } from '../prisma';
const dbPath = path.resolve(__pkgdir, 'config.db');

let prisma!: PrismaClient;
try {
  const { PrismaClient } = require(path.join(
    __pkgdir,
    'node_modules/@prisma/client'
  ));
  // process.env['DATABASE_URL'] = `file:${dbPath}`;
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`,
      },
    },
  });
} catch (err) {
  bunx(['prisma', 'generate'], { cwd: __pkgdir })
    .then(() => {
      const { PrismaClient } = require('@prisma/client');
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: `file:${dbPath}`,
          },
        },
      });
    })
    .catch((err) => {
      console.log('error', err);
    });
}

export function usePrisma(): PrismaClient {
  return prisma;
}
