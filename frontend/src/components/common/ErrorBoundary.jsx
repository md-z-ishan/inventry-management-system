import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Warning } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        bgcolor: '#0f172a',
                        p: 3
                    }}
                >
                    <Paper
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            maxWidth: 500,
                            borderRadius: 4,
                            bgcolor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <Warning sx={{ fontSize: 60, color: '#f59e0b' }} />
                        </Box>
                        <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
                            Something went wrong
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
                            We've encountered an unexpected error. Our team has been notified.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => window.location.reload()}
                                sx={{ color: '#94a3b8', borderColor: '#94a3b8' }}
                            >
                                Reload Page
                            </Button>
                            <Button
                                variant="contained"
                                onClick={this.handleReset}
                                sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#c2410c' } }}
                            >
                                Back to Dashboard
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
