import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, useTheme, MenuItem, CircularProgress, Alert } from '@mui/material';
import { QrCodeScanner, Close, Add, Remove } from '@mui/icons-material';
import QrReader from 'react-qr-reader-es6';
import { productAPI } from '../api/services';
import { toast } from 'react-toastify';

const QRScannerPage = () => {
    const theme = useTheme();
    const [scanResult, setScanResult] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [action, setAction] = useState('STOCK_IN');
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleScan = async (data) => {
        if (data && !loading && !openDialog) {
            setLoading(true);
            setScanResult(data);
            try {
                // Determine if data is a URL or ID.
                // If URL, extract ID. Assuming data is just ID for now or handled by backend.
                // If the QR is a URL like http://.../qr/ID, we should extract the ID.
                // Let's try sending the whole data or just the last part if it looks like a URL.
                let qrId = data;
                if (data.startsWith('http')) {
                    const parts = data.split('/');
                    qrId = parts[parts.length - 1];
                }

                const res = await productAPI.getProductByQR(qrId);
                setProduct(res.data.data);
                setOpenDialog(true);
            } catch (err) {
                console.error(err);
                setError('Product not found or invalid QR code');
                toast.error('Product not found for this QR code');
                // Allow rescanning after error
                setTimeout(() => {
                    setScanResult(null);
                    setError('');
                    setLoading(false);
                }, 3000);
            } finally {
                if (!openDialog) setLoading(false);
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError('Error accessing camera. Please ensure you have given permission.');
    };

    const handleStockUpdate = async () => {
        if (!product) return;
        setLoading(true);
        try {
            await productAPI.updateStock(product._id, {
                action,
                quantity: Number(quantity),
                reason: reason || `QR Scan ${action === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}`,
                transactionType: action === 'STOCK_IN' ? 'adjustment_in' : 'adjustment_out'
            });
            toast.success(`Stock ${action === 'STOCK_IN' ? 'added' : 'removed'} successfully`);
            setOpenDialog(false);
            setScanResult(null);
            setProduct(null);
            setReason('');
            setQuantity(1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update stock');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpenDialog(false);
        setScanResult(null);
        setProduct(null);
        setLoading(false);
    };

    return (
        <Box sx={{ flexGrow: 1 }} className="animate-fade-in">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    QR Scanner
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Scan QR codes to quickly manage inventory items.
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper
                    sx={{
                        p: 4,
                        maxWidth: 600,
                        width: '100%',
                        borderRadius: 5,
                        textAlign: 'center',
                        overflow: 'hidden'
                    }}
                    className="glass-card"
                >
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box sx={{ height: 400, bgcolor: 'black', borderRadius: 3, mb: 4, position: 'relative', overflow: 'hidden' }}>
                        {!openDialog && (
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                style={{ width: '100%', height: '100%' }}
                            />
                        )}
                        {/* Overlay guide */}
                        <Box sx={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            border: '2px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Box sx={{ width: 250, height: 250, border: '2px dashed rgba(249, 115, 22, 0.7)', borderRadius: 2 }} />
                        </Box>
                        {loading && !openDialog && (
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                <CircularProgress color="primary" />
                                <Typography sx={{ ml: 2, color: 'white' }}>Processing...</Typography>
                            </Box>
                        )}
                    </Box>

                    <Typography color="text.secondary">
                        Point camera at a product QR code
                    </Typography>
                </Paper>
            </Box>

            {/* Product Action Dialog */}
            <Dialog open={openDialog} onClose={handleClose} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Product Found
                    <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}><Close /></Button>
                </DialogTitle>
                <DialogContent>
                    {product && (
                        <Box sx={{ minWidth: 300, mt: 1 }}>
                            <Typography variant="h6" color="primary" sx={{ mb: 1 }}>{product.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                SKU: {product.sku} | Current Stock: {product.quantity} {product.unit}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Button
                                    variant={action === 'STOCK_IN' ? 'contained' : 'outlined'}
                                    color="success"
                                    onClick={() => setAction('STOCK_IN')}
                                    startIcon={<Add />}
                                    fullWidth
                                >
                                    Stock In
                                </Button>
                                <Button
                                    variant={action === 'STOCK_OUT' ? 'contained' : 'outlined'}
                                    color="error"
                                    onClick={() => setAction('STOCK_OUT')}
                                    startIcon={<Remove />}
                                    fullWidth
                                >
                                    Stock Out
                                </Button>
                            </Box>

                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                sx={{ mb: 2, '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                            />

                            <TextField
                                label="Reason (Optional)"
                                fullWidth
                                variant="outlined"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                sx={{ '& .MuiInputBase-root': { color: 'white' }, '& .MuiInputLabel-root': { color: 'text.secondary' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button onClick={handleStockUpdate} variant="contained" disabled={loading}>
                        {loading ? 'Updating...' : 'Confirm Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QRScannerPage;
