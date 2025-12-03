import { useState } from "react";
import { Box, Typography } from "@mui/material";
import MoodSelector, {
  MoodCard,
} from "../components/MoodSelector/MoodSelector";
import { moods } from "../utils/moodConfig";
import { saveMoodForToday, getMoodByDate } from "../utils/moodStorage";
import LegoButton from "../components/LegoButton/LegoButton";

const MoodPage = () => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
  };

  // Load saved mood for today from localStorage on initialization
  const [selectedMood, setSelectedMood] = useState<string | null>(() => {
    const today = getTodayDate();
    return getMoodByDate(today);
  });

  const handleMoodClick = (moodName: string) => {
    const newSelectedMood = moodName === selectedMood ? null : moodName;
    setSelectedMood(newSelectedMood);

    // Save to localStorage using new format
    saveMoodForToday(newSelectedMood);

    // Trigger custom event to update other components
    window.dispatchEvent(
      new CustomEvent("moodChanged", { detail: newSelectedMood })
    );
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
        How are you feeling today?
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

      {/* Statistics button */}
      <Box sx={{ marginTop: 4 }}>
        <LegoButton text="Statistics" to="/table" size="large" />
      </Box>
    </Box>
  );
};

export default MoodPage;
