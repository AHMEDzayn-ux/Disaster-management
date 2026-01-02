// SMS Report Processing Edge Function
// Receives SMS from Android Gateway, uses Gemini AI to parse, and inserts into Supabase
// Webhook URL: https://<your-project-ref>.supabase.co/functions/v1/sms-report
// Updated: 2026-01-01 - Using gemini-2.0-flash model

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as hexEncode } from 'https://deno.land/std@0.208.0/encoding/hex.ts'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Android SMS Gateway Webhook Payload Format
interface SMSGatewayPayload {
  smsId: string
  sender: string              // Phone number e.g. "+123456789"
  message: string             // SMS text content
  receivedAt: string          // ISO timestamp e.g. "2025-10-05T13:00:35.208Z"
  deviceId: string            // Gateway device ID
  webhookSubscriptionId: string
  webhookEvent: 'MESSAGE_RECEIVED' | 'STATUS_UPDATE'
}

// Verify HMAC SHA256 signature
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const computedSignature = new TextDecoder().decode(hexEncode(new Uint8Array(signatureBuffer)))
    
    // Constant-time comparison to prevent timing attacks
    if (signature.length !== computedSignature.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ computedSignature.charCodeAt(i)
    }
    
    return result === 0
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Report type definitions
interface Location {
  lat: number | null
  lng: number | null
  address: string
}

interface DisasterReport {
  type: 'disaster'
  disaster_type: string
  severity: string
  description: string
  people_affected?: string
  casualties?: string
  assistance_needed?: Record<string, boolean>
  location: Location
  disaster_time?: string
  affected_area?: string
  reporter_name: string
  contact_number: string
}

interface MissingPersonReport {
  type: 'missing_person'
  name: string
  age: number
  gender: string
  description?: string
  location: Location
  last_seen: string
  reporter_name: string
  contact_number: string
  additional_info?: string
}

interface AnimalRescueReport {
  type: 'animal_rescue'
  animal_type: string
  breed_size?: string
  description: string
  condition: string
  is_dangerous?: boolean
  location: Location
  reporter_name: string
  contact_number: string
}

interface ParsedReport {
  category: 'disaster' | 'missing_person' | 'animal_rescue'
  confidence: number
  data: DisasterReport | MissingPersonReport | AnimalRescueReport
  raw_message: string
}

