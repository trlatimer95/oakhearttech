// Public lookups that don't touch the visitor's site: DNS (email settings), RDAP (domain registration),
// Google PageSpeed Insights (speed), and Cloudflare Turnstile (is this a person).

import type { PsiRaw, QuickRaw } from '../src/lib/evaluation/facts';
import { registeredDomain } from '../src/lib/evaluation/url';

// ---- DNS over HTTPS ----

interface DohAnswer {
  type: number;
  data: string;
}

async function doh(name: string, type: 'MX' | 'TXT'): Promise<{ ok: boolean; nxdomain?: boolean; answers: DohAnswer[] }> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, answers: [] };
    const j = (await res.json()) as { Status: number; Answer?: DohAnswer[] };
    // 0 = found, 3 = no such name. Anything else (2 = server failure, ...) means we don't know.
    if (j.Status !== 0 && j.Status !== 3) return { ok: false, answers: [] };
    return { ok: true, nxdomain: j.Status === 3, answers: j.Answer ?? [] };
  } catch {
    return { ok: false, answers: [] };
  }
}

const txt = (a: DohAnswer[]) => a.filter((x) => x.type === 16).map((x) => x.data.replace(/"\s+"/g, '').replace(/^"|"$/g, '').replace(/\\"/g, '"'));

// Common DKIM selector names: Google, Microsoft 365, Mailchimp/Mandrill, Zoho, Proton, Fastmail, and generic ones.
const DKIM_SELECTORS = ['google', 'selector1', 'selector2', 'k1', 'k2', 'default', 's1', 's2', 'dkim', 'mail', 'zoho', 'protonmail', 'fm1', 'mandrill'];

export async function emailDns(domain: string): Promise<QuickRaw['dns']> {
  const [mx, root, dmarc, ...dkim] = await Promise.all([
    doh(domain, 'MX'),
    doh(domain, 'TXT'),
    doh(`_dmarc.${domain}`, 'TXT'),
    ...DKIM_SELECTORS.map((s) => doh(`${s}._domainkey.${domain}`, 'TXT')),
  ]);
  return {
    ok: mx.ok && root.ok && dmarc.ok,
    nxdomain: !!mx.nxdomain,
    mx: mx.answers
      .filter((a) => a.type === 15)
      .map((a) => a.data.split(/\s+/).pop()!.replace(/\.$/, ''))
      .filter((h) => h && h !== '.'),
    spf: txt(root.answers).filter((t) => /^v=spf1\b/i.test(t)),
    dmarc: txt(dmarc.answers).filter((t) => /^v=DMARC1\b/i.test(t)),
    dkimSelectors: DKIM_SELECTORS.filter((_, i) => txt(dkim[i].answers).some((t) => /\bp=[A-Za-z0-9+/]/.test(t))),
  };
}

// ---- RDAP (domain registration) ----

interface RdapEntity {
  roles?: string[];
  vcardArray?: [string, [string, unknown, string, string][]];
}

// IANA's list of which registry answers RDAP for each domain ending (.com → Verisign, ...). It changes rarely,
// so it's kept in memory and in Cloudflare's cache for a day.
let bootstrap: { at: number; services: [string[], string[]][] } | null = null;

async function rdapBase(tld: string): Promise<string | undefined> {
  if (!bootstrap || Date.now() - bootstrap.at > 86_400_000) {
    const res = await fetch('https://data.iana.org/rdap/dns.json', { signal: AbortSignal.timeout(5000), cf: { cacheTtl: 86_400, cacheEverything: true } } as RequestInit);
    if (!res.ok) return undefined;
    const j = (await res.json()) as { services: [string[], string[]][] };
    bootstrap = { at: Date.now(), services: j.services };
  }
  const urls = bootstrap.services.find(([tlds]) => tlds.includes(tld))?.[1];
  const base = urls?.find((u) => u.startsWith('https://')) ?? urls?.[0];
  return base ? base.replace(/\/?$/, '/') : undefined;
}

export async function rdap(host: string): Promise<QuickRaw['rdap']> {
  try {
    const domain = registeredDomain(host);
    const base = await rdapBase(domain.split('.').pop()!);
    if (!base) return { ok: false }; // some endings (.io, ...) don't offer RDAP
    const res = await fetch(`${base}domain/${domain}`, {
      headers: { Accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { ok: false };
    const j = (await res.json()) as { events?: { eventAction: string; eventDate: string }[]; status?: string[]; entities?: RdapEntity[] };
    const expires = j.events?.find((e) => e.eventAction === 'expiration')?.eventDate;
    const status = (j.status ?? []).map((s) => s.toLowerCase());
    const registrarEntity = j.entities?.find((e) => e.roles?.includes('registrar'));
    const registrar = registrarEntity?.vcardArray?.[1]?.find((f) => f[0] === 'fn')?.[3];
    return {
      ok: true,
      expires,
      transferLock: status.length ? status.some((s) => s.includes('transfer prohibited') || s.includes('transferprohibited')) : undefined,
      registrar: typeof registrar === 'string' ? registrar : undefined,
    };
  } catch {
    return { ok: false };
  }
}

// ---- PageSpeed Insights ----

interface LhAudit {
  score: number | null;
  numericValue?: number;
  scoreDisplayMode?: string;
  details?: { overallSavingsBytes?: number };
}

export async function pageSpeed(url: string, key?: string): Promise<PsiRaw> {
  const q = new URLSearchParams({ url, strategy: 'mobile' });
  for (const c of ['performance', 'accessibility', 'seo', 'best-practices']) q.append('category', c);
  if (key) q.set('key', key);
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: AbortSignal.timeout(55_000) });
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      return { ok: false, error: err?.error?.message?.slice(0, 200) ?? `PageSpeed returned ${res.status}`, audits: {} };
    }
    const j = (await res.json()) as {
      lighthouseResult?: { categories: Record<string, { score: number | null }>; audits: Record<string, LhAudit>; runtimeError?: { message: string } };
    };
    const lh = j.lighthouseResult;
    if (!lh || lh.runtimeError) return { ok: false, error: lh?.runtimeError?.message ?? 'No Lighthouse result', audits: {} };
    const cat = (k: string) => (lh.categories[k]?.score == null ? undefined : Math.round(lh.categories[k].score! * 100));
    const num = (k: string) => lh.audits[k]?.numericValue;
    // Image savings: older Lighthouse has separate image audits, newer has one "insight". Use the biggest figure.
    const savings = ['uses-optimized-images', 'modern-image-formats', 'uses-responsive-images', 'image-delivery-insight']
      .map((k) => lh.audits[k]?.details?.overallSavingsBytes)
      .filter((v): v is number => typeof v === 'number');
    const audits: Record<string, number | null> = {};
    for (const k of ['font-size', 'target-size', 'image-alt', 'viewport']) {
      const a = lh.audits[k];
      if (a) audits[k] = a.scoreDisplayMode === 'notApplicable' || a.scoreDisplayMode === 'manual' ? null : a.score;
    }
    return {
      ok: true,
      performance: cat('performance'),
      accessibility: cat('accessibility'),
      seo: cat('seo'),
      bestPractices: cat('best-practices'),
      lcpMs: num('largest-contentful-paint'),
      cls: num('cumulative-layout-shift'),
      totalBytes: num('total-byte-weight'),
      imageSavingsBytes: savings.length ? Math.max(...savings) : undefined,
      audits,
    };
  } catch (e) {
    return { ok: false, error: (e as Error)?.name === 'TimeoutError' ? 'PageSpeed timed out' : 'PageSpeed request failed', audits: {} };
  }
}

// ---- Turnstile ----

export async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, signal: AbortSignal.timeout(5000) });
    const j = (await res.json()) as { success?: boolean };
    return j.success === true;
  } catch {
    return false;
  }
}
