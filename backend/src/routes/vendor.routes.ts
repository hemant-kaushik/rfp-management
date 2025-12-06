import { Router} from 'express';
import * as vendorsController from '../api/vendors/vendors.controller';

const vendorRoutes = Router();

vendorRoutes.get('/', vendorsController.getVendors);
vendorRoutes.post('/', vendorsController.createVendor);
vendorRoutes.get('/:id', vendorsController.getVendorById);
vendorRoutes.put('/:id', vendorsController.updateVendor);
vendorRoutes.delete('/:id', vendorsController.deleteVendor);

export default vendorRoutes;
