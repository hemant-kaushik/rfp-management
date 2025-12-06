# AI-Powered RFP Management System

A single-user web application that streamlines the Request for Proposal (RFP) workflow from creation to vendor comparison using AI.

## Features

- **Natural Language RFP Creation**: Describe requirements in plain English, system converts to structured RFP
- **Vendor Management**: Maintain vendor database with contact information
- **Email Integration**: Send RFPs to vendors and receive responses automatically
- **AI-Powered Parsing**: Automatically extract key details from vendor responses (prices, terms, conditions)
- **Proposal Comparison**: Compare vendor proposals with AI-assisted recommendations

## Tech Stack

### Backend

- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **AI Provider**: Perplexity AI (sonar model)
- **Email**: Nodemailer (SMTP sending)

### Frontend

- **Framework**: React with TypeScript
- **UI Library**: Material-UI (MUI) for modern components
- **State Management**: React Query for server state
- **HTTP Client**: Axios

## Project Structure

```
RFP/
├── backend/          # Express API server
│   ├── src/
│   │   ├── api/      # Controllers (rfp, vendors, proposal, email)
│   │   ├── routes/   # Express route definitions
│   │   ├── models/   # Sequelize database models
│   │   ├── utils/    # Helper functions (AI, email)
│   │   ├── db/       # Database configuration
│   │   ├── app.ts    # Express app setup
│   │   └── index.ts  # Server entry point
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API client functions
│   │   ├── App.tsx     # Route configuration
│   │   └── main.tsx    # Application entry
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Perplexity AI API key
- Email account credentials (for sending/receiving)

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database:

```bash
# Create PostgreSQL database
createdb rfp_management
```

**Note**: Database tables are automatically created on first server start using Sequelize's `sync()` method. No manual migrations needed.

5. Start development server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

## Environment Variables

### Backend (.env)

Create `backend/.env` from `backend/.env.example`:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# Perplexity AI Configuration
PERPLEXITY_API_KEY=pplx-your_perplexity_api_key

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourcompany.com
EMAIL_REPLY_TO=your_email@gmail.com  # Optional: for vendor replies

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Note**: 
- Get your Perplexity API key from https://www.perplexity.ai/settings/api (starts with `pplx-`)
- For Gmail, use an App Password (not your regular password)
- Database tables are auto-created on first run

### Frontend (.env)

Create `frontend/.env` from `frontend/.env.example` (optional):

```
# Backend API URL (optional - defaults to /api proxy)
# If not set, vite.config.ts proxy handles API requests
VITE_API_URL=/api
```

**Note**: The frontend `.env` is optional since Vite's proxy configuration handles API routing by default. Only create it if you need to point to a different backend URL.

## API Endpoints

### RFP Endpoints
- `GET /api/rfps` - List all RFPs with vendor and proposal counts
- `POST /api/rfps` - Create RFP from natural language description
- `GET /api/rfps/:id` - Get RFP details with vendors and proposals
- `POST /api/rfps/:id/send` - Send RFP to selected vendors (requires `vendor_ids` array in body)

### Vendor Endpoints
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create new vendor
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Proposal Endpoints
- `POST /api/proposals/parse` - Parse vendor proposal email manually (requires `rfp_id`, `vendor_id`, `email_subject`, `email_body`)
- `GET /api/proposals/rfp/:id` - Get all proposals for an RFP
- `GET /api/proposals/rfp/:id/compare` - Compare proposals for an RFP with AI recommendations

### Email Endpoints
- `POST /api/email/receive` - Receive and process vendor proposal email (requires `from`, `subject`, `body`, optional `rfp_id`)

## Quick Start

Run the setup script to install dependencies:

```bash
./setup.sh
```

Or manually:

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## Development

### Starting the Application

1. **Start PostgreSQL** (if not running as a service):

```bash
# Linux/Mac
sudo systemctl start postgresql
# or
pg_ctl -D /usr/local/var/postgres start
```

2. **Create Database**:

```bash
createdb rfp_management
```

3. **Configure Environment**:

   - Copy `backend/.env.example` to `backend/.env`
   - Add your Perplexity AI API key, database URL, and email credentials
   - Get your Perplexity API key from https://www.perplexity.ai/settings/api
   - **Email Setup**: See `EMAIL_SETUP.md` for detailed email configuration instructions
     - For Gmail: Enable 2FA and generate App Password
     - Configure SMTP (for sending) and IMAP (for receiving) settings

4. **Start Backend** (in one terminal):

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5001` (default port is 5001, or as specified in PORT env variable)

5. **Start Frontend** (in another terminal):

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

## Architecture Overview

### Workflow

1. **Create RFP**: User describes requirements in natural language → AI parses into structured RFP
2. **Manage Vendors**: Add/edit vendor contact information
3. **Send RFP**: Select vendors and send RFP via email
4. **Receive Responses**: Vendors reply via email → System parses responses automatically
5. **Compare Proposals**: AI compares proposals and provides recommendations

### Key Components

- **AI Service**: Uses Perplexity AI (sonar model) for:

  - Natural language to structured RFP conversion (`parseRFPFromText`)
  - Vendor proposal parsing (`parseProposalEmail`)
  - Proposal comparison and recommendations (`compareProposals`)

- **Email Service**: Handles:

  - Sending RFPs to vendors via SMTP (Nodemailer)
  - Receiving vendor responses via webhook endpoint (`/api/email/receive`)

- **Database Schema** (PostgreSQL with Sequelize):
  - `vendors`: Vendor master data (id, name, email, contact_person, phone, address)
  - `rfps`: RFP definitions (id, title, description, budget, delivery_days, payment_terms, warranty_period, requirements JSONB, status)
  - `rfp_vendors`: Many-to-many relationship tracking sent RFPs (id, rfp_id, vendor_id, sent_at, status)
  - `proposals`: Parsed vendor responses (id, rfp_id, vendor_id, email_subject, email_body, parsed_data JSONB, total_price, delivery_days, payment_terms, warranty_period, completeness_score, ai_summary, ai_recommendation, status)

## Testing the System

### Example Workflow

1. **Create RFP**:

   - Go to "Create RFP"
   - Enter: "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
   - System will parse and create structured RFP

2. **Add Vendors**:

   - Go to "Vendors" → "Add New Vendor"
   - Add vendor details (name, email, etc.)

3. **Send RFP**:

   - Open RFP details
   - Click "Send to Vendors"
   - Select vendors and send

4. **Simulate Vendor Response**:

   - Use the `/api/email/receive` endpoint to simulate receiving a vendor email
   - System will parse the response automatically

5. **Compare Proposals**:
   - Open RFP details
   - Click "Compare Proposals"
   - View AI-generated comparison and recommendation

## API Documentation

See the "API Endpoints" section above for complete endpoint documentation.

## Notes

- **AI Provider**: The system uses Perplexity AI's sonar model for cost-effective AI processing with real-time information access
- **API Key**: Get your Perplexity API key from https://www.perplexity.ai/settings/api (key starts with `pplx-`)
- **Email Setup**: 
  - Email sending: Configured via SMTP (supports Gmail, Outlook, SendGrid, etc.)
  - Email receiving: Use the `/api/email/receive` webhook endpoint to process vendor responses
  - For Gmail: Enable 2FA and generate an App Password (not your regular password)
- **Database**: Tables are auto-created on first server start using Sequelize's `sync()` method
- **AI Parsing**: All AI parsing uses structured JSON output for reliability
- **Default Port**: Backend port is configurable via PORT env variable (defaults to 5432 in code, but should be set to 5001 in .env to avoid conflict with PostgreSQL)

## License

MIT
