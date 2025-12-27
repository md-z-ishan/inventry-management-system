import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, InputAdornment, IconButton, Typography, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Inventory2, Person, PersonAdd, Badge as BadgeIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        // confirmPassword: '' // Ideally add this validation
    });
    const [loading, setLoading] = useState(false);
    const [registerRole, setRegisterRole] = useState('user'); // 'admin' or 'user' (default to user/staff to be safe, or match login default)
    const [showPassword, setShowPassword] = useState(false);
    const { register, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.isAdmin ? '/admin' : '/user');
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare data with selected role
        const registrationData = {
            ...formData,
            role: registerRole
        };

        try {
            const result = await register(registrationData);
            if (result.success) {
                // Success toast already shown in context
                // Redirect based on role
                if (registerRole === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/user');
                }
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
                <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${registerRole === 'admin' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-1000 ${registerRole === 'admin' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}></div>
            </div>

            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
                <div className="relative z-10 text-white max-w-lg">
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-float transition-all duration-500 ${registerRole === 'admin' ? 'bg-gradient-to-tr from-orange-500 to-amber-500 shadow-orange-500/20' : 'bg-gradient-to-tr from-blue-500 to-cyan-500 shadow-blue-500/20'}`}>
                        <Inventory2 sx={{ fontSize: 56, color: 'white' }} />
                    </div>
                    <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
                        <span className="block mb-2">Join NexusInv</span>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500 ${registerRole === 'admin' ? 'from-orange-400 to-amber-200' : 'from-blue-400 to-cyan-200'}`}>
                            {registerRole === 'admin' ? 'Create Admin Account' : 'Create Staff Account'}
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed font-light">
                        {registerRole === 'admin'
                            ? 'Start your own inventory environment. Manage products, users, and analytics.'
                            : 'Join your team. Track inventory, scan items, and simplify your daily operations.'}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
                <div className="w-full max-w-md animate-fade-in backdrop-blur-xl bg-slate-800/40 p-10 rounded-3xl border border-white/5 shadow-2xl">

                    {/* Role Selector Tabs */}
                    <div className="flex p-1 bg-slate-900/50 rounded-xl mb-8 border border-white/5">
                        <button
                            onClick={() => setRegisterRole('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${registerRole === 'admin'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <PersonAdd fontSize="small" />
                            Admin
                        </button>
                        <button
                            onClick={() => setRegisterRole('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${registerRole === 'user'
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <BadgeIcon fontSize="small" />
                            Staff
                        </button>
                    </div>

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
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <Button
                            fullWidth
                            size="large"
                            type="submit"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: 3,
                                textTransform: 'none',
                                background: registerRole === 'admin'
                                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                boxShadow: registerRole === 'admin'
                                    ? '0 10px 20px -5px rgba(249, 115, 22, 0.5)'
                                    : '0 10px 20px -5px rgba(59, 130, 246, 0.5)',
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : `Create ${registerRole === 'admin' ? 'Admin' : 'Staff'} Account`}
                        </Button>

                        <div className="text-center mt-6">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Already have an account? <Link to="/login" className={`font-semibold hover:underline ${registerRole === 'admin' ? 'text-orange-500' : 'text-blue-500'}`}>Sign in instead</Link>
                            </Typography>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
