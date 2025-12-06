import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { rfpApi } from '../services/api';

export default function CreateRFP() {
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (desc: string) => rfpApi.create(desc).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      navigate(`/rfps/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      return;
    }
    mutation.mutate(description);
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Create New RFP
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" paragraph>
            Describe what you want to procure in natural language. Our AI will extract the
            structured information automatically.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="RFP Description"
              placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              required
            />

            {mutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Failed to create RFP'}
              </Alert>
            )}

            <Box mt={3} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending || !description.trim()}
              >
                {mutation.isPending ? <CircularProgress size={24} /> : 'Create RFP'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/')}>
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
