import { Request, Response } from "express";
import { Proposal, RFP, RFPVendor, Vendor } from "../../models";
import { parseRFPFromText, RFPStructure } from "../../utils/ai.utils";
import { sendRFPToVendors } from "../../utils/email.utils";
import { Op } from "sequelize";

export const getRFPs = async (req: Request, res: Response) => {
    try {
        const rfps = await RFP.findAll({
            include: [
                {
                    model: Vendor,
                    as: 'vendors',
                    through: { attributes: [] },
                    required: false,
                },
                {
                    model: Proposal,
                    as: 'proposals',
                    required: false,
                },
            ],
            order: [['created_at', 'DESC']],
        });

        // Format response with counts
        const formattedRFPs = rfps.map((rfp: any) => ({
            ...rfp.toJSON(),
            vendor_count: rfp.vendors?.length || 0,
            proposal_count: rfp.proposals?.length || 0,
        }));

        res.json(formattedRFPs);
    } catch (error: any) {
        console.error('Error fetching RFPs:', error);
        res.status(500).json({ error: 'Failed to fetch RFPs' });
    }
}

export const getRFPById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const rfp = await RFP.findByPk(id, {
            include: [
                {
                    model: Vendor,
                    as: 'vendors',
                    through: {
                        attributes: ['sent_at', 'status'],
                    },
                    required: false,
                },
                {
                    model: Proposal,
                    as: 'proposals',
                    include: [
                        {
                            model: Vendor,
                            as: 'vendor',
                            attributes: ['name', 'email'],
                        },
                    ],
                    required: false,
                    separate: true,
                    order: [['created_at', 'DESC']],
                },
            ],
        });

        if (!rfp) {
            return res.status(404).json({ error: 'RFP not found' });
        }

        // Format vendors with RFP status
        const vendors = (rfp as any).vendors?.map((vendor: any) => ({
            ...vendor.toJSON(),
            rfp_status: vendor.RFPVendor?.status,
            sent_at: vendor.RFPVendor?.sent_at,
        })) || [];

        const proposals = ((rfp as any).proposals?.map((proposal: any) => ({
            ...proposal.toJSON(),
            vendor_name: proposal.vendor?.name,
            vendor_email: proposal.vendor?.email,
        })) || []).sort((a: any, b: any) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Descending order (newest first)
        });

        res.json({
            ...rfp.toJSON(),
            vendors,
            proposals,
        });
    } catch (error: any) {
        console.error('Error fetching RFP:', error);
        res.status(500).json({ error: 'Failed to fetch RFP' });
    }
}

export const createRFP = async (req: Request, res: Response) => {
    try {
        const { description } = req.body;

        if (!description || typeof description !== 'string') {
            return res.status(400).json({ error: 'Description is required' });
        }

        // Parse natural language to structured RFP
        const structuredRFP = await parseRFPFromText(description);

        // Save to database using Sequelize
        const rfp = await RFP.create({
            title: structuredRFP.title,
            description: structuredRFP.description,
            budget: structuredRFP.budget || null,
            delivery_days: structuredRFP.delivery_days || null,
            payment_terms: structuredRFP.payment_terms || null,
            warranty_period: structuredRFP.warranty_period || null,
            requirements: structuredRFP.requirements || null,
        });

        res.status(201).json(rfp);
    } catch (error: any) {
        console.error('Error creating RFP:', error);
        res.status(500).json({ error: error.message || 'Failed to create RFP' });
    }
}

export const sendRFPToSelectedVendors = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vendor_ids } = req.body;

        if (!Array.isArray(vendor_ids) || vendor_ids.length === 0) {
            return res.status(400).json({ error: 'vendor_ids array is required' });
        }

        // Get RFP
        const rfp = await RFP.findByPk(id);
        if (!rfp) {
            return res.status(404).json({ error: 'RFP not found' });
        }

        // Get vendors
        const vendors = await Vendor.findAll({
            where: {
                id: {
                    [Op.in]: vendor_ids,
                },
            },
        });

        if (vendors.length === 0) {
            return res.status(404).json({ error: 'No vendors found' });
        }

        // Send emails
        const structuredRFP = {
            id: rfp.id,
            title: rfp.title,
            description: rfp.description,
            budget: rfp.budget ? parseFloat(String(rfp.budget)) : undefined,
            delivery_days: rfp.delivery_days || undefined,
            payment_terms: rfp.payment_terms || undefined,
            warranty_period: rfp.warranty_period || undefined,
            requirements: rfp.requirements || undefined,
        };

        const emailResult = await sendRFPToVendors(
            vendors.map((v) => ({ email: v.email, name: v.name })),
            structuredRFP as RFPStructure & { id: number }
        );

        // Update rfp_vendors table using Sequelize
        const now = new Date();
        for (const vendor of vendors) {
            await RFPVendor.upsert({
                rfp_id: Number(id),
                vendor_id: vendor.id,
                sent_at: now,
                status: 'sent',
            });
        }

        res.json({
            message: 'RFP sent to vendors',
            success: emailResult.success,
            failed: emailResult.failed
        });
    } catch (error: any) {
        console.error('Error sending RFP:', error);
        res.status(500).json({ error: error.message || 'Failed to send RFP' });
    }
}
