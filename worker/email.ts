// Emails a visitor a private link to their own evaluation report, right after they ask for it.
// Sent through Resend (resend.com). Needs the RESEND_API_KEY secret and the REPORT_FROM var; without them nothing is
// sent and the visitor just gets Tyler's personal reply, as before.
//
// The link is /api/report/<id>?k=<signature>. The signature is an HMAC of the id, so only links this Worker made
// open a report without the password, and only for evaluations where the visitor asked for the report.

import type { EvaluationResult } from '../src/lib/evaluation/types';
import { timingSafeEqual } from './report';

async function sign(id: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`report-link:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(id));
  return [...new Uint8Array(mac)].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function reportLink(origin: string, id: string, secret: string): Promise<string> {
  return `${origin}/api/report/${id}?k=${await sign(id, secret)}`;
}

export async function validLink(id: string, k: string | null, secret: string | undefined): Promise<boolean> {
  if (!k || !secret) return false;
  return timingSafeEqual(k, await sign(id, secret));
}

const EMAIL = /^[^\s@<>()",;:]{1,64}@[a-z0-9.-]{1,253}\.[a-z]{2,}$/i;
export const validEmail = (s: string) => s.length <= 254 && EMAIL.test(s);

const esc = (s: string | number | null | undefined) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendReportEmail(
  apiKey: string,
  from: string,
  to: { name: string; email: string },
  r: EvaluationResult,
  link: string,
): Promise<boolean> {
  const first = to.name.trim().split(/\s+/)[0]?.slice(0, 40) ?? '';
  const hi = first ? `Hi ${first},` : 'Hi,';
  const grade = r.overall.grade ? `${r.overall.grade} (${r.overall.score}/100)` : 'still being scored';
  const fixes = r.topFixes.slice(0, 3);

  const text = [
    hi,
    '',
    `Here's the full report for ${r.facts.host}. Overall grade: ${grade}.`,
    '',
    link,
    '',
    ...(fixes.length ? ['The top things to fix:', ...fixes.map((f, i) => `${i + 1}. ${f.title}`), ''] : []),
    'The report has every finding, why it matters and how to fix it. You can print it or save it as a PDF.',
    '',
    "I'll also look over your results myself and follow up within one business day with what I'd fix first. If you have questions before then, just reply to this email.",
    '',
    'Tyler Latimer',
    'Oakheart Technologies · (509) 590-2944 · oakhearttech.com',
  ].join('\n');

  const html = `<div style="font:15px/1.55 -apple-system,'Segoe UI',Arial,sans-serif;color:#1a1d24;max-width:560px">
<p>${esc(hi)}</p>
<p>Here's the full report for <b>${esc(r.facts.host)}</b>. Overall grade: <b>${esc(grade)}</b>.</p>
<p style="margin:22px 0"><a href="${esc(link)}" style="background:#152d5c;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;display:inline-block">View your report</a></p>
${fixes.length ? `<p style="margin-bottom:4px"><b>The top things to fix:</b></p><ol style="margin-top:0;padding-left:20px">${fixes.map((f) => `<li>${esc(f.title)}</li>`).join('')}</ol>` : ''}
<p>The report has every finding, why it matters and how to fix it. You can print it or save it as a PDF.</p>
<p>I'll also look over your results myself and follow up within one business day with what I'd fix first. If you have questions before then, just reply to this email.</p>
<p>Tyler Latimer<br><span style="color:#5b616e">Oakheart Technologies · (509) 590-2944 · <a href="https://oakhearttech.com" style="color:#152d5c">oakhearttech.com</a></span></p>
</div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to.email],
        reply_to: 'tyler@oakhearttech.com',
        subject: `Your website evaluation for ${r.facts.host}`,
        text,
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('resend', res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (e) {
    console.error('resend', e);
    return false;
  }
}
