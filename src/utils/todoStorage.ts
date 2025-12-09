import type { TodoItem } from "../pages/todo/types";

const TODOS_STORAGE_KEY = "todos";

type TodosStorageData = Record<string, TodoItem[]>;

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
 * Get all todos from localStorage
 */
const getTodosStorageData = (): TodosStorageData => {
  const stored = localStorage.getItem(TODOS_STORAGE_KEY);
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored);
    return parsed as TodosStorageData;
  } catch (e) {
    window.dispatchEvent(
      new CustomEvent("appError", {
        detail: "Не удалось прочитать задачи из хранилища. Данные сброшены.",
      })
    );
    return {};
  }
};

/**
 * Save todos to localStorage
 */
const saveTodosStorageData = (data: TodosStorageData): void => {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    window.dispatchEvent(
      new CustomEvent("appError", {
        detail:
          "Недостаточно места в хранилище задач. Очистите память или экспортируйте данные.",
      })
    );
  }
};

/**
 * Get todos for a specific date
 */
export const getTodosByDate = (date: string): TodoItem[] => {
  const data = getTodosStorageData();
  return data[date] || [];
};

/**
 * Get all todos as a flat array
 */
export const getAllTodos = (): TodoItem[] => {
  const data = getTodosStorageData();
  return Object.values(data).flat();
};

/**
 * Save a todo item
 */
export const saveTodo = (todo: TodoItem): void => {
  const data = getTodosStorageData();
  const dateTodos = data[todo.date] || [];

  // Check if todo already exists (update) or add new
  const existingIndex = dateTodos.findIndex((t) => t.id === todo.id);
  if (existingIndex >= 0) {
    dateTodos[existingIndex] = todo;
  } else {
    dateTodos.push(todo);
  }

  data[todo.date] = dateTodos;
  saveTodosStorageData(data);

  // Trigger custom event to update other components
  window.dispatchEvent(new CustomEvent("todoChanged", { detail: todo }));
};

/**
 * Delete a todo item
 */
export const deleteTodo = (id: string, date: string): void => {
  const data = getTodosStorageData();
  const dateTodos = data[date] || [];

  const filteredTodos = dateTodos.filter((t) => t.id !== id);
  if (filteredTodos.length === 0) {
    delete data[date];
  } else {
    data[date] = filteredTodos;
  }

  saveTodosStorageData(data);

  // Trigger custom event
  window.dispatchEvent(new CustomEvent("todoChanged"));
};

/**
 * Get todos for today
 */
export const getTodayTodos = (): TodoItem[] => {
  const today = getTodayLocalDate();
  return getTodosByDate(today);
};

/**
 * Get today's date string
 */
export const getTodayDateString = (): string => {
  return getTodayLocalDate();
};

/**
 * Get yesterday's date in YYYY-MM-DD format using local time
 */
export const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Export all todos as a plain object for backup
 */
export const exportTodosData = (): TodosStorageData => {
  return getTodosStorageData();
};

/**
 * Import todos data from backup
 */
export const importTodosData = (
  data: unknown
): { success: boolean; error?: string } => {
  if (typeof data === "undefined") {
    return { success: true };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { success: false, error: "Некорректный формат файла" };
  }

  const result: TodosStorageData = {};
  for (const [date, todos] of Object.entries(data)) {
    if (!Array.isArray(todos)) continue;
    result[date] = todos
      .map((t) => {
        if (
          typeof t === "object" &&
          t !== null &&
          "title" in t &&
          "author" in t &&
          "priority" in t &&
          "location" in t &&
          "date" in t
        ) {
          return {
            id: typeof t.id === "string" ? t.id : Date.now().toString(),
            title: String((t as TodoItem).title),
            description: String((t as TodoItem).description || ""),
            author: String((t as TodoItem).author),
            priority: (t as TodoItem).priority,
            mood: String((t as TodoItem).mood || ""),
            location: (t as TodoItem).location,
            completed: Boolean((t as TodoItem).completed),
            date: String((t as TodoItem).date),
          } as TodoItem;
        }
        return null;
      })
      .filter(Boolean) as TodoItem[];
  }

  saveTodosStorageData(result);
  window.dispatchEvent(new CustomEvent("todoChanged", { detail: "imported" }));
  window.dispatchEvent(
    new CustomEvent("appInfo", { detail: "Данные задач импортированы" })
  );
  return { success: true };
};
