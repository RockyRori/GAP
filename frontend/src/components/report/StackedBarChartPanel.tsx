// src/components/report/StackedBarChartPanel.tsx
import React from "react";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { GapMetrics } from "../../types/gap";

interface Props {
    metricsBySystem: Record<string, GapMetrics>;
}

export const StackedBarChartPanel: React.FC<Props> = ({ metricsBySystem }) => {
    const entries = Object.entries(metricsBySystem);

    if (entries.length === 0) {
        return <p>No metrics available for stacked bar chart.</p>;
    }

    // 按 Overall Score 从大到小排序
    const sorted = [...entries].sort(
        (a, b) => b[1].overallScore - a[1].overallScore
    );

    // 构造数据：每一段是加权贡献，三段相加 = overallScore
    const data = sorted.map(([systemName, m]) => {
        const gPart = 0.3 * m.groundFormulaAccuracy;
        const aPart = 0.4 * m.answerAccuracy;
        const pPart = 0.3 * m.provenanceAccuracy;

        return {
            system: systemName,
            G: gPart,
            A: aPart,
            P: pPart,
            overall: m.overallScore,
        };
    });

    return (
        <div className="gap-bar-panel">
            <h2>GAP Stacked Bar Chart</h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                Each bar shows the overall score per system, decomposed into weighted
                contributions from Ground Formula (G), Answer Accuracy (A), and
                Provenance Accuracy (P). Bars are sorted by overall score.
            </p>
            <div style={{ width: "100%", height: 480 }}>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="system" />
                        <YAxis
                            domain={[0, 1]}
                            tickFormatter={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                if (typeof value === "number") {
                                    return [`${(value * 100).toFixed(2)}%`, name];
                                }
                                return [value, name];
                            }}
                        />
                        <Legend />
                        {/* 颜色与雷达图保持强对比：蓝（G）、橙（A）、绿（P） */}
                        <Bar
                            dataKey="G"
                            name="G contribution"
                            stackId="score"
                            fill="#2563EB"
                        />
                        <Bar
                            dataKey="A"
                            name="A contribution"
                            stackId="score"
                            fill="#F97316"
                        />
                        <Bar
                            dataKey="P"
                            name="P contribution"
                            stackId="score"
                            fill="#16A34A"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
