import { desc, eq, count } from 'drizzle-orm';
import { db } from './drizzle';
import { managers, reviewApprovals, activityLogs } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import log from '@/lib/logger';

export async function getManager() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const manager = await db
    .select()
    .from(managers)
    .where(eq(managers.id, sessionData.user.id))
    .limit(1);

  if (manager.length === 0) {
    return null;
  }

  return manager[0];
}

export async function checkIsFirstTimeSetup() {
  try {
    // Removed invalid log.db.query call
    const result = await db
      .select({ count: count() })
      .from(managers);
    
    const isFirstTime = result[0].count === 0;
    log.debug('First time setup check completed', { 
      isFirstTime, 
      managerCount: result[0].count 
    });
    
    return isFirstTime;
  } catch (error: any) {
    log.error('checkIsFirstTimeSetup', error);
    throw error;
  }
}

export async function getReviewApproval(reviewId: string) {
  const result = await db
    .select()
    .from(reviewApprovals)
    .where(eq(reviewApprovals.reviewId, reviewId))
    .limit(1);

  return result[0] || null;
}

export async function getReviewApprovalsByListing(listingId: string) {
  return await db
    .select()
    .from(reviewApprovals)
    .where(eq(reviewApprovals.listingId, listingId));
}

export async function getActivityLogs() {
  const manager = await getManager();
  if (!manager) {
    throw new Error('Manager not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      details: activityLogs.details,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
    })
    .from(activityLogs)
    .where(eq(activityLogs.managerId, manager.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function logActivity(
  managerId: number,
  action: string,
  details?: string,
  ipAddress?: string
) {
  await db.insert(activityLogs).values({
    managerId,
    action,
    details,
    ipAddress
  });
}
