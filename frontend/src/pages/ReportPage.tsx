// src/pages/ReportPage.tsx
import React from "react";
import { useGap } from "../store/GapContext";
import { ReportSummaryCard } from "../components/report/ReportSummaryCard";
import { DownloadButtons } from "../components/report/DownloadButtons";
import { RadarChartPanel } from "../components/report/RadarChartPanel";

export const ReportPage: React.FC = () => {
  const { samples, metricsBySystem } = useGap();

  if (samples.length === 0) {
    return (
      <section>
        <h1>Report</h1>
        <p>No samples loaded. Please upload MRAG outputs first.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Report</h1>
      <p>
        This report summarizes the performance of all uploaded MRAG systems on the
        GAP benchmark using three core metrics: Ground Formula (G), Answer Accuracy
        (A), and Provenance Accuracy (P), plus a weighted overall score.
      </p>

      <ReportSummaryCard metricsBySystem={metricsBySystem} />

      <RadarChartPanel metricsBySystem={metricsBySystem} />

      <DownloadButtons metricsBySystem={metricsBySystem} />
    </section>
  );
};
