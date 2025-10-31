
import React from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from "@mui/material"
import { useExchangeRate } from "../../context/ExchangeRateContext"

interface ExchangeRateDialogProps {
  open: boolean
  onClose: () => void
}

const ExchangeRateDialog: React.FC<ExchangeRateDialogProps> = ({ open, onClose }) => {
  const { exchangeRate: currentRate, setExchangeRate } = useExchangeRate()
  const [tempExchangeRate, setTempExchangeRate] = React.useState(currentRate.toString())
  const [error, setError] = React.useState("")

  const handleSave = () => {
    const rate = parseFloat(tempExchangeRate)
    if (!isNaN(rate) && rate > 0) {
      setExchangeRate(rate)
      onClose()
    } else {
      setError("الرجاء إدخال سعر صرف صحيح أكبر من صفر")
    }
  }

  React.useEffect(() => {
    setTempExchangeRate(currentRate.toString())
    setError("")
  }, [currentRate, open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>حساب سعر الصرف</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="سعر الصرف (دولار إلى دينار عراقي)"
          type="number"
          value={tempExchangeRate}
          onChange={(e) => setTempExchangeRate(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            معلومات سعر الصرف الحالي:
          </Typography>
          <Typography variant="body1">
            1 دولار أمريكي = {currentRate.toLocaleString()} دينار عراقي
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            يتم استخدام هذا السعر في جميع حسابات العملة
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>إغلاق</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          حفظ
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExchangeRateDialog
