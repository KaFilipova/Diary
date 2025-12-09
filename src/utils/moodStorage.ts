import { moods, moodConfig } from "./moodConfig";
import type { Mood } from "../components/MoodSelector/MoodSelector";

const SELECTED_MOOD_KEY = "selectedMood";

type MoodStorageData = Record<string, string>;

/**
 * Get today's date in YYYY-MM-DD format using local time
 */
const getTodayLocalDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Migrate old string format to new object format
 */
const migrateOldFormat = (): void => {
  const stored = localStorage.getItem(SELECTED_MOOD_KEY);
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return;
    }
  } catch {
    const today = getTodayLocalDate();
    const newData: MoodStorageData = { [today]: stored };
    localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(newData));
  }
};

/**
 * Get mood storage data in the new format
 */
const getMoodStorageData = (): MoodStorageData => {
  migrateOldFormat();
  const stored = localStorage.getItem(SELECTED_MOOD_KEY);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === "string") {
      const today = getTodayLocalDate();
      const newData: MoodStorageData = { [today]: parsed };
      localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(newData));
      return newData;
    }
    return parsed as MoodStorageData;
  } catch {
    window.dispatchEvent(
      new CustomEvent("appError", {
        detail: "Не удалось прочитать данные настроения. Данные сброшены.",
      })
    );
    return {};
  }
};

/**
 * Save mood for today's date
 */
export const saveMoodForToday = (mood: string | null): void => {
  const today = getTodayLocalDate();
  const data = getMoodStorageData();

  if (mood) {
    data[today] = mood;
  } else {
    delete data[today];
  }

  try {
    localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(data));
  } catch (e) {
    window.dispatchEvent(
      new CustomEvent("appError", {
        detail: "Недостаточно места в хранилище настроений.",
      })
    );
  }

  // Trigger custom event to update other components
  window.dispatchEvent(new CustomEvent("moodChanged", { detail: mood }));
};

/**
 * Get mood by date (YYYY-MM-DD format)
 */
export const getMoodByDate = (date: string): string | null => {
  const data = getMoodStorageData();
  return data[date] || null;
};

/**
 * Get all mood data sorted by date (newest first)
 */
export const getAllMoodData = (): Array<{ date: string; mood: string }> => {
  const data = getMoodStorageData();
  return Object.entries(data)
    .map(([date, mood]) => ({ date, mood }))
    .sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Get all mood data as object (for performance optimization)
 * Use this when you need to access multiple dates - reads localStorage only once
 */
export const getAllMoodDataAsObject = (): MoodStorageData => {
  return getMoodStorageData();
};

/**
 * Получить выбранное настроение из localStorage (for current day)
 */
export const getSelectedMood = (): Mood | null => {
  const today = getTodayLocalDate();
  const savedMoodName = getMoodByDate(today);
  if (!savedMoodName) return null;

  return moods.find((mood) => mood.name === savedMoodName) || null;
};

/**
 * Получить изображение выбранного настроения
 */
export const getSelectedMoodImage = (): string | null => {
  const selectedMood = getSelectedMood();
  return selectedMood ? selectedMood.image : null;
};

/**
 * Получить имя выбранного настроения
 */
export const getSelectedMoodName = (): string | null => {
  const selectedMood = getSelectedMood();
  return selectedMood ? selectedMood.name : null;
};

/**
 * Проверить, должно ли настроение вращаться (только mood-awesome и mood-good)
 */
export const shouldMoodRotate = (moodName: string | null): boolean => {
  return moodName === "mood-awesome" || moodName === "mood-good";
};

/**
 * Получить цвет настроения для эффекта подсветки
 */
export const getMoodColor = (moodName: string | null): string => {
  if (!moodName) return "rgba(150, 150, 150, 0.6)";

  // Находим настроение по имени
  const mood = moodConfig.find((m) => m.name === moodName);
  if (mood) {
    // Конвертируем hex в rgba для эффекта
    const hex = mood.color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
  }

  return "rgba(150, 150, 150, 0.6)";
};

/**
 * Export mood data for backup
 */
export const exportMoodData = (): MoodStorageData => {
  return getMoodStorageData();
};

/**
 * Import mood data from backup
 */
export const importMoodData = (
  data: unknown
): { success: boolean; error?: string } => {
  if (typeof data === "undefined") {
    return { success: true };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { success: false, error: "Некорректный формат данных настроения" };
  }

  const result: MoodStorageData = {};
  for (const [date, mood] of Object.entries(data)) {
    if (typeof mood === "string") {
      result[date] = mood;
    }
  }

  try {
    localStorage.setItem(SELECTED_MOOD_KEY, JSON.stringify(result));
    window.dispatchEvent(
      new CustomEvent("moodChanged", { detail: "imported" })
    );
    window.dispatchEvent(
      new CustomEvent("appInfo", { detail: "Данные настроений импортированы" })
    );
    return { success: true };
  } catch {
    window.dispatchEvent(
      new CustomEvent("appError", {
        detail: "Не удалось сохранить данные настроений.",
      })
    );
    return { success: false, error: "Ошибка сохранения настроений" };
  }
};
