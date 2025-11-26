import "../styles/HomePage.scss";
import ListOfCards from "../components/HomePage/ListOfCards";
import { HOME_PAGE_LINKS } from "../utils/HomePageLinks";

const HomePage = () => {
  return <ListOfCards items={HOME_PAGE_LINKS} />;
};
export default HomePage;
