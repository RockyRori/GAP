import type { GapMetrics } from "../types/gap";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonReport(report: unknown, filename = "gap-report.json") {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, filename);
}

export function downloadCsvFromMetrics(
  metricsBySystem: Record<string, GapMetrics>,
  filename = "gap-metrics.csv"
) {
  const headers = [
    "system_name",
    "total_samples",
    "answer_accuracy",
    "formula_exact_match",
    "doc_loc_accuracy",
    "page_loc_accuracy",
    "overall_score",
  ];

  const lines = [headers.join(",")];

  for (const [systemName, m] of Object.entries(metricsBySystem)) {
    const row = [
      systemName,
      m.totalSamples,
      m.answerAccuracy.toFixed(4),
      m.formulaExactMatch.toFixed(4),
      m.docLocAccuracy.toFixed(4),
      m.pageLocAccuracy.toFixed(4),
      m.overallScore.toFixed(4),
    ];
    lines.push(row.join(","));
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}
