import React from "react";
import type { GapMetrics } from "../../types/gap";
import { downloadJsonReport, downloadCsvFromMetrics } from "../../utils/download";

interface Props {
  metricsBySystem: Record<string, GapMetrics>;
}

export const DownloadButtons: React.FC<Props> = ({ metricsBySystem }) => {
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
        disabled={Object.keys(metricsBySystem).length === 0}
        onClick={handleDownloadJson}
      >
        Download JSON Report
      </button>
      <button
        className="gap-button-secondary"
        disabled={Object.keys(metricsBySystem).length === 0}
        onClick={handleDownloadCsv}
      >
        Download CSV Summary
      </button>
    </div>
  );
};
