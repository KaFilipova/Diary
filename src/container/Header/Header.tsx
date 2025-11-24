import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { NavLink } from "react-router-dom";
import logoImage from "../../assets/images/diary_logo.png";
import "./Header.scss";
import SportsGymnasticsSharpIcon from "@mui/icons-material/SportsGymnasticsSharp";

function Header() {
  return (
    <>
      <AppBar
        position="static"
        sx={{
          minHeight: "70px",
          backgroundColor: "rgba(176, 177, 153, 0.94)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: "70px",
            padding: "0 2rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img src={logoImage} alt="logo" style={{ height: 38, width: 48 }} />
          <Box
            component="nav"
            sx={{
              display: "flex",
              gap: "1.5rem",
              padding: "1rem 2rem",
              backgroundColor: "rgba(176, 177, 153, 0.94)",
              justifyContent: "center",
            }}
          >
            <NavLink to="/">Главная</NavLink>
            <NavLink to="/mood">Настроение</NavLink>
            <NavLink to="/todo">Список задач</NavLink>
            <NavLink to="/calories">Употреблено калорий</NavLink>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.5rem",
              fontWeight: 600,
              flexGrow: 1,
              color: "rgb(94, 47, 3)",
            }}
          >
            Дневник - твой ежедневный балланс <SportsGymnasticsSharpIcon />
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Header;
