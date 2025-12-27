import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Inventory2 } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [loginRole, setLoginRole] = useState('admin'); // 'admin' or 'user'
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated, user } = useAuth();
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
        try {
            const result = await login(formData);
            if (result.success) {
                const user = result.user;

                // Validate Role Selection
                if (loginRole === 'admin') {
                    if (!user.isAdmin) {
                        toast.error('Access Denied: This account does not have Admin privileges.');
                        // Ideally logout here or just don't redirect
                        return;
                    }
                    navigate('/admin');
                } else {
                    // Logging in as User
                    // Optional: Prevent admins from logging in as users? Or allow it? 
                    // Usually allow, but redirect to user dashboard.
                    navigate('/user');
                }
            } else {
                toast.error(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-900 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${loginRole === 'admin' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-pulse delay-1000 transition-colors duration-1000 ${loginRole === 'admin' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}></div>
            </div>

            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
                <div className="relative z-10 text-white max-w-lg">
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-float transition-all duration-500 ${loginRole === 'admin' ? 'bg-gradient-to-tr from-orange-500 to-amber-500 shadow-orange-500/20' : 'bg-gradient-to-tr from-blue-500 to-cyan-500 shadow-blue-500/20'}`}>
                        <Inventory2 sx={{ fontSize: 56, color: 'white' }} />
                    </div>
                    <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
                        <span className="block mb-2">Smart Inventory</span>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-500 ${loginRole === 'admin' ? 'from-orange-400 to-amber-200' : 'from-blue-400 to-cyan-200'}`}>
                            {loginRole === 'admin' ? 'Admin Portal' : 'Staff Portal'}
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed font-light">
                        {loginRole === 'admin'
                            ? 'Complete control over products, users, and system settings.'
                            : 'Efficiently manage stock, scan QR codes, and handle transactions.'}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative z-10">
                <div className="w-full max-w-md animate-fade-in backdrop-blur-xl bg-slate-800/40 p-10 rounded-3xl border border-white/5 shadow-2xl">

                    {/* Role Selector Tabs */}
                    <div className="flex p-1 bg-slate-900/50 rounded-xl mb-8 border border-white/5">
                        <button
                            onClick={() => setLoginRole('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${loginRole === 'admin'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Lock fontSize="small" />
                            Admin Login
                        </button>
                        <button
                            onClick={() => setLoginRole('user')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${loginRole === 'user'
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Inventory2 fontSize="small" />
                            Staff Login
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400">Sign in to access your {loginRole} dashboard</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
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

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <button type="button" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-slate-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
