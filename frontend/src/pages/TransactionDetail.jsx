import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Grid, Divider, Chip, LinearProgress
} from '@mui/material';
import { ArrowBack, Download, Print } from '@mui/icons-material';
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

    useEffect(() => {
        fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        try {
            const res = await transactionAPI.getTransaction(id);
            setTransaction(res.data.data);
        } catch (error) {
            toast.error('Failed to load transaction details');
            navigate('/transactions');
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        if (!transaction) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('INVOICE', 14, 22);

        doc.setFontSize(10);
        doc.text(`Invoice #: ${transaction.invoiceNumber}`, 14, 30);
        doc.text(`Date: ${new Date(transaction.transactionDate).toLocaleDateString()}`, 14, 35);
        doc.text(`Status: ${transaction.status}`, 14, 40);

        // Partner Details
        const partner = transaction.supplier || transaction.customer;
        doc.text('Bill To:', 14, 50);
        if (partner) {
            doc.text(partner.name, 14, 55);
            doc.text(partner.email || '', 14, 60);
            const addressLines = doc.splitTextToSize(partner.address || '', 60);
            doc.text(addressLines, 14, 65);
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
            startY: 80,
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Total Amount: $${transaction.totalAmount}`, 14, finalY);

        // Footer
        doc.text('Thank you for your business!', 14, finalY + 20);

        doc.save(`${transaction.invoiceNumber}.pdf`);
    };

    if (loading) return <LinearProgress />;
    if (!transaction) return null;

    const partner = transaction.supplier || transaction.customer;

    return (
        <Box className="animate-fade-in">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/transactions')} sx={{ color: 'text.secondary' }}>
                    Back to List
                </Button>
                <Box>
                    <Button
                        startIcon={<Download />}
                        variant="contained"
                        onClick={generatePDF}
                        sx={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', mr: 2 }}
                    >
                        Download Invoice
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 5, mb: 4 }} className="glass-card">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>{transaction.type === 'SALE' ? 'INVOICE' : 'PURCHASE ORDER'}</Typography>
                        <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 600 }}>#{transaction.invoiceNumber}</Typography>
                        <Chip
                            label={transaction.status}
                            color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                            sx={{ mt: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Date Created:</Typography>
                        <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>{new Date(transaction.transactionDate).toLocaleDateString()}</Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Partner:</Typography>
                        <Typography variant="h6" sx={{ color: 'white' }}>{partner?.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{partner?.email}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{partner?.phone}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{partner?.address}</Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Item Description</TableCell>
                                <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>Quantity</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Unit Price</TableCell>
                                <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transaction.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ color: 'white' }}>
                                        {item.product ? (
                                            <>
                                                <Typography variant="body1">{item.product.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">SKU: {item.product.sku}</Typography>
                                            </>
                                        ) : 'Unknown Item'}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'text.secondary' }}>{item.quantity}</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.secondary' }}>${item.unitPrice}</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>${item.subtotal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                    <Paper sx={{ p: 3, minWidth: 250, bgcolor: 'rgba(0,0,0,0.2)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="text.secondary">Subtotal:</Typography>
                            <Typography color="white">${transaction.totalAmount}</Typography>
                        </Box>
                        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" color="primary">Total:</Typography>
                            <Typography variant="h6" color="white">${transaction.totalAmount}</Typography>
                        </Box>
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
};

export default TransactionDetail;
