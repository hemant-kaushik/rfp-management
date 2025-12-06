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
<p><strong>Instructions:</strong></p>
<p>Please reply to this email with your proposal including:</p>
<ul>
    <li>Total price or itemized pricing</li>
    <li>Delivery timeline</li>
    <li>Payment terms</li>
    <li>Warranty information</li>
    <li>Any additional terms or conditions</li>
</ul>

<p>Thank you,<br>
Procurement Team</p>

<p><em>This is an automated email. Please reply directly to this message with your proposal.</em></p>
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
        const replyToEmail = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER || process.env.EMAIL_FROM;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: vendorEmail,
            replyTo: replyToEmail, // So vendors can reply to this email
            subject,
            html: htmlBody,
            // Add text version for email clients that don't support HTML
            text: `Request for Proposal: ${rfp.title}\n\n${rfp.description}\n\nPlease reply to this email with your proposal.`,
        });

        console.log(`RFP sent successfully to ${vendorName} (${vendorEmail})`);
    } catch (error: any) {
        console.error(`Failed to send RFP to ${vendorEmail}:`, error);
        console.error('Error details:', error.message);
        throw new Error(`Failed to send email to ${vendorEmail}: ${error.message}`);
    }
}

/**
 * Send RFP to multiple vendors
 */
export async function sendRFPToVendors(
    vendors: Array<{ email: string; name: string }>,
    rfp: RFPStructure & { id: number }
): Promise<{ success: number; failed: number; errors?: Array<{ vendor: string; error: string }> }> {
    let success = 0;
    let failed = 0;
    const errors: Array<{ vendor: string; error: string }> = [];

    for (const vendor of vendors) {
        try {
            await sendRFPToVendor(vendor.email, vendor.name, rfp);
            success++;
        } catch (error: any) {
            failed++;
            errors.push({
                vendor: vendor.name,
                error: error.message || 'Unknown error'
            });
            console.error(`Failed to send to ${vendor.name}:`, error.message);
        }
    }

    return { success, failed, errors: errors.length > 0 ? errors : undefined };
}
