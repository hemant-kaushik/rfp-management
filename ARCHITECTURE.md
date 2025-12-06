# Architecture Documentation

## System Overview

The RFP Management System is a full-stack web application designed to streamline the procurement workflow using AI-powered natural language processing and automated email handling.

## Technology Stack

### Backend

- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **AI**: Perplexity AI (sonar model)
- **Email**: Nodemailer (SMTP sending)

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite
- **HTTP Client**: Axios

## Architecture Patterns

### Backend Architecture

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── app.ts                # Express app configuration
│   ├── db/                   # Database configuration
│   │   ├── sequelize.ts     # Sequelize instance
│   │   └── database.ts      # Database initialization
│   ├── models/               # Sequelize models
│   │   ├── RFP.ts
│   │   ├── Vendor.ts
│   │   ├── Proposal.ts
│   │   ├── RFPVendor.ts
│   │   └── index.ts         # Model associations
│   ├── routes/               # Express route definitions
│   │   ├── index.ts         # Route aggregator
│   │   ├── rfp.routes.ts     # RFP routes
│   │   ├── vendor.routes.ts  # Vendor routes
│   │   ├── proposal.routes.ts # Proposal routes
│   │   └── email.routes.ts   # Email routes
│   ├── api/                  # Controllers
│   │   ├── rfp/
│   │   │   └── rfp.controller.ts
│   │   ├── vendors/
│   │   │   └── vendors.controller.ts
│   │   ├── proposal/
│   │   │   └── proposal.controller.ts
│   │   └── email/
│   │       └── email.controller.ts
│   └── utils/                # Utility functions
│       ├── ai.utils.ts       # Perplexity AI integration
│       └── email.utils.ts    # Email sending
```

**Design Principles**:

- Separation of concerns (routes → controllers → models → database)
- Controller layer for request handling
- Utility functions for reusable business logic (AI, email)
- RESTful API design
- Error handling at controller level
- Sequelize ORM for database operations

### Frontend Architecture

```
frontend/
├── src/
│   ├── main.tsx              # Application entry
│   ├── App.tsx               # Route configuration
│   ├── components/           # Reusable UI components
│   │   └── Navbar.tsx
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx
│   │   ├── CreateRFP.tsx
│   │   ├── RFPDetail.tsx
│   │   ├── Vendors.tsx
│   │   └── VendorForm.tsx
│   └── services/
│       └── api.ts            # API client functions
```

**Design Principles**:

- Component-based architecture
- React Query for server state management
- Material-UI for consistent UI
- Separation of API calls from components

## Data Flow

### RFP Creation Flow

1. User enters natural language description
2. Frontend sends POST `/api/rfps` with description
3. Backend controller calls `parseRFPFromText()` (AI utility)
4. Perplexity AI returns structured JSON
5. Backend saves to database using Sequelize
6. Frontend receives structured RFP and displays

### Email Sending Flow

1. User selects vendors for an RFP
2. Frontend sends POST `/api/rfps/:id/send` with vendor IDs
3. Backend fetches RFP and vendor details
4. Backend formats RFP as HTML email
5. Nodemailer sends emails to vendors
6. Backend updates `rfp_vendors` table with sent status

### Proposal Parsing Flow

1. Vendor sends email response
2. Email received via `/api/email/receive` endpoint (webhook)
3. Backend identifies vendor by email address
4. Backend identifies RFP (from `rfp_id` parameter or email subject)
5. Backend calls `parseProposalEmail()` (AI utility)
6. Perplexity AI extracts structured data (price, terms, etc.)
7. Backend calculates completeness score (heuristic: 25% each for price, delivery, payment terms, items)
8. Backend saves proposal to database using Sequelize

### Comparison Flow

1. User requests comparison for an RFP
2. Frontend calls GET `/api/proposals/rfp/:id/compare`
3. Backend fetches all proposals for RFP using Sequelize
4. Backend calls `compareProposals()` (AI utility)
5. Perplexity AI returns comparison scores, strengths, weaknesses, and recommendation
6. Backend updates proposals with AI summaries (strengths/weaknesses)
7. Frontend displays comparison results with recommendation

## Database Schema

### Tables

**vendors**

- Stores vendor master data
- Fields: id, name, email, contact_person, phone, address

**rfps**

- Stores RFP definitions
- Fields: id, title, description, budget (DECIMAL), delivery_days (INTEGER), payment_terms (STRING), warranty_period (STRING), requirements (JSONB), status (STRING, default: 'draft'), created_at, updated_at

**rfp_vendors**

- Many-to-many relationship (junction table)
- Tracks which vendors received which RFPs
- Fields: id, rfp_id, vendor_id, sent_at (DATE), status (STRING, default: 'pending'), created_at, updated_at
- Unique constraint on (rfp_id, vendor_id)

**proposals**

- Stores parsed vendor responses
- Fields: id, rfp_id, vendor_id, email_subject (STRING), email_body (TEXT), raw_response (TEXT), parsed_data (JSONB), total_price (DECIMAL), delivery_days (INTEGER), payment_terms (STRING), warranty_period (STRING), completeness_score (DECIMAL), ai_summary (TEXT), ai_recommendation (TEXT), status (STRING, default: 'received'), created_at, updated_at

### Relationships

- RFP ↔ Vendor: Many-to-many (via rfp_vendors)
- RFP → Proposal: One-to-many
- Vendor → Proposal: One-to-many

## AI Integration

### Perplexity AI (sonar model) Usage

1. **RFP Parsing** (`parseRFPFromText`)

   - Input: Natural language description
   - Output: Structured JSON with title, description, budget, requirements, etc.
   - Model: `sonar`
   - Temperature: 0.3 (for consistency)
   - Response cleaning: Removes markdown code blocks if present

2. **Proposal Parsing** (`parseProposalEmail`)

   - Input: Email subject, body, RFP requirements
   - Output: Structured JSON with prices, terms, items
   - Model: `sonar`
   - Temperature: 0.3 (for consistency)
   - Matches vendor response to RFP requirements

3. **Proposal Comparison** (`compareProposals`)
   - Input: Array of proposals, RFP requirements
   - Output: Comparison scores (0-100), strengths/weaknesses arrays, recommendation with reasoning
   - Model: `sonar`
   - Temperature: 0.5 (slightly higher for more nuanced comparisons)
   - Provides detailed reasoning for recommendation

### Prompt Engineering

- System prompts define AI role and output format
- User prompts include context and specific instructions
- Response cleaning: Strips markdown code blocks (```json) for reliable JSON parsing
- Error handling: Specific error messages for rate limits, authentication, and quota issues
- API endpoint: `https://api.perplexity.ai/chat/completions`

## Security Considerations

- Environment variables for sensitive data (API keys, credentials)
- SQL injection prevention via parameterized queries
- CORS configuration for frontend access
- Input validation at API level
- Error handling without exposing internals

## Scalability Considerations

- Database indexes on foreign keys (defined in Sequelize models)
- Connection pooling via Sequelize (max: 5, min: 0, acquire: 30000ms, idle: 10000ms)
- Stateless API design
- Frontend caching via TanStack Query (React Query)
- Potential for horizontal scaling (stateless backend)
- Database tables auto-created via Sequelize sync (consider migrations for production)

## Future Enhancements

- Real-time email receiving (IMAP polling or webhook service integration)
- File attachment parsing (PDF proposals)
- User authentication and multi-user support
- Email templates customization
- Advanced analytics and reporting
- Export functionality (PDF, Excel)
- Notification system
- Version control for RFPs
- Database migrations (replace Sequelize sync with proper migrations)
- Input validation using Zod (already in dependencies)
- Rate limiting for API endpoints
- Comprehensive error logging and monitoring
