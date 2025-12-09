import moodGoodImage from "../assets/images/mood-good.png";
import todoImage from "../assets/images/todo.png";

export const HOME_PAGE_LINKS = [
  {
    to: "/mood",
    label: "Mood and Energy",
    description: "Go to mood and energy scale",
    image: moodGoodImage,
  },
  {
    to: "/todo",
    label: "Todo List",
    description: "Manage your tasks and plans",
    image: todoImage,
  },
  {
    to: "/calories",
    label: "Calories Consumed",
    description: "Track your calorie intake",
  },
];
