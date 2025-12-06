# Architecture Documentation

## System Overview

The RFP Management System is a full-stack web application designed to streamline the procurement workflow using AI-powered natural language processing and automated email handling.

## Technology Stack

### Backend

- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4o-mini API
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
│   ├── index.ts              # Application entry point
│   ├── config/
│   │   └── database.ts       # Database connection and schema
│   ├── routes/               # Express route handlers
│   │   ├── rfp.routes.ts     # RFP CRUD and operations
│   │   ├── vendor.routes.ts  # Vendor management
│   │   ├── proposal.routes.ts # Proposal parsing and comparison
│   │   └── email.routes.ts   # Email receiving webhook
│   └── services/             # Business logic layer
│       ├── ai.service.ts     # OpenAI integration
│       └── email.service.ts  # Email sending
```

**Design Principles**:

- Separation of concerns (routes → services → database)
- Service layer for business logic
- RESTful API design
- Error handling at route level

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
3. Backend calls `parseRFPFromText()` (AI service)
4. OpenAI returns structured JSON
5. Backend saves to database
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
2. Email received via `/api/email/receive` endpoint
3. Backend identifies vendor and RFP
4. Backend calls `parseProposalEmail()` (AI service)
5. OpenAI extracts structured data (price, terms, etc.)
6. Backend calculates completeness score
7. Backend saves proposal to database

### Comparison Flow

1. User requests comparison for an RFP
2. Frontend calls GET `/api/proposals/rfp/:id/compare`
3. Backend fetches all proposals for RFP
4. Backend calls `compareProposals()` (AI service)
5. OpenAI returns comparison scores and recommendation
6. Backend updates proposals with AI summaries
7. Frontend displays comparison results

## Database Schema

### Tables

**vendors**

- Stores vendor master data
- Fields: id, name, email, contact_person, phone, address

**rfps**

- Stores RFP definitions
- Fields: id, title, description, budget, delivery_days, payment_terms, warranty_period, requirements (JSONB), status

**rfp_vendors**

- Many-to-many relationship
- Tracks which vendors received which RFPs
- Fields: id, rfp_id, vendor_id, sent_at, status

**proposals**

- Stores parsed vendor responses
- Fields: id, rfp_id, vendor_id, email_subject, email_body, parsed_data (JSONB), total_price, delivery_days, payment_terms, warranty_period, completeness_score, ai_summary, ai_recommendation

### Relationships

- RFP ↔ Vendor: Many-to-many (via rfp_vendors)
- RFP → Proposal: One-to-many
- Vendor → Proposal: One-to-many

## AI Integration

### OpenAI GPT-4o-mini Usage

1. **RFP Parsing** (`parseRFPFromText`)

   - Input: Natural language description
   - Output: Structured JSON with title, description, budget, requirements, etc.
   - Uses JSON mode for reliable parsing

2. **Proposal Parsing** (`parseProposalEmail`)

   - Input: Email subject, body, RFP requirements
   - Output: Structured JSON with prices, terms, items
   - Matches vendor response to RFP requirements

3. **Proposal Comparison** (`compareProposals`)
   - Input: Array of proposals, RFP requirements
   - Output: Comparison scores, strengths/weaknesses, recommendation
   - Provides reasoning for recommendation

### Prompt Engineering

- System prompts define AI role and output format
- User prompts include context and specific instructions
- JSON mode ensures structured output
- Temperature settings balance creativity vs consistency

## Security Considerations

- Environment variables for sensitive data (API keys, credentials)
- SQL injection prevention via parameterized queries
- CORS configuration for frontend access
- Input validation at API level
- Error handling without exposing internals

## Scalability Considerations

- Database indexes on foreign keys
- Connection pooling (pg Pool)
- Stateless API design
- Frontend caching via React Query
- Potential for horizontal scaling (stateless backend)

## Future Enhancements

- Real-time email receiving (IMAP polling or webhook service)
- File attachment parsing (PDF proposals)
- User authentication and multi-user support
- Email templates customization
- Advanced analytics and reporting
- Export functionality (PDF, Excel)
- Notification system
- Version control for RFPs
