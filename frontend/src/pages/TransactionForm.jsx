import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, TextField, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Autocomplete
} from '@mui/material';
import { Save, Add, Delete, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { transactionAPI, partnerAPI, productAPI } from '../api/services';
import { toast } from 'react-toastify';

const TransactionForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('SALE');
    const [partners, setPartners] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        partnerId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        notes: ''
    });
    const [items, setItems] = useState([]);

    // Fetch initial data
    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchPartners();
        setFormData(prev => ({ ...prev, partnerId: '' })); // Reset partner when type changes
    }, [type]);

    const fetchPartners = async () => {
        try {
            let res;
            if (type === 'SALE') {
                res = await partnerAPI.getCustomers();
            } else {
                res = await partnerAPI.getSuppliers();
            }
            setPartners(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch partners');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getProducts({ limit: 1000 }); // Get all products for selection
            setProducts(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { product: null, quantity: 1, unitPrice: 0, subtotal: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === 'product') {
            item.product = value;
            if (value) {
                // Initial price setting
                item.unitPrice = type === 'SALE' ? value.price : value.cost || 0;
            }
        } else {
            item[field] = value;
        }

        // Recalculate subtotal
        item.subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        newItems[index] = item;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.partnerId) return toast.error('Please select a partner');
        if (items.length === 0) return toast.error('Please add at least one item');
        if (items.some(i => !i.product)) return toast.error('Please select product for all items');

        setLoading(true);
        try {
            const payload = {
                type,
                transactionDate: formData.transactionDate,
                status: formData.status,
                notes: formData.notes,
                items: items.map(i => ({
                    product: i.product._id,
                    quantity: Number(i.quantity),
                    unitPrice: Number(i.unitPrice),
                    subtotal: i.subtotal
                })),
                totalAmount: calculateTotal()
            };

            if (type === 'SALE') payload.customer = formData.partnerId;
            else payload.supplier = formData.partnerId;

            await transactionAPI.createTransaction(payload);
            toast.success('Transaction created successfully');
            navigate('/transactions');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="animate-fade-in">
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/transactions')} sx={{ color: 'text.secondary', mb: 2 }}>
                Back to List
            </Button>

            <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 3 }}>
                New {type === 'SALE' ? 'Sales Order' : 'Purchase Order'}
            </Typography>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, borderRadius: 5 }} className="glass-card">
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Transaction Type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            sx={{ '& .MuiInputBase-root': { color: 'white' } }}
                        >
                            <MenuItem value="SALE">Sales Order (Stock Out)</MenuItem>
                            <MenuItem value="PURCHASE">Purchase Order (Stock In)</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label={type === 'SALE' ? 'Customer' : 'Supplier'}
                            value={formData.partnerId}
                            onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' } }}
                        >
                            {partners.map(p => (
                                <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            type="date"
                            fullWidth
                            label="Date"
                            InputLabelProps={{ shrink: true }}
                            value={formData.transactionDate}
                            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' } }}
                        >
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' } }}
                        />
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Items</Typography>
                <TableContainer sx={{ mb: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', width: '40%' }}>Product</TableCell>
                                <TableCell sx={{ color: 'text.secondary', width: '15%' }}>Quantity</TableCell>
                                <TableCell sx={{ color: 'text.secondary', width: '15%' }}>Price</TableCell>
                                <TableCell sx={{ color: 'text.secondary', width: '20%' }}>Subtotal</TableCell>
                                <TableCell sx={{ color: 'text.secondary', width: '10%' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Autocomplete
                                            options={products}
                                            getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                            value={item.product}
                                            onChange={(event, newValue) => handleItemChange(index, 'product', newValue)}
                                            renderInput={(params) => <TextField {...params} variant="standard" placeholder="Select Product" />}
                                            sx={{ '& .MuiInputBase-input': { color: 'white' } }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            variant="standard"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            sx={{ '& .MuiInputBase-input': { color: 'white' } }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            variant="standard"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                            sx={{ '& .MuiInputBase-input': { color: 'white' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: 'white' }}>
                                        ${item.subtotal.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleRemoveItem(index)} color="error">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Button startIcon={<Add />} onClick={handleAddItem} sx={{ mb: 4 }}>
                    Add Item
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: 1, borderColor: 'rgba(255,255,255,0.1)', pt: 3 }}>
                    <Box sx={{ minWidth: 200 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">Total Amount:</Typography>
                            <Typography variant="h6" color="primary">${calculateTotal().toFixed(2)}</Typography>
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Create Transaction'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TransactionForm;
