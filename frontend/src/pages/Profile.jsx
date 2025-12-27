import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, TextField, useTheme, Avatar, Grid, Divider,
    CircularProgress, Tabs, Tab, IconButton, Switch,
    InputAdornment
} from '@mui/material';
import {
    Save, Person, Email, CameraAlt, Security,
    Settings, History, Logout, Phone, Home
} from '@mui/icons-material';
import { authAPI } from '../api/services';
import { toast } from 'react-toastify';
import LoginHistory from '../components/LoginHistory';
import { useTheme as useColorMode } from '../context/ThemeContext';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            {...other}
            style={{ height: '100%' }}
        >
            {value === index && (
                <Box sx={{ p: { xs: 2, md: 4 }, height: '100%' }} className="animate-fade-in">
                    {children}
                </Box>
            )}
        </div>
    );
};

const Profile = () => {
    const { toggleColorMode, mode } = useColorMode();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const [user, setUser] = useState({
        name: '',
        email: '',
        role: '',
        userId: '',
        avatar: '',
        loginHistory: []
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });


    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getMe();
            const userData = response.data.data.user;
            setUser({
                name: userData.name || '',
                email: userData.email || '',
                role: userData.role || '',
                userId: userData._id || 'ID',
                avatar: userData.avatar || '',
                loginHistory: userData.loginHistory || []
            });
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: userData.address || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await authAPI.uploadAvatar(formData);
            setUser(prev => ({ ...prev, avatar: response.data.data.avatar }));
            toast.success('Avatar updated successfully');
        } catch (error) {
            toast.error('Failed to upload avatar');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await authAPI.updateDetails(formData);
            const updatedUser = response.data.data.user;
            setUser(prev => ({
                ...prev,
                name: updatedUser.name,
                email: updatedUser.email
            }));
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setSaving(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoutAll = async () => {
        if (window.confirm('Are you sure you want to log out from all devices?')) {
            try {
                await authAPI.logoutAll();
                toast.success('Logged out from all devices');
                window.location.href = '/login';
            } catch (error) {
                toast.error('Failed to logout from all devices');
            }
        }
    };

    const toggleTheme = async () => {
        toggleColorMode();
        const newTheme = mode === 'light' ? 'dark' : 'light';
        try {
            await authAPI.updatePreferences({ theme: newTheme });
        } catch (error) {
            console.error('Failed to save theme preference');
        }
    };

    const CustomTab = (props) => (
        <Tab
            {...props}
            sx={{
                justifyContent: 'flex-start',
                minHeight: 50,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'text.secondary',
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                    bgcolor: 'rgba(249, 115, 22, 0.1)',
                    color: 'primary.main',
                    fontWeight: 700,
                },
                '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                }
            }}
        />
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, pb: 4 }} className="animate-fade-in">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                    My Profile
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Manage account settings and security preferences
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Panel: Avatar & Nav */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper className="glass-card" sx={{ p: 0, borderRadius: 5, overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(to bottom, rgba(249, 115, 22, 0.1), transparent)' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                <Avatar
                                    src={user.avatar}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        margin: '0 auto',
                                        border: '4px solid rgba(249, 115, 22, 0.3)',
                                        boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)',
                                        fontSize: '3rem',
                                        bgcolor: 'primary.main'
                                    }}
                                >
                                    {user.name?.charAt(0) || 'U'}
                                </Avatar>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="avatar-upload"
                                    type="file"
                                    onChange={handleAvatarUpload}
                                />
                                <label htmlFor="avatar-upload">
                                    <IconButton
                                        component="span"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 5,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            border: '3px solid #0f172a',
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }}
                                    >
                                        <CameraAlt fontSize="small" />
                                    </IconButton>
                                </label>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'white' }}>{user.name}</Typography>
                            <Typography variant="caption" sx={{
                                display: 'inline-block',
                                px: 1.5, py: 0.5,
                                borderRadius: 10,
                                bgcolor: 'rgba(255,255,255,0.1)',
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                fontWeight: 600
                            }}>
                                {user.role}
                            </Typography>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                        <Box sx={{ p: 2 }}>
                            <Tabs
                                orientation="vertical"
                                value={tabValue}
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTabs-indicator': { left: 0, width: 3, borderRadius: '0 4px 4px 0' }
                                }}
                            >
                                <CustomTab icon={<Person fontSize="small" sx={{ mr: 1.5 }} />} iconPosition="start" label="Personal Info" />
                                <CustomTab icon={<Security fontSize="small" sx={{ mr: 1.5 }} />} iconPosition="start" label="Security" />
                                <CustomTab icon={<Settings fontSize="small" sx={{ mr: 1.5 }} />} iconPosition="start" label="Preferences" />
                                <CustomTab icon={<History fontSize="small" sx={{ mr: 1.5 }} />} iconPosition="start" label="Activity Log" />
                            </Tabs>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Panel: Content */}
                <Grid item xs={12} md={8} lg={9}>
                    <Paper className="glass-card" sx={{ minHeight: 500, borderRadius: 5, overflow: 'hidden' }}>
                        {/* Tab 0: Edit Profile */}
                        <TabPanel value={tabValue} index={0}>
                            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                                <Button
                                    variant="contained"
                                    onClick={handleProfileUpdate}
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                    disabled={saving}
                                    sx={{
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>

                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Person sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Phone sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Home sx={{ color: 'text.secondary' }} /></InputAdornment>
                                        }}
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* Tab 1: Security */}
                        <TabPanel value={tabValue} index={1}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Security Settings</Typography>

                            <Box component="form" onSubmit={handlePasswordChange} sx={{ maxWidth: 600 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>Change Password</Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Current Password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="New Password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Confirm New Password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="outlined"
                                            disabled={saving}
                                            sx={{ borderRadius: 2, px: 4 }}
                                        >
                                            Update Password
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.1)' }} />

                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'error.main' }}>Danger Zone</Typography>
                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: 'rgba(239, 68, 68, 0.05)',
                                        borderRadius: 3,
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 2
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Sign out from all devices</Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            This will invalidate all active sessions across all your devices.
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<Logout />}
                                        onClick={handleLogoutAll}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Log Out All
                                    </Button>
                                </Paper>
                            </Box>
                        </TabPanel>

                        {/* Tab 2: Settings */}
                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Preferences</Typography>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>Appearance</Typography>
                                <Paper sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1, bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                            {mode === 'dark' ? <Settings fontSize="small" /> : <Settings fontSize="small" />}
                                        </Box>
                                        <Box>
                                            <Typography variant="body1" fontWeight={600}>Dark Mode</Typography>
                                            <Typography variant="body2" color="text.secondary">Use dark theme for the interface</Typography>
                                        </Box>
                                    </Box>
                                    <Switch
                                        checked={mode === 'dark'}
                                        onChange={toggleTheme}
                                        color="primary"
                                    />
                                </Paper>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>Notifications</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box>
                                                <Typography variant="body1" fontWeight={600}>Email Notifications</Typography>
                                                <Typography variant="body2" color="text.secondary">Receive updates and alerts via email</Typography>
                                            </Box>
                                            <Switch defaultChecked />
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 2.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box>
                                                <Typography variant="body1" fontWeight={600}>Push Notifications</Typography>
                                                <Typography variant="body2" color="text.secondary">Receive notifications on your device</Typography>
                                            </Box>
                                            <Switch defaultChecked />
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Box>
                        </TabPanel>

                        {/* Tab 3: Activity */}
                        <TabPanel value={tabValue} index={3}>
                            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Login Activity</Typography>
                            <LoginHistory history={user.loginHistory} />
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
