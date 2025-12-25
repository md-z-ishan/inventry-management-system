import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, InputAdornment, IconButton, Typography, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Inventory2 } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await register(formData);
            if (result.success) {
                navigate('/dashboard');
            } else {
                toast.error(result.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-900 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 order-2">
                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20 animate-float">
                        <Inventory2 sx={{ fontSize: 48, color: 'white' }} />
                    </div>
                    <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
                        Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">NexusInv</span> Today
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed font-light">
                        Unlock powerful inventory analytics, team collaboration, and real-time tracking features for free.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative z-10 order-1">
                <div className="w-full max-w-md animate-fade-in backdrop-blur-xl bg-slate-800/40 p-10 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400">Join thousands of users optimizing their inventory</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&.Mui-focused fieldset': { borderColor: '#f97316' },
                                    },
                                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#f97316' },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Email address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&.Mui-focused fieldset': { borderColor: '#f97316' },
                                    },
                                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#f97316' },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                variant="outlined"
                                helperText={<span className="text-slate-500">Min 8 chars, 1 uppercase, 1 lowercase, 1 number</span>}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                                        '&.Mui-focused fieldset': { borderColor: '#f97316' },
                                    },
                                    '& .MuiInputLabel-root': { color: '#94a3b8' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#f97316' },
                                    '& .MuiFormHelperText-root': { color: '#94a3b8' },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" className="text-slate-400">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                textTransform: 'none',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-slate-400">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
