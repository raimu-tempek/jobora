"use client";

import { pie as d3Pie } from "d3-shape";
import {
  Children,
  isValidElement,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  defaultPieColors,
  type PieContextValue,
  type PieData,
  PieContext,
} from "./pie-context";

export interface PieChartProps {
  /** Array of pie data items */
  data: PieData[];
  /** Fixed size in pixels. Default: 200 */
  size?: number;
  /** Inner radius for donut charts (0 = solid pie). Default: 0 */
  innerRadius?: number;
  /** Padding angle between slices in radians. Default: 0 */
  padAngle?: number;
  /** Corner radius for rounded slice edges in pixels. Default: 0 */
  cornerRadius?: number;
  /** Start angle in radians. Default: 0 (top in d3) */
  startAngle?: number;
  /** End angle in radians. Default: 2 * Math.PI (full circle) */
  endAngle?: number;
  /** Controlled hover state - index of hovered slice */
  hoveredIndex?: number | null;
  /** Hover state callback */
  onHoverChange?: (index: number | null) => void;
  /** Additional CSS class for the container */
  className?: string;
  /** Child components (PieSlice, PieCenter, etc.) */
  children: ReactNode;
}

export function PieChart({
  data,
  size = 200,
  innerRadius = 0,
  padAngle = 0,
  cornerRadius = 0,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  className,
  children,
}: PieChartProps) {
  const [uncontrolledHoveredIndex, setUncontrolledHoveredIndex] = useState<number | null>(null);

  const hoveredIndex = hoveredIndexProp !== undefined ? hoveredIndexProp : uncontrolledHoveredIndex;

  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (onHoverChange) {
        onHoverChange(index);
      }
      if (hoveredIndexProp === undefined) {
        setUncontrolledHoveredIndex(index);
      }
    },
    [hoveredIndexProp, onHoverChange]
  );

  const totalValue = useMemo(() => {
    return data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  }, [data]);

  const getColor = useCallback(
    (index: number) => {
      const item = data[index];
      if (item?.color) return item.color;
      return defaultPieColors[index % defaultPieColors.length] as string;
    },
    [data]
  );

  // Generate arcs from data using d3-shape
  const arcs = useMemo(() => {
    const pieGen = d3Pie<PieData>()
      .value((d) => Math.max(0, d.value))
      .sort(null)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(padAngle);

    return pieGen(data);
  }, [data, startAngle, endAngle, padAngle]);

  // Reserve margin for hover offset translation
  const outerRadius = Math.max(10, size / 2 - 12);

  const contextValue: PieContextValue = useMemo(
    () => ({
      data,
      arcs,
      size,
      innerRadius,
      outerRadius,
      padAngle,
      cornerRadius,
      totalValue,
      hoveredIndex,
      setHoveredIndex,
      getColor,
    }),
    [
      data,
      arcs,
      size,
      innerRadius,
      outerRadius,
      padAngle,
      cornerRadius,
      totalValue,
      hoveredIndex,
      setHoveredIndex,
      getColor,
    ]
  );

  // Separate SVG elements (e.g. PieSlice) from HTML elements (e.g. PieCenter)
  const svgChildren: ReactNode[] = [];
  const centerChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const type = child.type as { displayName?: string };
      if (type?.displayName === "PieCenter") {
        centerChildren.push(child);
      } else {
        svgChildren.push(child);
      }
    } else {
      svgChildren.push(child);
    }
  });

  return (
    <PieContext.Provider value={contextValue}>
      <div
        className={cn("grid place-items-center relative", className)}
        style={{
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr",
          width: size,
          height: size,
        }}
      >
        {/* SVG slice layer */}
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
          style={{
            gridArea: "1 / 1",
            contain: "layout style",
            overflow: "visible",
          }}
        >
          <g>{svgChildren}</g>
        </svg>

        {/* HTML center overlay layer */}
        {centerChildren.length > 0 && (
          <div
            className="pointer-events-none flex items-center justify-center select-none"
            style={{ gridArea: "1 / 1" }}
          >
            {centerChildren}
          </div>
        )}
      </div>
    </PieContext.Provider>
  );
}

PieChart.displayName = "PieChart";

export default PieChart;
