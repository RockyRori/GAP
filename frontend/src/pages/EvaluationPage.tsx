import React from "react";
import { useGap } from "../store/GapContext";
import { SystemMetricsTable } from "../components/evaluation/SystemMetricsTable";

export const EvaluationPage: React.FC = () => {
  const { samples, metricsBySystem } = useGap();

  return (
    <section>
      <h1>Evaluation Metrics</h1>
      {samples.length === 0 ? (
        <p>Please upload MRAG outputs first on the Upload page.</p>
      ) : (
        <>
          <p>
            Evaluated on <strong>{samples.length}</strong> samples from{" "}
            <strong>{Object.keys(metricsBySystem).length}</strong> systems.
          </p>
          <SystemMetricsTable metricsBySystem={metricsBySystem} />
        </>
      )}
    </section>
  );
};
