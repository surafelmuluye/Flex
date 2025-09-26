// Simple logger implementation
interface LogLevel {
  readonly ERROR: 'error';
  readonly WARN: 'warn';
  readonly INFO: 'info';
  readonly DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

type LogLevelType = LogLevel[keyof LogLevel];

interface LogEntry {
  level: LogLevelType;
  message: string;
  timestamp: string;
  operation?: string;
  [key: string]: unknown;
}

class SimpleLogger {
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatLogEntry(level: LogLevelType, message: string, meta?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      Object.assign(entry, meta);
    }

    return entry;
  }

  private shouldLog(level: LogLevelType): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }

    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === LOG_LEVELS.WARN || level === LOG_LEVELS.ERROR;
    }

    return true;
  }

  private log(level: LogLevelType, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.formatLogEntry(level, message, meta);

    if (this.isDevelopment) {
      // Pretty print in development
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}:`;
      console.log(prefix, message, meta ? meta : '');
    } else {
      // JSON format in production
      console.log(JSON.stringify(entry));
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }
}

// Create and export logger instance
const logger = new SimpleLogger();

export default logger;