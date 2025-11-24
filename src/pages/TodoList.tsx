import { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
const TodoList = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  return (
    <Box>
      <Typography variant="h4">Список задач</Typography>
      <TextField label="Новая задача" value={task}></TextField>
    </Box>
  );
};

export default TodoList;
