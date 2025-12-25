const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct, validateStockUpdate, validatePagination, handleValidationErrors } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

// All routes require authentication
router.use(protect);

// Public QR endpoint (for scanning)
router.get('/qr/:qrId', productController.getProductByQR);

// Protected routes
router.route('/')
    .get(validatePagination, handleValidationErrors, productController.getProducts)
    .post(authorize(ROLES.ADMIN, ROLES.MANAGER), validateProduct, handleValidationErrors, productController.createProduct);

// Reports - Must be before /:id routes to prevent shadowing
router.get('/low-stock', productController.getLowStockProducts);

router.route('/:id')
    .get(productController.getProduct)
    .put(authorize(ROLES.ADMIN, ROLES.MANAGER), validateProduct, handleValidationErrors, productController.updateProduct)
    .delete(authorize(ROLES.ADMIN), productController.deleteProduct);

router.route('/:id/stock')
    .post(authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateStockUpdate, handleValidationErrors, productController.updateStock);

router.route('/:id/qrcode')
    .post(authorize(ROLES.ADMIN, ROLES.MANAGER), productController.generateQRCode);

router.get('/:id/logs', validatePagination, handleValidationErrors, productController.getProductLogs);

// Batch operations
router.post('/batch/stock', authorize(ROLES.ADMIN, ROLES.MANAGER), productController.batchUpdateStock);

// Import
const upload = require('../middleware/upload');
router.post('/import', authorize(ROLES.ADMIN, ROLES.MANAGER), upload.single('file'), productController.bulkImport);



module.exports = router;