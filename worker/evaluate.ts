// Runs an evaluation: the quick checks (homepage, headers, DNS, domain), then the PageSpeed part, saving each
// result in D1 so the speed step, repeat visits and the report view can find it.

import { emailProvider, quickChecks, speedChecks } from '../src/lib/evaluation/checks';
import type { QuickRaw } from '../src/lib/evaluation/facts';
import { parseHtml } from '../src/lib/evaluation/html';
import { parseRobots } from '../src/lib/evaluation/robots';
import { buildResult } from '../src/lib/evaluation/score';
import type { EvaluationResult, SiteFacts } from '../src/lib/evaluation/types';
import { emailDns, pageSpeed, rdap } from './lookups';
import { type PageFetcher, isOwnHost, relayFetcher, safeFetch } from './net';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  TURNSTILE_SECRET?: string;
  PSI_API_KEY?: string;
  REPORT_PASSWORD?: string;
  IP_SALT?: string;
  /** Helper Worker used when the site being evaluated is oakhearttech.com itself (see net.ts). */
  FETCHER_URL?: string;
  FETCHER_SECRET?: string;
  /** Set only on staging: adds X-Robots-Tag noindex to every page. */
  NOINDEX?: string;
  /** Emailing visitors their report (see email.ts). Both must be set, or no email is sent. */
  RESEND_API_KEY?: string;
  REPORT_FROM?: string;
}

export const LIMITS = { perIpPerHour: 5, perDay: 200, cacheHours: 24, speedWindowMinutes: 15 };

export async function gatherQuick(origin: string, host: string, domain: string, get: PageFetcher = safeFetch): Promise<QuickRaw> {
  const altHostName = host.startsWith('www.') ? host.slice(4) : host === domain ? `www.${host}` : null;

  const [homepage, httpVersion, alt, robotsRes, sitemap1, sitemap2, dns, reg] = await Promise.all([
    get(`${origin}/`),
    get(`http://${host}/`, { readBody: false }),
    altHostName ? get(`https://${altHostName}/`, { readBody: false, timeoutMs: 6000 }) : Promise.resolve(null),
    get(`${origin}/robots.txt`, { maxBytes: 200_000, timeoutMs: 5000 }),
    get(`${origin}/sitemap.xml`, { maxBytes: 20_000, timeoutMs: 5000 }),
    get(`${origin}/sitemap_index.xml`, { maxBytes: 20_000, timeoutMs: 5000 }),
    emailDns(domain),
    rdap(host),
  ]);

  const isSitemap = (r: { ok: boolean; body?: string }) => r.ok && /<(urlset|sitemapindex)\b/i.test(r.body ?? '');
  const robotsText = robotsRes.ok && !/<html/i.test(robotsRes.body ?? '') ? (robotsRes.body ?? '') : '';
  const finalHost = (u?: string) => (u ? new URL(u).hostname : null);

  return {
    homepage: { ...homepage, body: undefined } as QuickRaw['homepage'],
    html: homepage.ok && homepage.body ? parseHtml(homepage.body) : null,
    httpToHttps: httpVersion.status ? (httpVersion.finalUrl ?? '').startsWith('https://') : null,
    altHost: alt && altHostName ? { host: altHostName, ok: alt.ok, sameDestination: alt.ok && finalHost(alt.finalUrl) === finalHost(homepage.finalUrl) } : null,
    robots: { found: !!robotsText, ...parseRobots(robotsText) },
    sitemapFound: isSitemap(sitemap1) || isSitemap(sitemap2),
    dns,
    rdap: reg,
  };
}

export function factsFrom(origin: string, host: string, domain: string, raw: QuickRaw): SiteFacts {
  return {
    origin,
    host,
    domain,
    platform: raw.html?.platform ?? undefined,
    emailProvider: emailProvider(raw.dns.mx),
    reachable: raw.homepage.ok,
  };
}

