import { Router } from 'express';
import * as proposalController from '../api/proposal/proposal.controller';

const proposalRoutes = Router();

proposalRoutes.post('/parse', proposalController.parseVendorProposalEmail);
proposalRoutes.get('/rfp/:id', proposalController.getProposalsByRFPController);
proposalRoutes.get('/rfp/:id/compare', proposalController.compareProposalsController);

export default proposalRoutes;
