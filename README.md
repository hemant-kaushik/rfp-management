# AI-Powered RFP Management System

A single-user web application that streamlines the Request for Proposal (RFP) workflow from creation to vendor comparison using AI. The system converts natural language RFP descriptions into structured formats, sends RFPs to vendors via email, and automatically parses and compares vendor proposals using AI.

## 1. Project Setup

### a. Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **PostgreSQL**: Version 14 or higher
- **Perplexity AI API Key**: Get from [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) (key starts with `pplx-`)
- **Email Account**: For sending RFPs (Gmail, Outlook, SendGrid, etc.)

### b. Install Steps

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration (see section c)
```

4. Create PostgreSQL database:
```bash
createdb rfp_management
```

**Note**: Database tables are automatically created on first server start using Sequelize's `sync()` method. No manual migrations needed.

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create environment file:
```bash
cp .env.example .env
# Only needed if you want to override the default API URL
```

**Note**: Frontend `.env` is optional since Vite's proxy configuration handles API routing by default.

#### Quick Setup Script

Alternatively, use the provided setup script:
```bash
./setup.sh
```

This will install dependencies for both frontend and backend, and create `.env` files if they don't exist.

### c. How to Configure Email Sending/Receiving

#### Email Sending (SMTP Configuration)

Edit `backend/.env` with your SMTP settings:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_REPLY_TO=your_email@gmail.com  # Optional: for vendor replies
```

**Gmail Setup**:
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an App Password (not your regular password)
4. Use this App Password as `EMAIL_PASS`

**Other Email Providers**:
- **Outlook**: `smtp-mail.outlook.com`, port `587`
- **SendGrid**: Use your SendGrid SMTP credentials
- **Custom SMTP**: Configure according to your provider's documentation

#### Email Receiving

The system uses a webhook endpoint to receive vendor responses:

- **Endpoint**: `POST /api/email/receive`
- **Manual Processing**: Send vendor emails to this endpoint (useful for testing)
- **Future**: Can be integrated with email services (Mailgun, SendGrid webhooks) or IMAP polling

**Note**: The system identifies vendors by email address, so ensure vendor emails in the database match the sender's email address.

### d. How to Run Everything Locally

1. **Start PostgreSQL** (if not running as a service):
```bash
# Linux/Mac
sudo systemctl start postgresql
# or
pg_ctl -D /usr/local/var/postgres start
```

2. **Start Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5001` (or port specified in `PORT` env variable)

3. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

4. **Access Application**:
   - Open browser to `http://localhost:3000`
   - Backend API available at `http://localhost:5001/api`

### e. Seed Data or Initial Scripts

**No seed data scripts are included**. The system starts with an empty database. You'll need to:

1. **Add Vendors**: Use the frontend UI or `POST /api/vendors` endpoint
2. **Create RFPs**: Use the frontend UI or `POST /api/rfps` endpoint

**Example: Adding a test vendor via API**:
```bash
curl -X POST http://localhost:5001/api/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor Inc",
    "email": "vendor@example.com",
    "contact_person": "John Doe",
    "phone": "+1-555-0123"
  }'
```

## 2. Tech Stack

### Frontend

- **Framework**: React 18.2.0 with TypeScript 5.3.3
- **Build Tool**: Vite 5.0.8
- **UI Library**: Material-UI (MUI) 5.15.0
  - `@mui/material`: Core components
  - `@mui/icons-material`: Icons
  - `@emotion/react` & `@emotion/styled`: Styling engine
- **Routing**: React Router DOM 6.21.1
- **State Management**: TanStack Query (React Query) 5.17.0
- **HTTP Client**: Axios 1.6.2

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express 4.18.2
- **Language**: TypeScript 5.3.3
- **Runtime Execution**: tsx 4.7.0 (for development)
- **Database ORM**: Sequelize 6.35.2
- **Database Driver**: pg (PostgreSQL) 8.11.3
- **HTTP Client**: Axios 1.6.2
- **CORS**: cors 2.8.5
- **Environment Variables**: dotenv 16.3.1

### Database

- **Database**: PostgreSQL 14+
- **ORM**: Sequelize with TypeScript support
- **Connection Pooling**: Configured in Sequelize (max: 5, min: 0)
- **Schema Management**: Auto-sync on startup (development mode)

### AI Provider

