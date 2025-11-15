import type { MRAGSample } from "../../types/mrag";
import type { GapMetrics } from "../../types/gap";

function boolToNum(b: boolean): number {
  return b ? 1 : 0;
}

function safeDiv(n: number, d: number): number {
  if (d === 0) return 0;
  return n / d;
}

/**
 * Try to parse numeric-like answers: supports plain floats and "a/b" fractions.
 */
function parseNumberLike(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  // fraction form: a/b
  const fracMatch = s.match(/^([-+]?\d+)\s*\/\s*([-+]?\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
      return num / den;
    }
  }

  const v = parseFloat(s);
  if (Number.isNaN(v)) return null;
  return v;
}

/**
 * Answer equivalence (A):
 * - if raw strings are exactly equal (trimmed) => equivalent
 * - else, if both can be parsed as numbers / fractions and |a-b| <= eps => equivalent
 */
function isAnswerEquivalent(gold: string | null, pred: string | null, eps = 1e-6): boolean {
  if (!gold || !pred) return false;

  const gTrim = gold.trim();
  const pTrim = pred.trim();

  if (!gTrim || !pTrim) return false;

  // exact string equality as a trivial pass
  if (gTrim === pTrim) return true;

  const gNum = parseNumberLike(gTrim);
  const pNum = parseNumberLike(pTrim);

  if (gNum === null || pNum === null) {
    return false;
  }

  return Math.abs(gNum - pNum) <= eps;
}

/**
 * Very lightweight LaTeX / expression normalization to capture simple equivalences.
 * This is NOT a full CAS, but it handles:
 * - removing common function prefixes like "f(x)=" or "y="
 * - removing whitespace
 * - normalizing some operators
 * - sorting additive terms split by '+' to handle "kx+1" vs "1+kx"
 */
function normalizeFormulaString(raw: string): string {
  let s = raw.trim();
  if (!s) return "";

  // Remove common leading patterns like f(x)=, y=, etc.
  s = s.replace(/^f\s*\(\s*x\s*\)\s*=/i, "");
  s = s.replace(/^[a-zA-Z]\s*=/, ""); // y=, z=, etc.

  // Normalize multiplication symbols
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\times/g, "*");

  // Remove all whitespace
  s = s.replace(/\s+/g, "");

  // Very rough additive term reordering: split by '+' and sort.
  // This will incorrectly touch plus signs in some complex cases,
  // but for simple linear formulas (kx+1 vs 1+kx) it works well enough.
  const parts = s.split("+");
  if (parts.length > 1) {
    parts.sort();
    s = parts.join("+");
  }

  return s;
}

/**
 * Formula equivalence (G):
 * - if both gold and pred are non-empty
 * - normalize both sides
 * - compare normalized strings for equality
 *
 * This approximates "mathematical equivalence" for simple formulas like:
 *   y = kx + 1
 *   y = 1 + kx
 *   1 + kx
 * which will be treated as equivalent.
 */
function isFormulaEquivalent(
  gold: string | null,
  pred: string | null
): boolean {
  if (!gold || !pred) return false;

  const gNorm = normalizeFormulaString(gold);
  const pNorm = normalizeFormulaString(pred);

  if (!gNorm || !pNorm) return false;

  return gNorm === pNorm;
}

export function computeMetricsForSystem(samples: MRAGSample[]): GapMetrics {
  const total = samples.length;

  let answerCorrect = 0;       // A
  let formulaCorrect = 0;      // G
  let docCorrect = 0;          // docLoc
  let pageCorrect = 0;         // pageLoc

  for (const s of samples) {
    // Answer Accuracy (A): numeric / string equivalence
    if (isAnswerEquivalent(s.gold_answer, s.pred_answer)) {
      answerCorrect++;
    }

    // Ground Formula (G): formula equivalence
    if (isFormulaEquivalent(s.gold_formula_latex, s.pred_formula_latex)) {
      formulaCorrect++;
    }

    // Doc-level grounding
    const docOk =
      s.gold_doc_name !== null &&
      s.pred_doc_name !== null &&
      s.gold_doc_name.trim() !== "" &&
      s.pred_doc_name.trim() !== "" &&
      s.gold_doc_name.trim() === s.pred_doc_name.trim();

    if (docOk) {
      docCorrect++;
    }

    // Page-level grounding (requires doc also correct)
    const pageOk =
      docOk &&
      s.gold_page !== null &&
      s.pred_page !== null &&
      s.gold_page === s.pred_page;

    if (pageOk) {
      pageCorrect++;
    }
  }

  const groundFormulaAccuracy = safeDiv(formulaCorrect, total);
  const answerAccuracy = safeDiv(answerCorrect, total);
  const docLocAccuracy = safeDiv(docCorrect, total);
  const pageLocAccuracy = safeDiv(pageCorrect, total);

  // Provenance Accuracy (P) = 0.6 * docLoc + 0.4 * pageLoc
  const provenanceAccuracy =
    0.6 * docLocAccuracy + 0.4 * pageLocAccuracy;

  // Overall = 0.3 * G + 0.4 * A + 0.3 * P
  const overallScore =
    0.3 * groundFormulaAccuracy +
    0.4 * answerAccuracy +
    0.3 * provenanceAccuracy;

  const metrics: GapMetrics = {
    totalSamples: total,
    groundFormulaAccuracy,
    answerAccuracy,
    provenanceAccuracy,
    overallScore,
    docLocAccuracy,
    pageLocAccuracy,
  };

  return metrics;
}

export function computeMetricsBySystem(
  samples: MRAGSample[]
): Record<string, GapMetrics> {
  const grouped: Record<string, MRAGSample[]> = {};

  for (const s of samples) {
    const key = s.system_name ?? "UNKNOWN_SYSTEM";
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(s);
  }

  const result: Record<string, GapMetrics> = {};
  for (const [systemName, arr] of Object.entries(grouped)) {
    result[systemName] = computeMetricsForSystem(arr);
  }

  return result;
}
