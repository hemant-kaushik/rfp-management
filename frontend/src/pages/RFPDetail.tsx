import { useParams } from 'react-router-dom';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import { rfpApi, vendorApi, proposalApi } from '../services/api';
import { useState } from 'react';

export default function RFPDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [showProposals, setShowProposals] = useState(false);

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

  const { data: proposalsData, isLoading: proposalsLoading, refetch: refetchProposals } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalApi.getByRFP(Number(id)).then(res => res.data),
    enabled: showProposals && !!id,
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
          <Button
            variant="outlined"
            onClick={() => {
              setShowProposals(!showProposals);
              if (!showProposals) {
                refetchProposals();
              }
            }}
            color={showProposals ? 'primary' : 'inherit'}
          >
            {showProposals ? 'Hide Proposals' : 'Show Proposals'}
          </Button>
          {showProposals && proposalsData && proposalsData.proposals && proposalsData.proposals.length > 0 && (
            <Button variant="outlined" onClick={() => setCompareDialogOpen(true)}>
              Compare Proposals
            </Button>
          )}
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

          {/* Proposals Section */}
          {showProposals && (
            <Box mt={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">
                  Proposals
                  {proposalsData && proposalsData.count > 0 && (
                    <Chip
                      label={`${proposalsData.count} received`}
                      size="small"
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                <Button
                  size="small"
                  onClick={() => refetchProposals()}
                  disabled={proposalsLoading}
                  startIcon={proposalsLoading ? <CircularProgress size={16} /> : <EmailIcon />}
                >
                  Refresh
                </Button>
              </Box>

              {proposalsLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : proposalsData && proposalsData.proposals && proposalsData.proposals.length > 0 ? (
                <Box>
                  {proposalsData.proposals.map((proposal: any) => (
                    <Card
                      key={proposal.id}
                      sx={{
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: 4,
                          borderColor: 'primary.main',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <CardContent>
                        <Accordion defaultExpanded={false} sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              px: 0,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                              <Box>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <EmailIcon color="primary" fontSize="small" />
                                  <Typography variant="h6" fontWeight="bold">
                                    {proposal.vendor_name}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {proposal.vendor_email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {proposal.email_subject}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {new Date(proposal.created_at).toLocaleString()}
                                </Typography>
                              </Box>
                              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                {proposal.total_price && (
                                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                                    ${parseFloat(proposal.total_price).toLocaleString()}
                                  </Typography>
                                )}
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
                                <Chip
                                  label={proposal.status || 'received'}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 2 }}>
                            <Grid container spacing={2} mb={2}>
                              {proposal.delivery_days && (
                                <Grid item xs={6} sm={3}>
                                  <Paper sx={{ p: 1.5, bgcolor: 'primary.50', textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Delivery
                                    </Typography>
                                    <Typography variant="h6" color="primary.main">
                                      {proposal.delivery_days} days
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                              {proposal.payment_terms && (
                                <Grid item xs={6} sm={3}>
                                  <Paper sx={{ p: 1.5, bgcolor: 'success.50', textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Payment Terms
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="success.main">
                                      {proposal.payment_terms}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                              {proposal.warranty_period && (
                                <Grid item xs={6} sm={3}>
                                  <Paper sx={{ p: 1.5, bgcolor: 'info.50', textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Warranty
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="info.main">
                                      {proposal.warranty_period}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                            </Grid>

                            {proposal.ai_summary && (
                              <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                  AI Summary
                                </Typography>
                                <Typography variant="body2">{proposal.ai_summary}</Typography>
                              </Alert>
                            )}

                            {proposal.ai_recommendation && (
                              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                  AI Recommendation
                                </Typography>
                                <Typography variant="body2">{proposal.ai_recommendation}</Typography>
                              </Alert>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                              Email Content
                            </Typography>
                            <Paper
                              sx={{
                                p: 2,
                                bgcolor: 'grey.50',
                                maxHeight: 300,
                                overflow: 'auto',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography
                                variant="body2"
                                component="pre"
                                sx={{
                                  whiteSpace: 'pre-wrap',
                                  fontFamily: 'inherit',
                                  margin: 0,
                                }}
                              >
                                {proposal.email_body || proposal.raw_response || 'No email content available'}
                              </Typography>
                            </Paper>
                          </AccordionDetails>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No proposals received yet for this RFP. Proposals will appear here once vendors reply to the RFP.
                </Alert>
              )}
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
