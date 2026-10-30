// Runs after `astro build`. Finds every inline <script> in dist/, computes its SHA-256 hash, and writes the hashes
// into the Content-Security-Policy in dist/_headers, so the policy can drop 'unsafe-inline' for scripts.
// Any inline script that changes (or is added) gets a new hash automatically on the next build.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const TOKEN = '{{SCRIPT_HASHES}}';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : [];
  });
}

const hashes = new Set();
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const [, attrs, body] = m;
    if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs)) continue; // external files and data blocks
    if (!body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
}

const headersPath = join(dist, '_headers');
if (!existsSync(headersPath)) throw new Error('dist/_headers not found');
const headers = readFileSync(headersPath, 'utf8');
if (!headers.includes(TOKEN)) throw new Error(`${TOKEN} not found in _headers`);
writeFileSync(headersPath, headers.replaceAll(TOKEN, [...hashes].sort().join(' ')));
console.log(`CSP: allowed ${hashes.size} inline script hash(es); 'unsafe-inline' removed from script-src.`);
