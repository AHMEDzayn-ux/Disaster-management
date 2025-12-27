# Donation System Setup Guide

## ✅ Complete! All Components Created

Your comprehensive donation management system has been successfully implemented with:

### Components Created:

1. **DonationCounter.jsx** - Animated donation total with progress bar
2. **DonationMotivation.jsx** - Rotating motivational slogans
3. **DonationForm.jsx** - Multi-step Stripe payment form
4. **RecentDonations.jsx** - Live donation ticker and list
5. **DonationList.jsx** - Full transparency ledger with filters
6. **Donations.jsx** - Main page integrating all components

### Database Schema:

- **donations-schema.sql** - Complete Supabase schema with RLS policies

### State Management:

- **useDonationStore** - Zustand store with real-time subscriptions

---

## 🚀 Setup Instructions

### Step 1: Configure Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `src/config/donations-schema.sql`
5. Click **Run** to create the donations table

### Step 2: Get Your Stripe API Keys

1. Create a Stripe account at https://stripe.com (or log in)
2. Go to **Developers → API Keys**
3. Copy your **Publishable Key** (starts with `pk_test_` for testing)
4. Copy your **Secret Key** (starts with `sk_test_` for testing)

### Step 3: Configure Environment Variables

Create/update your `.env` file in the project root:

```env
# Existing Supabase config
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add Stripe keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**IMPORTANT:** The Secret Key should NEVER be in your frontend code. You'll need it for the backend endpoint (see Step 4).

### Step 4: Create Payment Intent Endpoint (Backend Required)

The donation form needs a backend endpoint to create Stripe payment intents. Choose one option:

#### Option A: Supabase Edge Function (Recommended)

Create `supabase/functions/create-payment-intent/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, currency, email, metadata } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: currency || "usd",
      receipt_email: email,
      metadata: metadata || {},
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

Deploy:

```bash
supabase functions deploy create-payment-intent
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key
```

Update `DonationForm.jsx` line ~90 to use your endpoint:

```javascript
const response = await fetch('YOUR_SUPABASE_FUNCTION_URL/create-payment-intent', {
```

#### Option B: Vercel Serverless Function

Create `api/create-payment-intent.js`:

```javascript
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, currency, email, metadata } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "usd",
      receipt_email: email,
      metadata: metadata || {},
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

Add to Vercel environment variables:

```
STRIPE_SECRET_KEY=sk_test_your_secret_key
```

### Step 5: (Optional) Set Up Stripe Webhooks

To automatically update payment statuses when payments succeed/fail:

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Add endpoint: `YOUR_SUPABASE_FUNCTION_URL/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret

Create webhook handler (Supabase Edge Function):

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      await supabase
        .from("donations")
        .update({ stripe_payment_status: "succeeded" })
        .eq("stripe_payment_id", paymentIntent.id);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      await supabase
        .from("donations")
        .update({ stripe_payment_status: "failed" })
        .eq("stripe_payment_id", paymentIntent.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

---

## 🧪 Testing

### Test Mode (Development)

Use Stripe test cards:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155

Any future expiry date and any 3-digit CVC works.

### Verify Setup:

1. Start your dev server: `npm run dev`
2. Navigate to `/donations`
3. You should see:
   - Animated donation counter
   - Rotating motivational messages
   - Payment form with Stripe elements
   - Recent donations ticker
   - Transparency report tab

---

## 📋 Features Included

### ✅ Frontend Features:

- 💳 Stripe payment integration
- 📊 Real-time donation counter with animations
- 🎯 Progress bar to fundraising goal
- 💬 Rotating motivational slogans (12 messages)
- 📝 Multi-step donation form (Amount → Info → Payment)
- 🎁 Preset donation amounts ($10, $25, $50, $100, $250, $500)
- 💰 Custom amount input
- 🙏 Anonymous donation option
- 🎯 Purpose selection (8 categories)
- 📱 Live donation ticker
- 🎉 Success modal with confetti effect
- 📊 Complete transparency ledger
- 🔍 Advanced filtering and search
- 📈 Donation statistics dashboard
- 🔒 Security indicators and trust badges

### ✅ Backend Features:

- 🗄️ Supabase database with RLS
- 🔄 Real-time subscriptions
- 💾 Automatic caching
- 📊 Statistical functions
- 🔐 Payment verification via Stripe
- 📧 Email receipts (via Stripe)

### ✅ Transparency Features:

- 📊 Public donation ledger
- 💵 Real-time total raised counter
- 👥 Donor names (with anonymous option)
- 🎯 Purpose tracking
- 💳 Stripe Payment ID verification
- 📈 Statistics (total, average, max, count)
- 🔍 Searchable and filterable

---

## 🎨 Customization

### Change Fundraising Goal:

In `Donations.jsx`, update:

```javascript
<DonationCounter goalAmount={200000} /> // Change to your goal
```

### Modify Donation Purposes:

In `DonationForm.jsx`, edit the `DONATION_PURPOSES` array (line ~10)

### Add More Slogans:

In `DonationMotivation.jsx`, add to the `motivationalMessages` array

### Change Preset Amounts:

In `DonationForm.jsx`, modify `PRESET_AMOUNTS` array (line ~8)

---

## 🔒 Security Checklist

- [ ] ✅ Never commit `.env` file
- [ ] ✅ Use Stripe test keys for development
- [ ] ✅ Secret key only on backend (never frontend)
- [ ] ✅ Enable Stripe webhook signature verification
- [ ] ✅ Use HTTPS in production
- [ ] ✅ Enable Supabase RLS policies
- [ ] ✅ Validate amounts server-side
- [ ] ✅ Rate limit donation endpoints

---

## 🚀 Go Live Checklist

When ready for production:

1. **Switch to Live Stripe Keys:**

   - Replace `pk_test_*` with `pk_live_*`
   - Replace `sk_test_*` with `sk_live_*`

2. **Activate Stripe Account:**

   - Complete Stripe account verification
   - Add bank account for payouts

3. **Update Webhook URL:**

   - Point to production endpoint
   - Test webhook delivery

4. **Legal Compliance:**

   - Add terms and conditions
   - Privacy policy for donor data
   - Tax receipt generation (if applicable)
   - Charity registration verification

5. **Testing:**
   - Test full donation flow
   - Verify email receipts
   - Check database updates
   - Test refunds

---

## 📞 Support

For issues:

- **Stripe:** https://stripe.com/docs
- **Supabase:** https://supabase.com/docs
- **React Stripe.js:** https://stripe.com/docs/stripe-js/react

---

## 🎉 You're Ready!

The complete donation system is now implemented. Just:

1. Run the SQL schema in Supabase
2. Add your Stripe keys to `.env`
3. Create the payment intent endpoint
4. Start accepting donations! 💝
