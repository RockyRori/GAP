// src/components/report/ReportSummaryCard.tsx
import React from "react";
import type { GapMetrics } from "../../types/gap";
import './ReportSummaryCard.css';

interface Props {
  metricsBySystem: Record<string, GapMetrics>;
}

export const ReportSummaryCard: React.FC<Props> = ({ metricsBySystem }) => {
  const systemNames = Object.keys(metricsBySystem);
  if (systemNames.length === 0) {
    return <p>No metrics available.</p>;
  }

  return (
    <div className="gap-report-summary">
      <h2>Summary</h2>
      <ul>
        {systemNames.map((name) => {
          const m = metricsBySystem[name];
          return (
            <li key={name} className="summary-item">
              <strong>{name}</strong>
              <span className="metric-item">
                Overall: {(m.overallScore * 100).toFixed(2)}%
              </span>{" "}
              <span className="metric-item">
                G: {(m.groundFormulaAccuracy * 100).toFixed(2)}%
              </span>{" "}
              <span className="metric-item">
                A: {(m.answerAccuracy * 100).toFixed(2)}%
              </span>{" "}
              <span className="metric-item">
                P: {(m.provenanceAccuracy * 100).toFixed(2)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
