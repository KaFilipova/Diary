import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/index.scss";
import App from "./App/App";
import { CssBaseline } from "@mui/material";
import NotificationProvider from "./components/Notifications/NotificationProvider";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <ErrorBoundary>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
