import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onStay: () => void;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  onStay,
}) => {
  return (
    <Dialog open={open} onClose={onStay}>
      <DialogTitle>تأكيد الإلغاء</DialogTitle>
      <DialogContent>
        <Typography>
          لديك تغييرات لم يتم حفظها. هل أنت متأكد من أنك تريد المتابعة دون حفظ؟
          سيتم فقدان جميع التغييرات.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onStay} color="primary">
          البقاء والمتابعة
        </Button>
        <Button onClick={onCancel} color="secondary">
          البقاء وحفض التغييرات
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          تجاهل التغييرات
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