// Geocoding function using OpenStreetMap Nominatim (free, no API key required)
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'DisasterManagementSMS/1.0'
        }
      }
    )
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return null
    }
    
    const results = await response.json()
    
    if (results && results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

// Build the AI prompt for Gemini - Only extract fields that exist in database schema
function buildGeminiPrompt(smsText: string, senderPhone: string): string {
  const currentDate = new Date().toISOString()
  
  return `You are an AI assistant for a disaster management system. Analyze the following SMS message and extract structured information.

SMS MESSAGE:
"${smsText}"

SENDER PHONE: ${senderPhone}
CURRENT DATE/TIME: ${currentDate}

TASK:
1. Determine the report category: "disaster", "missing_person", or "animal_rescue"
2. Extract ONLY the fields specified below (these match our database schema)
3. Return a valid JSON object

CATEGORY DEFINITIONS:
- disaster: Reports about floods, fires, earthquakes, landslides, cyclones, building collapse, etc.
- missing_person: Reports about people who are lost, missing, or cannot be found
- animal_rescue: Reports about animals that need rescue (stranded, injured, trapped)

REQUIRED JSON STRUCTURE (only these exact fields):

For DISASTER reports:
{
  "category": "disaster",
  "confidence": 0.0-1.0,
  "data": {
    "disaster_type": "flood|landslide|fire|earthquake|cyclone|drought|tsunami|building-collapse|other",
    "severity": "low|moderate|high|critical",
    "people_affected": "0|1-10|11-50|51-100|100+" or null,
    "casualties": "none|minor|serious|fatalities" or null,
    "needs": {"rescue": bool, "medical": bool, "shelter": bool, "food": bool, "water": bool, "evacuation": bool} or null,
    "location_address": "extracted location text",
    "occurred_date": "ISO datetime or null",
    "area_size": "description of area size" or null,
    "reporter_name": "name if mentioned, else 'SMS Reporter'"
  }
}

For MISSING_PERSON reports:
{
  "category": "missing_person",
  "confidence": 0.0-1.0,
  "data": {
    "name": "person's name or 'Unknown Person'",
    "age": number (estimate if not given, use 30),
    "gender": "male|female|other",
    "description": "physical description, clothing, etc." or null,
    "location_address": "last seen location",
    "last_seen_date": "ISO datetime (use current time if not specified)",
    "reporter_name": "name if mentioned, else 'SMS Reporter'"
  }
}

For ANIMAL_RESCUE reports:
{
  "category": "animal_rescue",
  "confidence": 0.0-1.0,
  "data": {
    "animal_type": "dog|cat|cattle|goat|bird|wildlife|other",
    "breed": "breed or size description" or null,
    "condition": "healthy|injured|trapped|sick|critical",
    "is_dangerous": boolean,
    "location_address": "location description",
    "reporter_name": "name if mentioned, else 'SMS Reporter'"
  }
}

RULES:
1. Return ONLY valid JSON, no additional text
2. Use ONLY the fields shown above - no extra fields
3. If category is unclear, choose the most likely based on keywords
4. Set confidence based on how clear the message is (0.5-1.0)
5. Extract location as descriptive text in location_address field
6. If information is missing, use null or reasonable defaults
7. For severity, infer from urgency words (emergency, urgent, critical = high/critical)

RESPOND WITH JSON ONLY:`
}

// Call Gemini API
async function callGeminiAPI(prompt: string, apiKey: string): Promise<ParsedReport | null> {
  console.log('Calling Gemini API with key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NO KEY')
  
  try {
    // Using gemini-flash-lite-latest for better quota availability
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`
    console.log('Gemini URL:', url.replace(apiKey, 'REDACTED'))
    
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ]
        })
      }
    )

    console.log('Gemini response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return null
    }

    const result = await response.json()
    console.log('Gemini result received, has candidates:', !!result.candidates)
    
    // Extract text from Gemini response
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textContent) {
      console.error('No text content in Gemini response')
      return null
    }

    console.log('Gemini text content length:', textContent.length)

    // Clean the response - remove markdown code blocks if present
    let cleanedJson = textContent.trim()
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.slice(7)
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.slice(3)
    }
    if (cleanedJson.endsWith('```')) {
      cleanedJson = cleanedJson.slice(0, -3)
    }
    cleanedJson = cleanedJson.trim()

    // Parse the JSON
    const parsed = JSON.parse(cleanedJson)
    return parsed as ParsedReport

  } catch (error) {
    console.error('Gemini API call failed:', error)
    return null
  }
}

// Insert disaster report
async function insertDisasterReport(
  supabase: any,
  data: any,
  senderPhone: string,
  rawMessage: string
): Promise<{ id: string } | null> {
  // Build location object with geocoded coordinates and address
  const location = {
    lat: data.geocoded_lat || null,
    lng: data.geocoded_lng || null,
    address: data.location_address || 'Unknown location'
  }
  
  const insertData = {
    disaster_type: data.disaster_type || 'other',
    severity: data.severity || 'moderate',
    description: `[SMS Report] ${rawMessage}`,  // Store original SMS in description
    people_affected: data.people_affected || null,
    casualties: data.casualties || null,
    needs: data.needs || null,
    location: location,
    occurred_date: data.occurred_date || null,
    area_size: data.area_size || null,
    reporter_name: data.reporter_name || 'SMS Reporter',
    contact_number: senderPhone,
    status: 'Active',
    reported_via_sms: true,
    sms_sender_phone: senderPhone
  }
  
  console.log('Inserting disaster:', JSON.stringify(insertData))
  
  const { data: inserted, error } = await supabase
    .from('disasters')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('Insert disaster error:', error)
    return null
  }
  
  return inserted
}

