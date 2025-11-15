export interface GapMetrics {
  totalSamples: number;

  /**
   * Ground Formula (G):
   * proportion of samples where the predicted formula is mathematically equivalent
   * to the gold formula.
   */
  groundFormulaAccuracy: number;

  /**
   * Answer Accuracy (A):
   * proportion of samples where the predicted answer is mathematically / numerically
   * equivalent to the gold answer.
   */
  answerAccuracy: number;

  /**
   * Provenance Accuracy (P):
   * P = 0.6 * docLocAccuracy + 0.4 * pageLocAccuracy
   */
  provenanceAccuracy: number;

  /**
   * Overall weighted score:
   * Overall = 0.3 * G + 0.4 * A + 0.3 * P
   */
  overallScore: number;

  /**
   * Internal components for P (not shown in UI table, but kept for analysis).
   * Doc-level grounding correctness.
   */
  docLocAccuracy: number;

  /**
   * Internal components for P (not shown in UI table, but kept for analysis).
   * Doc + page-level grounding correctness.
   */
  pageLocAccuracy: number;
}

export interface SystemMetricsEntry {
  systemName: string;
  metrics: GapMetrics;
}
