// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    LinearProgress,
    Alert,
    Avatar,
    useTheme
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    QrCodeScanner as QrCodeIcon,
    Add as AddIcon,
    ArrowUpward,
    ArrowDownward,
    Inventory2
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productAPI, inventoryAPI } from '../api/services';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [movementData, setMovementData] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [productsRes, summaryRes, logsRes, lowStockRes] = await Promise.all([
                productAPI.getProducts({ limit: 5 }),
                inventoryAPI.getInventorySummary(),
                inventoryAPI.getInventoryLogs({ limit: 10 }),
                productAPI.getLowStockProducts(),
            ]);

            if (summaryRes.data?.data?.totals) {
                const { totals } = summaryRes.data.data;
                setStats({
                    totalProducts: totals.totalProducts || 0,
                    totalValue: totals.totalValue || 125000,
                    lowStockCount: totals.lowStockProducts || 0,
                    outOfStockCount: totals.outOfStockProducts || 0,
                });
            }

            if (logsRes.data?.data) setRecentActivities(logsRes.data.data);
            if (lowStockRes.data?.data) setLowStockProducts(lowStockRes.data.data);

            const movementRes = await inventoryAPI.getStockMovementAnalysis({ days: 7 });
            if (movementRes.data?.data?.movementAnalysis) {
                prepareChartData(movementRes.data.data.movementAnalysis);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (movementData) => {
        const labels = movementData.map(item => item.date);
        const stockInData = movementData.map(item => item.actions.find(a => a.action === 'STOCK_IN')?.totalQuantity || 0);
        const stockOutData = movementData.map(item => item.actions.find(a => a.action === 'STOCK_OUT')?.totalQuantity || 0);

        setMovementData({
            labels,
            datasets: [
                {
                    label: 'Stock In',
                    data: stockInData,
                    borderColor: '#f97316', // Orange
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
                        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');
                        return gradient;
                    },
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0f172a',
                    pointBorderColor: '#f97316',
                    pointBorderWidth: 2,
                },
                {
                    label: 'Stock Out',
                    data: stockOutData,
                    borderColor: '#3b82f6', // Blue
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                        return gradient;
                    },
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#0f172a',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 2,
                },
            ],
        });
    };

    const StatCard = ({ title, value, icon, gradient, trend, trendLabel }) => (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }} className="glass-card group hover:scale-[1.02] transition-transform duration-300">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-16 -mt-16 transition-opacity group-hover:opacity-20`}></div>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, background: `linear-gradient(to right, #fff, #94a3b8)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {value}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {trend > 0 ? '+' : ''}{trend}%
                                </span>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{trendLabel || "vs last week"}</Typography>
                            </Box>
                        )}
                    </Box>
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                        {React.cloneElement(icon, { sx: { color: 'white' } })}
                    </div>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) return <Box sx={{ width: '100%', mt: 4 }}><LinearProgress color="secondary" /></Box>;

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }} className="animate-fade-in">
                <div>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'white', mb: 1 }}>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Welcome back! Here's what's happening today.
                    </Typography>
                </div>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {(user?.isAdmin || ['admin', 'manager'].includes(user?.role)) ? (
                        <>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/products/new')}
                                sx={{
                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                    color: 'white',
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600
                                }}
                            >
                                New Product
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<QrCodeIcon />}
                                onClick={() => navigate('/inventory/qr-scan')}
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    px: 3,
                                    '&:hover': {
                                        borderColor: '#f97316',
                                        background: 'rgba(249, 115, 22, 0.05)'
                                    }
                                }}
                            >
                                Scan
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            startIcon={<QrCodeIcon />}
                            onClick={() => navigate('/inventory/qr-scan')}
                            size="large"
                            sx={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontWeight: 600,
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
                            }}
                        >
                            Start Scanning
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }} className="animate-fade-in delay-100">
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Products"
                        value={stats.totalProducts}
                        icon={<InventoryIcon />}
                        gradient="from-blue-500 to-indigo-600"
                        trend={12}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Stock Value"
                        value={`$${(stats.totalValue / 1000).toFixed(1)}k`}
                        icon={<TrendingUpIcon />}
                        gradient="from-emerald-400 to-teal-600"
                        trend={8.5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Low Stock Alerts"
                        value={stats.lowStockCount}
                        icon={<WarningIcon />}
                        gradient="from-orange-400 to-red-500"
                        trend={-2.4}
                        trendLabel="increased"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Out of Stock"
                        value={stats.outOfStockCount}
                        icon={<Inventory2 />}
                        gradient="from-pink-500 to-rose-600"
                        trend={0}
                        trendLabel="stable"
                    />
                </Grid>
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3} className="animate-fade-in delay-200">
                {/* Chart Section */}
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 4, height: '100%', borderRadius: 5 }} className="glass-card">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <div>
                                <Typography variant="h6" fontWeight="700" color="white">Inventory Movement</Typography>
                                <Typography variant="caption" color="text.secondary">In vs Out analysis (Last 7 days)</Typography>
                            </div>
                            <IconButton size="small" onClick={fetchDashboardData} sx={{ color: 'text.secondary' }}><RefreshIcon /></IconButton>
                        </Box>
                        <Box sx={{ height: 350 }}>
                            {movementData ? (
                                <Line data={movementData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top', align: 'end', labels: { usePointStyle: true, color: '#94a3b8' } },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            titleColor: '#f8fafc',
                                            bodyColor: '#cbd5e1',
                                            padding: 12,
                                            cornerRadius: 8,
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            borderWidth: 1
                                        }
                                    },
                                    scales: {
                                        y: {
                                            border: { display: false },
                                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                            ticks: { color: '#64748b' }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { color: '#64748b' }
                                        }
                                    },
                                    elements: {
                                        point: { radius: 0, hitRadius: 10, hoverRadius: 4 }
                                    }
                                }} />
                            ) : (
                                <Box display="flex" alignItems="center" justifyContent="center" height="100%"><Typography color="text.secondary">No data available</Typography></Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Low Stock Side Panel */}
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 5 }} className="glass-card">
                        <Typography variant="h6" fontWeight="700" color="white" gutterBottom>Critical Stock</Typography>
                        <Typography variant="caption" color="text.secondary" paragraph>Items needing immediate attention</Typography>

                        {lowStockProducts.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {lowStockProducts.slice(0, 5).map((product) => (
                                    <Box key={product._id} sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                                    }}>
                                        <Avatar variant="rounded" src={product.image} alt={product.name} sx={{ width: 48, height: 48, bgcolor: 'rgba(249, 115, 22, 0.1)', color: 'primary.main' }}>
                                            {product.name?.[0]}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" fontWeight="600" color="white">{product.name}</Typography>
                                            <Typography variant="caption" color="error.main" fontWeight="600">{product.quantity} units left</Typography>
                                        </Box>
                                        <Button size="small" variant="text" color="primary" onClick={() => navigate(`/products/${product._id}`)}>Order</Button>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            <Alert severity="success" variant="outlined" sx={{ mt: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none' }}>All stock levels are healthy!</Alert>
                        )}
                        <Button fullWidth variant="outlined" sx={{ mt: 3, borderRadius: 3, borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary' }} onClick={() => navigate('/products?status=low_stock')}>View Full Report</Button>
                    </Paper>
                </Grid>

                {/* Recent Activity Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 5 }} className="glass-card">
                        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <Typography variant="h6" fontWeight="700" color="white">Recent Transactions</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                                    <TableRow>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Product</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Action</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Quantity</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>User</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Time</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentActivities.map((log) => (
                                        <TableRow key={log._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>{log.product?.name?.[0]}</Avatar>
                                                    <Typography variant="body2" fontWeight="500" color="white">{log.product?.name || 'Unknown Product'}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Chip
                                                    icon={log.action === 'STOCK_IN' ? <ArrowUpward sx={{ fontSize: '14px !important' }} /> : <ArrowDownward sx={{ fontSize: '14px !important' }} />}
                                                    label={log.action === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: log.action === 'STOCK_IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: log.action === 'STOCK_IN' ? '#34d399' : '#f87171',
                                                        border: 'none',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.primary', borderColor: 'rgba(255,255,255,0.05)' }}>{log.quantity}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{log.performedByName}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                <Chip label="Completed" size="small" sx={{ height: 24, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {recentActivities.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>No recent activity found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;