- **Provider**: Perplexity AI
- **Model**: `sonar`
- **API Endpoint**: `https://api.perplexity.ai/chat/completions`
- **Usage**: 
  - RFP parsing from natural language
  - Proposal email parsing
  - Proposal comparison and recommendations

### Email Solution

- **Sending**: Nodemailer 6.9.7 (SMTP)
- **Receiving**: Webhook endpoint (`/api/email/receive`)
- **Dependencies** (available but not actively used):
  - `imap` 0.8.19
  - `mailparser` 3.6.5

### Key Libraries

- **Backend**:
  - `sequelize`: ORM for database operations
  - `axios`: HTTP client for Perplexity AI API
  - `nodemailer`: Email sending
  - `express`: Web framework
  - `cors`: Cross-origin resource sharing

- **Frontend**:
  - `@tanstack/react-query`: Server state management and caching
  - `axios`: API client
  - `react-router-dom`: Client-side routing
  - `@mui/material`: UI component library

## 3. API Documentation

### Base URL

- **Development**: `http://localhost:5001/api`
- **Production**: Configure via `FRONTEND_URL` and reverse proxy

### RFP Endpoints

#### GET /api/rfps

List all RFPs with vendor and proposal counts.

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Laptops and Monitors Procurement",
    "description": "Need to procure laptops and monitors...",
    "budget": "50000.00",
    "delivery_days": 30,
    "payment_terms": "net 30",
    "warranty_period": "1 year",
    "requirements": {
      "items": [
        {
          "name": "Laptops",
          "quantity": 20,
          "specifications": { "RAM": "16GB" }
        }
      ]
    },
    "status": "draft",
    "vendor_count": 3,
    "proposal_count": 2,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
]
```

#### POST /api/rfps

Create RFP from natural language description.

**Request Body**:
```json
{
  "description": "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "title": "Laptops and Monitors Procurement",
  "description": "Need to procure laptops and monitors for our new office",
  "budget": "50000.00",
  "delivery_days": 30,
  "payment_terms": "net 30",
  "warranty_period": "1 year",
  "requirements": {
    "items": [
      {
        "name": "Laptops",
        "quantity": 20,
        "specifications": { "RAM": "16GB" }
      },
      {
        "name": "Monitors",
        "quantity": 15,
        "specifications": { "size": "27-inch" }
      }
    ]
  },
  "status": "draft",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Description is required"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "error": "Perplexity API rate limit exceeded. Please try again later."
}
```

#### GET /api/rfps/:id

Get RFP details with associated vendors and proposals.

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Laptops and Monitors Procurement",
  "description": "Need to procure laptops...",
  "budget": "50000.00",
  "delivery_days": 30,
  "payment_terms": "net 30",
  "warranty_period": "1 year",
  "requirements": { "items": [...] },
  "status": "draft",
  "vendors": [
    {
      "id": 1,
      "name": "Tech Vendor Inc",
      "email": "vendor@example.com",
      "rfp_status": "sent",
      "sent_at": "2024-01-15T11:00:00.000Z"
    }
  ],
  "proposals": [
    {
      "id": 1,
      "vendor_id": 1,
      "vendor_name": "Tech Vendor Inc",
      "vendor_email": "vendor@example.com",
      "total_price": "28500.00",
      "delivery_days": 25,
      "payment_terms": "net 30",
      "warranty_period": "2 years",
      "completeness_score": "100.00",
      "status": "received",
      "created_at": "2024-01-16T09:00:00.000Z"
    }
  ],
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "RFP not found"
}
```

#### POST /api/rfps/:id/send

Send RFP to selected vendors via email.

**Request Body**:
```json
{
  "vendor_ids": [1, 2, 3]
}
```

**Success Response** (200 OK):
```json
{
  "message": "RFP sent to vendors",
  "success": 3,
  "failed": 0
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "vendor_ids array is required"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "RFP not found"
}
```

### Vendor Endpoints

#### GET /api/vendors

