import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import logger from './logger';
import path from 'node:path';
import { SqliteHelper } from './sqlite';
import { randomUUID } from 'node:crypto';

export async function runInitMigration(dbFile: string, migDir: string) {
  if (!existsSync(migDir)) {
    logger.error(`[migration] Cannot found migDir=${migDir}`);
    return;
  }

  const migFiles = (await fs.readdir(migDir))
    .map((file) => path.join(migDir, file))
    .filter((file) => path.extname(file) === '.sql');

  const db = new SqliteHelper(dbFile);
  db.exec(/* sql */ `CREATE TABLE IF NOT EXISTS _prisma_migrations (
        id TEXT PRIMARY KEY,
        finished_at DATETIME,
        migration_name TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  for (const migFile of migFiles) {
    const migSql = await fs.readFile(migFile, 'utf8');
    logger.info(`[migration] try migFile=${migFile}, migration=${migSql}`);
    try {
      const sqlName = path.basename(migFile);

      const res = db.select(
        `SELECT COUNT(1) AS cnt FROM _prisma_migrations WHERE migration_name = @name AND finished_at IS NOT NULL`,
        { name: sqlName }
      );
      if (res?.cnt > 0) {
        logger.error(
          `[migration] exists migration result migration=${migFile}`
        );
        continue;
      }
      const id = randomUUID();
      db.query(
        `INSERT INTO _prisma_migrations(id, migration_name) VALUES(@id, @name)`,
        {
          id,
          name: sqlName,
        }
      );
      const success = db.runInTransaction(() => {
        db.exec(migSql);
      });
      if (success) {
        db.query(
          `UPDATE _prisma_migrations SET finished_at = CURRENT_TIMESTAMP WHERE id=@id`,
          { id }
        );
      }
      logger.debug(`[migration] success migration=${migFile}`);
    } catch (err) {
      console.error(err);
      logger.error(
        `[migration] fail migration=${migSql}, error=${(err as any).message}`
      );
    }
  }

  db.close();
}
