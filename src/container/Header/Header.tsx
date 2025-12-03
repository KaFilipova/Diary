import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Tooltip,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { NavLink, useLocation } from "react-router-dom";
import logoImage from "../../assets/images/logo.png";
import Navigation from "../../components/Navigation/Navigation";
import LegoButton from "../../components/LegoButton/LegoButton";

function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "calendar-popover" : undefined;

  // Get today's date
  const today = new Date();
  // Format date as DD.MM.YYYY
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;

  // Format date for calendar input (YYYY-MM-DD)
  const dateForInput = today.toISOString().split("T")[0];

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
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tooltip followCursor title="Diary - your daily balance">
            <NavLink to="/" style={{ marginTop: "5px", display: "block" }}>
              <img
                src={logoImage}
                alt="logo"
                style={{ height: 70, width: 75 }}
              />
            </NavLink>
          </Tooltip>
        </Box>
        {!isHomePage && <Navigation />}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: "0 0 auto",
          }}
        >
          {/* Statistics button */}
          <LegoButton text="Statistics" to="/table" size="small" />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Tooltip title="Open calendar">
              <IconButton
                onClick={handleClick}
                aria-describedby={id}
                sx={{ color: "text.primary" }}
              >
                <CalendarTodayIcon />
              </IconButton>
            </Tooltip>
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "block" },
                color: "text.primary",
                fontWeight: 500,
                fontSize: "0.75rem",
              }}
            >
              {formattedDate}
            </Typography>
          </Box>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Box sx={{ p: 2, minWidth: 300 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                Calendar
              </Typography>
              <input
                type="date"
                value={dateForInput}
                onChange={(e) => {
                  // Can add date change logic here
                  console.log("Selected date:", e.target.value);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
              <Typography
                variant="body2"
                sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
              >
                Today: {formattedDate}
              </Typography>
            </Box>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
