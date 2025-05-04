import path from 'path';

import winston from 'winston';
import 'winston-daily-rotate-file';

var transport = new winston.transports.DailyRotateFile({
  level: 'info',
  filename: '%DATE%.log',
  dirname: path.join(__pkgdir, 'logs'),
  datePattern: 'YYYYMMDD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [transport],
});

export default logger;
