import React from 'react'
import { Box, Tabs, Tab, Paper } from '@mui/material'

interface TabItem {
  label: string
  value: string
  icon?: React.ReactElement
  count?: number
}

interface InnerNavBarProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
}

const InnerNavBar: React.FC<InnerNavBarProps> = ({ tabs, value, onChange }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        mb: 3,
        bgcolor: 'background.paper'
      }}
    >
      <Tabs 
        value={value} 
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
          },
          '& .Mui-selected': {
            color: 'error.main',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'error.main',
            height: 3,
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Box
                    sx={{
                      bgcolor: value === tab.value ? 'error.main' : 'grey.300',
                      color: value === tab.value ? 'white' : 'text.secondary',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      ml: 0.5
                    }}
                  >
                    {tab.count}
                  </Box>
                )}
              </Box>
            }
            value={tab.value}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Paper>
  )
}

export default InnerNavBar
