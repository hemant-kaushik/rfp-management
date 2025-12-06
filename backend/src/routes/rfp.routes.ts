import { Router } from 'express';
import * as rfpController from '../api/rfp/rfp.controller';

const rfpRoutes = Router();

rfpRoutes.get('/', rfpController.getRFPs);
rfpRoutes.post('/', rfpController.createRFP);
rfpRoutes.post('/:id/send', rfpController.sendRFPToSelectedVendors);
rfpRoutes.get('/:id', rfpController.getRFPById);

export default rfpRoutes;