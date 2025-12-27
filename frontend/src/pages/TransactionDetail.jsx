import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Grid, Divider, Chip, LinearProgress
} from '@mui/material';
import { ArrowBack, Download, Receipt, Business, Person, CalendarToday, Email } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../api/services';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TransactionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTransaction = React.useCallback(async () => {
        try {
            const res = await transactionAPI.getTransaction(id);
            setTransaction(res.data.data);
        } catch (error) {
            toast.error('Failed to load transaction details');
            navigate('/transactions');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchTransaction();
    }, [fetchTransaction]);

    const generatePDF = () => {
        if (!transaction) return;

        const doc = new jsPDF();

        // Header
        doc.setFillColor(249, 115, 22); // Orange primary
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('INVOICE', 14, 25);

        doc.setFontSize(10);
        doc.text(`#${transaction.invoiceNumber}`, 180, 25, { align: 'right' });

        doc.setTextColor(0, 0, 0);

        // Info Section
        doc.setFontSize(10);
        doc.text(`Date: ${new Date(transaction.transactionDate).toLocaleDateString()}`, 14, 50);
        doc.text(`Status: ${transaction.status}`, 14, 55);

        // Partner Details
        const partner = transaction.supplier || transaction.customer;

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Bill To:', 14, 70);
        doc.setFont(undefined, 'normal');

        if (partner) {
            doc.setFontSize(10);
            doc.text(partner.name, 14, 76);
            doc.text(partner.email || '', 14, 81);
            const addressLines = doc.splitTextToSize(partner.address || '', 60);
            doc.text(addressLines, 14, 86);
        }

        // Table
        const tableColumn = ["Product", "Qty", "Price", "Total"];
        const tableRows = [];

        transaction.items.forEach(item => {
            const productData = [
                item.product ? `${item.product.name} (${item.product.sku})` : 'Unknown Product',
                item.quantity,
                `$${item.unitPrice}`,
                `$${item.subtotal}`
            ];
            tableRows.push(productData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 110,
            headStyles: { fillColor: [249, 115, 22] },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Amount: $${transaction.totalAmount}`, 190, finalY, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for your business!', 105, 280, { align: 'center' });

        doc.save(`${transaction.invoiceNumber}.pdf`);
    };

    if (loading) return <LinearProgress />;
    if (!transaction) return null;

    const partner = transaction.supplier || transaction.customer;

    return (
        <Box className="animate-fade-in" sx={{ pb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/transactions')}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'white' } }}
                >
                    Back to List
                </Button>
                <Box>
                    <Button
                        startIcon={<Download />}
                        variant="contained"
                        onClick={generatePDF}
                        sx={{
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
                            fontWeight: 600,
                            mr: 2
                        }}
                    >
                        Download PDF
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: 5, overflow: 'hidden', position: 'relative' }} className="glass-card">
                {/* Decorative Header Bar */}
                <Box sx={{ height: 8, background: 'linear-gradient(90deg, #f97316 0%, #3b82f6 100%)' }} />

                <Box sx={{ p: { xs: 3, md: 5 } }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Receipt sx={{ fontSize: 40, color: 'primary.main' }} />
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                        {transaction.type === 'SALE' ? 'INVOICE' : 'PURCHASE ORDER'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        #{transaction.invoiceNumber}
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label={transaction.status}
                                sx={{
                                    bgcolor: transaction.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                    color: transaction.status === 'COMPLETED' ? '#4ade80' : '#facc15',
                                    fontWeight: 600,
                                    border: '1px solid',
                                    borderColor: transaction.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 4 }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarToday fontSize="inherit" /> Date
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                        {new Date(transaction.transactionDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Person fontSize="inherit" /> Created By
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                                        {transaction.user?.name || 'Admin'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Bill To
                            </Typography>
                            {partner ? (
                                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>{partner.name}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Email fontSize="small" /> {partner.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Business fontSize="small" /> {partner.address || "No address provided"}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">N/A</Typography>
                            )}
                        </Grid>
                    </Grid>

                    <TableContainer sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, py: 2 }}>PRODUCT</TableCell>
                                    <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>QUANTITY</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>UNIT PRICE</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>TOTAL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transaction.items.map((item, index) => (
                                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                                        <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.03)' }}>
                                            {item.product ? (
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.product.name}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>SKU: {item.product.sku}</Typography>
                                                </Box>
                                            ) : 'Unknown Item'}
                                        </TableCell>
                                        <TableCell align="center" sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.03)' }}>{item.quantity}</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.03)' }}>${item.unitPrice}</TableCell>
                                        <TableCell align="right" sx={{ color: 'white', fontWeight: 600, borderColor: 'rgba(255,255,255,0.03)' }}>${item.subtotal}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                        <Box sx={{ minWidth: 250 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography color="white" fontWeight={500}>${transaction.totalAmount}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Tax</Typography>
                                <Typography color="white" fontWeight={500}>$0.00</Typography>
                            </Box>
                            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>Total</Typography>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>${transaction.totalAmount}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TransactionDetail;
