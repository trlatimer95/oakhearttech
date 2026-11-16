// Drives the Free Website Evaluation page: Turnstile, the two API calls, the progress list, and the results.

import type { CategoryScore, CheckResult, EvaluationResult, Grade } from '../lib/evaluation/types';
import { trackConversion } from './ads';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      getResponse: (id?: string) => string | undefined;
    };
  }
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const GRADE_COLOR: Record<Grade, string> = { A: '#2f7d4f', B: '#3f7f8f', C: '#b7791f', D: '#c45f1c', F: '#b83a2e' };
const STATUS = {
  pass: { icon: '✓', color: '#2f7d4f', label: 'Passed' },
  warn: { icon: '!', color: '#b7791f', label: 'To improve' },
  fail: { icon: '✕', color: '#b83a2e', label: 'Problem' },
  skip: { icon: '–', color: '#8a8f99', label: 'Not checked' },
} as const;

let current: EvaluationResult | null = null;
let widgetId: string | undefined;

// ---------------------------------------------------------------- Turnstile

function loadTurnstile(form: HTMLFormElement): Promise<void> {
  return new Promise((resolve) => {
    const render = () => {
      const box = $('eval-turnstile');
      if (!box || !window.turnstile) return resolve();
      widgetId = window.turnstile.render(box, { sitekey: form.dataset.turnstileKey, theme: 'dark', appearance: 'interaction-only', action: 'evaluate' });
      resolve();
    };
    if (window.turnstile) return render();
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = render;
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

async function turnstileToken(): Promise<string> {
  // The widget solves itself in the background; wait up to ~8 seconds for it.
  for (let i = 0; i < 40; i++) {
    const t = window.turnstile?.getResponse(widgetId);
    if (t) return t;
    await new Promise((r) => setTimeout(r, 200));
  }
  return '';
}

// ---------------------------------------------------------------- Progress list

const QUICK_STEPS = ['Loading your homepage', 'Checking email settings', 'Checking your domain and security', 'Checking what Google sees'];

function showProgress(host: string) {
  $('eval-progress')?.classList.remove('hidden');
  const h = $('eval-progress-host');
  if (h) h.textContent = host;
  const list = $('eval-steps');
  if (!list) return;
  list.innerHTML = [...QUICK_STEPS, 'Measuring speed on a phone']
    .map((s, i) => `<li data-step="${i}" class="flex items-center gap-3 text-paper/45"><span class="mark inline-grid w-5 place-items-center">•</span>${s}${i === 4 ? '<small class="ml-1 text-sm text-paper/50">usually 15–40 seconds</small>' : ''}</li>`)
    .join('');
}

function setStep(i: number, state: 'run' | 'done' | 'fail') {
  const li = document.querySelector<HTMLElement>(`#eval-steps [data-step="${i}"]`);
  if (!li) return;
  const mark = li.querySelector<HTMLElement>('.mark')!;
  li.classList.toggle('text-paper/45', false);
  li.classList.add('text-paper');
  mark.innerHTML =
    state === 'done'
      ? '<span class="font-bold text-[#7fd1a0]">✓</span>'
      : state === 'fail'
        ? '<span class="font-bold text-[#ffb3a7]">–</span>'
        : '<span class="inline-block h-4 w-4 animate-spin rounded-full border-[3px] border-brass/30 border-t-brass"></span>';
}

// ---------------------------------------------------------------- Results

function gradeBadge(grade: Grade | null, size = 'h-10 w-10 text-xl') {
  if (!grade) return `<span class="${size} inline-grid place-items-center rounded-lg bg-line font-serif font-bold text-muted">…</span>`;
  return `<span class="${size} inline-grid place-items-center rounded-lg font-serif font-bold text-white" style="background:${GRADE_COLOR[grade]}">${grade}</span>`;
}

function ring(r: EvaluationResult) {
  const g = r.overall.grade;
  const pct = r.overall.score ?? 0;
  const color = g ? GRADE_COLOR[g] : '#c9a464';
  const inner = g
    ? `<b class="font-serif text-6xl leading-none" style="color:${color}">${g}</b><small class="mt-1 block text-xs font-semibold tracking-wide text-muted">${r.overall.score} / 100</small>`
    : `<span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brass/25 border-t-brass"></span><small class="mt-2 block px-3 text-xs font-semibold text-muted">Grade after the speed test</small>`;
  return `<div class="grid h-40 w-40 flex-none place-items-center rounded-full" style="background:conic-gradient(${color} 0 ${pct}%, #efe9dc ${pct}% 100%)">
    <div class="grid h-32 w-32 place-items-center rounded-full bg-white text-center"><div>${inner}</div></div></div>`;
}

function categoryCard(c: CategoryScore, pending: boolean) {
  const color = c.grade ? GRADE_COLOR[c.grade] : '#c9a464';
  const body = c.score === null
    ? `<p class="text-sm text-muted">${pending ? 'Measuring…' : 'Couldn’t be measured for this site.'}</p>`
    : `<div class="h-1.5 overflow-hidden rounded bg-[#efe9dc]"><i class="block h-full" style="width:${c.score}%;background:${color}"></i></div>
       <p class="text-xs text-muted">${c.score} / 100</p>
       <p class="text-[0.95rem] leading-snug">${esc(c.worst ?? 'No problems found.')}</p>`;
  return `<div class="card flex flex-col gap-2.5 p-5">
    <div class="flex items-start justify-between gap-3"><span class="font-semibold text-ink">${esc(c.name)}</span>${gradeBadge(c.grade)}</div>
    ${body}
    <p class="mt-auto border-t border-dashed border-line pt-2 text-xs text-muted">${Math.round(c.share * 100)}% of overall grade</p>
  </div>`;
}

function fixCard(f: CheckResult, i: number) {
  return `<div class="card border-t-4 p-6" style="border-top-color:${STATUS[f.status].color}">
    <p class="font-serif text-sm font-semibold text-oak">Fix ${i + 1}</p>
    <h3 class="mt-1 text-xl leading-tight">${esc(f.title)}</h3>
    <p class="mt-2 text-[0.95rem]">${esc(f.why)}</p>
    <p class="mt-2 text-[0.95rem] text-muted"><b class="text-ink">The fix:</b> ${esc(f.fix)}</p>
    <div class="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
      <span class="rounded-full bg-[#f1ede3] px-2.5 py-1 text-oak">${esc(f.effort)}</span>
      <span class="rounded-full bg-[#e8edf6] px-2.5 py-1 text-royal">${esc(f.menu)}</span>
    </div>
  </div>`;
}

function checkRow(c: CheckResult) {
  const s = STATUS[c.status];
  const extra = [c.status === 'warn' || c.status === 'fail' ? `<b class="text-ink">The fix:</b> ${esc(c.fix)}` : '', c.detail ? `<code class="break-all text-xs">${esc(c.detail)}</code>` : '']
    .filter(Boolean)
    .join('<br>');
  return `<li class="grid grid-cols-[1.75rem_1fr] gap-3 border-t border-line px-5 py-4 md:pl-10">
    <span class="mt-0.5 grid h-6 w-6 place-items-center rounded-full text-sm font-extrabold text-white" style="background:${s.color}" aria-label="${s.label}">${s.icon}</span>
    <div>
      <p class="font-semibold text-ink">${esc(c.title)}</p>
      <p class="text-[0.95rem] text-muted">${esc(c.why)}</p>
      ${extra ? `<details class="mt-1 text-sm"><summary class="cursor-pointer font-semibold text-royal">Details</summary><p class="mt-1 text-muted">${extra}</p></details>` : ''}
    </div>
  </li>`;
}

function checklist(r: EvaluationResult) {
  return r.categories
    .map((cat) => {
      const checks = r.checks.filter((c) => c.category === cat.id && c.status !== 'skip');
      if (!checks.length) return '';
      const n = cat.counts;
      const counts = [n.pass && `<span class="text-[#2f7d4f]">${n.pass} passed</span>`, n.warn && `<span class="text-[#b7791f]">${n.warn} to improve</span>`, n.fail && `<span class="text-[#b83a2e]">${n.fail} problem${n.fail === 1 ? '' : 's'}</span>`]
        .filter(Boolean)
        .join('');
      const order = { fail: 0, warn: 1, pass: 2, skip: 3 };
      return `<details class="group border-b border-line last:border-b-0" ${n.fail ? 'open' : ''}>
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink">
          <span>${esc(cat.name)}</span><span class="flex flex-wrap justify-end gap-x-3.5 text-sm font-medium">${counts}<span class="text-muted group-open:rotate-90">▸</span></span>
        </summary>
        <ul>${[...checks].sort((a, b) => order[a.status] - order[b.status]).map(checkRow).join('')}</ul>
      </details>`;
    })
    .join('');
}

function render(r: EvaluationResult) {
  current = r;
  const el = $('eval-results');
  if (!el) return;
  const pendingSpeed = !r.complete;
  const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const meta = [r.facts.platform && `Built with <b class="text-ink">${esc(r.facts.platform)}</b>`, r.facts.emailProvider && `Email by <b class="text-ink">${esc(r.facts.emailProvider)}</b>`, `Checked <b class="text-ink">${date}</b>`]
    .filter(Boolean)
    .join('<span aria-hidden="true">·</span>');

  const unreachable = !r.facts.reachable
    ? `<div class="mt-6 rounded-xl border border-[#e7cfa3] bg-[#fff8ea] p-5 text-[0.98rem]">
        <b class="text-ink">We couldn’t load your homepage.</b> Some sites block automated checks, and some are simply down.
        The email and domain results below still apply. <a class="font-semibold text-royal underline" href="#eval-next">Book a free walkthrough</a> and I’ll look at it by hand.
      </div>`
    : '';

  el.innerHTML = `
    <div class="card grid items-center gap-8 p-7 md:grid-cols-[10rem_1fr] md:p-9">
      <div class="mx-auto">${ring(r)}</div>
      <div>
        <p class="text-sm font-semibold text-muted">${esc(r.facts.host)} · overall grade</p>
        <h2 class="mt-1 text-2xl leading-tight md:text-3xl">${esc(r.overall.summary)}</h2>
        <p class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">${meta}</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <a href="#lead-form" class="rounded-lg border-2 border-royal bg-royal px-5 py-3 font-semibold text-white hover:bg-royal-dark">Email me the full report</a>
          <a href="#eval-next" class="rounded-lg border-2 border-royal px-5 py-3 font-semibold text-royal hover:bg-royal hover:text-white">Book a free walkthrough</a>
        </div>
      </div>
    </div>
    ${unreachable}
    ${pendingSpeed ? '<p class="mt-6 flex items-center gap-3 text-muted"><span class="inline-block h-4 w-4 animate-spin rounded-full border-[3px] border-brass/30 border-t-brass"></span>Still measuring speed on a phone. This usually takes 15–40 seconds; the rest of your results are ready below.</p>' : ''}

    <h2 class="mt-14 text-3xl">How your site scored</h2>
    <div class="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
      ${r.categories.map((c) => categoryCard(c, pendingSpeed && (c.id === 'speed' || c.id === 'mobile'))).join('')}
    </div>

    ${r.topFixes.length ? `<h2 class="mt-14 text-3xl">Your top ${r.topFixes.length === 1 ? 'fix' : `${r.topFixes.length} fixes`}</h2>
    <div class="mt-5 grid gap-4 lg:grid-cols-3">${r.topFixes.map(fixCard).join('')}</div>` : '<h2 class="mt-14 text-3xl">No significant problems found</h2>'}

    <h2 class="mt-14 text-3xl">Everything we checked</h2>
    <div class="card mt-5 overflow-hidden">${checklist(r)}</div>`;

  el.classList.remove('hidden');
  $('eval-next')?.classList.remove('hidden');
}

// ---------------------------------------------------------------- API

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({ error: 'Something went wrong. Please try again.' }));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Something went wrong. Please try again.');
  return data as T;
}

function showError(msg: string) {
  const e = $('eval-error');
  if (!e) return;
  e.textContent = msg;
  e.classList.toggle('hidden', !msg);
}

async function run(form: HTMLFormElement) {
  const input = $<HTMLInputElement>('eval-url')!;
  const button = $<HTMLButtonElement>('eval-submit')!;
  const value = input.value.trim();
  showError('');
  if (!value) return showError('Enter your website address, like yourbusiness.com.');

  button.disabled = true;
  button.textContent = 'Evaluating…';
  const host = value.replace(/^[a-z]+:\/\//i, '').split(/[/?#]/)[0].toLowerCase();
  showProgress(host);

  // The quick checks run together on the server; tick the list along so it doesn't look frozen.
  let step = 0;
  setStep(0, 'run');
  const ticker = setInterval(() => {
    if (step < QUICK_STEPS.length - 1) {
      setStep(step, 'done');
      step++;
      setStep(step, 'run');
    }
  }, 700);

  try {
    const token = await turnstileToken();
    const quick = await post<EvaluationResult>('/api/evaluate', { url: value, token });
    clearInterval(ticker);
    QUICK_STEPS.forEach((_, i) => setStep(i, 'done'));
    render(quick);
    trackConversion('evaluationRun');
    if (!quick.complete) {
      setStep(4, 'run');
      try {
        const full = await post<EvaluationResult>('/api/evaluate/speed', { id: quick.id });
        setStep(4, 'done');
        render(full);
      } catch (e) {
        setStep(4, 'fail');
        showError((e as Error).message);
      }
    } else {
      setStep(4, 'done');
    }
    $('eval-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    clearInterval(ticker);
    $('eval-progress')?.classList.add('hidden');
    showError((e as Error).message);
  } finally {
    button.disabled = false;
    button.textContent = 'Evaluate my site →';
    window.turnstile?.reset(widgetId); // tokens are single-use
  }
  void form;
}

// ---------------------------------------------------------------- Report request (Web3Forms)

function initLeadForm() {
  const form = $<HTMLFormElement>('lead-form');
  const status = $('lead-status');
  if (!form || !status) return;

  // Load the Web3Forms captcha only when someone starts filling the form, as on the contact page.
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.src = 'https://web3forms.com/client/script.js';
    s.async = true;
    document.body.appendChild(s);
  };
  ['focusin', 'pointerdown', 'keydown', 'touchstart'].forEach((e) => form.addEventListener(e, load, { once: true, passive: true }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = form.dataset.accessKey;
    const r = current;
    if (!key || !r) {
      status.textContent = 'Please run an evaluation first.';
      return;
    }
    if (!form.reportValidity()) return;
    const captcha = form.querySelector<HTMLTextAreaElement>('textarea[name="h-captcha-response"]');
    if (captcha && !captcha.value) {
      status.textContent = 'Please complete the captcha, then send again.';
      return;
    }
    status.textContent = 'Sending…';
    const data = new FormData(form);
    data.append('access_key', key);
    data.append('subject', `Website evaluation report request: ${r.facts.host} (${r.overall.grade ?? 'grade pending'})`);
    data.append('from_name', 'Oakheart website evaluation');
    data.append('website', r.facts.host);
    data.append('grade', `${r.overall.grade ?? '–'} (${r.overall.score ?? '–'}/100)`);
    data.append('summary', r.overall.summary);
    data.append('scores', r.categories.map((c) => `${c.name}: ${c.grade ?? '–'}${c.score === null ? '' : ` (${c.score})`}`).join(' · '));
    data.append('top_fixes', r.topFixes.map((f, i) => `${i + 1}. ${f.title} [${f.effort} · ${f.menu}]`).join('\n'));
    data.append('built_with', r.facts.platform ?? 'unknown');
    data.append('email_provider', r.facts.emailProvider ?? 'unknown');
    data.append('report', `${location.origin}/api/report/${r.id}`);
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const result = await res.json();
      if (!result.success) throw new Error('rejected');
      trackConversion('reportRequest');
      // Tyler has the request now. This also emails the visitor a link to their report, when that's set up.
      const lead = await post<{ emailed?: boolean }>('/api/evaluate/lead', { id: r.id, name: data.get('name'), email: data.get('email') }).catch(
        () => ({ emailed: false }),
      );
      form.reset();
      status.textContent = lead.emailed
        ? 'Done! Your report is on its way to your inbox (check spam if you don’t see it in a few minutes). I’ll follow up within one business day.'
        : 'Thanks! I’ll send your full report within one business day.';
    } catch {
      status.textContent = 'Something went wrong. Please email tyler@oakhearttech.com instead.';
    }
  });
}

export function initEvaluation() {
  const form = $<HTMLFormElement>('eval-form');
  if (!form) return;
  const ready = loadTurnstile(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await ready;
    run(form);
  });
  // Allow links like /website-evaluation?site=example.com to prefill the box.
  const pre = new URLSearchParams(location.search).get('site');
  if (pre) $<HTMLInputElement>('eval-url')!.value = pre;
  initLeadForm();
}
