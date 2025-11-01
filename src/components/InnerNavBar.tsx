import React, { useEffect } from 'react'
import { Box, Tabs, Tab, Paper } from '@mui/material'
import { usePermissions } from '../hooks/usePermissions.tsx'

interface TabItem {
  label: string
  value: string
  icon?: React.ReactElement
  count?: number
  permission?: string // إضافة خاصية الصلاحية
  permissions?: string[] // الصلاحيات المتعددة
}

interface InnerNavBarProps {
  tabs: TabItem[]
  value: string
  onChange: (value: string) => void
}

const InnerNavBar: React.FC<InnerNavBarProps> = ({ tabs, value, onChange }) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  // تصفية التبويبات حسب الصلاحيات
  const filteredTabs = tabs.filter(tab => {
    // إذا لم تكن هناك صلاحيات مطلوبة، اعرض التبويب
    if (!tab.permission && !tab.permissions) return true;

    // التحقق من صلاحية واحدة
    if (tab.permission && hasPermission(tab.permission)) return true;

    // التحقق من أي صلاحية من القائمة
    if (tab.permissions && hasAnyPermission(tab.permissions)) return true;

    return false;
  });

  // التحقق مما إذا كان التبويب الحالي لا يزال موجودًا بعد التصفية
  useEffect(() => {
    if (value && filteredTabs.length > 0 && !filteredTabs.some(tab => tab.value === value)) {
      // إذا لم يكن التبويب الحالي موجودًا، قم بالتبديل إلى أول تبويب متاح
      onChange(filteredTabs[0].value);
    }
  }, [value, filteredTabs, onChange]);

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
        {filteredTabs.map((tab) => (
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