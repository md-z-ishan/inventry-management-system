import React, { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, useTheme, Grid } from '@mui/material';
import { QrCode, Download } from '@mui/icons-material';

const QRGeneratorPage = () => {
    const theme = useTheme();
    const [productData, setProductData] = useState('');
    const [generated, setGenerated] = useState(false);

    const handleGenerate = () => {
        if (productData) {
            setGenerated(true);
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }} className="animate-fade-in">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    QR Generator
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Generate unique QR codes for your products.
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 5, height: '100%' }} className="glass-card">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 3 }}>
                            Product Details
                        </Typography>
                        <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth
                                label="Enter Product Data"
                                variant="outlined"
                                value={productData}
                                onChange={(e) => setProductData(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                    },
                                    '& .MuiInputLabel-root': { color: 'text.secondary' },
                                    '& .MuiInputBase-input': { color: 'white' },
                                }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<QrCode />}
                                onClick={handleGenerate}
                                disabled={!productData}
                                sx={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    py: 1.5,
                                    borderRadius: 3,
                                    fontWeight: 600,
                                    mt: 2
                                }}
                            >
                                Generate Code
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="glass-card">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 3, width: '100%', textAlign: 'left' }}>
                            Preview
                        </Typography>

                        <Box
                            sx={{
                                width: 250,
                                height: 250,
                                bgcolor: 'white',
                                borderRadius: 3,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 4
                            }}
                        >
                            {generated ? (
                                <Box sx={{ width: '100%', height: '100%', bgcolor: 'black' }} /> // Placeholder for actual QRCode
                            ) : (
                                <Typography color="text.disabled">QR Code will appear here</Typography>
                            )}
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            disabled={!generated}
                            sx={{
                                borderColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                borderRadius: 3,
                                px: 4,
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    bgcolor: 'rgba(59, 130, 246, 0.1)'
                                }
                            }}
                        >
                            Download PNG
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default QRGeneratorPage;
