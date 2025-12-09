import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import { getAllMoodDataAsObject } from "../../utils/moodStorage";
import { moodConfig } from "../../utils/moodConfig";
import { moods } from "../../utils/moodConfig";
import {
  getTodosByDate,
  getTodayDateString,
  saveTodo,
} from "../../utils/todoStorage";
import type { TodoItem } from "../../pages/todo/types";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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
  // Start with refreshKey = 1 to ensure initial data read
  const [refreshKey, setRefreshKey] = useState(1);
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);
  const [selectedDateForTasks, setSelectedDateForTasks] = useState(
    getTodayDateString()
  );
  const [selectedDateForCompleted, setSelectedDateForCompleted] = useState(
    getTodayDateString()
  );
  const currentYear = new Date().getFullYear();

  // Listen to mood changes to update the table
  useEffect(() => {
    const handleMoodChange = () => {
      // Force update to read fresh data from localStorage
      setRefreshKey((prev) => prev + 1);
    };

    const handleTodoChange = () => {
      // Force update when todos change
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("moodChanged", handleMoodChange);
    window.addEventListener("todoChanged", handleTodoChange);

    // Force update on mount to ensure fresh data is read
    setRefreshKey((prev) => prev + 1);

    // Also listen to storage events (in case data changes in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedMood" || e.key === "todos") {
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("moodChanged", handleMoodChange);
      window.removeEventListener("todoChanged", handleTodoChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Generate date string in YYYY-MM-DD format
  const getDateString = (day: number, month: number): string => {
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${monthStr}-${dayStr}`;
  };

  // Pre-calculate all cell colors and mood names and store in maps for performance
  // This will recalculate when refreshKey changes, ensuring fresh data from localStorage
  const { cellColorsMap, cellMoodsMap } = useMemo(() => {
    // Force read from localStorage on each calculation
    // Access refreshKey to ensure this memo recalculates when it changes
    void refreshKey; // Force dependency

    // ✅ OPTIMIZATION: Read all data from localStorage ONCE instead of 372 times
    // This is much faster, especially when you have 500+ mood entries
    const allMoodData = getAllMoodDataAsObject();

    const colorsMap = new Map<string, string | null>();
    const moodsMap = new Map<string, string | null>();
    for (let day = 1; day <= 31; day++) {
      for (let month = 1; month <= 12; month++) {
        if (!isValidDay(day, month)) {
          colorsMap.set(`${day}-${month}`, null);
          moodsMap.set(`${day}-${month}`, null);
          continue;
        }
        const dateString = getDateString(day, month);
        // ✅ Fast O(1) access to already-loaded object (no localStorage read)
        const moodName = allMoodData[dateString] || null;
        colorsMap.set(`${day}-${month}`, getMoodHexColor(moodName));
        moodsMap.set(`${day}-${month}`, moodName);
      }
    }
    return { cellColorsMap: colorsMap, cellMoodsMap: moodsMap };
  }, [refreshKey, currentYear]);

  // Get cell color for a specific day and month
  const getCellColor = (day: number, month: number): string | null => {
    return cellColorsMap.get(`${day}-${month}`) ?? null;
  };

  // Get mood name for a specific day and month
  const getCellMood = (day: number, month: number): string | null => {
    return cellMoodsMap.get(`${day}-${month}`) ?? null;
  };

  // Count days for each mood
  const moodCounts = useMemo(() => {
    const counts = new Map<string, number>();
    moods.forEach((mood) => {
      let count = 0;
      for (let day = 1; day <= 31; day++) {
        for (let month = 1; month <= 12; month++) {
          if (isValidDay(day, month)) {
            const cellMood = cellMoodsMap.get(`${day}-${month}`);
            if (cellMood === mood.name) {
              count++;
            }
          }
        }
      }
      counts.set(mood.name, count);
    });
    return counts;
  }, [cellMoodsMap]);

  // Get count for a specific mood
  const getMoodCount = (moodName: string): number => {
    return moodCounts.get(moodName) || 0;
  };

  // Get completed todos for selected date
  const completedTodos = useMemo(() => {
    const todos = getTodosByDate(selectedDateForCompleted);
    return todos.filter((todo) => todo.completed);
  }, [selectedDateForCompleted, refreshKey]);

  // Get incomplete todos for selected date
  const incompleteTodos = useMemo(() => {
    const todos = getTodosByDate(selectedDateForTasks);
    return todos.filter((todo) => !todo.completed);
  }, [selectedDateForTasks, refreshKey]);

  // Handle toggle complete status
  const handleToggleComplete = (todo: TodoItem) => {
    const updatedTodo: TodoItem = {
      ...todo,
      completed: !todo.completed,
    };
    saveTodo(updatedTodo);
    setRefreshKey((prev) => prev + 1);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format tooltip message
  const getTooltipMessage = (moodName: string, count: number): string => {
    const mood = moods.find((m) => m.name === moodName);
    const label = mood?.label || moodName;
    if (count === 0) {
      return `You had no ${label} days`;
    } else if (count === 1) {
      return `You had 1 ${label} day`;
    } else {
      return `You had ${count} ${label} days`;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        padding: 2,
        width: "100%",
        gap: 3,
        alignItems: "flex-start",
      }}
    >
      {/* Left side: Table */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "fit-content",
          marginTop: -1.25, // Move table 10px higher (10px / 8px = 1.25)
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
            gridTemplateColumns: "22px repeat(12, 16px)",
            gridTemplateRows: "auto repeat(31, 16px)",
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
                  lineHeight: "16px",
                  paddingRight: 0.5,
                }}
              >
                {day}
              </Typography>
              {/* Cells for this day across all 12 months */}
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const isValid = isValidDay(day, month);
                const cellColor = getCellColor(day, month);
                const cellMood = getCellMood(day, month);
                const isHighlighted = hoveredMood && cellMood === hoveredMood;
                const moodData = cellMood
                  ? moods.find((m) => m.name === cellMood)
                  : null;

                return (
                  <Tooltip
                    key={`cell-${day}-${month}`}
                    title={
                      moodData
                        ? `${moodData.label} - ${getDateString(day, month)}`
                        : isValid
                        ? `${getDateString(day, month)} - No mood selected`
                        : ""
                    }
                    arrow
                    placement="top"
                    disableHoverListener={!isValid || !moodData}
                  >
                    <Box
                      sx={{
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isValid
                          ? cellColor || "#FFFFFF"
                          : "#F3F3F3",
                        border: isValid
                          ? cellColor
                            ? isHighlighted
                              ? "2px solid rgba(0,0,0,0.4)"
                              : "none"
                            : "1px solid #C7C7C7"
                          : "none",
                        boxSizing: "border-box",
                        transition: "all 0.2s ease",
                        transform: isHighlighted ? "scale(1.2)" : "scale(1)",
                        zIndex: isHighlighted ? 10 : 1,
                        position: "relative",
                        boxShadow: isHighlighted
                          ? "0 0 4px rgba(0,0,0,0.3)"
                          : "none",
                        cursor: moodData ? "pointer" : "default",
                      }}
                    >
                      {moodData && (
                        <Box
                          component="img"
                          src={moodData.image}
                          alt={moodData.label}
                          sx={{
                            width: "14px",
                            height: "14px",
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Middle: Mood legend */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "flex-start",
          marginTop: 7, // Align with first row of table (after header + month row)
          minWidth: 120,
        }}
      >
        {/* Moods header */}
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#666",
            marginBottom: 0.5,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Moods
        </Typography>

        {/* Mood items */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          {moods.map((mood) => {
            const count = getMoodCount(mood.name);
            return (
              <Tooltip
                key={mood.name}
                title={getTooltipMessage(mood.name, count)}
                arrow
                placement="right"
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 8],
                        },
                      },
                    ],
                  },
                }}
              >
                <Box
                  onMouseEnter={() => setHoveredMood(mood.name)}
                  onMouseLeave={() => setHoveredMood(null)}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1,
                    padding: 0.75,
                    borderRadius: 1.5,
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.03)",
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  {/* Small icon on the left */}
                  <Box
                    component="img"
                    src={mood.image}
                    alt={`${mood.label} mood icon`}
                    sx={{
                      width: 35,
                      height: 35,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                  {/* Large colored square (empty) */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: mood.color,
                      borderRadius: 1.5,
                      flexShrink: 0,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                  {/* Label with count */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 0.5,
                      flex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.813rem",
                        color: "#333",
                        textTransform: "capitalize",
                        fontWeight: 500,
                      }}
                    >
                      {mood.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#666",
                        fontWeight: 600,
                      }}
                    >
                      ({count})
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      {/* Right side: Tasks to do */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: 200,
          marginTop: 7,
          marginLeft: 2,
          gap: 1.5,
        }}
      >
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: "rgba(255, 107, 53, 0.05)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-2px)",
              backgroundColor: "rgba(255, 107, 53, 0.08)",
            },
          }}
        >
          <CardContent sx={{ padding: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Tasks to do
              </Typography>
              {incompleteTodos.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 107, 53, 0.2)",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                      backgroundColor: "rgba(255, 107, 53, 0.3)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "rgba(255, 107, 53, 0.9)",
                    }}
                  >
                    {incompleteTodos.length}
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              type="date"
              value={selectedDateForTasks}
              onChange={(e) => setSelectedDateForTasks(e.target.value)}
              size="small"
              fullWidth
              sx={{
                marginBottom: 1.5,
                "& .MuiInputBase-root": {
                  fontSize: "0.75rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 107, 53, 0.05)",
                  },
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                marginBottom: 1.5,
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {formatDate(selectedDateForTasks)}
            </Typography>

            {incompleteTodos.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  padding: 2,
                  opacity: 0.6,
                  transition: "opacity 0.3s ease",
                  "&:hover": {
                    opacity: 1,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  No tasks to do
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  maxHeight: "300px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    borderRadius: "2px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(255, 107, 53, 0.3)",
                    borderRadius: "2px",
                    "&:hover": {
                      backgroundColor: "rgba(255, 107, 53, 0.5)",
                    },
                  },
                }}
              >
                {incompleteTodos.map((todo, index) => (
                  <Tooltip
                    key={todo.id}
                    title={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {todo.title}
                        </Typography>
                        {todo.description && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", marginTop: 0.5 }}
                          >
                            {todo.description}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{ display: "block", marginTop: 0.5 }}
                        >
                          Priority: {todo.priority} | Location: {todo.location}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            marginTop: 0.5,
                            fontStyle: "italic",
                          }}
                        >
                          Click to mark as completed
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="left"
                  >
                    <Box
                      onClick={() => handleToggleComplete(todo)}
                      sx={{
                        padding: 0.75,
                        borderRadius: 1,
                        backgroundColor: "rgba(255, 107, 53, 0.1)",
                        borderLeft: "3px solid rgba(255, 107, 53, 0.5)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        "&:hover": {
                          backgroundColor: "rgba(255, 107, 53, 0.2)",
                          borderLeft: "3px solid rgba(255, 107, 53, 0.8)",
                          transform: "translateX(4px)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          "& .check-icon": {
                            transform: "scale(1.2)",
                            color: "rgba(128, 128, 0, 0.8)",
                          },
                        },
                        "@keyframes fadeIn": {
                          from: {
                            opacity: 0,
                            transform: "translateY(-5px)",
                          },
                          to: {
                            opacity: 1,
                            transform: "translateY(0)",
                          },
                        },
                      }}
                    >
                      <CheckCircleOutlineIcon
                        className="check-icon"
                        sx={{
                          fontSize: "1rem",
                          color: "rgba(255, 107, 53, 0.5)",
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.7rem",
                          color: "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {todo.title}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
                <Box
                  sx={{
                    marginTop: 1,
                    paddingTop: 1,
                    borderTop: "1px solid rgba(255, 107, 53, 0.2)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.65rem",
                      textAlign: "center",
                      display: "block",
                      fontWeight: 600,
                    }}
                  >
                    Total: {incompleteTodos.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Right side: Completed tasks statistics */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: 200,
          marginTop: 7,
          marginLeft: 2,
          gap: 1.5,
        }}
      >
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: "rgba(128, 128, 0, 0.05)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-2px)",
              backgroundColor: "rgba(128, 128, 0, 0.08)",
            },
          }}
        >
          <CardContent sx={{ padding: "16px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Completed Tasks
              </Typography>
              {completedTodos.length > 0 && (
                <Box
                  sx={{
                    backgroundColor: "rgba(128, 128, 0, 0.2)",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                      backgroundColor: "rgba(128, 128, 0, 0.3)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "rgba(128, 128, 0, 0.9)",
                    }}
                  >
                    {completedTodos.length}
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              type="date"
              value={selectedDateForCompleted}
              onChange={(e) => setSelectedDateForCompleted(e.target.value)}
              size="small"
              fullWidth
              sx={{
                marginBottom: 1.5,
                "& .MuiInputBase-root": {
                  fontSize: "0.75rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(128, 128, 0, 0.05)",
                  },
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
                marginBottom: 1.5,
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {formatDate(selectedDateForCompleted)}
            </Typography>

            {completedTodos.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  padding: 2,
                  opacity: 0.6,
                  transition: "opacity 0.3s ease",
                  "&:hover": {
                    opacity: 1,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  No completed tasks
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                  maxHeight: "300px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    borderRadius: "2px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(128, 128, 0, 0.3)",
                    borderRadius: "2px",
                    "&:hover": {
                      backgroundColor: "rgba(128, 128, 0, 0.5)",
                    },
                  },
                }}
              >
                {completedTodos.map((todo, index) => (
                  <Tooltip
                    key={todo.id}
                    title={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {todo.title}
                        </Typography>
                        {todo.description && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", marginTop: 0.5 }}
                          >
                            {todo.description}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{ display: "block", marginTop: 0.5 }}
                        >
                          Priority: {todo.priority} | Location: {todo.location}
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="left"
                  >
                    <Box
                      sx={{
                        padding: 0.75,
                        borderRadius: 1,
                        backgroundColor: "rgba(128, 128, 0, 0.1)",
                        borderLeft: "3px solid rgba(128, 128, 0, 0.5)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                        "&:hover": {
                          backgroundColor: "rgba(128, 128, 0, 0.2)",
                          borderLeft: "3px solid rgba(128, 128, 0, 0.8)",
                          transform: "translateX(4px)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        },
                        "@keyframes fadeIn": {
                          from: {
                            opacity: 0,
                            transform: "translateY(-5px)",
                          },
                          to: {
                            opacity: 1,
                            transform: "translateY(0)",
                          },
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.7rem",
                          color: "text.primary",
                          textDecoration: "line-through",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {todo.title}
                      </Typography>
                    </Box>
                  </Tooltip>
                ))}
                <Box
                  sx={{
                    marginTop: 1,
                    paddingTop: 1,
                    borderTop: "1px solid rgba(128, 128, 0, 0.2)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.65rem",
                      textAlign: "center",
                      display: "block",
                      fontWeight: 600,
                    }}
                  >
                    Total: {completedTodos.length}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default YearlyTracker;
