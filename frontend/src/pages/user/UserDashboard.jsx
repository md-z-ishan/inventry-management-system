import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    QrCodeScanner as QrCodeIcon,
    Inventory2,
    TrendingUp,
    TrendingDown,
    Warning
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI, inventoryAPI } from '../../api/services';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStock: 0,
        recentTransactions: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [productsRes, logsRes, lowStockRes] = await Promise.all([
                productAPI.getProducts({ limit: 5 }),
                inventoryAPI.getInventoryLogs({ limit: 5 }),
                productAPI.getLowStockProducts()
            ]);

            setStats({
                totalProducts: productsRes.data?.total || 0,
                lowStock: lowStockRes.data?.count || 0,
                recentTransactions: logsRes.data?.total || 0
            });

            if (logsRes.data?.data) {
                setRecentActivity(logsRes.data.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="animate-fade-in">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" sx={{ color: 'white', mb: 1 }}>
                    Welcome Back! 👋
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Staff Dashboard - Quick operations at your fingertips
                </Typography>
            </Box>

            {/* Primary Action - Scan QR */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    textAlign: 'center'
                }}
            >
                <QrCodeIcon sx={{ fontSize: 64, color: 'white', mb: 2 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                    Scan Product QR Code
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                    Quickly update stock levels by scanning product QR codes
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/user/scan')}
                    sx={{
                        bgcolor: 'white',
                        color: '#f97316',
                        fontWeight: 700,
                        px: 6,
                        py: 1.5,
                        fontSize: '1.1rem',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)'
                        }
                    }}
                >
                    Start Scanning
                </Button>
            </Paper>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#1e293b', borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2 }}>
                                    <Inventory2 sx={{ color: '#3b82f6', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                        {stats.totalProducts}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Total Products
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#1e293b', borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                                    <Warning sx={{ color: '#ef4444', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                        {stats.lowStock}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Low Stock Items
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#1e293b', borderRadius: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', borderRadius: 2 }}>
                                    <TrendingUp sx={{ color: '#22c55e', fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                        {stats.recentTransactions}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Total Transactions
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Activity */}
            <Paper sx={{ borderRadius: 4, bgcolor: '#1e293b' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        Recent Activity
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary' }}>Action</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>Product</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>Quantity</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : recentActivity.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No recent activity
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentActivity.map((log, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Chip
                                                label={log.action}
                                                size="small"
                                                icon={log.action === 'STOCK_IN' ? <TrendingUp /> : <TrendingDown />}
                                                sx={{
                                                    bgcolor: log.action === 'STOCK_IN'
                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                        : 'rgba(239, 68, 68, 0.1)',
                                                    color: log.action === 'STOCK_IN' ? '#22c55e' : '#ef4444'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'white' }}>
                                            {log.product?.name || 'Unknown Product'}
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {log.quantity} {log.product?.unit || 'units'}
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default UserDashboard;
