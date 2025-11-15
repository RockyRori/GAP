import React, { createContext, useContext, useState, useMemo } from "react";
import type { MRAGSample } from "../types/mrag";
import type { GapMetrics } from "../types/gap";
import { computeMetricsBySystem } from "../core/scoring/computeMetrics";

interface GapState {
  samples: MRAGSample[];
  metricsBySystem: Record<string, GapMetrics>;
}

interface GapContextValue extends GapState {
  setSamples: (samples: MRAGSample[]) => void;
  reset: () => void;
}

const GapContext = createContext<GapContextValue | undefined>(undefined);

export const GapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [samples, setSamplesState] = useState<MRAGSample[]>([]);

  const metricsBySystem = useMemo(() => {
    return computeMetricsBySystem(samples);
  }, [samples]);

  const setSamples = (newSamples: MRAGSample[]) => {
    setSamplesState(newSamples);
  };

  const reset = () => {
    setSamplesState([]);
  };

  const value: GapContextValue = {
    samples,
    metricsBySystem,
    setSamples,
    reset,
  };

  return <GapContext.Provider value={value}>{children}</GapContext.Provider>;
};

export function useGap() {
  const ctx = useContext(GapContext);
  if (!ctx) {
    throw new Error("useGap must be used within GapProvider");
  }
  return ctx;
}
