// src/components/report/RadarChartPanel.tsx
import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { GapMetrics } from "../../types/gap";

interface Props {
  metricsBySystem: Record<string, GapMetrics>;
}

export const RadarChartPanel: React.FC<Props> = ({ metricsBySystem }) => {
  const systemNames = Object.keys(metricsBySystem);

  if (systemNames.length === 0) {
    return <p>No metrics available for radar chart.</p>;
  }

  // G / A / P 三个维度的数据
  const data: Array<Record<string, any>> = [
    { metric: "G" }, // Ground Formula
    { metric: "A" }, // Answer Accuracy
    { metric: "P" }, // Provenance Accuracy
  ];

  systemNames.forEach((name) => {
    const m = metricsBySystem[name];
    data[0][name] = m.groundFormulaAccuracy;
    data[1][name] = m.answerAccuracy;
    data[2][name] = m.provenanceAccuracy;
  });

  // 五种高对比颜色，超过 5 个模型循环使用
  const colors = [
    "#2563EB", // 蓝
    "#DC2626", // 红
    "#16A34A", // 绿
    "#F97316", // 橙
    "#7C3AED", // 紫
    "#6B7280", // 灰
  ];

  return (
    <div className="gap-radar-panel">
      <h2>GAP Radar Chart</h2>
      <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
        Each axis corresponds to Ground Formula (G), Answer Accuracy (A), and
        Provenance Accuracy (P). Values are normalized between 0 and 1.
      </p>
      {/* 高度翻倍 */}
      <div style={{ width: "100%", height: 720 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
            />
            {systemNames.map((name, idx) => {
              const color = colors[idx % colors.length];
              return (
                <Radar
                  key={name}
                  name={name}
                  dataKey={name}
                  stroke={color}
                  fill={color}
                  strokeWidth={3}        // 边粗一点
                  fillOpacity={0.2}
                />
              );
            })}
            <Legend />
            <Tooltip
              formatter={(value: any) => {
                if (typeof value === "number") {
                  return `${(value * 100).toFixed(1)}%`;
                }
                return value;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
