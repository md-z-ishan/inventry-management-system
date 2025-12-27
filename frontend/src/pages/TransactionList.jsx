import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, LinearProgress, InputBase, Tooltip, Avatar
} from '@mui/material';
import {
    Add, Visibility, Search, ShoppingCart, Sell,
    ReceiptLong
} from '@mui/icons-material';
import { transactionAPI } from '../api/services';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TransactionList = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0: All, 1: Purchase, 2: Sale
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            let type = '';
            if (tabValue === 1) type = 'PURCHASE';
            if (tabValue === 2) type = 'SALE';

            const res = await transactionAPI.getTransactions({ type });
            setTransactions(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [tabValue]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getStatusColor = (status) => {
        if (status === 'COMPLETED') return 'success';
        if (status === 'PENDING') return 'warning';
        return 'error';
    };

    const StatusChip = ({ status }) => {
        const color = getStatusColor(status);
        const bgColors = {
            success: 'rgba(34, 197, 94, 0.1)',
            warning: 'rgba(234, 179, 8, 0.1)',
            error: 'rgba(239, 68, 68, 0.1)'
        };
        const textColors = {
            success: '#4ade80',
            warning: '#facc15',
            error: '#f87171'
        };

        return (
            <Chip
                label={status}
                size="small"
                sx={{
                    bgcolor: bgColors[color],
                    color: textColors[color],
                    border: '1px solid',
                    borderColor: `${textColors[color]}40`,
                    fontWeight: 600,
                    borderRadius: '6px'
                }}
            />
        );
    };

    const filteredTransactions = transactions.filter(t =>
        t.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.supplier?.name || t.customer?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box className="animate-fade-in">
            {/* Header Section */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2, mb: 4 }}>
                <div>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <ReceiptLong sx={{ fontSize: 40, color: 'primary.main', filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.3))' }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Transactions
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.secondary', ml: 1 }}>
                        Manage purchases, sales, and financial records
                    </Typography>
                </div>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/transactions/new')}
                        sx={{
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            color: 'white', px: 3, py: 1.5, borderRadius: 3, fontWeight: 600,
                            boxShadow: '0 10px 20px -5px rgba(249, 115, 22, 0.4)',
                            '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', transform: 'translateY(-2px)' },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        New Transaction
                    </Button>
                </Box>
            </Box>

            {/* Main Content Card */}
            <Paper className="glass-card" sx={{ borderRadius: 5, overflow: 'hidden', p: 0 }}>
                {/* Toolbar */}
                <Box sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 3,
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {/* Custom Tabs */}
                    <Box sx={{ bgcolor: 'rgba(15, 23, 42, 0.4)', p: 0.5, borderRadius: 3, display: 'inline-flex' }}>
                        {['All Transactions', 'Purchases', 'Sales'].map((label, index) => (
                            <Box
                                key={index}
                                onClick={(e) => handleTabChange(e, index)}
                                sx={{
                                    px: 3, py: 1, borderRadius: 2.5, cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    bgcolor: tabValue === index ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: tabValue === index ? 'white' : 'text.secondary',
                                    fontWeight: tabValue === index ? 600 : 500,
                                    '&:hover': { color: 'white' }
                                }}
                            >
                                {label}
                            </Box>
                        ))}
                    </Box>

                    {/* Search Bar */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center',
                        bgcolor: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3, px: 2, py: 0.5, width: { xs: '100%', md: 300 }
                    }}>
                        <Search sx={{ color: 'text.secondary', mr: 1 }} />
                        <InputBase
                            placeholder="Search invoice or partner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ color: 'white', width: '100%' }}
                        />
                    </Box>
                </Box>

                {loading && <LinearProgress color="primary" sx={{ bgcolor: 'transparent' }} />}

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)' }}>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>DATE & INVOICE</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>TYPE</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>PARTNER</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>AMOUNT</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>STATUS</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions.map((transaction) => (
                                <TableRow
                                    key={transaction._id}
                                    hover
                                    sx={{
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03) !important' },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                                {transaction.invoiceNumber}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {new Date(transaction.transactionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                variant="rounded"
                                                sx={{
                                                    width: 32, height: 32,
                                                    bgcolor: transaction.type === 'SALE' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                                                    color: transaction.type === 'SALE' ? 'info.main' : 'primary.main'
                                                }}
                                            >
                                                {transaction.type === 'SALE' ? <Sell fontSize="small" /> : <ShoppingCart fontSize="small" />}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                {transaction.type}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                            {transaction.supplier ? transaction.supplier.name : (transaction.customer ? transaction.customer.name : '-')}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {transaction.supplier ? 'Supplier' : (transaction.customer ? 'Customer' : '')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 700,
                                                color: transaction.type === 'SALE' ? '#4ade80' : '#fb923c'
                                            }}
                                        >
                                            ${transaction.totalAmount.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <StatusChip status={transaction.status} />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/transactions/${transaction._id}`)}
                                                sx={{
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'primary.main', bgcolor: 'rgba(249, 115, 22, 0.1)' }
                                                }}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8, borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.5 }}>
                                            <ReceiptLong sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                                No transactions found
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                                                {searchTerm ? `No results for "${searchTerm}"` : "Create a new transaction to get started"}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default TransactionList;
