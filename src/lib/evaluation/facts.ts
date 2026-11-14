// Raw facts gathered by the Worker, before they're turned into checks. Kept separate so the check rules
// (checks.ts) can be unit-tested without any network.

import type { HtmlFacts } from './html';

export interface HttpFacts {
  ok: boolean;
  status?: number;
  /** Where the request ended up after redirects. */
  finalUrl?: string;
  redirects: string[];
  /** Lower-cased header names. */
  headers: Record<string, string>;
  /** Why it failed: the name didn't resolve, timed out, was refused by bot protection, a bad certificate, or anything else. */
  error?: 'dns' | 'timeout' | 'blocked' | 'tls' | 'refused' | 'other';
  ms?: number;
}

export interface QuickRaw {
  homepage: HttpFacts;
  html: HtmlFacts | null;
  /** Whether http:// ends up on https://. null when it couldn't be tested. */
  httpToHttps: boolean | null;
  /** The www or bare twin of the address that was typed. */
  altHost: { host: string; ok: boolean; sameDestination: boolean } | null;
  robots: { found: boolean; blocksAll: boolean; sitemapListed: boolean };
  sitemapFound: boolean;
  /** nxdomain: DNS says the name doesn't exist at all. */
  dns: { ok: boolean; nxdomain: boolean; mx: string[]; spf: string[]; dmarc: string[]; dkimSelectors: string[] };
  rdap: { ok: boolean; expires?: string; transferLock?: boolean; registrar?: string };
}

export interface PsiRaw {
  ok: boolean;
  error?: string;
  /** Lighthouse category scores, 0–100. */
  performance?: number;
  accessibility?: number;
  seo?: number;
  bestPractices?: number;
  lcpMs?: number;
  cls?: number;
  totalBytes?: number;
  imageSavingsBytes?: number;
  /** Lighthouse audit scores (0–1, or null when not applicable), by audit id. */
  audits: Record<string, number | null>;
}
