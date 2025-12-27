import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { productAPI, categoryAPI } from '../api/services';
import { toast } from 'react-toastify';

const units = ['piece', 'kg', 'liter', 'meter', 'box', 'pack', 'dozen', 'unit'];

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getCategories();
            if (res.data?.data) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await productAPI.getProduct(id);
            const product = res.data.data;
            formik.setValues({
                name: product.name,
                sku: product.sku || '',
                category: product.category?._id || product.category || '',
                description: product.description || '',
                quantity: product.quantity,
                unit: product.unit || 'piece',
                minStockLevel: product.minStockLevel || 10,
                costPrice: product.costPrice || 0,
                sellingPrice: product.sellingPrice || 0,
                brand: product.brand || '',
                location: product.location?.warehouse || ''
            });
        } catch (error) {
            toast.error('Failed to load product details');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            sku: '',
            category: '',
            description: '',
            quantity: 0,
            unit: 'piece',
            minStockLevel: 10,
            costPrice: 0,
            sellingPrice: 0,
            brand: '',
            location: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Required'),
            category: Yup.string().required('Required'),
            quantity: Yup.number().min(0, 'Must be positive').required('Required'),
            minStockLevel: Yup.number().min(0, 'Must be positive').required('Required'),
            costPrice: Yup.number().min(0, 'Must be positive'),
            sellingPrice: Yup.number().min(0, 'Must be positive'),
            unit: Yup.string().required('Required')
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                // Clean optional fields
                if (!values.sku) delete values.sku;

                // Format location if provided
                const payload = {
                    ...values,
                    location: values.location ? { warehouse: values.location } : undefined
                };

                if (isEditMode) {
                    await productAPI.updateProduct(id, payload);
                    toast.success('Product updated successfully');
                } else {
                    await productAPI.createProduct(payload);
                    toast.success('Product created successfully');
                }
                navigate('/products');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Operation failed');
            } finally {
                setLoading(false);
            }
        }
    });

    if (loading && isEditMode && !formik.values.name) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box className="animate-fade-in">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/products')} sx={{ mr: 2, color: 'white' }}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
                    {isEditMode ? 'Edit Product' : 'New Product'}
                </Typography>
            </Box>

            <Paper component="form" onSubmit={formik.handleSubmit} sx={{ p: 4, borderRadius: 4 }} className="glass-card">
                <Grid container spacing={3}>
                    {/* Basic Info */}
                    <Grid item xs={12}>
                        <Typography variant="h6" color="white" gutterBottom>Basic Information</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formik.values.category}
                                label="Category"
                                onChange={formik.handleChange}
                                sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                            {formik.touched.category && <FormHelperText>{formik.errors.category}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    {/* Stock Info */}
                    <Grid item xs={12}>
                        <Typography variant="h6" color="white" sx={{ mt: 2 }} gutterBottom>Inventory Details</Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Initial Quantity"
                            name="quantity"
                            value={formik.values.quantity}
                            onChange={formik.handleChange}
                            error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                            helperText={formik.touched.quantity && formik.errors.quantity}
                            disabled={isEditMode} // Usually stock is managed via transactions, but editing allowed for correction sometimes. Let's allowing it for now or lock it? Requirement says Updates stock via scanner. I'll allow edit.
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Unit</InputLabel>
                            <Select
                                name="unit"
                                value={formik.values.unit}
                                label="Unit"
                                onChange={formik.handleChange}
                                sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                            >
                                {units.map((u) => (
                                    <MenuItem key={u} value={u}>{u}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Min Stock Level"
                            name="minStockLevel"
                            value={formik.values.minStockLevel}
                            onChange={formik.handleChange}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>

                    {/* Pricing */}
                    <Grid item xs={12}>
                        <Typography variant="h6" color="white" sx={{ mt: 2 }} gutterBottom>Pricing</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Cost Price"
                            name="costPrice"
                            value={formik.values.costPrice}
                            onChange={formik.handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Selling Price"
                            name="sellingPrice"
                            value={formik.values.sellingPrice}
                            onChange={formik.handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>

                    {/* Extra Info */}
                    <Grid item xs={12}>
                        <Typography variant="h6" color="white" sx={{ mt: 2 }} gutterBottom>Additional Details</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="SKU (Optional)"
                            name="sku"
                            value={formik.values.sku}
                            onChange={formik.handleChange}
                            placeholder="Leave empty to auto-generate"
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Brand"
                            name="brand"
                            value={formik.values.brand}
                            onChange={formik.handleChange}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/products')}
                            sx={{ mr: 2, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.2)' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading || formik.isSubmitting}
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            sx={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                px: 4
                            }}
                        >
                            {isEditMode ? 'Update Product' : 'Create Product'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ProductForm;
