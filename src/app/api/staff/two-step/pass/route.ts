import { seeOther } from '../../../../../lib/http';
import { grantPass, safeNext, signedInUser } from '../../../../../lib/twoStepServer';

/**
 * Kitchen staff don't need a code (staff-roles ticket): mark the session as passed and carry on.
 * Master admins are sent back to the code page.
 */
export async function GET(request: Request) {
  const next = safeNext(new URL(request.url).searchParams.get('next'));
  const { user } = await signedInUser();
  if (!user) return seeOther(request, '/admin/login');
  if (user.role === 'master-admin') return seeOther(request, `/staff/two-step?next=${encodeURIComponent(next)}`);
  await grantPass(user);
  return seeOther(request, next);
}
