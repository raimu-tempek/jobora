"use client";

import { createContext, useContext } from "react";
import type { PieArcDatum } from "d3-shape";

export interface PieData {
  label: string;
  value: number;
  color?: string;
  fill?: string;
}

export interface PieContextValue {
  data: PieData[];
  arcs: PieArcDatum<PieData>[];
  size: number;
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
  cornerRadius: number;
  totalValue: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getColor: (index: number) => string;
}

export const defaultPieColors = [
  "var(--chart-1, #107c74)",
  "var(--chart-2, #3b82f6)",
  "var(--chart-3, #f59e0b)",
  "var(--chart-4, #ef4444)",
  "var(--chart-5, #8b5cf6)",
];

export const PieContext = createContext<PieContextValue | null>(null);

export function usePieContext(): PieContextValue {
  const context = useContext(PieContext);
  if (!context) {
    throw new Error("usePieContext must be used within a PieChart");
  }
  return context;
}
