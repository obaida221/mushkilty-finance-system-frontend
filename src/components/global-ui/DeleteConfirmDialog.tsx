"use client"

import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material"
import { Warning } from "@mui/icons-material"

interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  itemName?: string
  loading?: boolean
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من حذف هذا العنصر؟",
  itemName,
  loading = false
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          {message}
          {itemName && (
            <Box component="span" sx={{ fontWeight: 600 }}>
              {" "}{itemName}
            </Box>
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={loading}
        >
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmDialog
