import { Box, Typography } from "@mui/material";
import TodoCard from "./TodoCard";
import type { TodoItem } from "./types";

type TodoListProps = {
  todos: TodoItem[];
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
};

const TodoList = ({
  todos,
  onEdit,
  onDelete,
  onToggleComplete,
}: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          padding: 4,
          color: "text.secondary",
        }}
      >
        <Typography variant="h6">No tasks</Typography>
        <Typography variant="body2">
          Add your first task by clicking the "Add Task" button
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      ))}
    </Box>
  );
};

export default TodoList;


