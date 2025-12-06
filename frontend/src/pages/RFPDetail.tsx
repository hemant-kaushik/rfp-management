import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import { rfpApi, vendorApi, proposalApi } from '../services/api';
import { useState } from 'react';

export default function RFPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const { data: rfp, isLoading } = useQuery({
    queryKey: ['rfp', id],
    queryFn: () => rfpApi.getById(Number(id)).then(res => res.data),
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorApi.getAll().then(res => res.data),
  });

  const { data: comparison } = useQuery({
    queryKey: ['comparison', id],
    queryFn: () => proposalApi.compare(Number(id)).then(res => res.data),
    enabled: compareDialogOpen && !!rfp,
  });

  const sendMutation = useMutation({
    mutationFn: (vendorIds: number[]) =>
      rfpApi.sendToVendors(Number(id), vendorIds).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfp', id] });
      setSendDialogOpen(false);
      setSelectedVendors([]);
    },
  });

  const handleSendRFP = () => {
    if (selectedVendors.length === 0) return;
    sendMutation.mutate(selectedVendors);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!rfp) {
    return <Alert severity="error">RFP not found</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{rfp.title}</Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={() => setCompareDialogOpen(true)}>
            Compare Proposals
          </Button>
          <Button variant="contained" onClick={() => setSendDialogOpen(true)}>
            Send to Vendors
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {rfp.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {rfp.budget && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="h6">
                      ${parseFloat(rfp.budget).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                {rfp.delivery_days && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Required
                    </Typography>
                    <Typography variant="h6">{rfp.delivery_days} days</Typography>
                  </Grid>
                )}
                {rfp.payment_terms && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Terms
                    </Typography>
                    <Typography variant="h6">{rfp.payment_terms}</Typography>
                  </Grid>
                )}
                {rfp.warranty_period && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Warranty Required
                    </Typography>
                    <Typography variant="h6">{rfp.warranty_period}</Typography>
                  </Grid>
                )}
              </Grid>

              {rfp.requirements?.items && rfp.requirements.items.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <List>
                    {rfp.requirements.items.map((item: any, idx: number) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            <>
                              {item.quantity && `Quantity: ${item.quantity}`}
                              {item.specifications &&
                                Object.entries(item.specifications).map(([key, value]) => (
                                  <span key={key}>
                                    {' | '}
                                    {key}: {String(value)}
                                  </span>
                                ))}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>

          {rfp.proposals && rfp.proposals.length > 0 && (
            <Box mt={3}>
              <Typography variant="h5" gutterBottom>
                Proposals ({rfp.proposals.length})
              </Typography>
              {rfp.proposals.map((proposal: any) => (
                <Card key={proposal.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6">{proposal.vendor_name}</Typography>
                      <Chip
                        label={`${proposal.completeness_score || 0}% complete`}
                        size="small"
                        color={
                          proposal.completeness_score >= 75
                            ? 'success'
                            : proposal.completeness_score >= 50
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </Box>
                    {proposal.total_price && (
                      <Typography variant="h6" color="primary" gutterBottom>
                        ${parseFloat(proposal.total_price).toLocaleString()}
                      </Typography>
                    )}
                    <Grid container spacing={2} mt={1}>
                      {proposal.delivery_days && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Delivery: {proposal.delivery_days} days
                          </Typography>
                        </Grid>
                      )}
                      {proposal.payment_terms && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment: {proposal.payment_terms}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    {proposal.ai_summary && (
                      <Box mt={2}>
                        <Typography variant="body2" color="text.secondary">
                          {proposal.ai_summary}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vendors ({rfp.vendors?.length || 0})
              </Typography>
              {rfp.vendors && rfp.vendors.length > 0 ? (
                <List>
                  {rfp.vendors.map((vendor: any) => (
                    <ListItem key={vendor.id}>
                      <ListItemText
                        primary={vendor.name}
                        secondary={vendor.email}
                      />
                      <Chip
                        label={vendor.rfp_status}
                        size="small"
                        color={vendor.rfp_status === 'sent' ? 'primary' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No vendors assigned yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Send RFP Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send RFP to Vendors</DialogTitle>
        <DialogContent>
          {vendors && vendors.length > 0 ? (
            <Box>
              {vendors.map((vendor: any) => (
                <FormControlLabel
                  key={vendor.id}
                  control={
                    <Checkbox
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVendors([...selectedVendors, vendor.id]);
                        } else {
                          setSelectedVendors(selectedVendors.filter((id) => id !== vendor.id));
                        }
                      }}
                    />
                  }
                  label={`${vendor.name} (${vendor.email})`}
                />
              ))}
            </Box>
          ) : (
            <Typography>No vendors available. Please add vendors first.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendRFP}
            variant="contained"
            disabled={selectedVendors.length === 0 || sendMutation.isPending}
          >
            {sendMutation.isPending ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Proposal Comparison</DialogTitle>
        <DialogContent>
          {comparison ? (
            <Box>
              {comparison.recommendation && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Vendor: {comparison.recommendation.vendor_name}
                  </Typography>
                  <Typography variant="body2">
                    {comparison.recommendation.reasoning}
                  </Typography>
                </Alert>
              )}
              {comparison.summary && (
                <Typography variant="body1" paragraph>
                  {comparison.summary}
                </Typography>
              )}
              {comparison.comparison && comparison.comparison.length > 0 && (
                <Box mt={2}>
                  {comparison.comparison.map((comp: any, idx: number) => (
                    <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{comp.vendor_name}</Typography>
                        <Chip label={`Score: ${comp.score}`} color="primary" />
                      </Box>
                      <Box mt={1}>
                        <Typography variant="body2" color="success.main">
                          <strong>Strengths:</strong> {comp.strengths.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          <strong>Weaknesses:</strong> {comp.weaknesses.join(', ')}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
