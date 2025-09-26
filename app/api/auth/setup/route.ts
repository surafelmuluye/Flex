import { NextRequest } from 'next/server';
import { checkIsFirstTimeSetup } from '@/lib/db/queries';
import { 
  handleApiError, 
  withErrorHandling 
} from '@/lib/services/error.service';
import { 
  extractRequestContext, 
  createApiResponse, 
  performanceMonitor 
} from '@/lib/services/api.service';
import { getLogger } from '@/lib/services/simple-logger.service';

const log = getLogger('auth-setup');

// Main GET handler
const handleGetSetupStatus = async (request: NextRequest): Promise<Response> => {
  const context = extractRequestContext(request);
  const stopTimer = performanceMonitor.startTimer('setup_status_check');

  try {
    log.info('Checking first-time setup status', {
      requestId: context.requestId,
      endpoint: '/api/auth/setup',
      operation: 'setup_status_check_start',
    });
    
    const isFirstTime = await checkIsFirstTimeSetup();
    const duration = Date.now() - context.startTime;
    
    const responseData = {
      isFirstTimeSetup: isFirstTime,
      allowRegistration: isFirstTime
    };

    log.info('Setup status check completed', {
      requestId: context.requestId,
      isFirstTime,
      duration,
      endpoint: '/api/auth/setup',
      operation: 'setup_status_check_success',
    });
    
    return createApiResponse(responseData, context);

  } catch (error) {
    const duration = Date.now() - context.startTime;
    
    log.error('Failed to check setup status', {
      requestId: context.requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      endpoint: '/api/auth/setup',
      errorCode: (error as any)?.code,
      errorErrno: (error as any)?.errno,
      errorSyscall: (error as any)?.syscall,
      operation: 'setup_status_check_error',
    });
    
    // Log specific database connection issues
    if ((error as any)?.code === 'ECONNRESET' || (error as any)?.code === 'ECONNREFUSED') {
      log.error('Database connection error', {
        requestId: context.requestId,
        error: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        suggestion: 'Check database connection string and ensure database is running',
        operation: 'database_connection_error',
      });
    }
    
    throw error;
  } finally {
    stopTimer();
  }
};

// Apply error handling
const errorHandledHandler = withErrorHandling(handleGetSetupStatus);

// Export the GET handler
export const GET = errorHandledHandler;