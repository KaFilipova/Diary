import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import type { TodoItem, Priority, Location } from "./types";
import { moods } from "../../utils/moodConfig";
import { getTodayDateString } from "../../utils/todoStorage";

type TodoModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (todo: Omit<TodoItem, "id" | "completed">) => void;
  editingTodo?: TodoItem | null;
};

const TodoModal = ({ open, onClose, onSave, editingTodo }: TodoModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [mood, setMood] = useState("");
  const [location, setLocation] = useState<Location>("дом");
  const [date, setDate] = useState(getTodayDateString());

  const today = getTodayDateString();
  const isFutureDate = date > today;
  const canSave = !!title.trim() && !!author.trim() && !!date && !isFutureDate;

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description);
      setAuthor(editingTodo.author);
      setPriority(editingTodo.priority);
      setMood(editingTodo.mood);
      setLocation(editingTodo.location);
      setDate(editingTodo.date);
    } else {
      // Сброс формы при добавлении новой задачи - всегда используем сегодняшнюю дату
      setTitle("");
      setDescription("");
      setAuthor("");
      setPriority("medium");
      setMood("");
      setLocation("дом");
      setDate(getTodayDateString());
    }
  }, [editingTodo, open]);

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      author: author.trim(),
      priority,
      mood: mood.trim() || "Not specified",
      location,
      date,
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingTodo ? "Edit Task" : "Add Task"}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            paddingTop: 1,
          }}
        >
          <TextField
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            variant="outlined"
            inputProps={{ maxLength: 120, "aria-label": "Task title" }}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
          />

          <TextField
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            fullWidth
            required
            variant="outlined"
            inputProps={{ maxLength: 80, "aria-label": "Author name" }}
          />

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Mood</InputLabel>
            <Select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              label="Mood"
            >
              <MenuItem value="">
                <em>Not specified</em>
              </MenuItem>
              {moods.map((m) => (
                <MenuItem key={m.name} value={m.label}>
                  {m.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
              label="Location"
            >
              <MenuItem value="дом">Home</MenuItem>
              <MenuItem value="работа">Work</MenuItem>
              <MenuItem value="семья">Family</MenuItem>
              <MenuItem value="хобби">Hobby</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            variant="outlined"
            error={isFutureDate || !date}
            helperText={
              !date
                ? "Выберите дату"
                : isFutureDate
                ? "Дата не может быть в будущем"
                : ""
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: today,
              "aria-label": "Task date",
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!canSave}>
          {editingTodo ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TodoModal;
