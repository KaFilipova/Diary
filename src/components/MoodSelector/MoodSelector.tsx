import React from "react";
import { Box, Typography } from "@mui/material";

export type Mood = {
  name: string;
  label: string;
  image: string;
  color: string;
};

type MoodCardProps = {
  mood: Mood;
  isSelected: boolean;
  onClick: () => void;
};

export const MoodCard: React.FC<MoodCardProps> = ({
  mood,
  isSelected,
  onClick,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          "& .mood-label": {
            color: mood.color,
          },
        },
      }}
      onClick={onClick}
      role="button"
      aria-label={`Select mood: ${mood.label}`}
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <Typography
        className="mood-label"
        variant="body2"
        sx={{
          textAlign: "center",
          fontSize: { xs: "1rem", sm: "1.25rem" },
          fontWeight: isSelected ? "bold" : "normal",
          color: isSelected ? mood.color : "text.primary",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {mood.label}
      </Typography>
      <Box
        component="img"
        src={mood.image}
        alt={`Mood icon: ${mood.label}`}
        aria-hidden="false"
        sx={{
          width: { xs: 80, sm: 100, md: 120 },
          height: "auto",
          borderRadius: 2,
          boxShadow: isSelected ? 6 : 2,
          border: isSelected ? "3px solid" : "3px solid transparent",
          borderColor: isSelected ? mood.color : "transparent",
          transform: isSelected ? "scale(1.15)" : "scale(1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: isSelected ? "scale(1.2)" : "scale(1.05)",
          },
        }}
      />
    </Box>
  );
};

type MoodSelectorProps = {
  value?: number;
  onChange?: (value: number) => void;
};

const MoodSelector: React.FC<MoodSelectorProps> = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{ width: 600, mx: "auto" }}
    ></Box>
  );
};

export default MoodSelector;
