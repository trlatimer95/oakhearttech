// Fetching addresses that a stranger typed in. Every hop is checked: http/https only, standard ports, public
// hostnames, at most 5 redirects, a time limit and a size limit on what's read.

import type { HttpFacts } from '../src/lib/evaluation/facts';
import { isPublicHostname } from '../src/lib/evaluation/url';

export const USER_AGENT = 'Mozilla/5.0 (compatible; OakheartWebsiteEvaluation/1.0; +https://oakhearttech.com/website-evaluation)';

export interface FetchResult extends HttpFacts {
  body?: string;
}

interface Options {
  timeoutMs?: number;
  maxRedirects?: number;
  maxBytes?: number;
  readBody?: boolean;
}

function allowed(u: URL): boolean {
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  if (u.port && u.port !== '80' && u.port !== '443') return false;
  if (u.username || u.password) return false;
  return isPublicHostname(u.hostname);
}

export async function safeFetch(start: string, opts: Options = {}): Promise<FetchResult> {
  const { timeoutMs = 8000, maxRedirects = 5, maxBytes = 2_000_000, readBody = true } = opts;
  const redirects: string[] = [];
  const t0 = Date.now();
  let url = new URL(start);
  const deadline = AbortSignal.timeout(timeoutMs);

  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!allowed(url)) return { ok: false, redirects, headers: {}, error: 'other', ms: Date.now() - t0 };
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: deadline,
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.8' },
      });
    } catch (e) {
      return { ok: false, redirects, headers: {}, error: classifyError(e), ms: Date.now() - t0 };
    }

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));

    if (res.status >= 300 && res.status < 400 && headers.location) {
      res.body?.cancel();
      let next: URL;
      try {
        next = new URL(headers.location, url);
      } catch {
        return { ok: false, status: res.status, redirects, headers, error: 'other', ms: Date.now() - t0 };
      }
      redirects.push(next.toString());
      url = next;
      continue;
    }

    const body = readBody ? await readCapped(res, maxBytes).catch(() => '') : (res.body?.cancel(), undefined);
    const out: FetchResult = { ok: res.status >= 200 && res.status < 300, status: res.status, finalUrl: url.toString(), redirects, headers, body, ms: Date.now() - t0 };
    if (!out.ok) out.error = classifyStatus(res.status, headers, body ?? '');
    return out;
  }
  return { ok: false, redirects, headers: {}, error: 'other', ms: Date.now() - t0 };
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    text += decoder.decode(value, { stream: true });
    if (bytes >= maxBytes) {
      await reader.cancel();
      break;
    }
  }
  return text + decoder.decode();
}

function classifyError(e: unknown): HttpFacts['error'] {
  const msg = String((e as Error)?.message ?? e).toLowerCase();
  if ((e as Error)?.name === 'TimeoutError' || msg.includes('timeout') || msg.includes('timed out') || msg.includes('aborted')) return 'timeout';
  if (msg.includes('dns') || msg.includes('resolve') || msg.includes('not found') || msg.includes('enotfound')) return 'dns';
  if (msg.includes('tls') || msg.includes('ssl') || msg.includes('certificate')) return 'tls';
  if (msg.includes('refused') || msg.includes('reset')) return 'refused';
  return 'other';
}

/** Turns a non-2xx response into a reason. Cloudflare reports origin problems with its own 52x/530 codes. */
function classifyStatus(status: number, headers: Record<string, string>, body: string): HttpFacts['error'] {
  if (status === 530 || status === 1016) return 'dns';
  if (status === 525 || status === 526) return 'tls';
  if (status === 522 || status === 524) return 'timeout';
  if (status === 521 || status === 523) return 'refused';
  const challenge =
    headers['cf-mitigated'] === 'challenge' ||
    /just a moment|attention required|challenge-platform|cf-chl|captcha|access denied|request unsuccessful|sgcaptcha|incapsula/i.test(body.slice(0, 20_000));
  if (status === 403 || status === 429 || ((status === 503 || status === 401) && challenge)) return 'blocked';
  return 'other';
}
