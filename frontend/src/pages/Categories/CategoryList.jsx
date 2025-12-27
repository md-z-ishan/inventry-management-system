import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Category as CategoryIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { categoryAPI } from '../../api/services';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const { hasAnyRole } = useAuth();

    // const canManage = hasAnyRole(['admin', 'manager']);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryAPI.getCategories();
            if (res.data?.data) {
                setCategories(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenDialog = (category = null) => {
        setEditingCategory(category);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCategory(null);
        formik.resetForm();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This might affect products within this category.')) return;
        try {
            await categoryAPI.deleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            description: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Required').max(100, 'Too long'),
            description: Yup.string().max(500, 'Too long')
        }),
        onSubmit: async (values) => {
            try {
                if (editingCategory) {
                    await categoryAPI.updateCategory(editingCategory._id, values);
                    toast.success('Category updated');
                } else {
                    await categoryAPI.createCategory(values);
                    toast.success('Category created');
                }
                handleCloseDialog();
                fetchCategories();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Operation failed');
            }
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (editingCategory) {
            formik.setValues({
                name: editingCategory.name || '',
                description: editingCategory.description || ''
            });
        } else {
            formik.resetForm();
        }
    }, [editingCategory, formik]);

    return (
        <Box className="animate-fade-in">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
                <div>
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'white', mb: 1 }}>
                        Categories
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage product categories
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        fontWeight: 600,
                        width: { xs: '100%', md: 'auto' }
                    }}
                >
                    Add Category
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 4 }} className="glass-card">
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Code</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Description</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((cat) => (
                                    <TableRow key={cat._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 500, borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <CategoryIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                {cat.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <code className="text-xs bg-slate-800 px-2 py-1 rounded text-orange-400">{cat.code}</code>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>{cat.description || '-'}</TableCell>
                                        <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => handleOpenDialog(cat)} sx={{ color: 'warning.main' }}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(cat._id)} sx={{ color: 'error.main' }}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        bgcolor: '#1e293b',
                        backgroundImage: 'none',
                        color: 'white',
                        borderRadius: 3,
                        minWidth: { xs: '100%', sm: 400 }
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {editingCategory ? 'Edit Category' : 'New Category'}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            margin="normal"
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            margin="normal"
                            multiline
                            rows={3}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={formik.isSubmitting}
                            sx={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                fontWeight: 600
                            }}
                        >
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default CategoryList;
