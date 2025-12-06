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
 * 将任意类型安全转换为非空字符串，空串则返回 null
 */
function toNonEmptyString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

/**
 * 将任意类型安全转换为 number，失败则返回 null
 */
function toNumberOrNull(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") {
    if (Number.isNaN(raw)) return null;
    return raw;
  }
  const s = String(raw).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

/**
 * Try to parse numeric-like answers.
 *
 * Strategy:
 *  - Trim the string
 *  - Handle simple "a/b" fraction exactly
 *  - Otherwise, scan for numeric tokens (including decimals / scientific notation)
 *    and take the last one as the final answer
 */
function parseNumberLike(raw: string): number | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;

  // Normalize some common unicode math symbols
  s = s.replace(/×/g, "*").replace(/−/g, "-");

  // fraction form: a/b (only if the whole string matches)
  const fracMatch = s.match(/^([-+]?\d+)\s*\/\s*([-+]?\d+)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
      return num / den;
    }
  }

  // General case: pick the last numeric-looking token
  const numberPattern = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;
  const matches = s.match(numberPattern);
  if (matches && matches.length > 0) {
    const last = matches[matches.length - 1];
    const v = parseFloat(last);
    if (!Number.isNaN(v)) {
      return v;
    }
  }

  // Fallback: try parsing the whole string
  const v = parseFloat(s);
  if (Number.isNaN(v)) return null;
  return v;
}

/**
 * Answer equivalence (A):
 *  - if raw strings are exactly equal (trimmed) => equivalent
 *  - else, if both can be parsed as numbers and relative error < relTol => equivalent
 *
 * We use |pred - gold| / max(|gold|, 1e-9) < 0.02 as the default rule.
 *
 * gold / pred 允许是 number 或 string 或其他。
 */
function isAnswerEquivalent(
  goldRaw: unknown,
  predRaw: unknown,
  relTol = 0.02
): boolean {
  const gTrim = toNonEmptyString(goldRaw);
  const pTrim = toNonEmptyString(predRaw);

  if (!gTrim || !pTrim) return false;

  // exact string equality as a trivial pass
  if (gTrim === pTrim) return true;

  const gNum = parseNumberLike(gTrim);
  const pNum = parseNumberLike(pTrim);

  if (gNum === null || pNum === null) {
    return false;
  }

  const denom = Math.max(Math.abs(gNum), 1e-9);
  const relErr = Math.abs(pNum - gNum) / denom;
  return relErr < relTol;
}

/**
 * Normalize LaTeX-like formula strings into a canonical textual representation.
 * This is a lightweight "symbolic normalization" used in the browser:
 *  - strip outer variable assignments like "y =" or "f(x) ="
 *  - normalize multiplication symbols
 *  - drop whitespace and some harmless spacing commands
 *  - very rough reordering of additive terms separated by '+'
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

  // Remove common LaTeX sizing / spacing
  s = s.replace(/\\left/g, "");
  s = s.replace(/\\right/g, "");
  s = s.replace(/\\,/g, "");
  s = s.replace(/\\;/g, "");
  s = s.replace(/\\!/g, "");

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
 *  - if both gold and pred are non-empty
 *  - normalize both sides
 *  - compare normalized strings for equality
 *
 * gold / pred 可以是任意类型，内部转成字符串。
 */
function isFormulaEquivalent(
  goldRaw: unknown,
  predRaw: unknown
): boolean {
  const gStr = toNonEmptyString(goldRaw);
  const pStr = toNonEmptyString(predRaw);
  if (!gStr || !pStr) return false;

  const gNorm = normalizeFormulaString(gStr);
  const pNorm = normalizeFormulaString(pStr);

  if (!gNorm || !pNorm) return false;

  return gNorm === pNorm;
}

/**
 * Normalize document names for provenance comparison:
 *  - trim
 *  - lowercase
 *  - collapse internal whitespace
 */
function normalizeDocName(name: unknown): string {
  const s = toNonEmptyString(name);
  if (!s) return "";
  return s.toLowerCase().replace(/\s+/g, " ");
}

/**
 * Extract the main prefix of a document name (without .pdf suffix).
 */
function extractDocPrefix(name: unknown): string {
  const n = normalizeDocName(name);
  if (n.endsWith(".pdf")) {
    return n.slice(0, -4).trim();
  }
  return n;
}

/**
 * Document name equivalence:
 *  - both non-null and non-empty
 *  - gold "main prefix" must appear as a substring in the normalized pred name
 *    (e.g., "abc.pdf" vs "ABC   ABC.pdf" are considered a match)
 */
function isDocNameMatch(
  goldRaw: unknown,
  predRaw: unknown
): boolean {
  const goldPrefix = extractDocPrefix(goldRaw);
  const predClean = normalizeDocName(predRaw);

  if (!goldPrefix) return false;

  return predClean.includes(goldPrefix);
}

export function computeMetricsForSystem(samples: MRAGSample[]): GapMetrics {
  const total = samples.length;

  let answerCorrect = 0; // A
  let formulaCorrect = 0; // G
  let docCorrect = 0; // docLoc
  let pageCorrect = 0; // pageLoc

  for (const s of samples) {
    // Answer Accuracy (A): numeric / string equivalence with relative tolerance
    if (isAnswerEquivalent(s.gold_answer as unknown, s.pred_answer as unknown)) {
      answerCorrect++;
    }

    // Ground Formula (G): formula equivalence via symbolic-like normalization
    if (
      isFormulaEquivalent(
        s.gold_formula_latex as unknown,
        s.pred_formula_latex as unknown
      )
    ) {
      formulaCorrect++;
    }

    // Doc-level grounding: relaxed document name matching
    const docOk =
      toNonEmptyString(s.gold_doc_name) !== null &&
      toNonEmptyString(s.pred_doc_name) !== null &&
      isDocNameMatch(s.gold_doc_name as unknown, s.pred_doc_name as unknown);

    if (docOk) {
      docCorrect++;
    }

    // Page-level grounding (requires doc also correct), allowing ±1 page
    const goldPage = toNumberOrNull(s.gold_page as unknown);
    const predPage = toNumberOrNull(s.pred_page as unknown);

    const pageOk =
      docOk &&
      goldPage !== null &&
      predPage !== null &&
      Math.abs(goldPage - predPage) <= 1;

    if (pageOk) {
      pageCorrect++;
    }
  }

  const groundFormulaAccuracy = safeDiv(formulaCorrect, total);
  const answerAccuracy = safeDiv(answerCorrect, total);
  const docLocAccuracy = safeDiv(docCorrect, total);
  const pageLocAccuracy = safeDiv(pageCorrect, total);

  // Provenance Accuracy (P) = 0.6 * docLoc + 0.4 * pageLoc
  const provenanceAccuracy = 0.6 * docLocAccuracy + 0.4 * pageLocAccuracy;

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
    const key = (s.system_name as string) ?? "UNKNOWN_SYSTEM";
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
