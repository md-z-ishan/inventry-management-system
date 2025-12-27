import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    DashboardOutlined,
    QrCodeScanner,
    QrCode,
    PersonOutline,
    Inventory2Outlined,
    LogoutOutlined,
    ReceiptLong,
    LocalShipping,
    PeopleAlt,
    Print,
    MenuOpen
} from '@mui/icons-material';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { path: '/products', label: 'Products', icon: <Inventory2Outlined /> },
        { path: '/categories', label: 'Categories', icon: <Inventory2Outlined /> }, // Icon reuse, or could import Category icon
        { path: '/transactions', label: 'Transactions', icon: <ReceiptLong /> },
        { path: '/partners/suppliers', label: 'Suppliers', icon: <LocalShipping /> },
        { path: '/partners/customers', label: 'Customers', icon: <PeopleAlt /> },
        { path: '/inventory/qr-scan', label: 'QR Scanner', icon: <QrCodeScanner /> },
        { path: '/inventory/print-labels', label: 'Print Labels', icon: <Print /> },
        { path: '/profile', label: 'Profile', icon: <PersonOutline /> },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 text-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/20">
                        <Inventory2Outlined className="text-white" fontSize="small" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        NexusInv
                    </span>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden ml-auto text-slate-400 hover:text-white">
                        <MenuOpen fontSize="small" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => onClose && window.innerWidth < 768 && onClose()}
                                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-gradient-to-r from-orange-500/10 to-transparent text-orange-500 translate-x-1'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-8 bg-orange-500 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                )}
                                <span className={`mr-4 transition-colors ${isActive ? 'text-orange-500' : 'text-slate-500 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                <span className={`font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Admin/Logout Section */}
                <div className="p-4 border-t border-white/5 mx-4 mb-4">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20 group"
                    >
                        <LogoutOutlined className="mr-3 group-hover:-translate-x-1 transition-transform" fontSize="small" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
