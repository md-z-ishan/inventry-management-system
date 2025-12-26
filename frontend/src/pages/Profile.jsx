import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, TextField, useTheme, Avatar, Grid, Divider,
    CircularProgress, Tabs, Tab, IconButton, Switch, FormControlLabel, Fade
} from '@mui/material';
import {
    Save, Person, Email, Badge, CameraAlt, Security,
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
        >
            {value === index && (
                <Box sx={{ p: 3 }} className="animate-fade-in">
                    {children}
                </Box>
            )}
        </div>
    );
};

const Profile = () => {
    const theme = useTheme();
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

    const [preferences, setPreferences] = useState({
        theme: 'dark',
        notifications: {
            email: true,
            push: true
        }
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
            if (userData.preferences) {
                setPreferences(userData.preferences);
            }
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
        // Optimistically update preference in backend
        const newTheme = mode === 'light' ? 'dark' : 'light';
        try {
            await authAPI.updatePreferences({ theme: newTheme });
        } catch (error) {
            console.error('Failed to save theme preference');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }} className="animate-fade-in">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 1 }}>
                    My Profile
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Manage your account settings and preferences.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Panel: Avatar & Nav */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: 5, textAlign: 'center', mb: 3 }} className="glass-card">
                        <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                            <Avatar
                                src={user.avatar}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto',
                                    border: `4px solid ${theme.palette.background.paper}`,
                                    boxShadow: theme.shadows[10],
                                    fontSize: '3rem',
                                    bgcolor: theme.palette.primary.main
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
                                        bgcolor: theme.palette.secondary.main,
                                        color: 'white',
                                        '&:hover': { bgcolor: theme.palette.secondary.dark }
                                    }}
                                >
                                    <CameraAlt fontSize="small" />
                                </IconButton>
                            </label>
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{user.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 3 }}>
                            {user.role}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Tabs
                            orientation="vertical"
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{ borderRight: 1, borderColor: 'divider', '& .MuiTab-root': { alignItems: 'start' } }}
                        >
                            <Tab icon={<Person fontSize="small" sx={{ mr: 1 }} />} iconPosition="start" label="Edit Profile" />
                            <Tab icon={<Security fontSize="small" sx={{ mr: 1 }} />} iconPosition="start" label="Security" />
                            <Tab icon={<Settings fontSize="small" sx={{ mr: 1 }} />} iconPosition="start" label="Preferences" />
                            <Tab icon={<History fontSize="small" sx={{ mr: 1 }} />} iconPosition="start" label="Activity Log" />
                        </Tabs>
                    </Paper>
                </Grid>

                {/* Right Panel: Content */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ minHeight: 400, borderRadius: 5, overflow: 'hidden' }} className="glass-card">
                        {/* Tab 0: Edit Profile */}
                        <TabPanel value={tabValue} index={0}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Personal Information</Typography>
                            <Box component="form" onSubmit={handleProfileUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Full Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ startAdornment: <Person sx={{ color: 'text.secondary', mr: 1 }} /> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            name="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} /> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ startAdornment: <Phone sx={{ color: 'text.secondary', mr: 1 }} /> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ startAdornment: <Home sx={{ color: 'text.secondary', mr: 1 }} /> }}
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saving}
                                        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Box>
                            </Box>
                        </TabPanel>

                        {/* Tab 1: Security */}
                        <TabPanel value={tabValue} index={1}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Change Password</Typography>
                            <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 500 }}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Current Password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="New Password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Confirm New Password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={saving}
                                >
                                    Update Password
                                </Button>
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'error.main' }}>Danger Zone</Typography>
                            <Box sx={{ p: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Active Sessions</Typography>
                                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                    If you notice suspicious activity, you can log out of all other sessions across all devices.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Logout />}
                                    onClick={handleLogoutAll}
                                >
                                    Log Out All Devices
                                </Button>
                            </Box>
                        </TabPanel>

                        {/* Tab 2: Settings */}
                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Appearance & Preferences</Typography>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>Theme</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>Dark Mode</Typography>
                                        <Typography variant="body2" color="text.secondary">Switch between dark and light themes</Typography>
                                    </Box>
                                    <Switch
                                        checked={mode === 'dark'}
                                        onChange={toggleTheme}
                                    />
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Notifications</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label="Email Notifications" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label="Browser Push Notifications" />
                                    </Grid>
                                </Grid>
                            </Box>
                        </TabPanel>

                        {/* Tab 3: Activity */}
                        <TabPanel value={tabValue} index={3}>
                            <LoginHistory history={user.loginHistory} />
                        </TabPanel>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
