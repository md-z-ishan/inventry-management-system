const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'inventory-api' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ timestamp, level, message, ...meta }) => {
                        return `${timestamp} [${level}]: ${message} ${
                            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                        }`;
                    }
                )
            )
        }),
        
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // File transport for errors only
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        })
    ]
});

// Morgan stream for HTTP logging
logger.stream = {
    write: (message) => logger.info(message.trim())
};

// Audit logging helper
const auditLogger = {
    logAction: (action, entity, entityId, performedBy, description, metadata = {}) => {
        logger.info('AUDIT_LOG', {
            action,
            entity,
            entityId,
            performedBy,
            description,
            ...metadata,
            timestamp: new Date().toISOString()
        });
    },
    
    logError: (error, context = {}) => {
        logger.error('SYSTEM_ERROR', {
            error: error.message,
            stack: error.stack,
            ...context,
            timestamp: new Date().toISOString()
        });
    },
    
    logSecurity: (event, user, ip, userAgent) => {
        logger.warn('SECURITY_EVENT', {
            event,
            user,
            ip,
            userAgent,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = { logger, auditLogger };