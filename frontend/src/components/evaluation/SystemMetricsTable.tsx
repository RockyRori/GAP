import React from "react";
import type { GapMetrics } from "../../types/gap";

interface Props {
  metricsBySystem: Record<string, GapMetrics>;
}

export const SystemMetricsTable: React.FC<Props> = ({ metricsBySystem }) => {
  const systemNames = Object.keys(metricsBySystem);
  if (systemNames.length === 0) {
    return <p>No metrics available. Please upload MRAG outputs first.</p>;
  }

  return (
    <table className="gap-table">
      <thead>
        <tr>
          <th>System</th>
          <th>Total Samples</th>
          <th>Ground Formula (G)</th>
          <th>Answer Accuracy (A)</th>
          <th>Provenance Accuracy (P)</th>
          <th>Overall Score</th>
        </tr>
      </thead>
      <tbody>
        {systemNames.map((name) => {
          const m = metricsBySystem[name];
          return (
            <tr key={name}>
              <td>{name}</td>
              <td>{m.totalSamples}</td>
              <td>{(m.groundFormulaAccuracy * 100).toFixed(2)}%</td>
              <td>{(m.answerAccuracy * 100).toFixed(2)}%</td>
              <td>{(m.provenanceAccuracy * 100).toFixed(2)}%</td>
              <td>{(m.overallScore * 100).toFixed(2)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
