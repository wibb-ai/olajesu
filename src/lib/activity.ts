import type { PayloadRequest } from 'payload';

/**
 * Record a sensitive action in the Activity log (CONTEXT.md) under the signed-in staff member.
 * Runs inside the same request, so it rolls back with the change it describes.
 */
export async function logActivity(req: PayloadRequest, action: string, details: string): Promise<void> {
  const user = req.user as { id: number; collection?: string } | null | undefined;
  await req.payload.create({
    collection: 'activity-log',
    data: { action, details, staff: user?.collection === 'users' ? user.id : null },
    overrideAccess: true,
    req,
  });
}
