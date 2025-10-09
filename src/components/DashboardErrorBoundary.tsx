import React, { Component, ReactNode } from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';
import { RefreshOutlined } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              خطأ في تحميل لوحة التحكم
            </Typography>
            <Typography variant="body2" gutterBottom>
              حدث خطأ غير متوقع أثناء تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.
            </Typography>
            {this.state.error && (
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {this.state.error.message}
              </Typography>
            )}
          </Alert>
          <Button
            variant="contained"
            startIcon={<RefreshOutlined />}
            onClick={this.handleRetry}
          >
            إعادة تحميل الصفحة
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;