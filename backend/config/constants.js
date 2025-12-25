module.exports = {
    ROLES: {
        ADMIN: 'admin',
        MANAGER: 'manager',
        STAFF: 'staff',
        VIEWER: 'viewer'
    },
    
    INVENTORY_ACTIONS: {
        STOCK_IN: 'STOCK_IN',
        STOCK_OUT: 'STOCK_OUT',
        ADJUSTMENT: 'ADJUSTMENT',
        TRANSFER: 'TRANSFER'
    },
    
    STOCK_STATUS: {
        IN_STOCK: 'in_stock',
        LOW_STOCK: 'low_stock',
        OUT_OF_STOCK: 'out_of_stock',
        DISCONTINUED: 'discontinued'
    },
    
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },
    
    ERROR_CODES: {
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        AUTH_ERROR: 'AUTH_ERROR',
        FORBIDDEN: 'FORBIDDEN',
        NOT_FOUND: 'NOT_FOUND',
        DUPLICATE_ERROR: 'DUPLICATE_ERROR',
        SERVER_ERROR: 'SERVER_ERROR'
    }
};