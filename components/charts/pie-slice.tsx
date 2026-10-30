"use client";

import { arc as d3Arc, type PieArcDatum } from "d3-shape";
import { motion, useReducedMotion } from "motion/react";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { type PieData, usePieContext } from "./pie-context";

export interface PieSliceProps {
  /** Index of the slice in the data array */
  index: number;
  /** Optional color override */
  color?: string;
  /** Optional fill for patterns/gradients (e.g., 'url(#patternId)') */
  fill?: string;
  /** Enable animation on mount. Default: true */
  animate?: boolean;
  /** Show glow effect on hover. Default: false */
  showGlow?: boolean;
  /** Hover animation type: 'translate' | 'grow' | 'none'. Default: 'translate' */
  hoverEffect?: "translate" | "grow" | "none";
  /** Distance in pixels for hover effect. Default: 10 */
  hoverOffset?: number;
  /** Additional CSS class for the slice path */
  className?: string;
}

export const PieSlice = memo(function PieSlice({
  index,
  color: colorProp,
  fill,
  animate = true,
  showGlow = false,
  hoverEffect = "translate",
  hoverOffset = 10,
  className,
}: PieSliceProps) {
  const {
    arcs,
    innerRadius,
    outerRadius,
    cornerRadius,
    hoveredIndex,
    setHoveredIndex,
    getColor,
  } = usePieContext();

  const reducedMotion = useReducedMotion() ?? false;
  const arcData = arcs[index];
  const sliceColor = colorProp || getColor(index);

  // Generate SVG path for this slice
  const path = useMemo(() => {
    if (!arcData) return "";
    const arcGenerator = d3Arc<PieArcDatum<PieData>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(cornerRadius);

    return arcGenerator(arcData) || "";
  }, [arcData, innerRadius, outerRadius, cornerRadius]);

  if (!arcData || !path) {
    return null;
  }

  // Calculate translation vector along the arc's midpoint angle
  const midAngle = (arcData.startAngle + arcData.endAngle) / 2;
  // d3 angles: 0 is 12 o'clock (-y direction in SVG)
  const tx = Math.sin(midAngle) * hoverOffset;
  const ty = -Math.cos(midAngle) * hoverOffset;

  const isHovered = hoveredIndex === index;
  const isOtherHovered = hoveredIndex !== null && !isHovered;

  const targetX = !reducedMotion && isHovered && hoverEffect === "translate" ? tx : 0;
  const targetY = !reducedMotion && isHovered && hoverEffect === "translate" ? ty : 0;
  const targetScale = !reducedMotion && isHovered && hoverEffect === "grow" ? 1.05 : 1;
  const targetOpacity = isOtherHovered ? 0.45 : 1;

  return (
    <motion.g
      initial={
        animate && !reducedMotion
          ? { scale: 0, opacity: 0 }
          : false
      }
      animate={{
        x: targetX,
        y: targetY,
        scale: targetScale,
        opacity: targetOpacity,
      }}
      transition={{
        delay: animate && !reducedMotion ? index * 0.05 : 0,
        type: "spring",
        stiffness: 350,
        damping: 26,
      }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      style={{
        cursor: "pointer",
        transformOrigin: "0px 0px",
      }}
    >
      <path
        d={path}
        fill={fill || sliceColor}
        className={cn("transition-colors select-none", className)}
        style={
          showGlow && isHovered
            ? {
                filter: `drop-shadow(0 0 8px ${sliceColor})`,
              }
            : undefined
        }
      />
    </motion.g>
  );
});

PieSlice.displayName = "PieSlice";

export default PieSlice;
