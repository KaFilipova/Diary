import React, { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// 6 настроений
const SEGMENTS = 6;

const COLORS = [
  "#FF0000", // красный
  "#FF8C00", // оранжевый
  "#FFD500", // жёлтый
  "#4CAF50", // зелёный
  "#2196F3", // синий
  "#9C27B0", // фиолетовый
];

// геометрия дуги
const CX = 300; // центр по X
const CY = 300; // центр по Y (внизу, откуда выходит стрелка)
const R_OUTER = 440;
const R_INNER = 20;

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = degToRad(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad), // минус, потому что в SVG ось Y вниз
  };
}

// дугообразный сектор (кусок пончика)
function buildArcPath(
  startAngle: number,
  endAngle: number,
  rOuter: number,
  rInner: number
) {
  const outerStart = polarToCartesian(CX, CY, rOuter, startAngle);
  const outerEnd = polarToCartesian(CX, CY, rOuter, endAngle);
  const innerEnd = polarToCartesian(CX, CY, rInner, endAngle);
  const innerStart = polarToCartesian(CX, CY, rInner, startAngle);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  const sweepOuter = 1; // направление дуги
  const sweepInner = 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} ${sweepOuter} ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} ${sweepInner} ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

type MoodSelectorProps = {
  value?: number;
  onChange?: (value: number) => void;
};

const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(2); // по умолчанию середина
  const current = value ?? internalValue;

  const setValueSafely = (v: number) => {
    const clamped = Math.min(SEGMENTS - 1, Math.max(0, v));
    if (onChange) onChange(clamped);
    else setInternalValue(clamped);
  };

  const handlePrev = () => setValueSafely(current - 1);
  const handleNext = () => setValueSafely(current + 1);

  // угол стрелки — по центру сегмента
  // дуга 180° от левого края (-90°) до правого (+90°)
  const segmentSize = 180 / SEGMENTS;
  const pointerAngle = -90 + segmentSize * (current + 0.5);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{ width: 600, mx: "auto" }}
    >
      {/* зона со шкалой и стрелкой */}
      <Box
        sx={{
          position: "relative",
          width: 600,
          height: 360,
        }}
      >
        {/* SVG-дуга с сегментами */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 600 360"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const start = 180 - (i + 1) * segmentSize;
            const end = 180 - i * segmentSize;
            const d = buildArcPath(start, end, R_OUTER, R_INNER);
            return (
              <path
                key={i}
                d={d}
                fill={COLORS[i]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* стрелка поверх SVG */}
        <Box
          sx={{
            position: "absolute",
            left: CX,
            bottom: 60, // чуть отступаем от низа svg
            transform: `translateX(-50%) rotate(${pointerAngle}deg)`,
            transformOrigin: "50% 100%",
            transition: "transform 0.35s ease-out",
          }}
        >
          {/* сам "стержень" стрелки */}
          <Box
            sx={{
              width: 6,
              height: 180,
              bgcolor: "black",
              borderRadius: 999,
              position: "relative",
            }}
          >
            {/* треугольный носик */}
            <Box
              sx={{
                position: "absolute",
                top: -15,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderBottom: "20px solid black",
              }}
            />
          </Box>

          {/* кружок-основание */}
          <Box
            sx={{
              position: "absolute",
              bottom: -15,
              left: "50%",
              transform: "translateX(-50%)",
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "black",
            }}
          />
        </Box>
      </Box>

      {/* нижняя панель управления */}
      <Box display="flex" alignItems="center" gap={3}>
        <IconButton
          onClick={handlePrev}
          disabled={current === 0}
          sx={{
            bgcolor: "rgba(0,0,0,0.04)",
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: COLORS[current] }}
        >
          {current + 1} / {SEGMENTS}
        </Typography>

        <IconButton
          onClick={handleNext}
          disabled={current === SEGMENTS - 1}
          sx={{
            bgcolor: "rgba(0,0,0,0.04)",
          }}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MoodSelector;
