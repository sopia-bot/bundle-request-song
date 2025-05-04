import express, { Request, Response, NextFunction } from 'express';
import settingsRouter from './routes/settings';
import path from 'path';
import logger from './lib/logger';
import { readFileSync } from 'node:fs';
import { runInitMigration } from './lib/db';
import musicRouter from './routes/music';
import songsRouter from './routes/songs';

const app = express();
app.use(express.json());

// 에러 핸들러
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 라우터 설정
app.use('/settings', settingsRouter);
app.use('/music', musicRouter);
app.use('/songs', songsRouter);

const pkgFile = path.join(__pkgdir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgFile, 'utf-8'));
console.log(`[${pkg.name}] app loaded! version=${pkg.version}`);
logger.log('info', `[${pkg.name}] app loaded! version=${pkg.version}`);

runInitMigration(
  path.join(__pkgdir, 'config.db'),
  path.join(__pkgdir, 'migrations')
).catch((err) => {
  logger.error(`[migration] runInitMigration error ::`, err);
});

export default app;
