import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import RFPDetail from './pages/RFPDetail';
import Vendors from './pages/Vendors';
import VendorForm from './pages/VendorForm';

function App() {
  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfps/new" element={<CreateRFP />} />
          <Route path="/rfps/:id" element={<RFPDetail />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendors/new" element={<VendorForm />} />
          <Route path="/vendors/:id/edit" element={<VendorForm />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
