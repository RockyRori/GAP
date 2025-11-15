import type { MRAGSample } from "../../types/mrag";
import type { GapMetrics } from "../../types/gap";

function boolToNum(b: boolean): number {
  return b ? 1 : 0;
}

function safeDiv(n: number, d: number): number {
  if (d === 0) return 0;
  return n / d;
}

export function computeMetricsForSystem(samples: MRAGSample[]): GapMetrics {
  const total = samples.length;

  let answerCorrect = 0;
  let formulaCorrect = 0;
  let docCorrect = 0;
  let pageCorrect = 0;

  for (const s of samples) {
    if (
      s.gold_answer !== null &&
      s.pred_answer !== null &&
      s.gold_answer.trim() !== "" &&
      s.pred_answer.trim() !== "" &&
      s.gold_answer.trim() === s.pred_answer.trim()
    ) {
      answerCorrect++;
    }

    if (
      s.gold_formula_latex !== null &&
      s.pred_formula_latex !== null &&
      s.gold_formula_latex.trim() !== "" &&
      s.pred_formula_latex.trim() !== "" &&
      s.gold_formula_latex.trim() === s.pred_formula_latex.trim()
    ) {
      formulaCorrect++;
    }

    if (
      s.gold_doc_name !== null &&
      s.pred_doc_name !== null &&
      s.gold_doc_name.trim() !== "" &&
      s.pred_doc_name.trim() !== "" &&
      s.gold_doc_name.trim() === s.pred_doc_name.trim()
    ) {
      docCorrect++;
    }

    if (
      s.gold_doc_name !== null &&
      s.pred_doc_name !== null &&
      s.gold_page !== null &&
      s.pred_page !== null &&
      s.gold_doc_name.trim() === s.pred_doc_name.trim() &&
      s.gold_page === s.pred_page
    ) {
      pageCorrect++;
    }
  }

  const answerAccuracy = safeDiv(answerCorrect, total);
  const formulaExactMatch = safeDiv(formulaCorrect, total);
  const docLocAccuracy = safeDiv(docCorrect, total);
  const pageLocAccuracy = safeDiv(pageCorrect, total);

  // 一个简单的加权综合，你后面可以改权重
  const overallScore =
    0.4 * answerAccuracy +
    0.3 * formulaExactMatch +
    0.2 * docLocAccuracy +
    0.1 * pageLocAccuracy;

  const metrics: GapMetrics = {
    totalSamples: total,
    answerAccuracy,
    formulaExactMatch,
    docLocAccuracy,
    pageLocAccuracy,
    overallScore,
  };

  return metrics;
}

export function computeMetricsBySystem(samples: MRAGSample[]): Record<string, GapMetrics> {
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
