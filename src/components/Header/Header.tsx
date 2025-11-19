import { NavLink } from "react-router-dom";
import "./Header.scss";

function Header() {
  return (
    <header>
      <h1>Дневник</h1>
      <nav>
        <NavLink to="/">Главная</NavLink>
        <NavLink to="/mood">Настроение</NavLink>
        <NavLink to="/energy">Енергия</NavLink>
      </nav>
    </header>
  );
}

export default Header;
