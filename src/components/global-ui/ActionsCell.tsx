"use client"

import React from "react"
import { Box, Button, IconButton, Tooltip } from "@mui/material"
import { Edit, Delete, Visibility } from "@mui/icons-material"

interface ActionsCellProps {
  rowId: number
  row: any
  onEdit?: (row: any) => void
  onDelete?: (id: number) => void
  onView?: (row: any) => void
  editButton?: boolean
  deleteButton?: boolean
  viewButton?: boolean
  customActions?: React.ReactNode
  actionType?: "buttons" | "icons"
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  rowId,
  row,
  onEdit,
  onDelete,
  onView,
  editButton = true,
  deleteButton = true,
  viewButton = false,
  customActions = null,
  actionType = "buttons"
}) => {
  const handleEdit = () => {
    if (onEdit) onEdit(row)
  }

  const handleDelete = () => {
    if (onDelete) onDelete(rowId)
  }

  const handleView = () => {
    if (onView) onView(row)
  }

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {viewButton && 
        <Tooltip title="عرض التفاصيل">
          <IconButton size="small" color="primary" onClick={handleView}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      }

      {editButton && 
        <Tooltip title="تعديل">
          <IconButton 
            size="small" 
            color="primary" 
              onClick={handleEdit}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      }

      {deleteButton &&
        <Tooltip title="حذف">
          <IconButton
            size="small"
            color="error"
            onClick={handleDelete}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
        }

      {customActions}
    </Box>
  )
}

export default ActionsCell
