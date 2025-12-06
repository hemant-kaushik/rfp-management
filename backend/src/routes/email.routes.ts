import { Router } from 'express';
import * as emailController from '../api/email/email.controller';

const emailRoutes = Router();

emailRoutes.post('/receive', emailController.receiveVendorProposalEmailController);

export default emailRoutes;
