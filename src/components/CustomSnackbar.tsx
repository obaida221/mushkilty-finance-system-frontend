import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose?: () => void;
  autoHideDuration?: number;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 4000,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
    >
      <Alert
        severity={severity}
        sx={{ width: "100%" }}
        onClose={handleClose}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