// Insert missing person report
async function insertMissingPersonReport(
  supabase: any,
  data: any,
  senderPhone: string,
  rawMessage: string
): Promise<{ id: string } | null> {
  // Build location object with geocoded coordinates
  const location = {
    lat: data.geocoded_lat || null,
    lng: data.geocoded_lng || null,
    address: data.location_address || 'Unknown location'
  }
  
  const insertData = {
    name: data.name || 'Unknown Person',
    age: data.age || 30,
    gender: data.gender || 'other',
    description: data.description || null,
    last_seen_location: location,
    last_seen_date: data.last_seen_date || new Date().toISOString(),
    reporter_name: data.reporter_name || 'SMS Reporter',
    contact_number: senderPhone,
    additional_info: `[SMS Report] ${rawMessage}`,  // Store original SMS
    status: 'Active',
    reported_via_sms: true,
    sms_sender_phone: senderPhone
  }
  
  console.log('Inserting missing person:', JSON.stringify(insertData))
  
  const { data: inserted, error } = await supabase
    .from('missing_persons')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('Insert missing person error:', error)
    return null
  }
  
  return inserted
}

// Insert animal rescue report
async function insertAnimalRescueReport(
  supabase: any,
  data: any,
  senderPhone: string,
  rawMessage: string
): Promise<{ id: string } | null> {
  // Build location object with geocoded coordinates
  const location = {
    lat: data.geocoded_lat || null,
    lng: data.geocoded_lng || null,
    address: data.location_address || 'Unknown location'
  }
  
  const insertData = {
    animal_type: data.animal_type || 'other',
    breed: data.breed || null,
    description: `[SMS Report] ${rawMessage}`,  // Store original SMS in description
    condition: data.condition || 'trapped',
    is_dangerous: data.is_dangerous || false,
    location: location,
    reporter_name: data.reporter_name || 'SMS Reporter',
    contact_number: senderPhone,
    status: 'Pending',
    reported_via_sms: true,
    sms_sender_phone: senderPhone
  }
  
  console.log('Inserting animal rescue:', JSON.stringify(insertData))
  
  const { data: inserted, error } = await supabase
    .from('animal_rescues')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('Insert animal rescue error:', error)
    return null
  }
  
  return inserted
}

