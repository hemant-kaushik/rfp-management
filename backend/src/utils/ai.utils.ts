import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface RFPStructure {
    title: string;
    description: string;
    budget?: number;
    delivery_days?: number;
    payment_terms?: string;
    warranty_period?: string;
    requirements: {
        items: Array<{
            name: string;
            quantity?: number;
            specifications?: Record<string, any>;
        }>;
    };
}

export interface ParsedProposal {
    total_price?: number;
    delivery_days?: number;
    payment_terms?: string;
    warranty_period?: string;
    items?: Array<{
        name: string;
        quantity?: number;
        price?: number;
        specifications?: Record<string, any>;
    }>;
    notes?: string;
}

/**
 * Convert natural language RFP description to structured format
 */
export async function parseRFPFromText(text: string): Promise<RFPStructure> {
    const prompt = `You are an RFP parsing assistant. Extract structured information from the following natural language RFP description.

Return a JSON object with this structure:
{
  "title": "Short descriptive title",
  "description": "Full description",
  "budget": number (if mentioned),
  "delivery_days": number (if mentioned),
  "payment_terms": "string (e.g., 'net 30')",
  "warranty_period": "string (e.g., '1 year')",
  "requirements": {
    "items": [
      {
        "name": "item name",
        "quantity": number (if mentioned),
        "specifications": { "key": "value" } (any relevant specs)
      }
    ]
  }
}

RFP Description:
${text}

Return ONLY valid JSON, no markdown formatting or additional text.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that extracts structured data from text. Always return valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        return JSON.parse(content) as RFPStructure;
    } catch (error: any) {
        console.error('Error parsing RFP:', error);
        
        // Handle OpenAI API quota/rate limit errors
        if (error?.status === 429 || error?.code === 'insufficient_quota' || error?.code === 'rate_limit_exceeded') {
            const errorMessage = error?.error?.message || error?.message || 'Quota exceeded';
            throw new Error(`OpenAI API Quota Error: ${errorMessage}. Please add a payment method at https://platform.openai.com/account/billing to increase your quota.`);
        }
        
        // Handle authentication errors
        if (error?.status === 401) {
            throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
        }
        
        // Re-throw with original message if available
        if (error?.message) {
            throw error;
        }
        
        throw new Error('Failed to parse RFP from natural language');
    }
}

/**
 * Parse vendor proposal email and extract structured data
 */
export async function parseProposalEmail(
    emailSubject: string,
    emailBody: string,
    rfpRequirements: RFPStructure
): Promise<ParsedProposal> {
    const prompt = `You are analyzing a vendor proposal email. Extract key information and match it to the RFP requirements.

RFP Requirements:
${JSON.stringify(rfpRequirements, null, 2)}

Vendor Email:
Subject: ${emailSubject}
Body: ${emailBody}

Extract and return a JSON object with:
{
  "total_price": number (if mentioned),
  "delivery_days": number (if mentioned),
  "payment_terms": "string",
  "warranty_period": "string",
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "price": number,
      "specifications": { "key": "value" }
    }
  ],
  "notes": "any additional notes or conditions"
}

Return ONLY valid JSON, no markdown formatting.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a procurement assistant that extracts structured data from vendor proposals. Always return valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        return JSON.parse(content) as ParsedProposal;
    } catch (error) {
        console.error('Error parsing proposal:', error);
        throw new Error('Failed to parse vendor proposal');
    }
}

/**
 * Compare proposals and generate recommendation
 */
export async function compareProposals(
    proposals: Array<{
        vendor_name: string;
        total_price?: number;
        delivery_days?: number;
        payment_terms?: string;
        warranty_period?: string;
        completeness_score?: number;
        parsed_data: any;
    }>,
    rfpRequirements: RFPStructure
): Promise<{
    comparison: Array<{
        vendor_name: string;
        score: number;
        strengths: string[];
        weaknesses: string[];
    }>;
    recommendation: {
        vendor_name: string;
        reasoning: string;
    };
    summary: string;
}> {
    const prompt = `You are a procurement expert. Compare the following vendor proposals against the RFP requirements and provide recommendations.

RFP Requirements:
${JSON.stringify(rfpRequirements, null, 2)}

Proposals:
${JSON.stringify(proposals, null, 2)}

Return a JSON object with:
{
  "comparison": [
    {
      "vendor_name": "string",
      "score": number (0-100),
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "recommendation": {
    "vendor_name": "string",
    "reasoning": "detailed explanation"
  },
  "summary": "overall comparison summary"
}

Consider: price competitiveness, delivery time, payment terms, warranty, completeness of response, and alignment with requirements.

Return ONLY valid JSON, no markdown formatting.`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a procurement expert providing vendor comparison analysis. Always return valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        return JSON.parse(content);
    } catch (error) {
        console.error('Error comparing proposals:', error);
        throw new Error('Failed to compare proposals');
    }
}
