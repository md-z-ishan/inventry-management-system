import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useTheme, Chip, LinearProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { partnerAPI } from '../api/services';
import { toast } from 'react-toastify';

const CustomerList = () => {
    const theme = useTheme();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await partnerAPI.getCustomers();
            setCustomers(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (customer = null) => {
        if (customer) {
            setEditingId(customer._id);
            setFormData({
                name: customer.name,
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || ''
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await partnerAPI.updateCustomer(editingId, formData);
                toast.success('Customer updated');
            } else {
                await partnerAPI.createCustomer(formData);
                toast.success('Customer created');
            }
            setOpenDialog(false);
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await partnerAPI.deleteCustomer(id);
                toast.success('Customer deleted');
                fetchCustomers();
            } catch (error) {
                toast.error('Failed to delete customer');
            }
        }
    };

    return (
        <Box className="animate-fade-in">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>Customers</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>Manage your customer base</Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white', px: 3, py: 1.5, borderRadius: 3, fontWeight: 600
                    }}
                >
                    Add Customer
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 5, overflow: 'hidden' }} className="glass-card">
                {loading && <LinearProgress color="secondary" />}
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Phone</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Total Spent</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                    <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.05)' }}>{customer.name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{customer.email || '-'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{customer.phone || '-'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>${customer.totalSpent || 0}</TableCell>
                                    <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <IconButton size="small" onClick={() => handleOpen(customer)} sx={{ color: 'primary.main' }}><Edit fontSize="small" /></IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(customer._id)} sx={{ color: 'error.main' }}><Delete fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>No customers found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ color: 'white' }}>{editingId ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
                        <TextField
                            label="Name" fullWidth variant="outlined" value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        />
                        <TextField
                            label="Email" fullWidth variant="outlined" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        />
                        <TextField
                            label="Phone" fullWidth variant="outlined" value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        />
                        <TextField
                            label="Address" fullWidth variant="outlined" multiline rows={2} value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: 'primary.main' }}>{editingId ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CustomerList;
