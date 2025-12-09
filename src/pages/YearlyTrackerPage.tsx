import { useEffect, useState } from "react";
import YearlyTracker from "../components/YearlyTracker/YearlyTracker";

const YearlyTrackerPage = () => {
  const [key, setKey] = useState(0);

  // Force re-mount of YearlyTracker when page is visited
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, []);

  return <YearlyTracker key={key} />;
};

export default YearlyTrackerPage;
