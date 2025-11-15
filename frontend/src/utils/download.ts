// src/utils/download.ts
import type { GapMetrics } from "../types/gap";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonReport(
  report: unknown,
  filename = "gap-report.json"
) {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, filename);
}

/**
 * 导出包含 G/A/P 与 overall 的 CSV 汇总
 */
export function downloadCsvFromMetrics(
  metricsBySystem: Record<string, GapMetrics>,
  filename = "gap-metrics.csv"
) {
  const headers = [
    "system_name",
    "total_samples",
    "ground_formula_G",
    "answer_accuracy_A",
    "provenance_accuracy_P",
    "overall_score",
  ];

  const lines = [headers.join(",")];

  for (const [systemName, m] of Object.entries(metricsBySystem)) {
    const row = [
      systemName,
      m.totalSamples,
      m.groundFormulaAccuracy.toFixed(4),
      m.answerAccuracy.toFixed(4),
      m.provenanceAccuracy.toFixed(4),
      m.overallScore.toFixed(4),
    ];
      lines.push(row.join(","));
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}
