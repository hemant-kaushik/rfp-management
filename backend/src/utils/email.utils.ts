import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { RFPStructure } from './ai.utils';

dotenv.config();

// Email transporter for sending
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Format RFP as email content
 */
function formatRFPAsEmail(rfp: RFPStructure & { id: number }): string {
    let emailBody = `
<h2>Request for Proposal: ${rfp.title}</h2>

<p><strong>Description:</strong></p>
<p>${rfp.description}</p>

`;

    if (rfp.budget) {
        emailBody += `<p><strong>Budget:</strong> $${rfp.budget.toLocaleString()}</p>\n`;
    }

    if (rfp.delivery_days) {
        emailBody += `<p><strong>Delivery Required:</strong> Within ${rfp.delivery_days} days</p>\n`;
    }

    if (rfp.payment_terms) {
        emailBody += `<p><strong>Payment Terms:</strong> ${rfp.payment_terms}</p>\n`;
    }

    if (rfp.warranty_period) {
        emailBody += `<p><strong>Warranty Required:</strong> ${rfp.warranty_period}</p>\n`;
    }

    if (rfp.requirements?.items && rfp.requirements.items.length > 0) {
        emailBody += `<p><strong>Requirements:</strong></p>\n<ul>\n`;
        rfp.requirements.items.forEach(item => {
            emailBody += `<li>${item.name}`;
            if (item.quantity) emailBody += ` (Quantity: ${item.quantity})`;
            if (item.specifications) {
                emailBody += `<ul>`;
                Object.entries(item.specifications).forEach(([key, value]) => {
                    emailBody += `<li>${key}: ${value}</li>`;
                });
                emailBody += `</ul>`;
            }
            emailBody += `</li>\n`;
        });
        emailBody += `</ul>\n`;
    }

    emailBody += `
<p>Please reply to this email with your proposal including pricing, delivery timeline, and terms.</p>

<p>Thank you,<br>
Procurement Team</p>
`;

    return emailBody;
}

/**
 * Send RFP to a vendor via email
 */
export async function sendRFPToVendor(
    vendorEmail: string,
    vendorName: string,
    rfp: RFPStructure & { id: number }
): Promise<void> {
    const subject = `RFP: ${rfp.title}`;
    const htmlBody = formatRFPAsEmail(rfp);

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: vendorEmail,
            subject,
            html: htmlBody,
        });

        console.log(`RFP sent to ${vendorName} (${vendorEmail})`);
    } catch (error) {
        console.error(`Failed to send RFP to ${vendorEmail}:`, error);
        throw new Error(`Failed to send email to ${vendorEmail}`);
    }
}

/**
 * Send RFP to multiple vendors
 */
export async function sendRFPToVendors(
    vendors: Array<{ email: string; name: string }>,
    rfp: RFPStructure & { id: number }
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const vendor of vendors) {
        try {
            await sendRFPToVendor(vendor.email, vendor.name, rfp);
            success++;
        } catch (error) {
            failed++;
        }
    }

    return { success, failed };
}
