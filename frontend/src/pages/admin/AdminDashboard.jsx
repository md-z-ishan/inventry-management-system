import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    useTheme
} from '@mui/material';
import {
    People as PeopleIcon,
    VerifiedUser as ActiveIcon,
    Block as SuspendedIcon,
    Error as FailureIcon
} from '@mui/icons-material';
import { adminAPI } from '../../api/services';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" variant="subtitle1" component="div">
                    {title}
                </Typography>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: `${color}.light`,
                    color: `${color}.main`,
                    display: 'flex'
                }}>
                    {icon}
                </Box>
            </Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!stats) return null;

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Admin Dashboard
            </Typography>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.users.total}
                        icon={<PeopleIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={stats.users.active}
                        icon={<ActiveIcon />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Suspended Users"
                        value={stats.users.suspended}
                        icon={<SuspendedIcon />}
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Failed Logins (24h)"
                        value={stats.logins.failed}
                        icon={<FailureIcon />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Recent Activity */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Recent System Activity
                        </Typography>
                        <List>
                            {stats.recentActivities.map((activity, index) => (
                                <React.Fragment key={activity._id}>
                                    {index > 0 && <Divider component="li" />}
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                                {activity.performedBy?.name?.charAt(0) || '?'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
                                                        {activity.performedBy?.name || 'Unknown User'}
                                                    </Typography>
                                                    <Chip
                                                        label={activity.action}
                                                        size="small"
                                                        color={activity.action === 'LOGIN' ? 'info' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                        sx={{ display: 'block', my: 0.5 }}
                                                    >
                                                        {activity.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm:ss')} • {activity.ipAddress}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Quick Actions or Future Widgets */}
                <Grid item xs={12} md={4}>
                    {/* Placeholder for future widgets like storage usage, etc */}
                    <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.default' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            System Status
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Server Status</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                                    <Typography variant="body1" fontWeight="medium">Operational</Typography>
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Database</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                                    <Typography variant="body1" fontWeight="medium">Connected</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
