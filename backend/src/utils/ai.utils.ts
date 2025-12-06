import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY?.trim();

if (!PERPLEXITY_API_KEY) {
    console.warn('Warning: PERPLEXITY_API_KEY is not set. AI features will not work.');
} else {
    if (!PERPLEXITY_API_KEY.startsWith('pplx-')) {
        console.warn('Warning: PERPLEXITY_API_KEY does not start with "pplx-". Please verify your API key is correct.');
    } else {
        console.log('Perplexity API Key loaded successfully');
    }
}

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
        if (!PERPLEXITY_API_KEY) {
            throw new Error('PERPLEXITY_API_KEY is not configured');
        }

        const response = await axios.post(
            PERPLEXITY_API_URL,
            {
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that extracts structured data from text. Always return valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Perplexity AI');
        }

        // Clean the response in case it has markdown code blocks
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedContent) as RFPStructure;
    } catch (error: any) {
        console.error('Error parsing RFP:', error);
        
        // Handle Perplexity API errors
        if (error?.response?.status === 429) {
            throw new Error('Perplexity API rate limit exceeded. Please try again later.');
        }
        
        if (error?.response?.status === 401) {
            throw new Error(`Invalid Perplexity API key. Please check your PERPLEXITY_API_KEY environment variable. Make sure it starts with "pplx-" and is correct.`);
        }
        
        if (error?.response?.status === 402 || error?.response?.status === 403) {
            throw new Error('Perplexity API quota exceeded. Please check your account billing at https://www.perplexity.ai/settings/api.');
        }

        if (error?.response?.status === 400) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Bad request';
            throw new Error(`Perplexity API error: ${errorMessage}. Check if the model name is correct.`);
        }

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
        if (!PERPLEXITY_API_KEY) {
            throw new Error('PERPLEXITY_API_KEY is not configured');
        }

        const response = await axios.post(
            PERPLEXITY_API_URL,
            {
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'You are a procurement assistant that extracts structured data from vendor proposals. Always return valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Perplexity AI');
        }

        // Clean the response in case it has markdown code blocks
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedContent) as ParsedProposal;
    } catch (error: any) {
        console.error('Error parsing proposal:', error);

        // Handle Perplexity API errors
        if (error?.response?.status === 429) {
            throw new Error('Perplexity API rate limit exceeded. Please try again later.');
        }

        if (error?.response?.status === 401) {
            throw new Error(`Invalid Perplexity API key. Please check your PERPLEXITY_API_KEY environment variable. Make sure it starts with "pplx-" and is correct.`);
        }

        if (error?.response?.status === 402 || error?.response?.status === 403) {
            throw new Error('Perplexity API quota exceeded. Please check your account billing at https://www.perplexity.ai/settings/api.');
        }

        if (error?.message) {
            throw error;
        }

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
        if (!PERPLEXITY_API_KEY) {
            throw new Error('PERPLEXITY_API_KEY is not configured');
        }

        const response = await axios.post(
            PERPLEXITY_API_URL,
            {
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'You are a procurement expert providing vendor comparison analysis. Always return valid JSON.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5
            },
            {
                headers: {
                    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from Perplexity AI');
        }

        // Clean the response in case it has markdown code blocks
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanedContent);
    } catch (error: any) {
        console.error('Error comparing proposals:', error);

        // Handle Perplexity API errors
        if (error?.response?.status === 429) {
            throw new Error('Perplexity API rate limit exceeded. Please try again later.');
        }

        if (error?.response?.status === 401) {
            throw new Error(`Invalid Perplexity API key. Please check your PERPLEXITY_API_KEY environment variable. Make sure it starts with "pplx-" and is correct.`);
        }

        if (error?.response?.status === 402 || error?.response?.status === 403) {
            throw new Error('Perplexity API quota exceeded. Please check your account billing at https://www.perplexity.ai/settings/api.');
        }

        if (error?.response?.status === 400) {
            const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || 'Bad request';
            throw new Error(`Perplexity API error: ${errorMessage}. Check if the model name is correct.`);
        }

        if (error?.message) {
            throw error;
        }

        throw new Error('Failed to compare proposals');
    }
}
