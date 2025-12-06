# Quick Start Guide

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check PostgreSQL
psql --version

# Check npm
npm --version
```

## Installation

### Option 1: Using Setup Script

```bash
./setup.sh
```

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env  # Optional - only if you need custom API URL
```

## Database Setup

```bash
# Create database
createdb rfp_management

# Database tables are auto-created on first backend start
```

## Configuration

Edit `backend/.env`:

1. **Database**: Update `DATABASE_URL` with your PostgreSQL credentials
2. **OpenAI**: Add your `OPENAI_API_KEY` (get from https://platform.openai.com/)
3. **Email**: Configure SMTP settings for sending emails
   - For Gmail: Use App Password (not regular password)
   - Enable "Less secure app access" or use App Passwords

## Running the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

✅ Backend running on http://localhost:5001

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

✅ Frontend running on http://localhost:3000

## First Steps

1. **Open Browser**: Navigate to http://localhost:3000

2. **Add Vendors**:

   - Click "Vendors" → "Add New Vendor"
   - Add at least 2-3 vendors with email addresses

3. **Create RFP**:

   - Click "Create RFP"
   - Enter natural language description, e.g.:
     ```
     I need to procure laptops and monitors for our new office.
     Budget is $50,000 total. Need delivery within 30 days.
     We need 20 laptops with 16GB RAM and 15 monitors 27-inch.
     Payment terms should be net 30, and we need at least 1 year warranty.
     ```
   - Click "Create RFP"

4. **Send RFP**:

   - Open the created RFP
   - Click "Send to Vendors"
   - Select vendors and send

5. **Simulate Vendor Response**:

   - Use Postman or curl to POST to `/api/email/receive`:

   ```bash
   curl -X POST http://localhost:5001/api/email/receive \
     -H "Content-Type: application/json" \
     -d '{
       "from": "vendor@example.com",
       "subject": "Re: RFP: Laptops and Monitors",
       "body": "We can provide 20 laptops at $1,200 each and 15 monitors at $300 each. Total: $28,500. Delivery in 25 days. Payment terms: net 30. Warranty: 2 years.",
       "rfp_id": 1
     }'
   ```

6. **Compare Proposals**:
   - Open RFP details
   - Click "Compare Proposals"
   - View AI-generated comparison and recommendation

## Troubleshooting

### Database Connection Error

- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `psql -l | grep rfp_management`

### OpenAI API Error

- Verify API key is correct
- Check API key has credits/quota
- Ensure key starts with `sk-`

### Email Sending Fails

- For Gmail: Use App Password, not regular password
- Check EMAIL_HOST, EMAIL_PORT settings
- Verify SMTP credentials

### Frontend Can't Connect to Backend

- Ensure backend is running on port 5432
- Check CORS settings in backend
- Verify proxy in `vite.config.ts` points to `http://localhost:5432`

## Testing the AI Features

### Test RFP Parsing

Create an RFP with varied natural language:

- Include/omit budget
- Mix different requirement formats
- Test edge cases (no quantities, vague specs)

### Test Proposal Parsing

Send varied vendor responses:

- Well-structured emails
- Messy emails with tables
- Missing information
- Extra information

### Test Comparison

Create multiple proposals with:

- Different prices
- Different delivery times
- Different terms
- Varying completeness

## Next Steps

- Review `ARCHITECTURE.md` for system design details
- Check `README.md` for full documentation
- Customize email templates in `backend/src/services/email.service.ts`
- Adjust AI prompts in `backend/src/services/ai.service.ts`
