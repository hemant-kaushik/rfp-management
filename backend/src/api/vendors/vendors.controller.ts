import { Request, Response } from 'express';
import { Vendor } from '../../models';

export const getVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await Vendor.findAll({
            order: [['name', 'ASC']],
        });
        res.json(vendors);
    } catch (error: any) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ error: 'Failed to fetch vendors' });
    }
}

export const getVendorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        res.json(vendor);
    } catch (error: any) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({ error: 'Failed to fetch vendor' });
    }
}

export const createVendor = async (req: Request, res: Response) => {
    try {
        const { name, email, contact_person, phone, address } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const vendor = await Vendor.create({
            name,
            email,
            contact_person: contact_person || null,
            phone: phone || null,
            address: address || null,
        });

        res.status(201).json(vendor);
    } catch (error: any) {
        console.error('Error creating vendor:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Vendor with this email already exists' });
        }
        res.status(500).json({ error: 'Failed to create vendor' });
    }
}

export const updateVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, contact_person, phone, address } = req.body;

        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        await vendor.update({
            name: name ?? vendor.name,
            email: email ?? vendor.email,
            contact_person: contact_person ?? vendor.contact_person,
            phone: phone ?? vendor.phone,
            address: address ?? vendor.address,
        });

        res.json(vendor);
    } catch (error: any) {
        console.error('Error updating vendor:', error);
        res.status(500).json({ error: 'Failed to update vendor' });
    }
}

export const deleteVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        await vendor.destroy();
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting vendor:', error);
        res.status(500).json({ error: 'Failed to delete vendor' });
    }
}