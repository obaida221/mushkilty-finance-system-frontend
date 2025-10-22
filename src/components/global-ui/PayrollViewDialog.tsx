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
  Card,
  CardContent,
} from "@mui/material"
import { AccountBalance, Person, Schedule, CheckCircle, Payment } from "@mui/icons-material"
import type { Payroll } from "../../types"

interface PayrollViewDialogProps {
  open: boolean
  onClose: () => void
  payroll: Payroll | null
}

const PayrollViewDialog: React.FC<PayrollViewDialogProps> = ({
  open,
  onClose,
  payroll
}) => {
  if (!payroll) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatCurrency = (amount: string, currency: string) => {
    const parsedAmount = parseFloat(amount)
    const formattedAmount = parsedAmount.toLocaleString()
    const currencySymbol = currency === "USD" ? "$" : "د.ع"
    return `${formattedAmount} ${currencySymbol}`
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalance color="primary" />
          تفاصيل الراتب
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* User Info Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Person color="primary" />
                  معلومات الموظف
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      الاسم
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {payroll.user?.name || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      البريد الإلكتروني
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {payroll.user?.email || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      الدور
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {payroll.user?.role?.name || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      معرّف المستخدم
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      #{payroll.user_id}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Payroll Details Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Payment color="primary" />
                  تفاصيل الراتب
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      المبلغ
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      {formatCurrency(payroll.amount, payroll.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      الحالة
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={payroll.paid_at ? "مدفوع" : "معلق"}
                        size="small"
                        color={payroll.paid_at ? "success" : "warning"}
                        icon={payroll.paid_at ? <CheckCircle fontSize="small" /> : <Schedule fontSize="small" />}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      بداية الفترة
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {payroll.period_start ? new Date(payroll.period_start).toLocaleDateString("ar-IQ") : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      نهاية الفترة
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {payroll.period_end ? new Date(payroll.period_end).toLocaleDateString("ar-IQ") : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الدفع
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(payroll.paid_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      معرّف الراتب
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      #{payroll.id}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes Card */}
          {payroll.note && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    ملاحظات
                  </Typography>
                  <Typography variant="body1">
                    {payroll.note}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Timestamps Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    معلومات النظام
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      تاريخ الإنشاء
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(payroll.created_at)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      آخر تحديث
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatDate(payroll.updated_at)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PayrollViewDialog
