import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Skeleton,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TodoList from "./todo/TodoList";
import TodoModal from "./todo/TodoModal";
import type { TodoItem } from "./todo/types";
import {
  getAllTodos,
  saveTodo,
  deleteTodo,
  getTodosByDate,
  getTodayDateString,
  exportTodosData,
  importTodosData,
} from "../utils/todoStorage";
import { exportMoodData, importMoodData } from "../utils/moodStorage";

/**
 * Darken a hex color by a percentage
 */
const darkenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0xff) - Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

/**
 * Lighten a hex color by a percentage
 */
const lightenColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const TodoListPage = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [currentDate, setCurrentDate] = useState(getTodayDateString());
  const [selectedViewDate, setSelectedViewDate] = useState(
    getTodayDateString()
  );
  const [viewDateFilter, setViewDateFilter] = useState<
    "all" | "incomplete" | "complete"
  >("incomplete");
  const [isLoading, setIsLoading] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Update current date every minute to handle day changes
  useEffect(() => {
    const updateDate = () => {
      const today = getTodayDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    };

    // Update immediately
    updateDate();

    // Update every minute
    const interval = setInterval(updateDate, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

  const loadTodos = () => {
    setIsLoading(true);
    const data = getAllTodos();
    setTodos(data);
    setIsLoading(false);
  };

  // Load todos from localStorage
  useEffect(() => {
    loadTodos();

    // Listen to todo changes
    const handleTodoChange = () => {
      loadTodos();
    };

    window.addEventListener("todoChanged", handleTodoChange);
    return () => {
      window.removeEventListener("todoChanged", handleTodoChange);
    };
  }, []);

  const handleAddTodo = (todoData: Omit<TodoItem, "id" | "completed">) => {
    const newTodo: TodoItem = {
      ...todoData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      completed: false,
    };
    saveTodo(newTodo);
    loadTodos();
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setModalOpen(true);
  };

  const handleUpdateTodo = (todoData: Omit<TodoItem, "id" | "completed">) => {
    if (!editingTodo) return;

    const updatedTodo: TodoItem = {
      ...todoData,
      id: editingTodo.id,
      completed: editingTodo.completed,
    };

    saveTodo(updatedTodo);
    loadTodos();
    setEditingTodo(null);
  };

  const handleToggleComplete = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo: TodoItem = {
      ...todo,
      completed: !todo.completed,
    };

    saveTodo(updatedTodo);
    loadTodos();
  };

  const handleDeleteTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTodo(id, todo.date);
      loadTodos();
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTodo(null);
  };

  const handleOpenModal = () => {
    setEditingTodo(null);
    setModalOpen(true);
  };

  // Get today's tasks
  const todayTodos = useMemo(() => {
    return getTodosByDate(currentDate);
  }, [currentDate, todos]);

  // Get tasks for selected view date
  const selectedDateTodos = useMemo(() => {
    const dateTodos = getTodosByDate(selectedViewDate);

    if (viewDateFilter === "all") {
      return dateTodos;
    } else if (viewDateFilter === "incomplete") {
      return dateTodos.filter((todo) => !todo.completed);
    } else {
      return dateTodos.filter((todo) => todo.completed);
    }
  }, [todos, selectedViewDate, viewDateFilter]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      // Try to use showPicker() if available (modern browsers)
      if (typeof (dateInputRef.current as any).showPicker === "function") {
        (dateInputRef.current as any).showPicker();
      } else {
        // Fallback: focus and click the input
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  const renderSkeletonList = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Card key={i} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      todos: exportTodosData(),
      moods: exportMoodData(),
      version: "1",
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diary-backup.json";
    a.click();
    URL.revokeObjectURL(url);

    window.dispatchEvent(
      new CustomEvent("appInfo", { detail: "Резервная копия сохранена" })
    );
  };

  const handleImportFile = (file: File) => {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("bad");
        }

        const todosResult = importTodosData((parsed as any).todos);
        const moodResult = importMoodData((parsed as any).moods);

        if (todosResult.success && moodResult.success !== false) {
          loadTodos();
          window.dispatchEvent(
            new CustomEvent("appInfo", { detail: "Данные импортированы" })
          );
        } else {
          setImportError(
            todosResult.error || moodResult.error || "Ошибка импорта данных"
          );
        }
      } catch (e) {
        setImportError("Некорректный файл резервной копии");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Todo List
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            aria-label="Export data"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              paddingX: 2.5,
              paddingY: 1.5,
              backgroundColor: "#5B7FA6",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.5px",
              boxShadow: `
                0 4px 0 ${darkenColor("#5B7FA6", 20)},
                0 6px 8px rgba(187, 149, 149, 0.75),
                inset 0 1px 0 ${lightenColor("#5B7FA6", 15)},
                inset 0 -1px 0 ${darkenColor("#5B7FA6", 10)}
              `,
              border: `2px solid ${darkenColor("#5B7FA6", 15)}`,
              position: "relative",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "2px",
                left: "2px",
                right: "2px",
                height: "30%",
                background: `linear-gradient(to bottom, ${lightenColor(
                  "#5B7FA6",
                  20
                )}, transparent)`,
                borderRadius: "6px 6px 0 0",
                pointerEvents: "none",
              },
              "&:hover": {
                backgroundColor: "#5B7FA6",
                transform: "translateY(1px)",
                outline: "none !important",
                boxShadow: `
                  0 3px 0 ${darkenColor("#5B7FA6", 20)},
                  0 5px 6px rgba(226, 15, 15, 0.58),
                  inset 0 1px 0 ${lightenColor("#5B7FA6", 15)},
                  inset 0 -1px 0 ${darkenColor("#5B7FA6", 10)}
                `,
              },
              "&:active": {
                transform: "translateY(2px)",
                boxShadow: `
                  0 2px 0 ${darkenColor("#5B7FA6", 20)},
                  0 4px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 ${lightenColor("#5B7FA6", 15)},
                  inset 0 -1px 0 ${darkenColor("#5B7FA6", 10)}
                `,
              },
              "&:focus": {
                outline: "none !important",
                boxShadow: `
                  0 4px 0 ${darkenColor("#5B7FA6", 20)},
                  0 6px 8px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#5B7FA6", 15)},
                  inset 0 -1px 0 ${darkenColor("#5B7FA6", 10)}
                `,
              },
              "&:focus-visible": {
                outline: "none !important",
                boxShadow: `
                  0 4px 0 ${darkenColor("#5B7FA6", 20)},
                  0 6px 8px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#5B7FA6", 15)},
                  inset 0 -1px 0 ${darkenColor("#5B7FA6", 10)}
                `,
              },
              "&.Mui-focusVisible": {
                outline: "none !important",
                boxShadow: `
                  0 4px 0 ${darkenColor("#5B7FA6", 20)},
                  0 6px 8px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#5B7FA6", 15)},
                  inset 0 -1px 0 ${darkenColor("#5B7FA6", 10)}
                `,
              },
              "& .MuiButton-startIcon": {
                position: "relative",
                zIndex: 1,
              },
            }}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<FileUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import data"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              paddingX: 2.5,
              paddingY: 1.5,
              backgroundColor: "#6B8E6B",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.875rem",
              letterSpacing: "0.5px",
              boxShadow: `
                0 4px 0 ${darkenColor("#6B8E6B", 20)},
                0 6px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 ${lightenColor("#6B8E6B", 15)},
                inset 0 -1px 0 ${darkenColor("#6B8E6B", 10)}
              `,
              border: `2px solid ${darkenColor("#6B8E6B", 15)}`,
              position: "relative",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "2px",
                left: "2px",
                right: "2px",
                height: "30%",
                background: `linear-gradient(to bottom, ${lightenColor(
                  "#6B8E6B",
                  20
                )}, transparent)`,
                borderRadius: "6px 6px 0 0",
                pointerEvents: "none",
              },
              "&:hover": {
                backgroundColor: "#6B8E6B",
                transform: "translateY(1px)",
                outline: "none !important",
                border: `2px solid ${darkenColor("#6B8E6B", 15)} !important`,
                boxShadow: `
                  0 3px 0 ${darkenColor("#6B8E6B", 20)},
                  0 5px 6px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#6B8E6B", 15)},
                  inset 0 -1px 0 ${darkenColor("#6B8E6B", 10)}
                `,
              },
              "&:active": {
                transform: "translateY(2px)",
                boxShadow: `
                  0 2px 0 ${darkenColor("#6B8E6B", 20)},
                  0 4px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 ${lightenColor("#6B8E6B", 15)},
                  inset 0 -1px 0 ${darkenColor("#6B8E6B", 10)}
                `,
              },
              "&:focus": {
                outline: "none !important",
                boxShadow: `
                  0 4px 0 ${darkenColor("#6B8E6B", 20)},
                  0 6px 8px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#6B8E6B", 15)},
                  inset 0 -1px 0 ${darkenColor("#6B8E6B", 10)}
                `,
              },
              "&:focus-visible": {
                outline: "none !important",
                boxShadow: `
                  0 4px 0 ${darkenColor("#6B8E6B", 20)},
                  0 6px 8px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#6B8E6B", 15)},
                  inset 0 -1px 0 ${darkenColor("#6B8E6B", 10)}
                `,
              },
              "&.Mui-focusVisible": {
                outline: "none !important",
                boxShadow: `
                  0 4px 0 ${darkenColor("#6B8E6B", 20)},
                  0 6px 8px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 ${lightenColor("#6B8E6B", 15)},
                  inset 0 -1px 0 ${darkenColor("#6B8E6B", 10)}
                `,
              },
              "& .MuiButton-startIcon": {
                position: "relative",
                zIndex: 1,
              },
            }}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            aria-label="Add new task"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              paddingX: 3,
              paddingY: 1.5,
              backgroundColor: "#FF6B35",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.5px",
              boxShadow: `
              0 4px 0 ${darkenColor("#FF6B35", 20)},
              0 6px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 ${lightenColor("#FF6B35", 15)},
              inset 0 -1px 0 ${darkenColor("#FF6B35", 10)}
            `,
              border: `2px solid ${darkenColor("#FF6B35", 15)}`,
              position: "relative",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              transition: "all 0.2s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "2px",
                left: "2px",
                right: "2px",
                height: "30%",
                background: `linear-gradient(to bottom, ${lightenColor(
                  "#FF6B35",
                  20
                )}, transparent)`,
                borderRadius: "6px 6px 0 0",
                pointerEvents: "none",
              },
              "&:hover": {
                backgroundColor: "#FF6B35",
                transform: "translateY(1px)",
                outline: "none !important",
                border: `2px solid ${darkenColor("#FF6B35", 15)} !important`,
                boxShadow: `
                0 3px 0 ${darkenColor("#FF6B35", 20)},
                0 5px 6px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 ${lightenColor("#FF6B35", 15)},
                inset 0 -1px 0 ${darkenColor("#FF6B35", 10)}
              `,
              },
              "&:active": {
                transform: "translateY(2px)",
                boxShadow: `
                0 2px 0 ${darkenColor("#FF6B35", 20)},
                0 4px 4px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 ${lightenColor("#FF6B35", 15)},
                inset 0 -1px 0 ${darkenColor("#FF6B35", 10)}
              `,
              },
              "&:focus": {
                outline: "none !important",
                boxShadow: `
                0 4px 0 ${darkenColor("#FF6B35", 20)},
                0 6px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 ${lightenColor("#FF6B35", 15)},
                inset 0 -1px 0 ${darkenColor("#FF6B35", 10)}
              `,
              },
              "&:focus-visible": {
                outline: "none !important",
                boxShadow: `
                0 4px 0 ${darkenColor("#FF6B35", 20)},
                0 6px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 ${lightenColor("#FF6B35", 15)},
                inset 0 -1px 0 ${darkenColor("#FF6B35", 10)}
              `,
              },
              "&.Mui-focusVisible": {
                outline: "none !important",
                boxShadow: `
                0 4px 0 ${darkenColor("#FF6B35", 20)},
                0 6px 8px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 ${lightenColor("#FF6B35", 15)},
                inset 0 -1px 0 ${darkenColor("#FF6B35", 10)}
              `,
              },
              "& .MuiButton-startIcon": {
                position: "relative",
                zIndex: 1,
              },
            }}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        aria-label="Import backup file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
        }}
      />

      {importError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {importError}
        </Alert>
      )}

      {/* Today's tasks */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h6"
          sx={{
            marginBottom: 2,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          Today - {formatDate(currentDate)}
        </Typography>
        {isLoading ? (
          renderSkeletonList()
        ) : todayTodos.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              padding: 4,
              color: "text.secondary",
            }}
          >
            <Typography variant="body1">No tasks for today</Typography>
          </Box>
        ) : (
          <TodoList
            todos={todayTodos}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onToggleComplete={handleToggleComplete}
          />
        )}
      </Box>

      {/* View tasks by date */}
      <Card
        sx={{
          marginBottom: 4,
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: "rgba(255, 152, 0, 0.05)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "warning.main",
              }}
            >
              View Tasks by Date
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <ToggleButtonGroup
                value={viewDateFilter}
                exclusive
                onChange={(_, value) => {
                  if (value !== null) {
                    setViewDateFilter(value);
                  }
                }}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    borderRadius: "8px",
                    textTransform: "none",
                    paddingX: 2,
                    paddingY: 1,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    letterSpacing: "0.5px",
                    border: `1px solid rgba(255, 152, 0, 0.5)`,
                    color: "rgb(94, 47, 3)",
                    backgroundColor: "rgba(255, 152, 0, 0.35)",
                    boxShadow: `
                      0 2px 0 rgba(255, 152, 0, 0.3),
                      0 3px 6px rgba(0, 0, 0, 0.12),
                      inset 0 1px 0 rgba(255, 255, 255, 0.15)
                    `,
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 153, 0, 0.26)",
                      transform: "translateY(1px)",
                      boxShadow: `
                        0 1px 0 rgba(255, 152, 0, 0.3),
                        0 2px 4px rgba(0, 0, 0, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15)
                      `,
                    },
                    "&:active": {
                      transform: "translateY(2px)",
                      boxShadow: `
                        0 1px 0 rgba(255, 152, 0, 0.3),
                        0 2px 3px rgba(0, 0, 0, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15)
                      `,
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255, 107, 53, 0.5)",
                      border: `1px solid rgba(255, 107, 53, 0.6)`,
                      color: "rgb(94, 47, 3)",
                      boxShadow: `
                        0 2px 0 rgba(255, 107, 53, 0.35),
                        0 3px 6px rgba(0, 0, 0, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `,
                      "&:hover": {
                        backgroundColor: "rgba(255, 107, 53, 0.6)",
                        boxShadow: `
                          0 1px 0 rgba(255, 107, 53, 0.35),
                          0 2px 4px rgba(0, 0, 0, 0.12),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                      },
                      "&:active": {
                        boxShadow: `
                          0 1px 0 rgba(255, 107, 53, 0.35),
                          0 2px 3px rgba(0, 0, 0, 0.12),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                      },
                      "&:focus": {
                        outline: "none",
                      },
                      "&:focus-visible": {
                        outline: "none",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="incomplete">Incomplete</ToggleButton>
                <ToggleButton value="complete">Complete</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <Typography
                variant="h6"
                onClick={handleCalendarClick}
                sx={{
                  fontWeight: 600,
                  color: "warning.main",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  transition: "all 0.2s ease",
                  userSelect: "none",
                  "&:hover": {
                    color: "warning.dark",
                    transform: "scale(1.02)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 20 }} />
                {formatDate(selectedViewDate)}
              </Typography>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedViewDate}
                onChange={(e) => {
                  setSelectedViewDate(e.target.value);
                }}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 0,
                  height: 0,
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>

          {isLoading ? (
            renderSkeletonList()
          ) : selectedDateTodos.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                padding: 3,
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                No tasks found for this date
                {viewDateFilter !== "all" && ` (${viewDateFilter})`}
              </Typography>
            </Box>
          ) : (
            <TodoList
              todos={selectedDateTodos}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
              onToggleComplete={handleToggleComplete}
            />
          )}
        </CardContent>
      </Card>

      <TodoModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={editingTodo ? handleUpdateTodo : handleAddTodo}
        editingTodo={editingTodo}
      />
    </Container>
  );
};

export default TodoListPage;
