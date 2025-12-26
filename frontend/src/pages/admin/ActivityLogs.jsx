import React, { useState, useEffect } from 'react';
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
    TablePagination,
    TextField,
    MenuItem,
    Grid,
    Chip,
    IconButton,
    CircularProgress,
    Collapse,
    Card,
    CardContent,
    Button
} from '@mui/material';
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';
import { adminAPI } from '../../api/services';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Row = ({ log }) => {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{log.performedBy?.name || 'Unknown'}</Typography>
                    <Typography variant="caption" color="text.secondary">{log.userRole}</Typography>
                </TableCell>
                <TableCell>
                    <Chip
                        label={log.action}
                        color={['LOGIN', 'CREATE'].includes(log.action) ? 'success' : log.action === 'DELETE' ? 'error' : 'primary'}
                        size="small"
                        variant="outlined"
                    />
                </TableCell>
                <TableCell>{log.entity}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2">User Agent:</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{log.userAgent}</Typography>

                                    {log.changes && log.changes.length > 0 && (
                                        <>
                                            <Typography variant="subtitle2">Changes:</Typography>
                                            {log.changes.map((change, idx) => (
                                                <Box key={idx} sx={{ ml: 1, mb: 0.5 }}>
                                                    <Typography variant="body2">
                                                        <b>{change.field}:</b> <span style={{ color: 'red' }}>{JSON.stringify(change.oldValue)}</span> &rarr; <span style={{ color: 'green' }}>{JSON.stringify(change.newValue)}</span>
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </>
                                    )}
                                </Grid>
                                {(log.oldData || log.newData) && (
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2">Raw Data Snapshot:</Typography>
                                        <Card variant="outlined" sx={{ bgcolor: '#f5f5f5', maxHeight: 200, overflow: 'auto' }}>
                                            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                <pre style={{ fontSize: '0.75rem', margin: 0 }}>
                                                    {JSON.stringify(log.newData || log.oldData, null, 2)}
                                                </pre>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [total, setTotal] = useState(0);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, actionFilter, userFilter, startDate, endDate]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getLogs({
                page: page + 1,
                limit: rowsPerPage,
                action: actionFilter || undefined,
                user: userFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setLogs(response.data.data);
            setTotal(response.data.total);
        } catch (error) {
            toast.error('Failed to fetch system logs');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleApplyFilters = () => {
        setPage(0);
        fetchLogs();
    };

    const handleResetFilters = () => {
        setActionFilter('');
        setUserFilter('');
        setStartDate('');
        setEndDate('');
        setPage(0);
        // Needed to trigger refetch effectively since state update is async, 
        // but useEffect depends on page/rows. 
        // We can just call fetchLogs next tick or let the user click search.
        // Let's force a fetch with empty params.
        setTimeout(() => {
            fetchLogs();
        }, 100);
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>System Activity Logs</Typography>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Search User"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            placeholder="Name or ID"
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="Action"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="">All Actions</MenuItem>
                            <MenuItem value="LOGIN">Login</MenuItem>
                            <MenuItem value="LOGOUT">Logout</MenuItem>
                            <MenuItem value="CREATE">Create</MenuItem>
                            <MenuItem value="UPDATE">Update</MenuItem>
                            <MenuItem value="DELETE">Delete</MenuItem>
                            <MenuItem value="Access">Access</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" onClick={handleApplyFilters} fullWidth>
                            Filter
                        </Button>
                        <Button variant="outlined" onClick={handleResetFilters} fullWidth>
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Logs Table */}
            <Paper sx={{ width: '100%', mb: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Time</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Entity</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>IP Address</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No logs found</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <Row key={log._id} log={log} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default ActivityLogs;
