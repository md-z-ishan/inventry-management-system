import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { AccessTime, Computer, Public } from '@mui/icons-material';

const LoginHistory = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <Paper sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 4 }} className="glass-card">
                <Typography color="text.secondary">No login history available.</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 0, mt: 3, overflow: 'hidden', borderRadius: 4 }} className="glass-card">
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" fontWeight="700" color="white">
                    Login History
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Recent account activity
                </Typography>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(15, 23, 42, 0.5)' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Date & Time</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Device / Browser</TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>IP Address</TableCell>
                            <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.slice().reverse().slice(0, 10).map((entry, index) => (
                            <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02) !important' } }}>
                                <TableCell sx={{ color: 'text.primary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        {new Date(entry.loginTime).toLocaleString()}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Computer sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        {entry.userAgent ? (entry.userAgent.length > 30 ? entry.userAgent.substring(0, 30) + '...' : entry.userAgent) : 'Unknown'}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Public sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        {entry.ipAddress || 'Unknown'}
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Chip
                                        label={entry.status}
                                        size="small"
                                        color={entry.status === 'SUCCESS' ? 'success' : 'error'}
                                        sx={{ height: 24, fontSize: 11 }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default LoginHistory;
