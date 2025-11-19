import { Routes, Route } from "react-router-dom";
import HomePage from "../../pages/HomePage";
import MoodPage from "../../pages/MoodPage";
import EnergyPage from "../../pages/EnergyPage";



type Props = {};

function Main({}: Props) {
  return (
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/energy" element={<EnergyPage />} />
      </Routes>
    </main>
  );
}

export default Main;
