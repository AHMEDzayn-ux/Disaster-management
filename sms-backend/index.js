import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Placeholder for AI model integration (Gemini Pro or similar)
async function extractReportData(smsText) {
  // TODO: Call Gemini Pro API here
  // For now, return dummy data
  return {
    type: 'unknown',
    location: 'unknown',
    description: smsText
  };
}

// Twilio/SMS webhook endpoint
app.post('/sms-report', async (req, res) => {
  const smsText = req.body.Body || req.body.body || '';
  const from = req.body.From || req.body.from || '';

  try {
    const report = await extractReportData(smsText);
    const { data, error } = await supabase.from('disaster_reports').insert([
      {
        ...report,
        source: 'sms',
        reporter_phone: from
      }
    ]);
    if (error) throw error;
    res.status(200).send('Report received. Thank you!');
  } catch (err) {
    res.status(500).send('Error processing report.');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SMS backend listening on port ${PORT}`);
});
