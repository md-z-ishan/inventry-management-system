const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

class QRGenerator {
    constructor(options = {}) {
        this.options = {
            size: options.size || 300,
            margin: options.margin || 2,
            color: options.color || {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'H'
        };
    }
    
    async generateProductQR(productData, baseUrl) {
        try {
            const qrId = uuidv4();
            const productUrl = `${baseUrl}/api/v1/products/qr/${qrId}`;
            const qrData = {
                productId: productData.productId,
                sku: productData.sku,
                name: productData.name,
                url: productUrl,
                timestamp: new Date().toISOString()
            };
            
            // Generate QR code as data URL
            const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
                width: this.options.size,
                margin: this.options.margin,
                color: this.options.color,
                errorCorrectionLevel: this.options.errorCorrectionLevel
            });
            
            // Generate QR code as buffer for printing
            const qrCodeBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
                width: this.options.size,
                margin: this.options.margin,
                color: this.options.color,
                errorCorrectionLevel: this.options.errorCorrectionLevel,
                type: 'png'
            });
            
            return {
                qrId,
                dataURL: qrCodeDataURL,
                buffer: qrCodeBuffer,
                data: qrData,
                productUrl
            };
            
        } catch (error) {
            throw new Error(`QR code generation failed: ${error.message}`);
        }
    }
    
    async generateBatchQRCodes(products, baseUrl) {
        const results = [];
        
        for (const product of products) {
            try {
                const qrCode = await this.generateProductQR(product, baseUrl);
                results.push({
                    productId: product._id,
                    productName: product.name,
                    qrCode
                });
            } catch (error) {
                results.push({
                    productId: product._id,
                    productName: product.name,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    async generateQRCodeForText(text) {
        try {
            return await QRCode.toDataURL(text, {
                width: this.options.size,
                margin: this.options.margin,
                color: this.options.color,
                errorCorrectionLevel: this.options.errorCorrectionLevel
            });
        } catch (error) {
            throw new Error(`QR code generation failed: ${error.message}`);
        }
    }
}

module.exports = QRGenerator;