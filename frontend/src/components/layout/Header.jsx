import React from 'react';
import { NotificationsOutlined, PersonOutline, Search, Menu } from '@mui/icons-material';
import { IconButton, Avatar, Badge, InputBase, Paper } from '@mui/material';

import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
    const { user } = useAuth();
    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-slate-900/50 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center">
                        <IconButton
                            className="md:hidden mr-4"
                            onClick={onMenuClick}
                            sx={{ color: 'white' }}
                        >
                            <Menu />
                        </IconButton>

                        {/* Search Bar - hidden on mobile */}
                        <div className="hidden md:flex flex-1 max-w-lg">
                            <Paper
                                component="form"
                                sx={{
                                    p: '2px 4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: 400,
                                    borderRadius: '16px',
                                    boxShadow: 'none',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    bgcolor: 'rgba(30, 41, 59, 0.5)',
                                    color: 'text.primary'
                                }}
                            >
                                <IconButton sx={{ p: '12px' }} aria-label="search">
                                    <Search className="text-slate-400" />
                                </IconButton>
                                <InputBase
                                    sx={{ ml: 1, flex: 1, color: '#f8fafc' }}
                                    placeholder="Search inventory, products..."
                                    inputProps={{ 'aria-label': 'search inventory' }}
                                />
                            </Paper>
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-6">
                        <IconButton className="transform hover:scale-110 transition-transform bg-slate-800/50 hover:bg-slate-700/50 p-2.5 rounded-xl border border-white/5">
                            <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { border: '2px solid #0f172a' } }}>
                                <NotificationsOutlined className="text-slate-300" />
                            </Badge>
                        </IconButton>

                        <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-white tracking-wide">
                                    {user?.name} {user?.role === 'admin' && <span className="text-orange-400">(Admin)</span>}
                                </p>
                                <p className="text-xs text-orange-400 font-medium uppercase">
                                    {user?.role || 'User'}
                                </p>
                            </div>
                            <Avatar
                                sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}
                                className="cursor-pointer border-2 border-white/10 shadow-lg shadow-orange-500/10 transition-transform hover:scale-105"
                            >
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
