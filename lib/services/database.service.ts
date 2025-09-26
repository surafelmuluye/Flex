import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/lib/db/schema';
import log from '@/lib/logger';

// Database configuration
interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly ssl: boolean;
  readonly max: number;
  readonly idleTimeoutMillis: number;
  readonly connectionTimeoutMillis: number;
}

// Get database configuration from environment
function getDatabaseConfig(): DatabaseConfig {
  // Check if POSTGRES_URL is available (for Neon, etc.)
  if (process.env.POSTGRES_URL) {
    const url = new URL(process.env.POSTGRES_URL);
    const config: DatabaseConfig = {
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      database: url.pathname.slice(1), // Remove leading slash
      username: url.username,
      password: url.password,
      ssl: url.searchParams.get('sslmode') === 'require',
      max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000'),
    };
    
    log.info('Database configuration loaded from POSTGRES_URL', {
      host: config.host,
      port: config.port,
      database: config.database,
      ssl: config.ssl,
      maxConnections: config.max,
      operation: 'database_config_loaded',
    });
    
    return config;
  }
  
  // Fallback to individual environment variables
  const config: DatabaseConfig = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'the_flex_dashboard',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
    max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT || '2000'),
  };

  log.info('Database configuration loaded', {
    host: config.host,
    port: config.port,
    database: config.database,
    ssl: config.ssl,
    maxConnections: config.max,
    operation: 'database_config_loaded',
  });

  return config;
}

// Create database connection
function createDatabaseConnection(config: DatabaseConfig) {
  const connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
  
  const client = postgres(connectionString, {
    max: config.max,
    idle_timeout: config.idleTimeoutMillis / 1000,
    connect_timeout: config.connectionTimeoutMillis / 1000,
    ssl: config.ssl ? 'require' : false,
  });

  const db = drizzle(client, { schema });

  log.info('Database connection established', {
    operation: 'database_connection_established',
  });

  return { client, db };
}

// Global database instance
let databaseInstance: ReturnType<typeof createDatabaseConnection> | null = null;

// Get database instance
export function getDatabase() {
  if (!databaseInstance) {
    const config = getDatabaseConfig();
    databaseInstance = createDatabaseConnection(config);
  }
  
  return databaseInstance;
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: Record<string, unknown>;
}> {
  try {
    // Check if database is configured
    const config = getDatabaseConfig();
    if (!config.host || !config.database) {
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          error: 'Database not configured',
        },
      };
    }

    const { db } = getDatabase();
    
    // Simple query to test connection
    const result = await db.execute('SELECT 1 as test');
    
    if (result && result.length > 0) {
      log.info('Database health check passed', {
        operation: 'database_health_check_passed',
      });

      return {
        status: 'healthy',
        details: {
          connected: true,
          testQuery: 'success',
        },
      };
    } else {
      throw new Error('Database test query failed');
    }
  } catch (error) {
    log.error('Database health check failed', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'database_health_check_failed',
    });

    return {
      status: 'unhealthy',
      details: {
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

// Database transaction wrapper
export async function withTransaction<T>(
  operation: (db: ReturnType<typeof getDatabase>['db']) => Promise<T>
): Promise<T> {
  const { db } = getDatabase();
  
  try {
    log.debug('Starting database transaction', {
      operation: 'database_transaction_start',
    });

    // The type of 'operation' expects the full db object, but 'tx' is a transaction object missing $client.
    // So, we need to create a proxy object that adds $client to tx.
    const result = await db.transaction(async (tx) => {
      const txWithClient = Object.assign(Object.create(Object.getPrototypeOf(db)), tx, { $client: db.$client });
      // Pass the proxy object to operation
      return await operation(txWithClient);
    });

    log.debug('Database transaction completed', {
      operation: 'database_transaction_complete',
    });

    return result;
  } catch (error) {
    log.error('Database transaction failed', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'database_transaction_failed',
    });
    throw error;
  }
}

// Database query wrapper with error handling
export async function executeQuery<T>(
  operation: (db: ReturnType<typeof getDatabase>['db']) => Promise<T>,
  operationName: string = 'database_query'
): Promise<T> {
  try {
    const { db } = getDatabase();
    
    log.debug('Executing database query', {
      operation: operationName,
    });

    const result = await operation(db);

    log.debug('Database query completed', {
      operation: operationName,
      hasResult: !!result,
    });

    return result;
  } catch (error) {
    log.error('Database query failed', {
      error: error instanceof Error ? error.message : String(error),
      operation: operationName,
    });
    throw error;
  }
}

// Database connection cleanup
export async function closeDatabaseConnection(): Promise<void> {
  if (databaseInstance) {
    try {
      await databaseInstance.client.end();
      databaseInstance = null;
      
      log.info('Database connection closed', {
        operation: 'database_connection_closed',
      });
    } catch (error) {
      log.error('Error closing database connection', {
        error: error instanceof Error ? error.message : String(error),
        operation: 'database_connection_close_error',
      });
    }
  }
}

// Database statistics
export async function getDatabaseStats(): Promise<{
  connections: number;
  status: string;
  uptime: number;
}> {
  try {
    const { db } = getDatabase();
    
    // Get basic database stats
    const result = await db.execute(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT extract(epoch from now() - pg_postmaster_start_time())::int) as uptime_seconds
    `);

    if (result && result.length > 0) {
      const stats = result[0] as {
        active_connections: number;
        max_connections: number;
        uptime_seconds: number;
      };

      return {
        connections: stats.active_connections,
        status: 'connected',
        uptime: stats.uptime_seconds,
      };
    }

    return {
      connections: 0,
      status: 'unknown',
      uptime: 0,
    };
  } catch (error) {
    log.error('Failed to get database stats', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'database_stats_failed',
    });

    return {
      connections: 0,
      status: 'error',
      uptime: 0,
    };
  }
}

// Database migration status
export async function getMigrationStatus(): Promise<{
  status: 'up_to_date' | 'pending' | 'error';
  details: Record<string, unknown>;
}> {
  try {
    const { db } = getDatabase();
    
    // Check if migrations table exists
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      ) as migrations_table_exists
    `);

    if (result && result.length > 0) {
      const hasMigrationsTable = (result[0] as { migrations_table_exists: boolean }).migrations_table_exists;
      
      if (hasMigrationsTable) {
        // Get migration count
        const migrationCount = await db.execute('SELECT COUNT(*) as count FROM __drizzle_migrations');
        const count = migrationCount[0] as { count: number };
        
        return {
          status: 'up_to_date',
          details: {
            migrationsTable: true,
            migrationCount: count.count,
          },
        };
      } else {
        return {
          status: 'pending',
          details: {
            migrationsTable: false,
            message: 'Migrations table not found',
          },
        };
      }
    }

    return {
      status: 'error',
      details: {
        message: 'Could not check migration status',
      },
    };
  } catch (error) {
    log.error('Failed to check migration status', {
      error: error instanceof Error ? error.message : String(error),
      operation: 'migration_status_failed',
    });

    return {
      status: 'error',
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
