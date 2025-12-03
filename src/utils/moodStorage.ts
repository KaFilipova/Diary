import { moods } from "./moodConfig";
import type { Mood } from "../components/MoodSelector/MoodSelector";

const SELECTED_MOOD_KEY = "selectedMood";

/**
 * Type for mood storage structure: { "YYYY-MM-DD": "mood-name", ... }
 */
type MoodStorageData = Record<string, string>;

/**
 * Migrate old format (string) to new format (object with dates)
 * If old format exists, convert it to new format with today's date
 */
const migrateOldFormat = (): void => {
  const stored = localStorage.getItem(SELECTED_MOOD_KEY);
  if (!stored) return;

  // Check if it's old format (string, not JSON object)
  try {
    const parsed = JSON.parse(stored);
    // If it's already an object, migration not needed
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return;
    }
  } catch {
    // If parsing fails, it's old format (plain string)
    const today = new Date().toISOString().split("T")[0];
    const newData: MoodStorageData = { [today]: stored };
    localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(newData));
  }
};

/**
 * Get mood storage data, migrating from old format if needed
 */
const getMoodStorageData = (): MoodStorageData => {
  migrateOldFormat();
  const stored = localStorage.getItem(SELECTED_MOOD_KEY);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored);
    // If it's old format (string), migrate it
    if (typeof parsed === "string") {
      const today = new Date().toISOString().split("T")[0];
      const newData: MoodStorageData = { [today]: parsed };
      localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(newData));
      return newData;
    }
    return parsed as MoodStorageData;
  } catch {
    return {};
  }
};

/**
 * Save mood for today's date
 */
export const saveMoodForToday = (mood: string | null): void => {
  const today = new Date().toISOString().split("T")[0];
  const data = getMoodStorageData();

  if (mood) {
    data[today] = mood;
  } else {
    delete data[today];
  }

  localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(data));
};

/**
 * Get mood by specific date (format: YYYY-MM-DD)
 */
export const getMoodByDate = (date: string): string | null => {
  const data = getMoodStorageData();
  return data[date] || null;
};

/**
 * Get all mood data as an array of { date, mood } sorted by date (newest first)
 */
export const getAllMoodData = (): Array<{ date: string; mood: string }> => {
  const data = getMoodStorageData();
  return Object.entries(data)
    .map(([date, mood]) => ({ date, mood }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Get selected mood for today from localStorage
 */
export const getSelectedMood = (): Mood | null => {
  const today = new Date().toISOString().split("T")[0];
  const savedMoodName = getMoodByDate(today);
  if (!savedMoodName) return null;

  return moods.find((mood) => mood.name === savedMoodName) || null;
};

/**
 * Get image of selected mood for today
 */
export const getSelectedMoodImage = (): string | null => {
  const selectedMood = getSelectedMood();
  return selectedMood ? selectedMood.image : null;
};

/**
 * Get name of selected mood for today
 */
export const getSelectedMoodName = (): string | null => {
  const selectedMood = getSelectedMood();
  return selectedMood ? selectedMood.name : null;
};

/**
 * Check if mood should rotate (only mood-awesome and mood-good)
 */
export const shouldMoodRotate = (moodName: string | null): boolean => {
  return moodName === "mood-awesome" || moodName === "mood-good";
};

/**
 * Get mood color for glow effect
 */
export const getMoodColor = (moodName: string | null): string => {
  if (!moodName) return "rgba(150, 150, 150, 0.6)";

  // Find mood by name
  const mood = moods.find((m) => m.name === moodName);
  if (mood) {
    // Convert hex to rgba for effect
    const hex = mood.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  return "rgba(150, 150, 150, 0.6)";
};