// Log SMS processing for debugging/audit
async function logSMSProcessing(
  supabase: any,
  senderPhone: string,
  rawMessage: string,
  category: string | null,
  success: boolean,
  recordId: string | null,
  errorMessage: string | null,
  smsId?: string,
  deviceId?: string
): Promise<void> {
  try {
    await supabase
      .from('sms_processing_logs')
      .insert({
        sender_phone: senderPhone,
        raw_message: rawMessage,
        detected_category: category,
        processing_success: success,
        created_record_id: recordId,
        error_message: errorMessage,
        sms_id: smsId || null,
        device_id: deviceId || null,
        processed_at: new Date().toISOString()
      })
  } catch (error) {
    // Log table might not exist, ignore error
    console.log('SMS log insert skipped (table may not exist):', error)
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Read raw body for signature verification
  const rawBody = await req.text()
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const webhookSecret = Deno.env.get('SMS_WEBHOOK_SECRET')

    // Verify X-Signature header if webhook secret is configured
    const signature = req.headers.get('x-signature')
    if (webhookSecret && signature) {
      const isValid = await verifySignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('Webhook signature verified successfully')
    }

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('GEMINI_API_KEY found, length:', geminiApiKey.length)

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse incoming SMS payload from Android Gateway
    const payload: SMSGatewayPayload = JSON.parse(rawBody)
    
    // Only process MESSAGE_RECEIVED events
    if (payload.webhookEvent !== 'MESSAGE_RECEIVED') {
      console.log(`Ignoring webhook event: ${payload.webhookEvent}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored', event: payload.webhookEvent }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract fields from the gateway payload
    const smsId = payload.smsId
    const senderPhone = payload.sender || 'unknown'
    const smsMessage = payload.message || ''
    const receivedAt = payload.receivedAt
    const deviceId = payload.deviceId

    if (!smsMessage || smsMessage.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Empty message',
          reply: 'Your message was empty. Please send a description of the emergency.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing SMS [${smsId}] from ${senderPhone} received at ${receivedAt}: ${smsMessage.substring(0, 100)}...`)

    // Build prompt and call Gemini AI
    const prompt = buildGeminiPrompt(smsMessage, senderPhone)
    const parsedReport = await callGeminiAPI(prompt, geminiApiKey)

    if (!parsedReport) {
      await logSMSProcessing(supabase, senderPhone, smsMessage, null, false, null, 'AI parsing failed', smsId, deviceId)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Could not parse message',
          reply: 'We could not understand your message. Please try again with more details about the emergency, location, and your name.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Geocode the address if present
    const locationAddress = parsedReport.data.location_address
    if (locationAddress) {
      const coords = await geocodeAddress(locationAddress)
      if (coords) {
        // Store coordinates in the data for insert functions to use
        parsedReport.data.geocoded_lat = coords.lat
        parsedReport.data.geocoded_lng = coords.lng
        console.log(`Geocoded "${locationAddress}" to: ${coords.lat}, ${coords.lng}`)
      } else {
        console.log(`Could not geocode: "${locationAddress}"`)
      }
    }

    // Insert into appropriate table
    let insertResult: { id: string } | null = null
    let tableName = ''

    switch (parsedReport.category) {
      case 'disaster':
        insertResult = await insertDisasterReport(
          supabase,
          parsedReport.data as DisasterReport,
          senderPhone,
          smsMessage
        )
        tableName = 'disasters'
        break

      case 'missing_person':
        insertResult = await insertMissingPersonReport(
          supabase,
          parsedReport.data as MissingPersonReport,
          senderPhone,
          smsMessage
        )
        tableName = 'missing_persons'
        break

      case 'animal_rescue':
        insertResult = await insertAnimalRescueReport(
          supabase,
          parsedReport.data as AnimalRescueReport,
          senderPhone,
          smsMessage
        )
        tableName = 'animal_rescues'
        break

      default:
        await logSMSProcessing(supabase, senderPhone, smsMessage, parsedReport.category, false, null, 'Unknown category', smsId, deviceId)
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Unknown report category',
            reply: 'We could not determine the type of report. Please specify if this is about a disaster, missing person, or animal rescue.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    if (!insertResult) {
      await logSMSProcessing(supabase, senderPhone, smsMessage, parsedReport.category, false, null, 'Database insert failed', smsId, deviceId)
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to save report',
          reply: 'There was an error saving your report. Please try again later.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log successful processing
    await logSMSProcessing(supabase, senderPhone, smsMessage, parsedReport.category, true, insertResult.id, null, smsId, deviceId)

    // Format category for display
    const categoryDisplay = parsedReport.category.replace('_', ' ')
    
    // Build confirmation message for SMS reply
    const confirmationMessage = `Your ${categoryDisplay} report has been received. Reference ID: ${insertResult.id.substring(0, 8).toUpperCase()}. Our team will respond soon.`

    console.log(`Successfully created ${parsedReport.category} report: ${insertResult.id}`)

    // Return success response with reply message for the gateway
    return new Response(
      JSON.stringify({
        success: true,
        smsId: smsId,
        category: parsedReport.category,
        confidence: parsedReport.confidence,
        record_id: insertResult.id,
        table: tableName,
        reply: confirmationMessage,
        // Include extracted data for debugging
        extracted_data: parsedReport.data
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('SMS processing error:', error)
    
    // Always return 200 to acknowledge receipt (prevents retries for parse errors)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        reply: 'An error occurred processing your message. Please try again.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