List all vendors.

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Tech Vendor Inc",
    "email": "vendor@example.com",
    "contact_person": "John Doe",
    "phone": "+1-555-0123",
    "address": "123 Main St, City, State",
    "created_at": "2024-01-10T10:00:00.000Z",
    "updated_at": "2024-01-10T10:00:00.000Z"
  }
]
```

#### POST /api/vendors

Create new vendor.

**Request Body**:
```json
{
  "name": "Tech Vendor Inc",
  "email": "vendor@example.com",
  "contact_person": "John Doe",
  "phone": "+1-555-0123",
  "address": "123 Main St, City, State"
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "name": "Tech Vendor Inc",
  "email": "vendor@example.com",
  "contact_person": "John Doe",
  "phone": "+1-555-0123",
  "address": "123 Main St, City, State",
  "created_at": "2024-01-10T10:00:00.000Z",
  "updated_at": "2024-01-10T10:00:00.000Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Name and email are required"
}
```

**Error Response** (409 Conflict):
```json
{
  "error": "Vendor with this email already exists"
}
```

#### GET /api/vendors/:id

Get vendor details.

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Tech Vendor Inc",
  "email": "vendor@example.com",
  "contact_person": "John Doe",
  "phone": "+1-555-0123",
  "address": "123 Main St, City, State",
  "created_at": "2024-01-10T10:00:00.000Z",
  "updated_at": "2024-01-10T10:00:00.000Z"
}
```

#### PUT /api/vendors/:id

Update vendor.

