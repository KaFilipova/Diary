import { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  Collapse,
  Checkbox,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import type { TodoItem } from "./types";

type TodoCardProps = {
  todo: TodoItem;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

const TodoCard = ({
  todo,
  onEdit,
  onDelete,
  onToggleComplete,
}: TodoCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      default:
        return priority;
    }
  };

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      дом: "Home",
      работа: "Work",
      семья: "Family",
      хобби: "Hobby",
    };
    return labels[location] || location;
  };

  return (
    <Card
      sx={{
        marginBottom: 2,
        borderRadius: 2,
        boxShadow: 2,
        transition: "all 0.3s ease",
        opacity: todo.completed ? 0.7 : 1,
        backgroundColor: todo.completed
          ? "rgba(128, 128, 0, 0.15)" // бледно-оливковый цвет для выполненных
          : "rgba(255, 107, 53, 0.08)", // светло-светло оранжевый для невыполненных
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, gap: 1 }}>
            <Checkbox
              checked={todo.completed}
              onChange={() => onToggleComplete(todo.id)}
              icon={<RadioButtonUncheckedIcon />}
              checkedIcon={<CheckCircleIcon />}
              sx={{
                color: todo.completed ? "success.main" : "action.active",
                "&.Mui-checked": {
                  color: "success.main",
                },
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                flex: 1,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "text.secondary" : "text.primary",
              }}
            >
              {todo.title}
            </Typography>
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
              label={new Date(todo.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              size="small"
              variant="outlined"
              sx={{
                marginLeft: 1,
                borderColor: todo.completed ? "text.disabled" : "primary.main",
                color: todo.completed ? "text.disabled" : "primary.main",
              }}
            />
          </Box>
          <Chip
            label={getPriorityLabel(todo.priority)}
            color={
              getPriorityColor(todo.priority) as "success" | "warning" | "error"
            }
            size="small"
            sx={{ marginLeft: 1 }}
          />
        </Box>

        <Box
          sx={{ display: "flex", gap: 1, marginBottom: 1, flexWrap: "wrap" }}
        >
          <Typography
            variant="body2"
            sx={{
              color: todo.completed ? "text.disabled" : "text.secondary",
            }}
          >
            Author: <strong>{todo.author}</strong>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: todo.completed ? "text.disabled" : "text.secondary",
            }}
          >
            Location: <strong>{getLocationLabel(todo.location)}</strong>
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: todo.completed ? "text.disabled" : "text.secondary",
            }}
          >
            Mood: <strong>{todo.mood}</strong>
          </Typography>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              marginTop: 2,
              padding: 2,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: todo.completed ? "text.disabled" : "text.secondary",
                whiteSpace: "pre-wrap",
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.description}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>

      <CardActions
        sx={{ justifyContent: "space-between", padding: "0 16px 16px" }}
      >
        <IconButton
          onClick={() => setExpanded(!expanded)}
          aria-label="expand description"
          size="small"
          sx={{
            "&:active": {
              transform: "translateY(2px)",
            },
            "&:focus": {
              outline: "none",
            },
            "&:focus-visible": {
              outline: "none",
            },
            transition: "all 0.2s ease",
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Box>
          <IconButton
            onClick={() => onEdit(todo)}
            aria-label="edit"
            color="primary"
            size="small"
            sx={{
              "&:active": {
                transform: "translateY(2px)",
              },
              "&:focus": {
                outline: "none",
              },
              "&:focus-visible": {
                outline: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete(todo.id)}
            aria-label="delete"
            color="error"
            size="small"
            sx={{
              "&:active": {
                transform: "translateY(2px)",
              },
              "&:focus": {
                outline: "none",
              },
              "&:focus-visible": {
                outline: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default TodoCard;

