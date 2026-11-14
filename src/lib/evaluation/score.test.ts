import { describe, expect, it } from 'vitest';
import { quickChecks, speedChecks } from './checks';
import type { QuickRaw } from './facts';
import { parseHtml } from './html';
import { buildResult, gradeFor, scoreCategory, topFixes } from './score';
import type { CheckResult } from './types';

const c = (over: Partial<CheckResult>): CheckResult => ({
  id: 'x',
  category: 'google',
  weight: 'medium',
  status: 'pass',
  title: 't',
  why: 'w',
  fix: '',
  effort: 'Quick fix',
  menu: 'm',
  ...over,
});

describe('grades', () => {
  it('uses the agreed bands', () => {
    expect([95, 90, 89, 80, 79, 70, 69, 55, 54, 0].map(gradeFor)).toEqual(['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'F', 'F']);
  });
});

describe('scoreCategory', () => {
  it('gives half credit for warnings and ignores skips', () => {
    const s = scoreCategory('google', [c({ weight: 'high', status: 'pass' }), c({ weight: 'high', status: 'warn' }), c({ weight: 'critical', status: 'skip' })], false);
    expect(s.score).toBe(75);
    expect(s.counts).toEqual({ pass: 1, warn: 1, fail: 0 });
  });
  it('caps a category with a failed critical check at D', () => {
    const checks = [c({ weight: 'critical', status: 'fail' }), ...Array.from({ length: 30 }, () => c({ weight: 'high', status: 'pass' }))];
    const s = scoreCategory('google', checks, false);
    expect(s.score).toBe(69);
    expect(s.grade).toBe('D');
  });
  it('returns no score while pending or when nothing ran', () => {
    expect(scoreCategory('speed', [c({ category: 'speed' })], true).score).toBeNull();
    expect(scoreCategory('speed', [], false).score).toBeNull();
  });
});

describe('topFixes', () => {
  it('ranks by weight and severity, one per category, quick fixes first on ties', () => {
    const fixes = topFixes([
      c({ id: 'a', category: 'email', weight: 'high', status: 'fail', effort: 'Half day' }),
      c({ id: 'b', category: 'email', weight: 'high', status: 'fail', effort: 'Quick fix' }),
      c({ id: 'c', category: 'speed', weight: 'low', status: 'warn' }),
      c({ id: 'd', category: 'google', weight: 'medium', status: 'fail' }),
      c({ id: 'e', category: 'security', weight: 'medium', status: 'warn' }),
    ]);
    expect(fixes.map((f) => f.id)).toEqual(['b', 'd', 'e']);
  });
});

describe('buildResult', () => {
  it('holds back the overall grade until the speed test is in, and reweights unmeasured categories', () => {
    const checks = [c({ category: 'google' }), c({ category: 'email', status: 'fail', weight: 'high', id: 'dmarc' })];
    const partial = buildResult('id', 'now', { origin: '', host: '', domain: '', reachable: true }, checks, ['speed']);
    expect(partial.overall.grade).toBeNull();
    expect(partial.complete).toBe(false);
    const done = buildResult('id', 'now', { origin: '', host: '', domain: '', reachable: true }, checks);
    // google 100 (share .25) and email 0 (share .2); speed, security, mobile have no checks and are left out.
    expect(done.overall.score).toBe(56);
    expect(done.overall.summary).toContain('emails are likely landing in spam');
  });
});

describe('check rules', () => {
  const base: QuickRaw = {
    homepage: { ok: true, status: 200, redirects: [], headers: { 'strict-transport-security': 'max-age=1', 'x-content-type-options': 'nosniff', 'referrer-policy': 'x', 'x-frame-options': 'DENY' } },
    html: parseHtml('<title>Example Bakery | Fresh bread in Spokane</title><meta name="description" content="Bread."><meta name="viewport" content="width=device-width"><h1>Hi</h1><a href="tel:1">x</a>'),
    httpToHttps: true,
    altHost: { host: 'www.example.com', ok: true, sameDestination: true },
    robots: { found: true, blocksAll: false, sitemapListed: true },
    sitemapFound: true,
    dns: { ok: true, nxdomain: false, mx: ['example-com.mail.protection.outlook.com'], spf: ['v=spf1 include:spf.protection.outlook.com -all'], dmarc: [], dkimSelectors: ['selector1'] },
    rdap: { ok: true, expires: '2026-12-24T00:00:00Z', transferLock: true },
  };
  const now = new Date('2026-11-13T00:00:00Z');

  it('flags a missing DMARC record and names the provider', () => {
    const checks = quickChecks(base, now);
    expect(checks.find((x) => x.id === 'dmarc')?.status).toBe('fail');
    expect(checks.find((x) => x.id === 'mx')?.why).toContain('Microsoft 365');
  });
  it('counts days to domain expiry', () => {
    const exp = quickChecks(base, now).find((x) => x.id === 'domain-expiry')!;
    expect(exp.status).toBe('warn');
    expect(exp.title).toBe('Your domain expires in 41 days');
  });
  it('treats noindex as a critical failure', () => {
    const raw = { ...base, homepage: { ...base.homepage, headers: { ...base.homepage.headers, 'x-robots-tag': 'noindex' } } };
    const ix = quickChecks(raw, now).find((x) => x.id === 'indexable')!;
    expect(ix.status).toBe('fail');
    expect(ix.weight).toBe('critical');
  });
  it('skips rather than fails when bot protection blocks the check', () => {
    const raw = { ...base, homepage: { ok: false, redirects: [], headers: {}, error: 'blocked' as const }, html: null };
    const checks = quickChecks(raw, now);
    expect(checks.find((x) => x.id === 'https')?.status).toBe('skip');
    expect(checks.some((x) => x.id === 'title')).toBe(false);
    expect(checks.find((x) => x.id === 'dmarc')?.status).toBe('fail'); // email checks still run
  });
  it('flags two SPF records and +all', () => {
    expect(quickChecks({ ...base, dns: { ...base.dns, spf: ['v=spf1 -all', 'v=spf1 ~all'] } }, now).find((x) => x.id === 'spf')?.status).toBe('fail');
    expect(quickChecks({ ...base, dns: { ...base.dns, spf: ['v=spf1 +all'] } }, now).find((x) => x.id === 'spf')?.status).toBe('fail');
  });
  it('turns PageSpeed numbers into checks', () => {
    const s = speedChecks({ ok: true, performance: 42, lcpMs: 5100, cls: 0.05, totalBytes: 3_500_000, imageSavingsBytes: 1_200_000, accessibility: 85, audits: { 'font-size': 1, 'target-size': 0, 'image-alt': null } });
    const by = Object.fromEntries(s.map((x) => [x.id, x]));
    expect(by.performance.status).toBe('fail');
    expect(by.lcp.title).toBe('Main content takes 5.1 seconds to appear on a phone');
    expect(by.cls.status).toBe('pass');
    expect(by['page-weight'].status).toBe('warn');
    expect(by.images.status).toBe('fail');
    expect(by['tap-targets'].status).toBe('warn');
    expect(by['image-alt']).toBeUndefined();
  });
  it('skips speed when PageSpeed fails', () => {
    expect(speedChecks({ ok: false, error: 'x', audits: {} }).every((x) => x.status === 'skip')).toBe(true);
  });
});
