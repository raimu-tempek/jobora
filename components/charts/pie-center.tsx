"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  ChartStatFlow,
  type ChartStatFlowFormat,
  defaultChartStatFlowFormat,
} from "./chart-stat-flow";
import {
  chartCenterContainerClassName,
  chartCenterLabelClassName,
  chartCenterValueClassName,
} from "./chart-center-typography";
import { type PieData, usePieContext } from "./pie-context";

export interface PieCenterProps {
  /** Label shown below the value. Default: "Total" when not hovering */
  defaultLabel?: string;
  /** Format options for NumberFlow. Default: standard notation */
  formatOptions?: ChartStatFlowFormat;
  /** Prefix to show before the number (e.g., "$") */
  prefix?: string;
  /** Suffix to show after the number (e.g., "%") */
  suffix?: string;
  /**
   * Custom render function for complete control over center content.
   * Called with current or hovered slice details.
   */
  children?: (props: {
    value: number;
    label: string;
    isHovered: boolean;
    data: PieData;
  }) => ReactNode;
  /** Additional class name for the container */
  className?: string;
  /** Class name for the value text */
  valueClassName?: string;
  /** Class name for the label text */
  labelClassName?: string;
}

export function PieCenter({
  defaultLabel = "Total",
  formatOptions = defaultChartStatFlowFormat,
  prefix,
  suffix,
  children,
  className,
  valueClassName = chartCenterValueClassName,
  labelClassName = chartCenterLabelClassName,
}: PieCenterProps) {
  const { innerRadius, totalValue, data, hoveredIndex } = usePieContext();

  // Only renders when innerRadius > 0 per Bklit UI spec
  if (innerRadius <= 0) {
    return null;
  }

  const hoveredData = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;
  const displayValue = hoveredData ? hoveredData.value : totalValue;
  const displayLabel = hoveredData ? hoveredData.label : defaultLabel;
  const activeData: PieData = hoveredData || {
    label: defaultLabel,
    value: totalValue,
  };

  const centerDiameter = Math.max(20, innerRadius * 2 - 8);

  if (children) {
    return (
      <div
        className={cn(
          chartCenterContainerClassName,
          "flex items-center justify-center pointer-events-none select-none",
          className
        )}
        style={{ width: centerDiameter, height: centerDiameter }}
      >
        {children({
          value: displayValue,
          label: displayLabel,
          isHovered: hoveredIndex !== null,
          data: activeData,
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        chartCenterContainerClassName,
        "flex flex-col items-center justify-center text-center pointer-events-none select-none",
        className
      )}
      style={{ width: centerDiameter, height: centerDiameter }}
    >
      <ChartStatFlow
        formatOptions={formatOptions}
        label={displayLabel}
        labelClassName={labelClassName}
        prefix={prefix}
        suffix={suffix}
        value={displayValue}
        valueClassName={valueClassName}
      />
    </div>
  );
}

PieCenter.displayName = "PieCenter";

export default PieCenter;
