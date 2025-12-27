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
    InputAdornment,
    TextField,
    TablePagination,
    Chip,
    Avatar,
    Stack,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getProducts({
                page: page + 1,
                limit: rowsPerPage,
                search
            });
            setProducts(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productAPI.deleteProduct(id);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    return (
        <Box className="animate-fade-in">
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <div>
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'white', mb: 1 }}>
                        Product Inventory
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage your products and stock levels
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/products/new')}
                    sx={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Add Product
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }} className="glass-card">
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search products by name, SKU..."
                    value={search}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        }
                    }}
                />
            </Paper>

            {/* Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 4 }} className="glass-card">
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Product</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>SKU</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Category</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Stock</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Price</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={40} thickness={4} />
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                        No products found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                        <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                    variant="rounded"
                                                    src={product.image}
                                                    sx={{ width: 48, height: 48, bgcolor: 'rgba(249, 115, 22, 0.1)', color: 'primary.main' }}
                                                >
                                                    {product.name?.[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: 'white' }}>
                                                        {product.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {product.brand || 'No Brand'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                            {product.sku}
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <Chip
                                                label={product.category?.name || 'Uncategorized'}
                                                size="small"
                                                sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.secondary' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ color: product.quantity <= product.minQuantity ? '#ef4444' : 'white', fontWeight: 600 }}>
                                                    {product.quantity} {product.unit}
                                                </Typography>
                                                {product.quantity <= product.minQuantity && (
                                                    <Typography variant="caption" sx={{ color: '#ef4444' }}>Low Stock</Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255,255,255,0.05)' }}>
                                            ${product.sellingPrice || product.price || 0}
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View QR">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/products/qr/${product._id}`)} // Assuming a QR view exists or dialog
                                                        sx={{ color: 'info.main' }}
                                                    >
                                                        <QrCodeIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/products/edit/${product._id}`)}
                                                        sx={{ color: 'warning.main' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(product._id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}
                />
            </Paper>
        </Box>
    );
};

export default ProductList;
