import React from "react";
import type { GapMetrics } from "../../types/gap";

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
            <li key={name}>
              <strong>{name}</strong>: Overall {(
                m.overallScore * 100
              ).toFixed(2)}
              % (Answer {(
                m.answerAccuracy * 100
              ).toFixed(2)}
              %, Formula {(
                m.formulaExactMatch * 100
              ).toFixed(2)}
              %)
            </li>
          );
        })}
      </ul>
    </div>
  );
};
