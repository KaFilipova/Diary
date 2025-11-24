import { AppBar, Toolbar, Box, Tooltip, IconButton } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { NavLink } from "react-router-dom";
import logoImage from "../../assets/images/diary_logo.png";
import Navigation from "../../components/Navigation/Navigation";

function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        display: "flex",
        minHeight: "70px",
        backgroundColor: "rgba(176, 177, 153, 0.94)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "70px",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ flex: "0 0 auto" }}>
          <Tooltip followCursor title="Дневник - твой ежедневный балланс">
            <NavLink to="/">
              <img
                src={logoImage}
                alt="logo"
                style={{ height: 38, width: 48 }}
              />
            </NavLink>
          </Tooltip>
        </Box>
        <Navigation />
        <Box sx={{ flex: "0 0 auto" }}>
          <IconButton>
            <CalendarTodayIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
