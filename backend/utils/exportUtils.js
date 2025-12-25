const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportUtils {
    constructor() {
        this.exportsDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(this.exportsDir)) {
            fs.mkdirSync(this.exportsDir, { recursive: true });
        }
    }
    
    async exportToCSV(data, fields, filename) {
        try {
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(data);
            
            const filePath = path.join(this.exportsDir, `${filename}-${Date.now()}.csv`);
            fs.writeFileSync(filePath, csv);
            
            return {
                filePath,
                filename: `${filename}-${Date.now()}.csv`,
                mimeType: 'text/csv'
            };
        } catch (error) {
            throw new Error(`CSV export failed: ${error.message}`);
        }
    }
    
    async exportToPDF(data, title, columns, filename) {
        return new Promise((resolve, reject) => {
            try {
                const filePath = path.join(this.exportsDir, `${filename}-${Date.now()}.pdf`);
                const doc = new PDFDocument({ margin: 50 });
                const stream = fs.createWriteStream(filePath);
                
                doc.pipe(stream);
                
                // Header
                doc.fontSize(20).text(title, { align: 'center' });
                doc.moveDown();
                doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
                doc.moveDown(2);
                
                // Table headers
                const startX = 50;
                const startY = doc.y;
                const rowHeight = 30;
                const colWidths = columns.map(col => col.width || 100);
                
                // Draw table headers
                doc.font('Helvetica-Bold');
                let currentX = startX;
                columns.forEach((column, index) => {
                    doc.text(column.header, currentX, startY, {
                        width: colWidths[index],
                        align: column.align || 'left'
                    });
                    currentX += colWidths[index];
                });
                
                // Draw horizontal line
                doc.moveTo(startX, startY + rowHeight - 10)
                   .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + rowHeight - 10)
                   .stroke();
                
                // Draw table rows
                doc.font('Helvetica');
                data.forEach((row, rowIndex) => {
                    currentX = startX;
                    const yPos = startY + (rowIndex + 1) * rowHeight;
                    
                    columns.forEach((column, colIndex) => {
                        const value = row[column.field] || '';
                        doc.text(String(value), currentX, yPos, {
                            width: colWidths[colIndex],
                            align: column.align || 'left'
                        });
                        currentX += colWidths[colIndex];
                    });
                    
                    // Add page break if needed
                    if (yPos > doc.page.height - 100) {
                        doc.addPage();
                    }
                });
                
                // Footer
                doc.page.margins.bottom = 50;
                const pageCount = doc.bufferedPageRange().count;
                
                for (let i = 0; i < pageCount; i++) {
                    doc.switchToPage(i);
                    doc.fontSize(10).text(
                        `Page ${i + 1} of ${pageCount}`,
                        doc.page.width - 100,
                        doc.page.height - 50,
                        { align: 'center' }
                    );
                }
                
                doc.end();
                
                stream.on('finish', () => {
                    resolve({
                        filePath,
                        filename: `${filename}-${Date.now()}.pdf`,
                        mimeType: 'application/pdf'
                    });
                });
                
                stream.on('error', reject);
                
            } catch (error) {
                reject(new Error(`PDF export failed: ${error.message}`));
            }
        });
    }
    
    async exportInventoryReport(products, format = 'csv') {
        const fields = [
            { label: 'Product ID', value: 'productId' },
            { label: 'SKU', value: 'sku' },
            { label: 'Name', value: 'name' },
            { label: 'Category', value: 'category.name' },
            { label: 'Quantity', value: 'quantity' },
            { label: 'Unit', value: 'unit' },
            { label: 'Min Stock', value: 'minStockLevel' },
            { label: 'Status', value: 'status' },
            { label: 'Cost Price', value: 'costPrice' },
            { label: 'Selling Price', value: 'sellingPrice' },
            { label: 'Location', value: row => `${row.location?.warehouse || ''} ${row.location?.aisle || ''}` }
        ];
        
        const csvFields = fields.map(f => f.label);
        const productData = products.map(p => ({
            productId: p.productId,
            sku: p.sku,
            name: p.name,
            'category.name': p.category?.name || '',
            quantity: p.quantity,
            unit: p.unit,
            minStockLevel: p.minStockLevel,
            status: p.status,
            costPrice: p.costPrice,
            sellingPrice: p.sellingPrice,
            'location.warehouse': p.location?.warehouse || '',
            'location.aisle': p.location?.aisle || ''
        }));
        
        if (format === 'csv') {
            return await this.exportToCSV(productData, csvFields, 'inventory-report');
        } else {
            const pdfColumns = [
                { header: 'Product ID', field: 'productId', width: 80 },
                { header: 'Name', field: 'name', width: 150 },
                { header: 'Quantity', field: 'quantity', width: 60, align: 'right' },
                { header: 'Unit', field: 'unit', width: 50 },
                { header: 'Status', field: 'status', width: 80 },
                { header: 'Location', field: 'location', width: 100 }
            ];
            
            return await this.exportToPDF(
                productData.map(p => ({
                    ...p,
                    location: `${p['location.warehouse']} ${p['location.aisle']}`
                })),
                'Inventory Report',
                pdfColumns,
                'inventory-report'
            );
        }
    }
    
    cleanupOldExports(days = 7) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        fs.readdirSync(this.exportsDir).forEach(file => {
            const filePath = path.join(this.exportsDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtimeMs < cutoff) {
                fs.unlinkSync(filePath);
            }
        });
    }
}

module.exports = ExportUtils;