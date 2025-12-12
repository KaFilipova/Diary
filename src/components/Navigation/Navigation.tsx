import { Box, Button } from "@mui/material";
import { NavLink } from "react-router-dom";
import { HOME_PAGE_LINKS } from "../../utils/HomePageLinks";

const styles = {
  color: "rgb(94, 47, 3)",
  fontWeight: 500,
  textTransform: "none",
  fontSize: "1rem",
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(94, 47, 3, 0.1)",
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(2px)",
  },
  "&:focus": {
    outline: "none",
  },
  "&:focus-visible": {
    outline: "none",
  },
  "&.active": {
    backgroundColor: "rgba(94, 47, 3, 0.2)",
    fontWeight: 600,
  },
};

const Navigation = () => {
  return (
    <Box
      component="nav"
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        gap: "0.5rem",
        alignItems: "center",
      }}
    >
      {HOME_PAGE_LINKS.map((link) => (
        <Button key={link.to} component={NavLink} to={link.to} sx={styles}>
          {link.label}
        </Button>
      ))}
    </Box>
  );
};

export default Navigation;
