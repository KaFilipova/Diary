import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

type Notification = {
  id: number;
  message: string;
  severity: AlertColor;
};

type NotificationContextValue = {
  notify: (message: string, severity?: AlertColor) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Notification | null>(null);

  const showNext = () => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    setOpen(true);
  };

  const notify = (message: string, severity: AlertColor = "info") => {
    setQueue((prev) => [...prev, { id: Date.now(), message, severity }]);
  };

  // Listen to global events from utils
  useEffect(() => {
    const handleInfo = (event: Event) => {
      const custom = event as CustomEvent<string>;
      notify(custom.detail, "info");
    };
    const handleError = (event: Event) => {
      const custom = event as CustomEvent<string>;
      notify(custom.detail, "error");
    };
    window.addEventListener("appInfo", handleInfo);
    window.addEventListener("appError", handleError);
    return () => {
      window.removeEventListener("appInfo", handleInfo);
      window.removeEventListener("appError", handleError);
    };
  }, []);

  useEffect(() => {
    showNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, current]);

  const handleClose = () => {
    setOpen(false);
    setCurrent(null);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={current?.severity || "info"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export default NotificationProvider;



