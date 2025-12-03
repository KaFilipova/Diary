import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import MoodPage from "../../pages/MoodPage";
import TodoList from "../../pages/TodoList";
import Calories from "../../pages/Calories";
import YearlyTrackerPage from "../../pages/YearlyTrackerPage";

type Props = {};

function Main({}: Props) {
  return (
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/todo" element={<TodoList />} />
        <Route path="/calories" element={<Calories />} />
        <Route path="/table" element={<YearlyTrackerPage />} />
      </Routes>
    </main>
  );
}

export default Main;
