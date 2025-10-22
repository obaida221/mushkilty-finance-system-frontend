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
  Grid,
  Divider,
  Chip,
} from "@mui/material"
import { Visibility } from "@mui/icons-material"

interface FieldConfig {
  key: string
  label: string
  formatter?: (value: any) => string | React.ReactNode
  chip?: boolean
  chipColor?: "primary" | "secondary" | "success" | "error" | "warning" | "info"
}

interface ViewRowDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  data: any
  fields: FieldConfig[]
  loading?: boolean
}

const ViewRowDialog: React.FC<ViewRowDialogProps> = ({
  open,
  onClose,
  title = "عرض البيانات",
  data,
  fields,
  loading = false
}) => {
  const renderValue = (field: FieldConfig) => {
    const value = data[field.key]

    if (value === null || value === undefined || value === "") {
      return "-"
    }

    if (field.formatter) {
      return field.formatter(value)
    }

    if (field.chip) {
      return (
        <Chip
          label={value}
          size="small"
          color={field.chipColor || "primary"}
        />
      )
    }

    return typeof value === "object" ? JSON.stringify(value) : String(value)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Visibility />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {fields.map((field, index) => (
            <Grid item xs={12} sm={6} key={field.key}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {field.label}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {renderValue(field)}
              </Typography>
              {index < fields.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewRowDialog
