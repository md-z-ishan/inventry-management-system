import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, LinearProgress, Tabs, Tab
} from '@mui/material';
import { Add, Visibility, FilterList } from '@mui/icons-material';
import { transactionAPI } from '../api/services';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TransactionList = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0: All, 1: Purchase, 2: Sale

    useEffect(() => {
        fetchTransactions();
    }, [tabValue]);

    const fetchTransactions = async () => {
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
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getStatusColor = (status) => {
        if (status === 'COMPLETED') return 'success';
        if (status === 'PENDING') return 'warning';
        return 'error';
    };

    return (
        <Box className="animate-fade-in">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>Transactions</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>Track your purchases and sales</Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/transactions/new')}
                    sx={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white', px: 3, py: 1.5, borderRadius: 3, fontWeight: 600
                    }}
                >
                    New Transaction
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 5, overflow: 'hidden' }} className="glass-card">
                <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                        <Tab label="All Transactions" sx={{ color: 'text.secondary' }} />
                        <Tab label="Purchase Orders" sx={{ color: 'text.secondary' }} />
                        <Tab label="Sales Orders" sx={{ color: 'text.secondary' }} />
                    </Tabs>
                </Box>

                {loading && <LinearProgress color="secondary" />}

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Invoice #</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Partner</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Status</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 500, borderColor: 'rgba(255,255,255,0.05)' }}>
                                        {transaction.invoiceNumber}
                                    </TableCell>
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            label={transaction.type}
                                            size="small"
                                            color={transaction.type === 'SALE' ? 'info' : 'secondary'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                        {transaction.supplier ? transaction.supplier.name : (transaction.customer ? transaction.customer.name : '-')}
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)' }}>
                                        ${transaction.totalAmount.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <Chip
                                            label={transaction.status}
                                            size="small"
                                            color={getStatusColor(transaction.status)}
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <IconButton size="small" onClick={() => navigate(`/transactions/${transaction._id}`)} sx={{ color: 'primary.main' }}>
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>No transactions found</TableCell>
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
