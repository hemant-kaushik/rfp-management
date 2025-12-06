import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { vendorApi } from '../services/api';
import { useState } from 'react';

export default function Vendors() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null);

  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorApi.getAll().then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vendorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    },
  });

  const handleDeleteClick = (id: number) => {
    setVendorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (vendorToDelete) {
      deleteMutation.mutate(vendorToDelete);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load vendors</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Vendors</Typography>
        <Button variant="contained" onClick={() => navigate('/vendors/new')}>
          Add New Vendor
        </Button>
      </Box>

      {!vendors || vendors.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No vendors yet. Add your first vendor to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {vendors.map((vendor: any) => (
            <Grid item xs={12} md={6} lg={4} key={vendor.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box flex={1}>
                      <Typography variant="h6" gutterBottom>
                        {vendor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {vendor.email}
                      </Typography>
                      {vendor.contact_person && (
                        <Typography variant="body2" color="text.secondary">
                          Contact: {vendor.contact_person}
                        </Typography>
                      )}
                      {vendor.phone && (
                        <Typography variant="body2" color="text.secondary">
                          Phone: {vendor.phone}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(vendor.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vendor?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
