import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import MoodPage from "../../pages/MoodPage";

type Props = {};

function Main({}: Props) {
  return (
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mood" element={<MoodPage />} />
      </Routes>
    </main>
  );
}

export default Main;
