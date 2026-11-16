// A tiny helper Worker on workers.dev, used only when the evaluation checks oakhearttech.com itself (see isOwnHost
// in net.ts for why). It fetches one address on oakhearttech.com with the same safeguards as the main Worker and
// returns what it saw. Locked with a shared secret, and it refuses any other domain, so it can't be used as a proxy.
// Deploy with: npx wrangler deploy -c wrangler.fetcher.jsonc

import { type FetchOptions, isOwnHost, safeFetch } from './net';
import { timingSafeEqual } from './report';

interface Env {
  FETCHER_SECRET?: string;
}

const deny = (status: number) => new Response(null, { status });

export default {
  async fetch(req, env): Promise<Response> {
    if (req.method !== 'POST') return deny(404);
    const key = req.headers.get('X-Fetcher-Key') ?? '';
    if (!env.FETCHER_SECRET || !timingSafeEqual(key, env.FETCHER_SECRET)) return deny(403);

    let body: { url?: unknown; opts?: FetchOptions };
    try {
      body = await req.json();
    } catch {
      return deny(400);
    }
    let target: URL;
    try {
      target = new URL(String(body.url ?? ''));
    } catch {
      return deny(400);
    }
    if (!isOwnHost(target.hostname)) return deny(403);

    const o = body.opts ?? {};
    const opts: FetchOptions = {
      timeoutMs: Math.min(Number(o.timeoutMs) || 8000, 8000),
      maxRedirects: Math.min(Number(o.maxRedirects) || 5, 5),
      maxBytes: Math.min(Number(o.maxBytes) || 2_000_000, 2_000_000),
      readBody: o.readBody !== false,
    };
    return Response.json(await safeFetch(target.toString(), opts));
  },
} satisfies ExportedHandler<Env>;
