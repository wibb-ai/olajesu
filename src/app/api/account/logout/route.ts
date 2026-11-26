import { endSession } from '../../../../lib/account';
import { fromThisSite, seeOther } from '../../../../lib/http';

/** Signs out on this device. */
export async function POST(request: Request) {
  if (!fromThisSite(request)) return new Response('Not allowed', { status: 403 });
  await endSession();
  return seeOther(request, '/');
}
