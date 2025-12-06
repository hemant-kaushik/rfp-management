import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          RFP Management System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/rfps/new"
            variant={location.pathname === '/rfps/new' ? 'outlined' : 'text'}
          >
            Create RFP
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/vendors"
            variant={location.pathname.startsWith('/vendors') ? 'outlined' : 'text'}
          >
            Vendors
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
