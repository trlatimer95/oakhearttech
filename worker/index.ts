// The site's only server code. Static pages are served straight from dist/; this Worker runs first only for /api/*
// (see run_worker_first in wrangler.jsonc).
//
//   POST /api/evaluate         { url, token }  quick checks, returns a partial result with the speed test pending
//   POST /api/evaluate/speed   { id }          runs PageSpeed and returns the finished result
//   POST /api/evaluate/lead    { id }          marks that the visitor asked for the full report
//   GET  /api/report/<id>                      printable report, password protected (for Tyler)

import { normalizeUrl } from '../src/lib/evaluation/url';
import { type Env, loadResult, rateLimited, recentResult, runQuick, runSpeed, saveResult, sha256 } from './evaluate';
import { verifyTurnstile } from './lookups';
import { authorized, renderReport } from './report';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const fail = (error: string, status: number) => json({ error }, status);

const ID = /^[0-9a-f-]{36}$/;

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get('Content-Type') ?? '').includes('application/json')) return null;
  const text = await req.text();
  if (text.length > 4000) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

async function handle(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');

  if (path.startsWith('/api/report/') && req.method === 'GET') {
    if (!authorized(req, env.REPORT_PASSWORD)) {
      return new Response('Password required.', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Oakheart reports", charset="UTF-8"' } });
    }
    const id = path.slice('/api/report/'.length);
    const saved = ID.test(id) ? await loadResult(env, id) : null;
    if (!saved) return new Response('Not found.', { status: 404 });
    return new Response(renderReport(saved.result), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" },
    });
  }

  if (req.method !== 'POST') return fail('Not found.', 404);
  // Same-origin only: the page posts here, nobody else should.
  const origin = req.headers.get('Origin');
  if (origin && origin !== url.origin) return fail('Not allowed.', 403);
  const body = await readJson(req);
  if (!body) return fail('Bad request.', 400);

  if (path === '/api/evaluate') {
    const target = normalizeUrl(String(body.url ?? ''));
    if (!target.ok) return fail(target.error, 400);

    const ip = req.headers.get('CF-Connecting-IP');
    if (!env.TURNSTILE_SECRET) return fail('The evaluation isn’t set up yet. Please try again later.', 503);
    if (!(await verifyTurnstile(String(body.token ?? ''), env.TURNSTILE_SECRET, ip))) {
      return fail('We couldn’t confirm you’re a person. Refresh the page and try again.', 403);
    }

    const ipHash = await sha256(`${env.IP_SALT ?? 'oakheart'}:${ip ?? 'unknown'}`);
    const limited = await rateLimited(env, ipHash);
    if (limited === 'ip') return fail('You’ve run several evaluations in the last hour. Please try again a bit later, or book a walkthrough and I’ll look at it with you.', 429);
    if (limited === 'day') return fail('The evaluation is very busy today. Please try again tomorrow, or book a walkthrough.', 429);

    // A site evaluated in the last day gets the same results, without running PageSpeed again.
    const recent = await recentResult(env, target.host);
    if (recent) {
      const copy = { ...recent, id: crypto.randomUUID(), createdAt: recent.createdAt };
      await saveResult(env, copy, ipHash, true);
      return json(copy);
    }
    const r = await runQuick(env, target.origin, target.host, target.domain, ipHash);
    return 'error' in r ? fail(r.error, r.status) : json(r);
  }

  if (path === '/api/evaluate/speed') {
    const id = String(body.id ?? '');
    if (!ID.test(id)) return fail('Bad request.', 400);
    const r = await runSpeed(env, id);
    return 'error' in r ? fail(r.error, r.status) : json(r);
  }

  if (path === '/api/evaluate/lead') {
    const id = String(body.id ?? '');
    if (!ID.test(id)) return fail('Bad request.', 400);
    await env.DB.prepare('UPDATE evaluations SET lead_submitted = 1 WHERE id = ?').bind(id).run();
    return json({ ok: true });
  }

  return fail('Not found.', 404);
}

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) {
      const res = await env.ASSETS.fetch(req);
      // Staging (staging.oakhearttech.com) is a full copy of the site: keep it out of search results.
      if (!env.NOINDEX) return res;
      const out = new Response(res.body, res);
      out.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return out;
    }
    try {
      return await handle(req, env);
    } catch (e) {
      console.error('api error', e);
      return fail('Something went wrong on our side. Please try again in a minute.', 500);
    }
  },

  // Weekly clean-up: evaluations are kept for 12 months (see the privacy policy).
  async scheduled(_event, env): Promise<void> {
    await env.DB.prepare('DELETE FROM evaluations WHERE created_at < ?').bind(Date.now() - 365 * 86_400_000).run();
  },
} satisfies ExportedHandler<Env>;
