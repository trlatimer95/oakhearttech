// A printable version of one evaluation, for Tyler to save as a PDF and send with a personal note.
// Protected by a password (HTTP Basic auth, any username) set with `wrangler secret put REPORT_PASSWORD`.

import type { CheckResult, EvaluationResult } from '../src/lib/evaluation/types';

const esc = (s: string | number | null | undefined) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function authorized(req: Request, password?: string): boolean {
  if (!password) return false;
  const h = req.headers.get('Authorization') ?? '';
  if (!h.startsWith('Basic ')) return false;
  try {
    const [, pass] = atob(h.slice(6)).split(':');
    return timingSafeEqual(pass ?? '', password);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const ICON = { pass: '✓', warn: '!', fail: '✕', skip: '–' } as const;
const COLOR = { pass: '#2f7d4f', warn: '#b7791f', fail: '#b83a2e', skip: '#8a8f99' } as const;

function row(c: CheckResult): string {
  return `<tr>
    <td class="ic" style="color:${COLOR[c.status]}">${ICON[c.status]}</td>
    <td><b>${esc(c.title)}</b><div class="why">${esc(c.why)}</div>${c.status === 'warn' || c.status === 'fail' ? `<div class="fix"><b>Fix:</b> ${esc(c.fix)} <span class="eff">${esc(c.effort)} · ${esc(c.menu)}</span></div>` : ''}${c.detail ? `<div class="det">${esc(c.detail)}</div>` : ''}</td>
  </tr>`;
}

export function renderReport(r: EvaluationResult): string {
  const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
  const cats = r.categories
    .map(
      (c) => `<div class="cat"><div class="g">${esc(c.grade ?? '–')}</div><div><b>${esc(c.name)}</b><div class="why">${c.score === null ? 'Not measured' : `${c.score} / 100`}${c.worst ? ` · ${esc(c.worst)}` : ''}</div></div></div>`,
    )
    .join('');
  const sections = r.categories
    .map((c) => {
      const checks = r.checks.filter((x) => x.category === c.id);
      return checks.length ? `<h3>${esc(c.name)}</h3><table>${checks.map(row).join('')}</table>` : '';
    })
    .join('');
  const fixes = r.topFixes
    .map((f, i) => `<li><b>${i + 1}. ${esc(f.title)}</b><div class="why">${esc(f.why)}</div><div class="fix"><b>Fix:</b> ${esc(f.fix)} <span class="eff">${esc(f.effort)} · ${esc(f.menu)}</span></div></li>`)
    .join('');

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<title>Website evaluation: ${esc(r.facts.host)}</title>
<style>
  body{font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1a1d24;max-width:820px;margin:32px auto;padding:0 24px}
  h1{font:600 30px/1.15 Georgia,serif;color:#0e1a33;margin:4px 0 8px} h2{font:600 22px Georgia,serif;color:#0e1a33;margin:32px 0 10px}
  h3{font:600 17px Georgia,serif;color:#152d5c;margin:24px 0 6px;border-bottom:2px solid #c9a464;padding-bottom:4px}
  .eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8a6a3f}
  .overall{display:flex;gap:20px;align-items:center;border:1px solid #e3e0d8;border-radius:12px;padding:18px 22px}
  .big{font:700 54px Georgia,serif;color:#152d5c;min-width:70px;text-align:center}
  .meta{color:#5b616e;font-size:13.5px}
  .cats{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .cat{display:flex;gap:12px;align-items:center;border:1px solid #e3e0d8;border-radius:10px;padding:10px 12px}
  .g{font:700 22px Georgia,serif;color:#fff;background:#152d5c;border-radius:8px;width:38px;height:38px;display:grid;place-items:center;flex:none}
  ol{list-style:none;padding:0} li{margin:0 0 14px}
  table{width:100%;border-collapse:collapse} td{vertical-align:top;padding:8px 6px;border-bottom:1px solid #eee}
  .ic{width:22px;font-weight:800;font-size:16px} .why{color:#5b616e;font-size:14px} .fix{font-size:14px;margin-top:3px}
  .eff{color:#8a6a3f;font-size:12.5px;font-weight:600;margin-left:6px} .det{font:12px ui-monospace,Consolas,monospace;color:#8a8f99;margin-top:3px;word-break:break-all}
  .foot{margin-top:36px;color:#5b616e;font-size:13px;border-top:1px solid #e3e0d8;padding-top:12px}
  @media print{body{margin:0}.noprint{display:none}}
</style></head><body>
<p class="noprint meta">Print this page or save it as a PDF (Ctrl+P) to send with your note.</p>
<div class="eyebrow">Oakheart Technologies · Free Website Evaluation</div>
<h1>${esc(r.facts.host)}</h1>
<div class="overall"><div class="big">${esc(r.overall.grade ?? '–')}</div><div><b>${esc(r.overall.summary)}</b>
<div class="meta">Overall ${esc(r.overall.score ?? '–')} / 100 · Checked ${esc(date)}${r.facts.platform ? ` · Built with ${esc(r.facts.platform)}` : ''}${r.facts.emailProvider ? ` · Email by ${esc(r.facts.emailProvider)}` : ''}</div></div></div>
<h2>Scores by area</h2><div class="cats">${cats}</div>
<h2>Top fixes</h2><ol>${fixes || '<li>No significant problems found.</li>'}</ol>
<h2>Everything we checked</h2>${sections}
<p class="foot">An automated check of public information, not a full audit or security test. Results are estimates.<br>
Tyler Latimer · Oakheart Technologies · (509) 590-2944 · tyler@oakhearttech.com · oakhearttech.com</p>
</body></html>`;
}
