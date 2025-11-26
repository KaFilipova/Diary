import { Box, Typography } from "@mui/material";
import MoodSelector from "../components/MoodSelector/MoodSelector";

const MoodPage = () => {
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
    </Box>
  );
};

export default MoodPage;
