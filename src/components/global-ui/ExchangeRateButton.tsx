
import React, { useState } from "react"
import { IconButton, Tooltip } from "@mui/material"
import { CurrencyExchange } from "@mui/icons-material"
import ExchangeRateDialog from "./ExchangeRateDialog"

const ExchangeRateButton: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip title="حساب سعر الصرف">
        <IconButton
          onClick={() => setOpen(true)}
          color="primary"
          size="small"
        >
          <CurrencyExchange />
        </IconButton>
      </Tooltip>

      <ExchangeRateDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default ExchangeRateButton
