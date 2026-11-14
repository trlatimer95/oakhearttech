// Turns finished checks into category scores, an overall grade, a one-line summary and the top 3 fixes.
// Rules (see docs/website-evaluation-plan.md): a check earns its weight on pass, half on warn, nothing on fail, and
// skipped checks don't count. A failed critical check caps its category at a D.

import { SHORT } from './checks';
import type { CategoryId, CategoryScore, CheckResult, EvaluationResult, Grade, SiteFacts, Weight } from './types';

export const CATEGORIES: { id: CategoryId; name: string; share: number }[] = [
  { id: 'google', name: 'Found on Google', share: 0.25 },
  { id: 'speed', name: 'Speed', share: 0.2 },
  { id: 'email', name: 'Email', share: 0.2 },
  { id: 'security', name: 'Security & upkeep', share: 0.2 },
  { id: 'mobile', name: 'Mobile & usability', share: 0.15 },
];

const POINTS: Record<Weight, number> = { critical: 10, high: 5, medium: 3, low: 1 };
const EFFORT_ORDER = { 'Quick fix': 0, 'Half day': 1, Project: 2 } as const;
const CRITICAL_CAP = 69; // highest score that still grades as D

export function gradeFor(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 55) return 'D';
  return 'F';
}

export function scoreCategory(id: CategoryId, checks: CheckResult[], pending: boolean): CategoryScore {
  const def = CATEGORIES.find((c) => c.id === id)!;
  const mine = checks.filter((c) => c.category === id && c.status !== 'skip');
  const counts = { pass: 0, warn: 0, fail: 0 };
  let earned = 0;
  let possible = 0;
  let criticalFail = false;
  for (const c of mine) {
    const p = POINTS[c.weight];
    possible += p;
    if (c.status === 'pass') earned += p;
    else if (c.status === 'warn') earned += p / 2;
    if (c.status !== 'skip') counts[c.status as 'pass' | 'warn' | 'fail']++;
    if (c.status === 'fail' && c.weight === 'critical') criticalFail = true;
  }
  const worst = rank(mine.filter((c) => c.status === 'fail' || c.status === 'warn'))[0];
  if (pending || possible === 0) return { id, name: def.name, share: def.share, score: null, grade: null, counts, worst: worst?.title };
  let score = Math.round((100 * earned) / possible);
  if (criticalFail) score = Math.min(score, CRITICAL_CAP);
  return { id, name: def.name, share: def.share, score, grade: gradeFor(score), counts, worst: worst?.title };
}

/** Most important problems first: weight × severity, then the quickest fixes. */
function rank(problems: CheckResult[]): CheckResult[] {
  const sev = (c: CheckResult) => POINTS[c.weight] * (c.status === 'fail' ? 2 : 1);
  return [...problems].sort((a, b) => sev(b) - sev(a) || EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort]);
}

export function topFixes(checks: CheckResult[], n = 3): CheckResult[] {
  const picked: CheckResult[] = [];
  const seen = new Set<CategoryId>();
  for (const c of rank(checks.filter((c) => c.status === 'fail' || c.status === 'warn'))) {
    if (seen.has(c.category)) continue;
    seen.add(c.category);
    picked.push(c);
    if (picked.length === n) break;
  }
  return picked;
}

export function summarize(grade: Grade | null, fixes: CheckResult[]): string {
  const phrases = [...new Set(fixes.map((f) => SHORT[f.id]).filter(Boolean))].slice(0, 2);
  const list = phrases.length === 2 ? `${phrases[0]}, and ${phrases[1]}` : phrases[0];
  switch (grade) {
    case 'A':
      return list ? `Your site is in great shape. One thing to look at: ${list}.` : 'Your site is in great shape.';
    case 'B':
      return list ? `A strong site, but ${list}.` : 'A strong site with only small things to tidy up.';
    case 'C':
      return list ? `A solid site, but ${list}.` : 'A solid site with a few things worth fixing.';
    case 'D':
      return list ? `Your site works, but ${list}.` : 'Your site works, but several things are holding it back.';
    case 'F':
      return list ? `Your site needs attention: ${list}.` : 'Your site needs attention in several areas.';
    default:
      return 'Your results are still coming in.';
  }
}

/** Builds the full result. `pending` lists categories whose checks haven't run yet (speed, before PageSpeed finishes). */
export function buildResult(
  id: string,
  createdAt: string,
  facts: SiteFacts,
  checks: CheckResult[],
  pending: CategoryId[] = [],
): EvaluationResult {
  // The speed test also feeds part of Mobile & usability, so that category waits for it too.
  const waiting = new Set<CategoryId>(pending.includes('speed') ? [...pending, 'mobile'] : pending);
  const categories = CATEGORIES.map((c) => scoreCategory(c.id, checks, waiting.has(c.id)));
  const complete = waiting.size === 0;
  const scored = categories.filter((c) => c.score !== null);
  const shareSum = scored.reduce((s, c) => s + c.share, 0);
  const overallScore = complete && shareSum > 0 ? Math.round(scored.reduce((s, c) => s + c.score! * c.share, 0) / shareSum) : null;
  const overallGrade = overallScore === null ? null : gradeFor(overallScore);
  const fixes = topFixes(checks);
  return {
    id,
    createdAt,
    facts,
    checks,
    categories,
    overall: { score: overallScore, grade: overallGrade, summary: summarize(overallGrade, fixes) },
    topFixes: fixes,
    complete,
  };
}
