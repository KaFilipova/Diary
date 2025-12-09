import { useState } from "react";
import { Box, Typography } from "@mui/material";
import MoodSelector, {
  MoodCard,
  type Mood,
} from "../components/MoodSelector/MoodSelector";
import { moods } from "../utils/moodConfig";
import { saveMoodForToday, getMoodByDate } from "../utils/moodStorage";

const MoodPage = () => {
  // Load saved mood from localStorage on initialization (for current day)
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    // Use local time to get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    return getMoodByDate(todayStr);
  });

  const handleMoodClick = (moodName: string) => {
    const newSelectedMood = moodName === selectedMood ? null : moodName;
    setSelectedMood(newSelectedMood);

    // Save to localStorage using the new date-based format
    saveMoodForToday(newSelectedMood);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", marginBottom: 4 }}
      >
        Какое у вас сегодня настроение?
      </Typography>
      <MoodSelector />

      {/* Display mood images */}
      <Box
        sx={{
          marginTop: 4,
          width: "100%",
          maxWidth: 800,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {moods.map((mood) => (
          <MoodCard
            key={mood.name}
            mood={mood}
            isSelected={selectedMood === mood.name}
            onClick={() => handleMoodClick(mood.name)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MoodPage;
