// Shared shapes for the Free Website Evaluation. Used by the Worker (worker/) and the page script.

export type CategoryId = 'google' | 'speed' | 'email' | 'security' | 'mobile';
export type Status = 'pass' | 'warn' | 'fail' | 'skip';
export type Weight = 'critical' | 'high' | 'medium' | 'low';
export type Effort = 'Quick fix' | 'Half day' | 'Project';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

/** One finished check, with the visitor-facing wording already filled in. */
export interface CheckResult {
  id: string;
  category: CategoryId;
  weight: Weight;
  status: Status;
  /** Short plain-English line, written for the result (e.g. "Your domain expires in 41 days"). */
  title: string;
  /** One or two sentences: what it means for the business. */
  why: string;
  /** One sentence: what fixing it involves. Only meaningful when status is warn or fail. */
  fix: string;
  effort: Effort;
  /** The fix-menu item this maps to. */
  menu: string;
  /** Technical detail for the "Details" toggle. */
  detail?: string;
}

export interface CategoryScore {
  id: CategoryId;
  name: string;
  /** Share of the overall grade, 0–1. */
  share: number;
  /** null while the category's checks haven't run yet (the speed test fills in later). */
  score: number | null;
  grade: Grade | null;
  counts: { pass: number; warn: number; fail: number };
  /** Title of the most serious problem, if any. */
  worst?: string;
}

export interface SiteFacts {
  /** The address that was evaluated, as https://host */
  origin: string;
  host: string;
  /** Name used for DNS and domain checks (host without a leading www.). */
  domain: string;
  platform?: string;
  emailProvider?: string;
  reachable: boolean;
}

export interface EvaluationResult {
  id: string;
  createdAt: string;
  facts: SiteFacts;
  checks: CheckResult[];
  categories: CategoryScore[];
  overall: { score: number | null; grade: Grade | null; summary: string };
  topFixes: CheckResult[];
  /** True once the PageSpeed part has finished (or failed for good). */
  complete: boolean;
}
