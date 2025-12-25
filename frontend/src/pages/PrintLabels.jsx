import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, useTheme, TextField, InputAdornment } from '@mui/material';
import { Print, Search } from '@mui/icons-material';
import { productAPI } from '../api/services';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react'; // Need to install qrcode.react or use existing qrcode lib logic

// We might need to handle QR generation. The backend has logic but frontend rendering is often faster for bulk printing.
// Checking package.json for QR lib. 
// If not present, I'll use a simple img src to backend /qrcode endpoint or a library.
// The backend /qrcode endpoint generates a data URL but for *generating* on the fly for multiple items, frontend lib is better to avoid API spam.
// Let's assume I'll use a library. I'll check package.json first. 
// Actually, I can just use the backend endpoint: <img src={product.qrCode} /> if it's already generated and stored, or generate on fly.
// Let's check if Product model has qrCode field stored (Data URL).
// If not, I should probably install `qrcode.react`.

const PrintLabels = () => {
    const theme = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState('');
    const componentRef = useRef();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getAll();
            setProducts(res.data.data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = products.map((n) => n._id);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handlePrint = () => {
        window.print();
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.sku.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Box className="no-print" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'white' }}>
                        Print Labels
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Select products to generate and print QR code labels.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Print />}
                    disabled={selected.length === 0}
                    onClick={handlePrint}
                    sx={{ bgcolor: theme.palette.primary.main }}
                >
                    Print {selected.length} Labels
                </Button>
            </Box>

            <Paper className="no-print glass-card" sx={{ mb: 4, p: 2, borderRadius: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name or SKU..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        sx: { color: 'white' }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }
                    }}
                />
            </Paper>

            <TableContainer component={Paper} className="no-print glass-card" sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selected.length > 0 && selected.length < products.length}
                                    checked={products.length > 0 && selected.length === products.length}
                                    onChange={handleSelectAllClick}
                                    sx={{ color: 'text.secondary' }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>Name</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>SKU</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>Price</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>Stock</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                const isItemSelected = isSelected(row._id);
                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) => handleClick(event, row._id)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row._id}
                                        selected={isItemSelected}
                                        sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: 'rgba(249, 115, 22, 0.08)' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isItemSelected} sx={{ color: 'text.secondary', '&.Mui-checked': { color: theme.palette.primary.main } }} />
                                        </TableCell>
                                        <TableCell sx={{ color: 'white' }}>{row.name}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{row.sku}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>${row.price}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>{row.quantity}</TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={{ color: 'text.secondary' }}
                />
            </TableContainer>

            {/* Printable Section - Hidden on screen, visible on print */}
            <div id="print-area" className="print-only">
                <style>
                    {`
                        @media screen {
                            .print-only { display: none; }
                        }
                        @media print {
                            .no-print { display: none !important; }
                            .print-only { display: block; }
                            body { background: white !important; color: black !important; }
                            .print-grid { 
                                display: grid; 
                                grid-template-columns: repeat(auto-fill, minmax(2.5in, 1fr)); 
                                gap: 10px; 
                                padding: 20px;
                            }
                            .print-item {
                                border: 1px solid #ccc;
                                padding: 10px;
                                text-align: center;
                                page-break-inside: avoid;
                                display: flex;
                                flexDirection: column;
                                alignItems: center;
                                justify-content: center;
                                height: 2.5in;
                            }
                            /* Hide sidebar/navbar if they rely on CSS classes or just use generic selectors */
                            nav, header, aside { display: none !important; }
                        }
                    `}
                </style>
                <div className="print-grid">
                    {products.filter(p => selected.includes(p._id)).map(product => (
                        <div key={product._id} className="print-item">
                            {/* Assuming we have a base64 or URL for QR, or generating it. 
                                Since we don't have qrcode.react yet, let's use the API endpoint for image src which is easiest.
                                Or better: fetch the qrCode data url from product if it exists.
                                If using product.qrCode (from backend generation) which is a Data URL.
                            */}
                            {product.qrCode ? (
                                <img src={product.qrCode} alt="QR" style={{ width: '1.5in', height: '1.5in' }} />
                            ) : (
                                <div style={{ width: '1.5in', height: '1.5in', border: '1px dashed #000' }}>No QR</div>
                            )}
                            <h3 style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>{product.name}</h3>
                            <p style={{ margin: 0, fontSize: '12px' }}>{product.sku}</p>
                            <p style={{ margin: 0, fontSize: '12px' }}>${product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Box>
    );
};

export default PrintLabels;
