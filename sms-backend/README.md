# SMS Backend for Disaster Reporting

## Setup
1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

## Endpoints
- `POST /sms-report` — Receives SMS from Twilio or similar gateway.

## AI Integration
- Update `extractReportData()` in `index.js` to call Gemini Pro or your chosen AI model.
