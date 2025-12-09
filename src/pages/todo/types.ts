export interface TodoItem {
  id: string;
  title: string;
  description: string;
  author: string;
  priority: "low" | "medium" | "high";
  mood: string;
  location: "дом" | "работа" | "семья" | "хобби";
  completed: boolean;
  date: string; // YYYY-MM-DD format
}

export type Priority = "low" | "medium" | "high";
export type Location = "дом" | "работа" | "семья" | "хобби";
