/** Only the site's own pages may call these endpoints (a basic guard against cross-site requests). */
export function fromThisSite(request: Request) {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export const json = (body: unknown, status = 200) => Response.json(body, { status });

/** After a form post: send the browser to another page with a GET (303). */
export const seeOther = (request: Request, path: string) => Response.redirect(new URL(path, process.env.NEXT_PUBLIC_SERVER_URL || request.url), 303);
