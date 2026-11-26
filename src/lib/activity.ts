import type { Payload, PayloadRequest } from 'payload';

/** The same, from outside a Payload hook (e.g. a route handler), for a known staff member. */
export async function logActivityAs(payload: Payload, staffId: number | null, action: string, details: string): Promise<void> {
  await payload.create({ collection: 'activity-log', data: { action, details, staff: staffId }, overrideAccess: true });
}

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
