import type { Mood } from "../components/MoodSelector/MoodSelector";

// Dynamically load all images starting with mood-
const allMoodImages = Object.values(
  import.meta.glob("../assets/images/mood-*.png", {
    eager: true,
    import: "default",
  })
) as string[];

// Define moods with their labels, display order, and colors
export const moodConfig = [
  { name: "mood-awesome", label: "awesome", color: "#FF6B35" }, // bright orange
  { name: "mood-good", label: "good", color: "#FFD93D" }, // warm yellow
  { name: "mood-sad", label: "sad", color: "#1E3A8A" }, // dark blue
  { name: "mood-angry", label: "angry", color: "#8B0000" }, // dark red
  { name: "mood-scared", label: "scared", color: "#B794F6" }, // light purple
  { name: "mood-anxity", label: "uncertain", color: "#808080" }, // gray
];

// Create array of moods with images
export const moods: Mood[] = moodConfig
  .map((mood) => {
    const image = allMoodImages.find((img) => img.includes(mood.name));
    return image ? { ...mood, image } : null;
  })
  .filter((mood): mood is Mood => mood !== null);
