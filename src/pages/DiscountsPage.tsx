"use client"

import type React from "react"
import { useState } from "react"
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip, InputAdornment,
  MenuItem, FormControl, InputLabel, Select, Grid
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, Edit, Delete, Add, Discount as DiscountIcon } from "@mui/icons-material"
import type { Discount } from "../types"

// Mock data
const mockDiscounts: Discount[] = [
  { id: "1", code: "SUMMER2024", type: "percentage", value: 20, description: "خصم صيفي 20%", startDate: "2024-06-01", endDate: "2024-08-31", usageCount: 15, maxUsage: 50, isActive: true, createdAt: "2024-05-01" },
  { id: "2", code: "NEWSTUDENT", type: "fixed", value: 50000, description: "خصم للطلاب الجدد", startDate: "2024-01-01", endDate: "2024-12-31", usageCount: 8, maxUsage: null, isActive: true, createdAt: "2024-01-01" },
]

const DiscountsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts)

  const [discountForm, setDiscountForm] = useState({
    code: "",
    type: "",
    value: "",
    description: "",
    startDate: "",
    endDate: "",
    maxUsage: "",
  })

  const handleOpenDialog = (discount?: Discount) => {
    if (discount) {
      // تعديل خصم موجود
      setEditingId(discount.id)
      setDiscountForm({
        code: discount.code,
        type: discount.type,
        value: discount.value.toString(),
        description: discount.description,
        startDate: discount.startDate,
        endDate: discount.endDate,
        maxUsage: discount.maxUsage ? discount.maxUsage.toString() : "",
      })
    } else {
      // إضافة خصم جديد
      setEditingId(null)
      setDiscountForm({ code: "", type: "", value: "", description: "", startDate: "", endDate: "", maxUsage: "" })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const handleSaveDiscount = () => {
    if (!discountForm.code || !discountForm.type || !discountForm.value) return

    if (editingId) {
      // تحديث الخصم
      setDiscounts(prev =>
        prev.map(d =>
          d.id === editingId
            ? {
                ...d,
                code: discountForm.code.toUpperCase(),
                type: discountForm.type,
                value: Number(discountForm.value),
                description: discountForm.description,
                startDate: discountForm.startDate,
                endDate: discountForm.endDate,
                maxUsage: discountForm.maxUsage ? Number(discountForm.maxUsage) : null,
              }
            : d
        )
      )
    } else {
      // إضافة خصم جديد
      const newDiscount: Discount = {
        id: (discounts.length + 1).toString(),
        code: discountForm.code.toUpperCase(),
        type: discountForm.type,
        value: Number(discountForm.value),
        description: discountForm.description,
        startDate: discountForm.startDate,
        endDate: discountForm.endDate,
        usageCount: 0,
        maxUsage: discountForm.maxUsage ? Number(discountForm.maxUsage) : null,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setDiscounts(prev => [...prev, newDiscount])
    }

    handleCloseDialog()
  }

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(prev => prev.filter(d => d.id !== id))
  }

  const columns: GridColDef[] = [
    { field: "code", headerName: "الكود", width: 150, renderCell: (params) => <Typography sx={{ fontFamily: "monospace", fontWeight: 600 }}>{params.value}</Typography> },
    { field: "description", headerName: "الوصف", flex: 1, minWidth: 200 },
    { field: "type", headerName: "النوع", width: 120, renderCell: (params) => <Chip label={params.value === "percentage" ? "نسبة مئوية" : "مبلغ ثابت"} size="small" color="secondary" /> },
    { field: "value", headerName: "القيمة", width: 120, renderCell: (params) => (params.row.type === "percentage" ? `${params.value}%` : `${params.value.toLocaleString()} د.ع`) },
    { field: "usageCount", headerName: "الاستخدام", width: 120, renderCell: (params) => `${params.value} / ${params.row.maxUsage || "∞"}` },
    { field: "isActive", headerName: "الحالة", width: 100, renderCell: (params) => <Chip label={params.value ? "نشط" : "غير نشط"} size="small" color={params.value ? "success" : "default"} /> },
    {
      field: "actions", headerName: "الإجراءات", width: 120, sortable: false, renderCell: (params) => (
        <Box>
          <IconButton color="primary" size="small" onClick={() => handleOpenDialog(params.row as Discount)}><Edit fontSize="small" /></IconButton>
          <IconButton color="error" size="small" onClick={() => handleDeleteDiscount(params.row.id)}><Delete fontSize="small" /></IconButton>
        </Box>
      )
    },
  ]

  const filteredDiscounts = discounts.filter(d =>
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>الخصومات والأكواد الترويجية</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>إضافة كود خصم</Button>
      </Box>

      <Paper>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="البحث عن كود خصم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ mb: 3 }}
          />
          <DataGrid
            rows={filteredDiscounts}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": { borderColor: "divider" },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "background.default", borderColor: "divider" },
            }}
          />
        </Box>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><DiscountIcon /> {editingId ? "تعديل كود خصم" : "إضافة كود خصم جديد"}</Box></DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="كود الخصم" value={discountForm.code} onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })} placeholder="SUMMER2024" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الخصم</InputLabel>
                  <Select value={discountForm.type} label="نوع الخصم" onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}>
                    <MenuItem value="percentage">نسبة مئوية</MenuItem>
                    <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField fullWidth label="الوصف" value={discountForm.description} onChange={(e) => setDiscountForm({ ...discountForm, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label={discountForm.type === "percentage" ? "النسبة المئوية" : "المبلغ (دينار عراقي)"} type="number" value={discountForm.value} onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="تاريخ البداية" type="date" value={discountForm.startDate} onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="تاريخ النهاية" type="date" value={discountForm.endDate} onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <TextField fullWidth label="الحد الأقصى للاستخدام (اتركه فارغاً لعدد غير محدود)" type="number" value={discountForm.maxUsage} onChange={(e) => setDiscountForm({ ...discountForm, maxUsage: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSaveDiscount} variant="contained">{editingId ? "تحديث" : "إضافة"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DiscountsPage
