import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

type LegoButtonProps = {
  text: string;
  to: string;
  color?: string;
  size?: "small" | "medium" | "large";
};

const LegoButton = ({
  text,
  to,
  color = "#FF6B35",
  size = "medium",
}: LegoButtonProps) => {
  const navigate = useNavigate();

  const sizeStyles = {
    small: {
      padding: "8px 20px",
      fontSize: "0.875rem",
    },
    medium: {
      padding: "12px 32px",
      fontSize: "1rem",
    },
    large: {
      padding: "16px 40px",
      fontSize: "1.125rem",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <Box
      onClick={() => navigate(to)}
      sx={{
        display: "inline-block",
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.2s ease",
        "&:active": {
          transform: "translateY(2px)",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: color,
          padding: currentSize.padding,
          borderRadius: "8px",
          boxShadow: `
            0 4px 0 ${darkenColor(color, 20)},
            0 6px 8px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 ${lightenColor(color, 15)},
            inset 0 -1px 0 ${darkenColor(color, 10)}
          `,
          border: `2px solid ${darkenColor(color, 15)}`,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: "2px",
            left: "2px",
            right: "2px",
            height: "30%",
            background: `linear-gradient(to bottom, ${lightenColor(
              color,
              20
            )}, transparent)`,
            borderRadius: "6px 6px 0 0",
            pointerEvents: "none",
          },
        }}
      >
        <Typography
          sx={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: currentSize.fontSize,
            textAlign: "center",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            letterSpacing: "0.5px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Darken a hex color by a percentage
 */
const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0xff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

/**
 * Lighten a hex color by a percentage
 */
const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export default LegoButton;

