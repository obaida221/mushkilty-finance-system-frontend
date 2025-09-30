import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  type SelectChangeEvent,
} from "@mui/material"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Search, TrendingUp, TrendingDown, Receipt, AccountBalance } from "@mui/icons-material"
import type { Transaction } from "../types"

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "payment",
    amount: 500000,
    description: "دفعة من الطالب علي أحمد - دورة البرمجة",
    date: "2024-03-15",
    referenceId: "PAY001",
    createdBy: "1",
    createdAt: "2024-03-15T10:30:00",
  },
  {
    id: "2",
    type: "expense",
    amount: 150000,
    description: "فواتير الكهرباء والماء",
    date: "2024-03-14",
    referenceId: "EXP001",
    createdBy: "1",
    createdAt: "2024-03-14T14:20:00",
  },
  {
    id: "3",
    type: "payroll",
    amount: 1000000,
    description: "راتب د. محمد أحمد - مارس 2024",
    date: "2024-03-01",
    referenceId: "PAY001",
    createdBy: "1",
    createdAt: "2024-03-01T09:00:00",
  },
  {
    id: "4",
    type: "payment",
    amount: 400000,
    description: "دفعة من الطالبة سارة محمد - دورة التصميم",
    date: "2024-03-13",
    referenceId: "PAY002",
    createdBy: "2",
    createdAt: "2024-03-13T11:15:00",
  },
  {
    id: "5",
    type: "refund",
    amount: 100000,
    description: "استرجاع مبلغ للطالب حسن علي",
    date: "2024-03-12",
    referenceId: "REF001",
    createdBy: "1",
    createdAt: "2024-03-12T16:45:00",
  },
]

const TransactionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [transactions] = useState<Transaction[]>(mockTransactions)

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <TrendingUp sx={{ fontSize: 18 }} />
      case "expense":
        return <TrendingDown sx={{ fontSize: 18 }} />
      case "refund":
        return <Receipt sx={{ fontSize: 18 }} />
      case "payroll":
        return <AccountBalance sx={{ fontSize: 18 }} />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payment: "دفعة",
      expense: "مصروف",
      refund: "مرتجع",
      payroll: "راتب",
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string): "success" | "error" | "warning" | "info" => {
    const colors: Record<string, "success" | "error" | "warning" | "info"> = {
      payment: "success",
      expense: "error",
      refund: "warning",
      payroll: "info",
    }
    return colors[type] || "info"
  }

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "التاريخ",
      width: 120,
    },
    {
      field: "type",
      headerName: "النوع",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {getTypeIcon(params.value)}
          <Chip label={getTypeLabel(params.value)} size="small" color={getTypeColor(params.value)} />
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "الوصف",
      flex: 2,
      minWidth: 250,
    },
    {
      field: "amount",
      headerName: "المبلغ",
      width: 150,
      renderCell: (params) => {
        const row = params.row as Transaction
        const isIncome = row.type === "payment"
        return (
          <Typography color={isIncome ? "success.main" : "error.main"} sx={{ fontWeight: 600 }}>
            {isIncome ? "+" : "-"}
            {params.value.toLocaleString()} د.ع
          </Typography>
        )
      },
    },
    {
      field: "referenceId",
      headerName: "رقم المرجع",
      width: 130,
    },
  ]

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceId?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalIncome = transactions.filter((t) => t.type === "payment").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses =
    transactions.filter((t) => t.type === "expense" || t.type === "payroll").reduce((sum, t) => sum + t.amount, 0) +
    transactions.filter((t) => t.type === "refund").reduce((sum, t) => sum + t.amount, 0)

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        المعاملات المالية
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Paper sx={{ p: 3, flex: 1, minWidth: 250 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "success.main", p: 1.5, borderRadius: 2 }}>
              <TrendingUp sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                إجمالي الدخل
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                {totalIncome.toLocaleString()} د.ع
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, minWidth: 250 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "error.main", p: 1.5, borderRadius: 2 }}>
              <TrendingDown sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                إجمالي المصروفات
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "error.main" }}>
                {totalExpenses.toLocaleString()} د.ع
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, minWidth: 250 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "primary.main", p: 1.5, borderRadius: 2 }}>
              <AccountBalance sx={{ color: "white" }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                صافي الربح
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {(totalIncome - totalExpenses).toLocaleString()} د.ع
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Paper>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <TextField
              placeholder="البحث في المعاملات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 250 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>نوع المعاملة</InputLabel>
              <Select value={typeFilter} label="نوع المعاملة" onChange={handleTypeFilterChange}>
                <MenuItem value="all">جميع المعاملات</MenuItem>
                <MenuItem value="payment">الدفعات</MenuItem>
                <MenuItem value="expense">المصروفات</MenuItem>
                <MenuItem value="refund">المرتجعات</MenuItem>
                <MenuItem value="payroll">الرواتب</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: "date", sort: "desc" }],
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderColor: "divider",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "background.default",
                borderColor: "divider",
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default TransactionsPage
