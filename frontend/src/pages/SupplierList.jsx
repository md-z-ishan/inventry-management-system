import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { partnerAPI } from '../api/services';
import { toast } from 'react-toastify';

const SupplierList = () => {
    // const theme = useTheme();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', contactPerson: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const res = await partnerAPI.getSuppliers();
            setSuppliers(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (supplier = null) => {
        if (supplier) {
            setEditingId(supplier._id);
            setFormData({
                name: supplier.name,
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                contactPerson: supplier.contactPerson || ''
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', email: '', phone: '', address: '', contactPerson: '' });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingId) {
                await partnerAPI.updateSupplier(editingId, formData);
                toast.success('Supplier updated');
            } else {
                await partnerAPI.createSupplier(formData);
                toast.success('Supplier created');
            }
            setOpenDialog(false);
            fetchSuppliers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await partnerAPI.deleteSupplier(id);
                toast.success('Supplier deleted');
                fetchSuppliers();
            } catch (error) {
                toast.error('Failed to delete supplier');
            }
        }
    };

    return (
        <Box className="animate-fade-in">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
                <div>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>Suppliers</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>Manage your supply partners</Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white', px: 3, py: 1.5, borderRadius: 3, fontWeight: 600,
                        width: { xs: '100%', md: 'auto' }
                    }}
                >
                    Add Supplier
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 5, overflow: 'hidden' }} className="glass-card">
                {loading && <LinearProgress color="secondary" />}
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Contact Person</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Phone</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map((supplier) => (
                                <TableRow key={supplier._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                    <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.05)' }}>{supplier.name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{supplier.contactPerson || '-'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{supplier.email || '-'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{supplier.phone || '-'}</TableCell>
                                    <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        <IconButton size="small" onClick={() => handleOpen(supplier)} sx={{ color: 'primary.main' }}><Edit fontSize="small" /></IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(supplier._id)} sx={{ color: 'error.main' }}><Delete fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && suppliers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>No suppliers found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#1e293b', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ color: 'white' }}>{editingId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: { xs: '100%', sm: 400 } }}>
                        <TextField
                            label="Name" fullWidth variant="outlined" value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                        />
                        <TextField
                            label="Contact Person" fullWidth variant="outlined" value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
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

export default SupplierList;
