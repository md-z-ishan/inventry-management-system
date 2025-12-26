import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, TextField, useTheme, Avatar, Grid, Divider, CircularProgress } from '@mui/material';
import { Save, Person, Email, Badge } from '@mui/icons-material';
import { authAPI } from '../api/services';
import { toast } from 'react-toastify';
import LoginHistory from '../components/LoginHistory';

const Profile = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState({
        name: '',
        email: '',
        role: '',
        userId: '',
        loginHistory: []
    });

    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getMe();
            console.log('Profile Data:', response.data);
            const userData = response.data.data.user;
            setUser({
                name: userData.name || '',
                email: userData.email || '',
                role: userData.role || '',
                userId: userData._id || '#USER-123456',
                loginHistory: userData.loginHistory || []
            });
            setFormData({
                name: userData.name || '',
                email: userData.email || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
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
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
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
                <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                    My Profile
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Manage your account settings and preferences.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Profile Card */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: 5, textAlign: 'center' }} className="glass-card">
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                margin: '0 auto',
                                mb: 3,
                                bgcolor: theme.palette.primary.main,
                                fontSize: '3rem',
                                fontWeight: 700
                            }}
                        >
                            {user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                            {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textTransform: 'capitalize' }}>
                            {user.role}
                        </Typography>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                        <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                                <Email fontSize="small" />
                                <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                                <Badge fontSize="small" />
                                <Typography variant="body2">ID: {user.userId}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Edit Form */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 5 }} className="glass-card">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 4 }}>
                            Edit Profile
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="name"
                                        label="Full Name"
                                        variant="outlined"
                                        value={formData.name}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                            },
                                            '& .MuiInputLabel-root': { color: 'text.secondary' },
                                            '& .MuiInputBase-input': { color: 'white' },
                                        }}
                                        InputProps={{
                                            startAdornment: <Person sx={{ color: 'text.secondary', mr: 1, my: 0.5 }} />,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email Address"
                                        variant="outlined"
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                                            },
                                            '& .MuiInputLabel-root': { color: 'text.secondary' },
                                            '& .MuiInputBase-input': { color: 'white' },
                                        }}
                                        InputProps={{
                                            startAdornment: <Email sx={{ color: 'text.secondary', mr: 1, my: 0.5 }} />,
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 3,
                                        fontWeight: 600
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Login History */}
                    <LoginHistory history={user.loginHistory} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
