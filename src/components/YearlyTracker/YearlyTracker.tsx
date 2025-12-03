import { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { getMoodByDate } from "../../utils/moodStorage";
import { moodConfig } from "../../utils/moodConfig";

/**
 * Get hex color for mood name
 */
const getMoodHexColor = (moodName: string | null): string | null => {
  if (!moodName) return null;
  const mood = moodConfig.find((m) => m.name === moodName);
  return mood ? mood.color : null;
};

/**
 * Check if a day is valid for a given month
 */
const isValidDay = (day: number, month: number): boolean => {
  // Month is 1-based (1 = January, 12 = December)
  if (month === 2) {
    // February: max 28 days (29 in leap years, but we'll use 28 for simplicity)
    return day <= 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    // April, June, September, November: max 30 days
    return day <= 30;
  }
  // January, March, May, July, August, October, December: 31 days
  return day <= 31;
};

const YearlyTracker = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const currentYear = new Date().getFullYear();

  // Listen to mood changes to update the table
  useEffect(() => {
    const handleMoodChange = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("moodChanged", handleMoodChange);
    return () => {
      window.removeEventListener("moodChanged", handleMoodChange);
    };
  }, []);

  // Generate date string in YYYY-MM-DD format
  const getDateString = (day: number, month: number): string => {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${monthStr}-${dayStr}`;
  };

  // Get cell color for a specific day and month
  const getCellColor = (day: number, month: number): string | null => {
    if (!isValidDay(day, month)) {
      return null; // Invalid day, will be styled as gray
    }
    const dateString = getDateString(day, month);
    const moodName = getMoodByDate(dateString);
    return getMoodHexColor(moodName);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 2,
        width: "100%",
        maxWidth: "fit-content",
      }}
    >
      {/* Header with title and year */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#333",
            fontSize: "1.5rem",
          }}
        >
          Yearly
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#333",
            fontSize: "1.5rem",
          }}
        >
          {currentYear}
        </Typography>
      </Box>

      {/* Main grid container - using CSS Grid for proper alignment */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "30px repeat(12, 24px)",
          gridTemplateRows: "auto repeat(31, 24px)",
          gap: 0,
          width: "fit-content",
        }}
      >
        {/* First row: empty corner + month headers */}
        <Box key="corner" />
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <Typography
            key={`month-${month}`}
            sx={{
              fontSize: "0.75rem",
              textAlign: "center",
              color: "#333",
              lineHeight: 1,
              paddingTop: 0.5,
            }}
          >
            {month}
          </Typography>
        ))}

        {/* Rows for each day: day number + 12 cells */}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <Box key={`row-${day}`} sx={{ display: "contents" }}>
            {/* Day number */}
            <Typography
              sx={{
                fontSize: "0.75rem",
                textAlign: "right",
                color: "#333",
                lineHeight: "24px",
                paddingRight: 0.5,
              }}
            >
              {day}
            </Typography>
            {/* Cells for this day across all 12 months */}
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const isValid = isValidDay(day, month);
              const cellColor = getCellColor(day, month);

              return (
                <Box
                  key={`cell-${day}-${month}`}
                  sx={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: isValid
                      ? cellColor || "#FFFFFF"
                      : "#F3F3F3",
                    border: isValid
                      ? cellColor
                        ? "none"
                        : "1px solid #C7C7C7"
                      : "none",
                    boxSizing: "border-box",
                  }}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default YearlyTracker;

