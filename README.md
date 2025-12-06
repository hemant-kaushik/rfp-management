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
- **Database**: PostgreSQL
- **AI Provider**: OpenAI API
- **Email**: Nodemailer (sending), IMAP/Mailgun (receiving)

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
│   │   ├── routes/   # API routes
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic (AI, email)
│   │   ├── utils/    # Helper functions
│   │   └── config/   # Configuration
│   └── migrations/   # Database migrations
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/ # API clients
│   │   └── hooks/
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key
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

# Run migrations
npm run migrate
```

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
DATABASE_URL=postgresql://user:password@localhost:5432/rfp_management
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourcompany.com
PORT=5432
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

Create `frontend/.env` from `frontend/.env.example` (optional):

```
# Backend API URL (optional - defaults to /api proxy)
# If not set, vite.config.ts proxy handles API requests
VITE_API_URL=/api
```

**Note**: The frontend `.env` is optional since Vite's proxy configuration handles API routing by default. Only create it if you need to point to a different backend URL.

## API Endpoints

- `POST /api/rfps` - Create RFP from natural language
- `GET /api/rfps` - List all RFPs
- `GET /api/rfps/:id` - Get RFP details
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - List vendors
- `POST /api/rfps/:id/send` - Send RFP to vendors
- `POST /api/proposals/parse` - Parse vendor response email
- `GET /api/rfps/:id/compare` - Compare proposals for an RFP

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
   - Add your OpenAI API key, database URL, and email credentials

4. **Start Backend** (in one terminal):

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5432`

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

- **AI Service**: Uses OpenAI GPT-4o-mini for:

  - Natural language to structured RFP conversion
  - Vendor proposal parsing
  - Proposal comparison and recommendations

- **Email Service**: Handles:

  - Sending RFPs to vendors (Nodemailer)
  - Receiving vendor responses (webhook endpoint)

- **Database Schema**:
  - `vendors`: Vendor master data
  - `rfps`: RFP definitions with requirements
  - `rfp_vendors`: Many-to-many relationship tracking sent RFPs
  - `proposals`: Parsed vendor responses with AI-extracted data

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

### RFP Endpoints

- `POST /api/rfps` - Create RFP from natural language description
- `GET /api/rfps` - List all RFPs
- `GET /api/rfps/:id` - Get RFP with vendors and proposals
- `POST /api/rfps/:id/send` - Send RFP to selected vendors

### Vendor Endpoints

- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/:id` - Get vendor details
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Proposal Endpoints

- `POST /api/proposals/parse` - Parse vendor response email
- `GET /api/proposals/rfp/:id/compare` - Compare proposals for an RFP

### Email Endpoints

- `POST /api/email/receive` - Receive and process vendor response email

## Notes

- The system uses OpenAI's GPT-4o-mini model for cost-effective AI processing
- Email receiving is currently via a manual webhook endpoint (can be integrated with services like Mailgun, SendGrid webhooks)
- Database tables are auto-created on first run
- All AI parsing uses structured JSON output for reliability

## License

MIT
