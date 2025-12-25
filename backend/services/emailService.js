const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    
    async sendLowStockAlert(product, threshold) {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'inventory@example.com',
            to: process.env.ALERT_RECIPIENTS || 'admin@example.com',
            subject: `🚨 Low Stock Alert: ${product.name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .alert { color: #d63031; }
                        .product-info { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h2 class="alert">Low Stock Alert</h2>
                    <div class="product-info">
                        <p><strong>Product:</strong> ${product.name}</p>
                        <p><strong>Product ID:</strong> ${product.productId}</p>
                        <p><strong>Current Stock:</strong> ${product.quantity} ${product.unit}</p>
                        <p><strong>Minimum Required:</strong> ${threshold || product.minStockLevel} ${product.unit}</p>
                        <p><strong>Status:</strong> ${product.status}</p>
                        <p><strong>Location:</strong> ${product.location?.warehouse || 'N/A'} - ${product.location?.aisle || 'N/A'}</p>
                    </div>
                    <p>Please reorder this product as soon as possible.</p>
                    <p><a href="${process.env.FRONTEND_URL}/products/${product._id}">View Product Details</a></p>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Low stock alert sent for product: ${product.name}`);
        } catch (error) {
            console.error('Failed to send low stock alert:', error);
        }
    }
    
    async sendInventoryReport(recipient, reportData, format) {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'inventory@example.com',
            to: recipient,
            subject: `📊 Inventory Report - ${new Date().toLocaleDateString()}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #4CAF50; color: white; }
                        .low-stock { background-color: #ffebee; }
                        .out-of-stock { background-color: #ffcdd2; }
                    </style>
                </head>
                <body>
                    <h2>Inventory Report</h2>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Name</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                                <th>Status</th>
                                <th>Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.map(product => `
                                <tr class="${product.status === 'low_stock' ? 'low-stock' : product.status === 'out_of_stock' ? 'out-of-stock' : ''}">
                                    <td>${product.productId}</td>
                                    <td>${product.name}</td>
                                    <td>${product.quantity}</td>
                                    <td>${product.unit}</td>
                                    <td>${product.status}</td>
                                    <td>${product.location?.warehouse || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p>Total Products: ${reportData.length}</p>
                    <p>Low Stock Items: ${reportData.filter(p => p.status === 'low_stock').length}</p>
                    <p>Out of Stock Items: ${reportData.filter(p => p.status === 'out_of_stock').length}</p>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Inventory report sent to: ${recipient}`);
        } catch (error) {
            console.error('Failed to send inventory report:', error);
        }
    }
    
    async sendWelcomeEmail(user, password = null) {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'inventory@example.com',
            to: user.email,
            subject: 'Welcome to Inventory Management System',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .welcome { color: #2d3436; }
                        .credentials { background: #f8f9fa; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h2 class="welcome">Welcome ${user.name}!</h2>
                    <p>Your account has been created successfully in the Inventory Management System.</p>
                    <div class="credentials">
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                        ${password ? `<p><strong>Temporary Password:</strong> ${password}</p>` : ''}
                    </div>
                    <p>Please login at: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
                    <p>For security reasons, please change your password after first login.</p>
                    <p>If you have any questions, please contact the system administrator.</p>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to: ${user.email}`);
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }
}

module.exports = new EmailService();