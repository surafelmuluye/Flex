import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
import log from '@/lib/logger';

dotenv.config();

if (!process.env.POSTGRES_URL) {
  const error = new Error('POSTGRES_URL environment variable is not set');
  log.error('Database configuration error', {
    error: error.message,
    availableEnvVars: Object.keys(process.env).filter(key => key.includes('POSTGRES') || key.includes('DB')),
    suggestion: 'Please set POSTGRES_URL in your .env.local file'
  });
  throw error;
}

// Configure postgres client with better error handling and connection options
const postgresConfig: postgres.Options<{}> = {
  max: 10, // Maximum number of connections
  idle_timeout: 20000, // 20 seconds
  connect_timeout: 30000, // 30 seconds
  prepare: false, // Disable prepared statements for better compatibility
  transform: {
    undefined: null, // Transform undefined to null
  },
  onnotice: (notice) => {
    log.debug('PostgreSQL notice', { notice: notice.message });
  },
  onparameter: (key, value) => {
    log.debug('PostgreSQL parameter change', { key, value });
  }
};

// Create postgres client with enhanced configuration
export const client = postgres(process.env.POSTGRES_URL, postgresConfig);

// Add connection event logging
client.listen('connect', () => {
  log.info('Database connected', { timestamp: new Date().toISOString() });
});

client.listen('disconnect', () => {
  log.info('Database disconnected', { timestamp: new Date().toISOString() });
});

client.listen('error', (error: any) => {
  log.error('Database connection error', { 
    error: error?.message || String(error),
    code: error?.code,
    errno: error?.errno,
    timestamp: new Date().toISOString()
  });
});

export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development' ? {
    logQuery: (query, params) => {
      log.debug('Database query executed', { 
        query: query.slice(0, 200) + (query.length > 200 ? '...' : ''),
        paramsCount: params?.length || 0
      });
    }
  } : false
});

// Database health check function
export async function checkDatabaseConnection(): Promise<{ healthy: boolean; error?: string; latency?: number }> {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    await client`SELECT 1 as health_check`;
    const latency = Date.now() - startTime;
    
    log.info('Database health check passed', { latency });
    
    return { 
      healthy: true, 
      latency 
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    log.error('Database health check failed', { 
      error: error instanceof Error ? error.message : String(error),
      latency 
    });
    
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : String(error),
      latency 
    };
  }
}

// Graceful shutdown handler
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await client.end();
    log.info('Database connection closed gracefully');
  } catch (error) {
    log.error('Error closing database connection', { error });
  }
}

log.info('Database client initialized', {
  hasConnectionString: !!process.env.POSTGRES_URL,
  environment: process.env.NODE_ENV || 'unknown'
});
