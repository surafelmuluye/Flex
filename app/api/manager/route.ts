import { NextResponse } from 'next/server';
import { getManager } from '@/lib/db/queries';
import log from '@/lib/logger';

export async function GET() {
  try {
    const manager = await getManager();
    
    if (!manager) {
      log.warn('Manager data requested but not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Don't return password hash
    const { passwordHash, ...managerData } = manager;

    log.debug('Manager data fetched successfully', { managerId: manager.id });

    return NextResponse.json({
      success: true,
      data: managerData
    });

  } catch (error: any) {
    log.error('Failed to fetch manager data', { error: error?.message || String(error) });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch manager data'
    }, { status: 500 });
  }
}