**Request Body** (all fields optional):
```json
{
  "name": "Updated Vendor Name",
  "phone": "+1-555-9999"
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Updated Vendor Name",
  "email": "vendor@example.com",
  "phone": "+1-555-9999",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

#### DELETE /api/vendors/:id

Delete vendor.

**Success Response** (200 OK):
```json
{
  "message": "Vendor deleted successfully"
}
```

### Proposal Endpoints

#### POST /api/proposals/parse

Manually parse vendor proposal email.

**Request Body**:
```json
{
  "rfp_id": 1,
  "vendor_id": 1,
  "email_subject": "Re: RFP: Laptops and Monitors",
  "email_body": "We can provide 20 laptops at $1,200 each and 15 monitors at $300 each. Total: $28,500. Delivery in 25 days. Payment terms: net 30. Warranty: 2 years."
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "rfp_id": 1,
  "vendor_id": 1,
  "email_subject": "Re: RFP: Laptops and Monitors",
  "email_body": "We can provide...",
  "raw_response": "We can provide...",
  "parsed_data": {
    "total_price": 28500,
    "delivery_days": 25,
    "payment_terms": "net 30",
    "warranty_period": "2 years",
    "items": [
      {
        "name": "Laptops",
        "quantity": 20,
        "price": 1200
      },
      {
        "name": "Monitors",
        "quantity": 15,
        "price": 300
      }
    ]
  },
  "total_price": "28500.00",
  "delivery_days": 25,
  "payment_terms": "net 30",
  "warranty_period": "2 years",
  "completeness_score": "100.00",
  "status": "received",
  "created_at": "2024-01-16T09:00:00.000Z"
}
```

#### GET /api/proposals/rfp/:id

Get all proposals for an RFP.

**Response** (200 OK):
```json
{
  "rfp": {
    "id": 1,
    "title": "Laptops and Monitors Procurement"
  },
  "proposals": [
    {
      "id": 1,
      "vendor_id": 1,
      "vendor_name": "Tech Vendor Inc",
      "vendor_email": "vendor@example.com",
      "total_price": "28500.00",
      "delivery_days": 25,
      "completeness_score": "100.00",
      "status": "received",
      "created_at": "2024-01-16T09:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### GET /api/proposals/rfp/:id/compare

Compare proposals for an RFP with AI recommendations.

**Response** (200 OK):
```json
{
  "rfp": {
    "id": 1,
    "title": "Laptops and Monitors Procurement",
    "budget": "50000.00",
    "requirements": { "items": [...] }
  },
  "proposals": [...],
  "comparison": [
    {
      "vendor_name": "Tech Vendor Inc",
      "score": 85,
      "strengths": ["Competitive pricing", "Fast delivery"],
      "weaknesses": ["Limited warranty period"]
    },
    {
      "vendor_name": "Another Vendor",
      "score": 72,
      "strengths": ["Extended warranty"],
      "weaknesses": ["Higher price", "Longer delivery time"]
    }
  ],
  "recommendation": {
    "vendor_name": "Tech Vendor Inc",
    "reasoning": "Tech Vendor Inc offers the best balance of price, delivery time, and terms while meeting all requirements."
  },
  "summary": "Two proposals received. Tech Vendor Inc is recommended due to competitive pricing and faster delivery."
}
```

**Response** (200 OK - No proposals):
```json
{
  "message": "No proposals received yet",
  "comparison": [],
  "recommendation": null,
  "summary": "No proposals to compare"
}
```

### Email Endpoints

#### POST /api/email/receive

Receive and process vendor proposal email (webhook).

**Request Body**:
```json
{
  "from": "vendor@example.com",
  "subject": "Re: RFP: Laptops and Monitors",
  "body": "We can provide 20 laptops at $1,200 each...",
  "rfp_id": 1
}
```

**Note**: `rfp_id` is optional. If not provided, system attempts to match RFP from email subject.

**Success Response** (201 Created):
```json
{
  "message": "Proposal received and parsed successfully",
  "proposal": {
    "id": 1,
    "rfp_id": 1,
    "vendor_id": 1,
    "total_price": "28500.00",
    "delivery_days": 25,
    "completeness_score": "100.00",
    "status": "received"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "from, subject, and body are required"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Vendor not found. Please add vendor first."
}
```

## 4. Decisions & Assumptions

### Key Design Decisions

#### Models & Database Schema

1. **Sequelize ORM**: Chose Sequelize over raw SQL for type safety, model relationships, and easier maintenance. Trade-off: Auto-sync in development (should use migrations in production).

2. **JSONB for Flexible Data**:
   - `rfps.requirements`: Stores structured item requirements as JSONB for flexibility
   - `proposals.parsed_data`: Stores AI-parsed data as JSONB to accommodate varying proposal formats
   - Allows schema evolution without migrations

3. **Many-to-Many Relationship**: `rfp_vendors` junction table tracks:
   - Which vendors received which RFPs
   - When RFPs were sent (`sent_at`)
   - Status of RFP-vendor relationship (`pending`, `sent`, `responded`)

4. **Completeness Score**: Simple heuristic (25% each for):
   - Total price presence
   - Delivery days presence
   - Payment terms presence
   - Items array presence
   - **Rationale**: Quick calculation, could be enhanced with ML-based scoring

5. **Status Fields**: 
   - `rfps.status`: `draft`, `sent`, `closed`
   - `rfp_vendors.status`: `pending`, `sent`, `responded`
   - `proposals.status`: `received`, `reviewed`, `accepted`, `rejected`
   - **Rationale**: Simple state tracking, extensible for workflow

#### Flows & Processes

1. **Natural Language RFP Creation**: 
   - Single-step process: user provides description → AI parses → saved
   - **Rationale**: Reduces friction, leverages AI for structure extraction
   - **Trade-off**: Less control over exact structure, requires good prompts

2. **Email-Based Workflow**:
   - RFPs sent via email (SMTP)
   - Responses received via webhook (not IMAP polling)
   - **Rationale**: Webhook is more reliable, easier to debug, works with any email service
   - **Trade-off**: Requires integration setup (future: IMAP polling option)

3. **Vendor Identification by Email**:
   - System matches vendor by email address from incoming emails
   - **Rationale**: Simple, reliable identifier
   - **Assumption**: Vendor email in database matches sender email exactly

4. **RFP Matching**:
   - Primary: `rfp_id` parameter in webhook request
   - Fallback: Extract from email subject (fuzzy matching)
   - **Rationale**: Flexible for different integration scenarios
   - **Trade-off**: Subject matching may fail with complex subjects

5. **AI Parsing Strategy**:
   - Always provide RFP requirements context to AI
   - Use structured JSON output with error handling
   - Clean markdown code blocks from responses
   - **Rationale**: Improves accuracy, handles edge cases

6. **Comparison Scoring**:
   - AI generates 0-100 scores per vendor
   - Considers: price, delivery, terms, warranty, completeness
   - Provides reasoning for recommendation
   - **Rationale**: Transparent, explainable recommendations

#### Scoring & Evaluation

1. **Completeness Score**: Binary presence check (25% per field)
   - Could be enhanced with: field importance weighting, data quality checks
   - **Current limitation**: Doesn't assess quality, only presence

2. **Comparison Scoring**: AI-generated, considers multiple factors
   - **Strengths**: Contextual, considers RFP requirements
   - **Limitations**: May vary between runs, depends on prompt quality

### Assumptions

#### Email & Communication

1. **Email Format**: 
   - Vendors reply to RFP emails in plain text or HTML
   - Key information (price, delivery, terms) is in email body (not attachments)
   - **Limitation**: Doesn't parse PDF attachments or complex tables

2. **Email Delivery**:
   - SMTP credentials are valid and email service is accessible
   - Vendors receive and can reply to emails
   - **Future**: Handle bounce backs, delivery failures

3. **Vendor Behavior**:
   - Vendors reply to the same email thread
   - Email subject contains RFP reference (for fallback matching)
   - Vendor email matches database exactly

#### Data & Formats

1. **RFP Descriptions**:
   - Users provide reasonably structured natural language
   - AI can extract: budget, delivery time, items, quantities, specifications
   - **Limitation**: Very unstructured or ambiguous descriptions may parse incorrectly

2. **Proposal Formats**:
   - Vendors provide pricing in recognizable formats ($, USD, numbers)
   - Delivery times in days or weeks (convertible)
   - **Limitation**: Non-standard formats may not parse correctly

3. **Currency & Units**:
   - Assumes single currency (USD by default)
   - Delivery in days
   - **Future**: Multi-currency support, unit conversion

#### System Limitations

1. **Single User**: No authentication, assumes single user
2. **No Versioning**: RFPs and proposals are not versioned
3. **No Attachments**: Doesn't handle file attachments in proposals
4. **No Real-time**: Email receiving requires manual webhook calls (no IMAP polling)
5. **Database**: Auto-sync in development (not production-ready migrations)

#### AI Provider

1. **Perplexity AI Availability**: Assumes API is accessible, has quota
2. **Response Format**: Assumes JSON responses (with markdown cleaning)
3. **Rate Limits**: No built-in retry logic for rate limits
4. **Cost**: Assumes API costs are acceptable for usage volume

## 5. AI Tools Usage

### Which AI Tools Were Used

1. **Cursor**: For Initial Project Setup + initial boilerplate to make CRUD Apis for the Project + Making Frontend part of the project
2. **ChatGPT**: Assisted Through integrated language models for Parsing the rfps through perplexity + Integrating the Email Functionality

### What They Helped With

#### 1. Boilerplate Generation

- **Express.js Setup**: Generated initial Express app structure, middleware configuration, and route definitions
- **Sequelize Models**: Created model definitions with proper TypeScript types, relationships, and indexes
- **React Components**: Generated Material-UI component structures with proper TypeScript interfaces
- **API Controllers**: Created controller functions with error handling patterns

**Example Prompt Used**:
```
"Create a Sequelize model for RFP with fields: title, description, budget, delivery_days, payment_terms, warranty_period, requirements (JSONB), and status. Include proper TypeScript types and timestamps."
```

#### 2. Debugging & Error Handling

- **API Error Responses**: Helped structure consistent error response formats
- **Perplexity API Integration**: Debugged API call issues, error handling for rate limits and authentication
- **TypeScript Type Errors**: Resolved type mismatches, especially with Sequelize model types and JSONB fields
- **Database Connection Issues**: Troubleshot Sequelize connection pooling and configuration

**Example Prompt Used**:
```
"The Perplexity API is returning 401 errors. Help me add proper error handling for authentication failures, rate limits, and quota issues with clear error messages."
```

#### 3. Design & Architecture

- **Database Schema Design**: Discussed trade-offs between normalized vs. denormalized structures
- **API Endpoint Design**: Designed RESTful endpoints with proper HTTP methods and status codes
- **Component Structure**: Planned React component hierarchy and state management approach
- **Email Workflow**: Designed email sending/receiving flow with webhook approach

**Example Prompt Used**:
```
"Design a database schema for an RFP system. I need to track RFPs, vendors, which vendors received which RFPs, and vendor proposals. Consider many-to-many relationships and proposal parsing requirements."
```

#### 4. Parsing & Data Extraction

- **AI Prompt Engineering**: Refined prompts for Perplexity AI to extract structured data from natural language
- **JSON Parsing**: Handled markdown code block cleaning in AI responses
- **Email Parsing Logic**: Designed approach to match vendor emails and extract RFP context
- **Completeness Scoring**: Designed heuristic for proposal completeness evaluation

**Example Prompt Used**:
```
"Create a prompt for Perplexity AI that extracts structured RFP data from natural language. The output should be JSON with: title, description, budget, delivery_days, payment_terms, warranty_period, and requirements (items array). Handle edge cases like missing fields."
```

#### 5. Code Refactoring

- **Type Safety**: Improved TypeScript types throughout the codebase
- **Error Handling**: Standardized error handling patterns across controllers
- **Code Organization**: Refactored file structure (moved from `services/` to `utils/`, organized controllers)
- **Database Queries**: Optimized Sequelize queries with proper includes and associations

### Notable Prompts/Approaches

#### 1. Structured AI Output Parsing

**Challenge**: Perplexity AI sometimes returns JSON wrapped in markdown code blocks.

**Solution Prompt**:
```
"Create a function that calls Perplexity AI and parses the response. The AI may return JSON wrapped in markdown code blocks (```json ... ```). Clean the response to extract valid JSON, handle parsing errors, and provide specific error messages for different failure scenarios (rate limits, auth, quota)."
```

**Result**: Implemented response cleaning that strips markdown, handles various error codes, and provides user-friendly error messages.

#### 2. Completeness Score Calculation

**Challenge**: Need a simple but effective way to score proposal completeness.

**Approach Discussed**:
```
"I need to calculate a completeness score for vendor proposals. The score should consider: total_price, delivery_days, payment_terms, and items array. Should I use a simple binary check (present/not present) or a more sophisticated scoring system?"
```

**Decision**: Started with simple binary scoring (25% each) for MVP, with notes on future enhancements (weighting, quality assessment).

#### 3. Email Workflow Design

**Challenge**: How to receive vendor responses reliably.

**Approach Discussed**:
```
"I need to receive vendor proposal emails. Options: 1) IMAP polling, 2) Webhook endpoint, 3) Email service webhooks (Mailgun/SendGrid). What are the trade-offs? Which is best for a single-user MVP?"
```

**Decision**: Webhook endpoint for MVP (simple, debuggable), with notes on IMAP polling for future enhancement.

#### 4. RFP Matching from Email Subject

**Challenge**: Match incoming emails to RFPs when `rfp_id` not provided.

**Approach**:
```
"Create logic to match an incoming email to an RFP. If rfp_id is provided, use it. Otherwise, try to match by email subject. The subject might be 'Re: RFP: [RFP Title]' or similar variations."
```

**Result**: Implemented fallback matching using case-insensitive LIKE query on RFP titles.

### What Was Learned or Changed

#### 1. Prompt Engineering Best Practices

- **Structured Output**: Always request JSON format explicitly
- **Context Matters**: Providing RFP requirements to AI improves proposal parsing accuracy
- **Error Handling**: AI responses need cleaning and validation, not just direct parsing
- **Temperature Settings**: Lower temperature (0.3) for parsing, higher (0.5) for comparisons

#### 2. TypeScript + Sequelize Integration

- **Model Types**: Learned to properly type Sequelize models with TypeScript
- **JSONB Handling**: Discovered need for type assertions when working with JSONB fields
- **Association Types**: Understood how to properly type Sequelize associations and includes

#### 3. API Design Patterns

- **Consistent Error Responses**: Standardized error format across all endpoints
- **Status Codes**: Proper use of 201 for creation, 404 for not found, 400 for validation errors
- **Response Structure**: Learned to include metadata (counts, status) in list responses

#### 4. AI Integration Patterns

- **Retry Logic**: Considered but not implemented - would need exponential backoff for rate limits
- **Caching**: AI responses could be cached for same inputs (not implemented)
- **Cost Management**: Learned to monitor API usage, use appropriate models (sonar is cost-effective)

#### 5. Development Workflow

- **Iterative Refinement**: Used AI to quickly prototype, then refined based on testing
- **Code Review**: AI helped identify potential issues before manual testing
- **Documentation**: AI assisted in generating comprehensive documentation and comments

### Changes Made Based on AI Suggestions

1. **Response Cleaning**: Added markdown stripping after AI suggested it would improve reliability
2. **Error Messages**: Enhanced error messages based on AI feedback about user experience
3. **Type Safety**: Improved TypeScript types throughout after AI identified type issues
4. **Code Organization**: Restructured from `services/` to `utils/` based on clearer separation of concerns
5. **Database Indexes**: Added indexes on foreign keys after AI suggested performance improvements

---

## License

MIT
