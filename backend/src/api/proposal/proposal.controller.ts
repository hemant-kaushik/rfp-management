import { Request, Response } from "express";
import { RFP, Vendor } from "../../models";
import { Proposal } from "../../models";
import { compareProposals, parseProposalEmail } from "../../utils/ai.utils";

export const parseVendorProposalEmail = async (req: Request, res: Response) => {
    try {
        const { rfp_id, vendor_id, email_subject, email_body } = req.body;

        if (!rfp_id || !vendor_id || !email_subject || !email_body) {
            return res.status(400).json({
                error: 'rfp_id, vendor_id, email_subject, and email_body are required'
            });
        }

        // Get RFP requirements
        const rfp = await RFP.findByPk(rfp_id);
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
        const parsedData = await parseProposalEmail(email_subject, email_body, rfpRequirements);

        // Calculate completeness score (simple heuristic)
        let completenessScore = 0;
        if (parsedData.total_price) completenessScore += 25;
        if (parsedData.delivery_days) completenessScore += 25;
        if (parsedData.payment_terms) completenessScore += 25;
        if (parsedData.items && parsedData.items.length > 0) completenessScore += 25;

        // Save proposal using Sequelize
        const proposal = await Proposal.create({
            rfp_id,
            vendor_id,
            email_subject,
            email_body,
            raw_response: email_body,
            parsed_data: parsedData,
            total_price: parsedData.total_price || null,
            delivery_days: parsedData.delivery_days || null,
            payment_terms: parsedData.payment_terms || null,
            warranty_period: parsedData.warranty_period || null,
            completeness_score: completenessScore,
        });

        res.status(201).json(proposal);
    } catch (error: any) {
        console.error('Error parsing proposal:', error);
        res.status(500).json({ error: error.message || 'Failed to parse proposal' });
    }
}

export const compareProposalsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get RFP
        const rfp = await RFP.findByPk(id);
        if (!rfp) {
            return res.status(404).json({ error: 'RFP not found' });
        }

        // Get all proposals for this RFP
        const proposals = await Proposal.findAll({
            where: { rfp_id: id },
            include: [
                {
                    model: Vendor,
                    as: 'vendor',
                    attributes: ['name'],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        if (proposals.length === 0) {
            return res.json({
                message: 'No proposals received yet',
                comparison: [],
                recommendation: null,
                summary: 'No proposals to compare',
            });
        }

        // Prepare data for AI comparison
        const proposalsForComparison = proposals.map((p: any) => ({
            vendor_name: p.vendor?.name,
            total_price: p.total_price ? parseFloat(String(p.total_price)) : undefined,
            delivery_days: p.delivery_days || undefined,
            payment_terms: p.payment_terms || undefined,
            warranty_period: p.warranty_period || undefined,
            completeness_score: p.completeness_score ? parseFloat(String(p.completeness_score)) : undefined,
            parsed_data: p.parsed_data,
        }));

        const rfpRequirements = {
            title: rfp.title,
            description: rfp.description || '',
            budget: rfp.budget ? parseFloat(String(rfp.budget)) : undefined,
            delivery_days: rfp.delivery_days || undefined,
            payment_terms: rfp.payment_terms || undefined,
            warranty_period: rfp.warranty_period || undefined,
            requirements: (rfp.requirements as { items: Array<any> }) || { items: [] },
        };

        // Get AI comparison
        const comparison = await compareProposals(proposalsForComparison, rfpRequirements);

        // Update proposals with AI summary/recommendation
        for (const comp of comparison.comparison) {
            const proposal = proposals.find((p: any) => p.vendor?.name === comp.vendor_name);
            if (proposal) {
                await proposal.update({
                    ai_summary: `Strengths: ${comp.strengths.join(', ')}\nWeaknesses: ${comp.weaknesses.join(', ')}`,
                });
            }
        }

        res.json({
            rfp: {
                id: rfp.id,
                title: rfp.title,
                budget: rfp.budget,
                requirements: rfp.requirements,
            },
            proposals: proposals.map((p: any) => ({
                ...p.toJSON(),
                vendor_name: p.vendor?.name,
            })),
            comparison: comparison.comparison,
            recommendation: comparison.recommendation,
            summary: comparison.summary,
        });
    } catch (error: any) {
        console.error('Error comparing proposals:', error);
        res.status(500).json({ error: error.message || 'Failed to compare proposals' });
    }
}