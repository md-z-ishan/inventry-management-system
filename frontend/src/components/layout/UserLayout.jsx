import React, { useState } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory2 as ProductsIcon,
    QrCodeScanner as ScanIcon,
    Receipt as TransactionsIcon,
    Person as ProfileIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const UserLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const menuItems = [
        { path: '/user', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/user/scan', label: 'Scan QR', icon: <ScanIcon /> },
        { path: '/user/products', label: 'Products', icon: <ProductsIcon /> },
        { path: '/user/transactions', label: 'My Transactions', icon: <TransactionsIcon /> },
        { path: '/user/profile', label: 'Profile', icon: <ProfileIcon /> }
    ];

    const isActive = (path) => location.pathname === path;

    const drawerContent = (
        <>
            {/* Logo/Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>
                    📦 NexusInv
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Staff Portal
                </Typography>
            </Box>

            {/* User Info */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#f97316' }}>{user?.name?.[0]}</Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                            {user?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Staff Member
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Menu */}
            <List sx={{ flex: 1, py: 2 }}>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        sx={{
                            mx: 1,
                            mb: 0.5,
                            borderRadius: 2,
                            bgcolor: isActive(item.path) ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                            color: isActive(item.path) ? '#f97316' : 'text.secondary',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>

            {/* Logout */}
            <List sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <ListItem
                    button
                    onClick={logout}
                    sx={{
                        mx: 1,
                        my: 1,
                        borderRadius: 2,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
            {/* Mobile Header */}
            <AppBar
                position="fixed"
                sx={{
                    display: { md: 'none' },
                    bgcolor: '#1e293b',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: 'none'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                        Staff Portal
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }} // Better open performance on mobile
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            bgcolor: '#1e293b',
                            borderRight: '1px solid rgba(255, 255, 255, 0.05)'
                        }
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#0f172a', width: { md: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar sx={{ display: { md: 'none' } }} />
                <Outlet />
            </Box>
        </Box>
    );
};

export default UserLayout;
