import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'logs';
const { combine, timestamp, printf, colorize, json } = winston.format;

// Define log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston to use these colors
winston.addColors(colors);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json(),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: { service: 'proposal-gate' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
    })
  );
}

// Create a stream object with a 'write' function that will be used by `morgan`
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger };
