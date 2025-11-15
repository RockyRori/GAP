// src/components/report/DownloadButtons.tsx
import React from "react";
import type { GapMetrics } from "../../types/gap";
import {
  downloadJsonReport,
  downloadCsvFromMetrics,
} from "../../utils/download";

interface Props {
  metricsBySystem: Record<string, GapMetrics>;
}

export const DownloadButtons: React.FC<Props> = ({ metricsBySystem }) => {
  const hasMetrics = Object.keys(metricsBySystem).length > 0;

  const handleDownloadJson = () => {
    const report = {
      generated_at: new Date().toISOString(),
      metrics_by_system: metricsBySystem,
    };
    downloadJsonReport(report);
  };

  const handleDownloadCsv = () => {
    downloadCsvFromMetrics(metricsBySystem);
  };

  return (
    <div className="gap-download-buttons">
      <button
        className="gap-button"
        disabled={!hasMetrics}
        onClick={handleDownloadJson}
      >
        Download JSON Report
      </button>

      <button
        className="gap-button-secondary"
        disabled={!hasMetrics}
        onClick={handleDownloadCsv}
      >
        Download CSV Summary
      </button>
    </div>
  );
};
