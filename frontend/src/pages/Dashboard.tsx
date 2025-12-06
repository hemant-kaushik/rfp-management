import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { rfpApi } from '../services/api';

export default function Dashboard() {
  const { data: rfps, isLoading, error } = useQuery({
    queryKey: ['rfps'],
    queryFn: () => rfpApi.getAll().then(res => res.data),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load RFPs</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">RFPs</Typography>
        <Button variant="contained" component={Link} to="/rfps/new">
          Create New RFP
        </Button>
      </Box>

      {!rfps || rfps.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No RFPs yet. Create your first RFP to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {rfps.map((rfp: any) => (
            <Grid item xs={12} md={6} key={rfp.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6">{rfp.title}</Typography>
                    <Chip
                      label={rfp.status || 'draft'}
                      size="small"
                      color={rfp.status === 'sent' ? 'primary' : 'default'}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {rfp.description}
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    {rfp.budget && (
                      <Typography variant="body2">
                        <strong>Budget:</strong> ${parseFloat(rfp.budget).toLocaleString()}
                      </Typography>
                    )}
                    {rfp.delivery_days && (
                      <Typography variant="body2">
                        <strong>Delivery:</strong> {rfp.delivery_days} days
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={2} mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Vendors: {rfp.vendor_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Proposals: {rfp.proposal_count || 0}
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to={`/rfps/${rfp.id}`}
                    variant="outlined"
                    size="small"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
