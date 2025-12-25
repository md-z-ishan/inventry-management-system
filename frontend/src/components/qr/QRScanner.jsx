// QRScanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  TextField,
} from '@mui/material';
import QrScanner from 'react-qr-scanner';
import { QrCodeScanner, PhotoCamera, Close, Check } from '@mui/icons-material';
import { productAPI } from '../../api/services';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({
    action: 'STOCK_OUT',
    quantity: 1,
    reason: '',
  });
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const handleScan = async (data) => {
    if (data && !loading) {
      setScanning(false);
      setLoading(true);
      setError(null);
      
      try {
        // Extract QR data
        const qrData = JSON.parse(data.text);
        const productId = qrData.productId;
        
        // Fetch product details
        const response = await productAPI.getProductByQR(qrData.qrId || productId);
        setResult({
          qrData,
          product: response.data.data,
        });
        setShowResult(true);
      } catch (err) {
        console.error('Scan error:', err);
        setError('Failed to scan QR code. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error('Scanner error:', err);
    setError('Scanner error: ' + err.message);
  };

  const handleStockUpdate = async () => {
    if (!result?.qrData?.productId) return;
    
    try {
      setLoading(true);
      await productAPI.updateStock(result.qrData.productId, stockUpdate);
      
      // Reset and show success
      setShowResult(false);
      setResult(null);
      setStockUpdate({
        action: 'STOCK_OUT',
        quantity: 1,
        reason: '',
      });
      
      // Show success message
      alert(`Stock updated successfully! ${stockUpdate.action === 'STOCK_IN' ? 'Added' : 'Removed'} ${stockUpdate.quantity} items.`);
      
      // Continue scanning
      setScanning(true);
    } catch (err) {
      setError('Failed to update stock: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewStyle = {
    height: 300,
    width: 400,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        QR Code Scanner
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Scanner
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {scanning ? (
              <Box>
                <QrScanner
                  ref={scannerRef}
                  delay={300}
                  style={previewStyle}
                  onError={handleError}
                  onScan={handleScan}
                  constraints={{
                    audio: false,
                    video: {
                      facingMode: 'environment',
                    },
                  }}
                />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Close />}
                    onClick={() => setScanning(false)}
                    disabled={loading}
                  >
                    Stop Scanning
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    width: 400,
                    height: 300,
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <QrCodeScanner sx={{ fontSize: 100, color: 'grey.400' }} />
                  )}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  onClick={() => setScanning(true)}
                  disabled={loading}
                  size="large"
                >
                  Start Scanning
                </Button>
              </Box>
            )}
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Point your camera at a product QR code to scan
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Click "Start Scanning" to activate camera</li>
              <li>Point camera at product QR code</li>
              <li>Scanner will automatically detect QR code</li>
              <li>Product details will appear for stock update</li>
              <li>Choose action (Stock In/Out) and quantity</li>
              <li>Click "Update Stock" to complete transaction</li>
            </Box>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Ensure good lighting and hold steady for better scanning.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Result Dialog */}
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Product Scanned
          {result?.product && (
            <Typography variant="body2" color="textSecondary">
              ID: {result.product.productId}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {result?.product && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {result.product.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Current Stock
                      </Typography>
                      <Typography variant="h6">
                        {result.product.quantity} {result.product.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Status
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          result.product.status === 'in_stock'
                            ? 'success.main'
                            : result.product.status === 'low_stock'
                            ? 'warning.main'
                            : 'error.main'
                        }
                      >
                        {result.product.status.replace('_', ' ').toUpperCase()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Typography variant="subtitle1" gutterBottom>
                Update Stock
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Action"
                    value={stockUpdate.action}
                    onChange={(e) =>
                      setStockUpdate({ ...stockUpdate, action: e.target.value })
                    }
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="STOCK_IN">Stock In</option>
                    <option value="STOCK_OUT">Stock Out</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={stockUpdate.quantity}
                    onChange={(e) =>
                      setStockUpdate({
                        ...stockUpdate,
                        quantity: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason (Optional)"
                    multiline
                    rows={2}
                    value={stockUpdate.reason}
                    onChange={(e) =>
                      setStockUpdate({ ...stockUpdate, reason: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResult(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={handleStockUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QRScanner;