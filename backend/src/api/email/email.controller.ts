import { Request, Response } from "express";
import { Proposal, RFP, Vendor } from "../../models";
import { Op } from "sequelize";
import { parseProposalEmail } from "../../utils/ai.utils";

export const receiveVendorProposalEmailController = async (req: Request, res: Response) => {
    try {
        const { from, subject, body, rfp_id } = req.body;

        if (!from || !subject || !body) {
            return res.status(400).json({ error: 'from, subject, and body are required' });
        }

        // Find vendor by email
        const vendor = await Vendor.findOne({
            where: { email: from },
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found. Please add vendor first.' });
        }

        // If rfp_id is provided, use it; otherwise try to find RFP from subject
        let rfpId = rfp_id;
        if (!rfpId) {
            // Try to extract RFP ID from subject (e.g., "Re: RFP: Laptops and Monitors")
            const searchTitle = `%${subject.replace(/^(Re:|Fwd?:)\s*/i, '').trim()}%`;
            const foundRfp = await RFP.findOne({
                where: {
                    title: {
                        [Op.iLike]: searchTitle,
                    },
                },
                limit: 1,
            });
            if (foundRfp) {
                rfpId = foundRfp.id;
            }
        }

        if (!rfpId) {
            return res.status(400).json({
                error: 'Could not determine RFP. Please provide rfp_id in request.',
            });
        }

        // Get RFP requirements
        const rfp = await RFP.findByPk(rfpId);
        if (!rfp) {
            return res.status(404).json({ error: 'RFP not found' });
        }

        const rfpRequirements = {
            title: rfp.title,
            description: rfp.description || '',
            budget: rfp.budget ? parseFloat(String(rfp.budget)) : undefined,
            delivery_days: rfp.delivery_days || undefined,
            payment_terms: rfp.payment_terms || undefined,
            warranty_period: rfp.warranty_period || undefined,
            requirements: (rfp.requirements as { items: Array<any> }) || { items: [] },
        };

        // Parse email with AI
        const parsedData = await parseProposalEmail(subject, body, rfpRequirements);

        // Calculate completeness score
        let completenessScore = 0;
        if (parsedData.total_price) completenessScore += 25;
        if (parsedData.delivery_days) completenessScore += 25;
        if (parsedData.payment_terms) completenessScore += 25;
        if (parsedData.items && parsedData.items.length > 0) completenessScore += 25;

        // Save proposal using Sequelize
        const proposal = await Proposal.create({
            rfp_id: rfpId,
            vendor_id: vendor.id,
            email_subject: subject,
            email_body: body,
            raw_response: body,
            parsed_data: parsedData,
            total_price: parsedData.total_price || null,
            delivery_days: parsedData.delivery_days || null,
            payment_terms: parsedData.payment_terms || null,
            warranty_period: parsedData.warranty_period || null,
            completeness_score: completenessScore,
        });

        res.status(201).json({
            message: 'Proposal received and parsed successfully',
            proposal,
        });
    } catch (error: any) {
        console.error('Error receiving email:', error);
        res.status(500).json({ error: error.message || 'Failed to process email' });
    }
}