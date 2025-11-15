export interface GapMetrics {
  totalSamples: number;
  answerAccuracy: number;        // 0-1
  formulaExactMatch: number;     // 0-1
  docLocAccuracy: number;        // 0-1
  pageLocAccuracy: number;       // 0-1
  overallScore: number;          // 0-1, 可以按权重综合
}

export interface SystemMetricsEntry {
  systemName: string;
  metrics: GapMetrics;
}