// ---- Storage ----

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function rateLimited(env: Env, ipHash: string): Promise<'ip' | 'day' | null> {
  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM evaluations WHERE ip_hash = ?1 AND created_at > ?2) AS ip_count,
       (SELECT COUNT(*) FROM evaluations WHERE created_at > ?3 AND cached = 0) AS day_count`,
  )
    .bind(ipHash, now - 3_600_000, now - 86_400_000)
    .first<{ ip_count: number; day_count: number }>();
  if ((row?.ip_count ?? 0) >= LIMITS.perIpPerHour) return 'ip';
  if ((row?.day_count ?? 0) >= LIMITS.perDay) return 'day';
  return null;
}

export async function recentResult(env: Env, host: string): Promise<EvaluationResult | null> {
  const row = await env.DB.prepare('SELECT result FROM evaluations WHERE host = ? AND complete = 1 AND created_at > ? ORDER BY created_at DESC LIMIT 1')
    .bind(host, Date.now() - LIMITS.cacheHours * 3_600_000)
    .first<{ result: string }>();
  return row ? (JSON.parse(row.result) as EvaluationResult) : null;
}

export async function saveResult(env: Env, r: EvaluationResult, ipHash: string, cached: boolean): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO evaluations (id, created_at, host, domain, ip_hash, grade, score, complete, cached, result)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(r.id, Date.parse(r.createdAt), r.facts.host, r.facts.domain, ipHash, r.overall.grade, r.overall.score, r.complete ? 1 : 0, cached ? 1 : 0, JSON.stringify(r))
    .run();
}

export async function loadResult(env: Env, id: string): Promise<{ result: EvaluationResult; createdAt: number; lead: boolean } | null> {
  const row = await env.DB.prepare('SELECT result, created_at, lead_submitted FROM evaluations WHERE id = ?').bind(id).first<{ result: string; created_at: number; lead_submitted: number }>();
  return row ? { result: JSON.parse(row.result), createdAt: row.created_at, lead: !!row.lead_submitted } : null;
}

// ---- The two steps ----

export async function runQuick(env: Env, origin: string, host: string, domain: string, ipHash: string): Promise<EvaluationResult | { error: string; status: number }> {
  const own = isOwnHost(host) && env.FETCHER_URL && env.FETCHER_SECRET;
  const raw = await gatherQuick(origin, host, domain, own ? relayFetcher(env.FETCHER_URL!, env.FETCHER_SECRET!) : safeFetch);
  // Nothing at all at this name (no website, no email records): almost always a typo, so say that instead of an F.
  if (!raw.homepage.ok && raw.dns.ok && raw.dns.nxdomain && !raw.dns.mx.length) {
    return { error: `We couldn’t find a website or email at ${host}. Check the spelling and try again.`, status: 422 };
  }
  const result = buildResult(crypto.randomUUID(), new Date().toISOString(), factsFrom(origin, host, domain, raw), quickChecks(raw), ['speed']);
  await saveResult(env, result, ipHash, false);
  return result;
}

export async function runSpeed(env: Env, id: string): Promise<EvaluationResult | { error: string; status: number }> {
  const saved = await loadResult(env, id);
  if (!saved) return { error: 'That evaluation wasn’t found. Please start again.', status: 404 };
  if (saved.result.complete) return saved.result;
  if (Date.now() - saved.createdAt > LIMITS.speedWindowMinutes * 60_000) return { error: 'This evaluation expired. Please start again.', status: 410 };

  const r = saved.result;
  // Claim the speed step so a double-click doesn't run PageSpeed twice.
  const claim = await env.DB.prepare('UPDATE evaluations SET speed_started = 1 WHERE id = ? AND speed_started = 0').bind(id).run();
  if (!claim.meta.changes) return { error: 'The speed test is already running. Give it a few more seconds.', status: 409 };

  const psi = r.facts.reachable ? await pageSpeed(`${r.facts.origin}/`, env.PSI_API_KEY) : { ok: false, error: 'Site did not load', audits: {} };
  const quick = r.checks.filter((c) => c.category !== 'speed' && !['font-size', 'tap-targets', 'image-alt', 'accessibility'].includes(c.id));
  const done = buildResult(r.id, r.createdAt, r.facts, [...quick, ...speedChecks(psi)]);
  await env.DB.prepare('UPDATE evaluations SET complete = 1, grade = ?, score = ?, result = ? WHERE id = ?')
    .bind(done.overall.grade, done.overall.score, JSON.stringify(done), id)
    .run();
  return done;
}
