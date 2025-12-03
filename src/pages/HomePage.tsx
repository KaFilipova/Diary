import { useMemo, useState, useEffect } from "react";
import "../styles/HomePage.scss";
import ListOfCards from "../components/HomePage/ListOfCards";
import { HOME_PAGE_LINKS } from "../utils/HomePageLinks";
import {
  getSelectedMoodImage,
  getSelectedMoodName,
} from "../utils/moodStorage";

const HomePage = () => {
  // State to track selected mood
  const [selectedMoodImage, setSelectedMoodImage] = useState<string | null>(
    getSelectedMoodImage()
  );
  const [selectedMoodName, setSelectedMoodName] = useState<string | null>(
    getSelectedMoodName()
  );

  // Update on mood change
  useEffect(() => {
    const handleMoodChange = () => {
      setSelectedMoodImage(getSelectedMoodImage());
      setSelectedMoodName(getSelectedMoodName());
    };

    // Listen to custom mood change event
    window.addEventListener("moodChanged", handleMoodChange);

    // Also update on mount (in case user returned to the page)
    handleMoodChange();

    return () => {
      window.removeEventListener("moodChanged", handleMoodChange);
    };
  }, []);

  // Update links with selected mood image
  const linksWithMood = useMemo(() => {
    return HOME_PAGE_LINKS.map((link) => {
      // If this is mood card and there's a selected mood, use its image
      if (link.to === "/mood" && selectedMoodImage) {
        return {
          ...link,
          image: selectedMoodImage,
          moodName: selectedMoodName, // Pass mood name to determine effect
        };
      }
      return link;
    });
  }, [selectedMoodImage, selectedMoodName]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <ListOfCards items={linksWithMood} />
    </div>
  );
};
export default HomePage;
