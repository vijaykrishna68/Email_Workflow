import { createWriteStream } from 'fs';
import { join } from 'path';

// Create a write stream for logging
const accessLogStream = createWriteStream(join(process.cwd(), 'logs', 'access.log'), { flags: 'a' });
const errorLogStream = createWriteStream(join(process.cwd(), 'logs', 'error.log'), { flags: 'a' });

export const logger = {
  info: (message: string, meta?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      meta
    };
    console.log(JSON.stringify(logEntry));
    accessLogStream.write(JSON.stringify(logEntry) + '\n');
  },

  error: (message: string, error?: Error, meta?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      meta
    };
    console.error(JSON.stringify(logEntry));
    errorLogStream.write(JSON.stringify(logEntry) + '\n');
  },

  warn: (message: string, meta?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      meta
    };
    console.warn(JSON.stringify(logEntry));
    accessLogStream.write(JSON.stringify(logEntry) + '\n');
  }
};
