# 🚨 Disaster Management Platform - Sri Lanka

## Complete Documentation

**Version:** 1.0.0  
**Last Updated:** January 2, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Getting Started](#getting-started)
6. [User Roles](#user-roles)
7. [Module Documentation](#module-documentation)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Deployment](#deployment)
11. [Security](#security)
12. [Contributing](#contributing)

---

## Overview

The **Disaster Management Platform** is a comprehensive web-based system designed specifically for Sri Lanka to enable efficient coordination of emergency response, resource management, and community support during disasters such as floods, landslides, tsunamis, and other natural calamities.

### Mission

To provide a centralized, accessible platform that connects:

- **Victims** who need to report emergencies and find help
- **Responders** who volunteer to assist in relief efforts
- **Administrators** who coordinate and manage relief operations

### Key Objectives

- ✅ **Rapid Response** - Enable quick reporting and response to disasters
- ✅ **Resource Coordination** - Efficient management of relief camps and supplies
- ✅ **Community Support** - Connect those in need with volunteers and donors
- ✅ **Transparency** - Track donations and relief efforts publicly
- ✅ **Accessibility** - Mobile-friendly design accessible to all users

---

## Features

### 🔴 Core Modules

| Module                     | Description                                              | Status      |
| -------------------------- | -------------------------------------------------------- | ----------- |
| **Missing Persons**        | Report and track missing individuals during disasters    | ✅ Complete |
| **Disaster Reporting**     | Submit and monitor disaster incidents with location data | ✅ Complete |
| **Animal Rescue**          | Coordinate rescue operations for animals in distress     | ✅ Complete |
| **Camp Management**        | Manage relief camps, supplies, and facilities            | ✅ Complete |
| **Volunteer Registration** | Register and coordinate volunteer groups                 | ✅ Complete |
| **Donation Facilitation**  | Enable monetary donations via Stripe                     | ✅ Complete |
| **Emergency Contacts**     | Quick access to emergency services                       | ✅ Complete |
| **Admin Dashboard**        | Comprehensive admin management panel                     | ✅ Complete |

### 🟢 Advanced Features

| Feature                   | Description                                               | Status      |
| ------------------------- | --------------------------------------------------------- | ----------- |
| **Real-time Updates**     | Live data synchronization via Supabase Realtime           | ✅ Complete |
| **Interactive Maps**      | Location picking with Leaflet maps                        | ✅ Complete |
| **Role-based Access**     | Separate interfaces for reporters, responders, and admins | ✅ Complete |
| **Secure Authentication** | Admin authentication via Supabase Auth                    | ✅ Complete |
| **Payment Processing**    | Stripe integration for secure donations                   | ✅ Complete |
| **Code Splitting**        | Lazy loading for optimized performance                    | ✅ Complete |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Reporter │  │Responder │  │  Admin   │  │  Public  │         │
│  │   UI     │  │   UI     │  │   UI     │  │   UI     │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │             │             │                │
│  ┌────┴─────────────┴─────────────┴─────────────┴────┐          │
│  │              React Router (Navigation)             │          │
│  └────────────────────────┬──────────────────────────┘          │
│                           │                                      │
│  ┌────────────────────────┴──────────────────────────┐          │
│  │              Zustand (State Management)            │          │
│  └────────────────────────┬──────────────────────────┘          │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    BACKEND (Supabase)                            │
├───────────────────────────┴──────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Database   │  │     Auth     │  │   Storage    │           │
│  │ (PostgreSQL) │  │  (JWT/RLS)   │  │   (Files)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │   Realtime   │  │Edge Functions│                             │
│  │(WebSockets)  │  │ (Serverless) │                             │
│  └──────────────┘  └──────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├───────────────────────────┴──────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │    Stripe    │  │   Leaflet    │  │ AWS Amplify  │           │
│  │  (Payments)  │  │    (Maps)    │  │  (Hosting)   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

### Application Flow

```
User Journey:

Landing Page (Role Selection)
         │
    ┌────┴────┬─────────────┐
    ▼         ▼             ▼
 Reporter   Responder     Admin
    │         │             │
    ▼         ▼             ▼
┌────────┐ ┌────────┐  ┌────────┐
│ Report │ │ Browse │  │ Login  │
│Incident│ │ Cases  │  │        │
└───┬────┘ └───┬────┘  └───┬────┘
    │          │           │
    ▼          ▼           ▼
┌────────┐ ┌────────┐  ┌────────┐
│  View  │ │Respond/│  │ Manage │
│ Status │ │Volunteer│  │ System │
└────────┘ └────────┘  └────────┘
```

---

## Technology Stack

### Frontend

| Technology           | Version  | Purpose              |
| -------------------- | -------- | -------------------- |
| **React**            | 19.2.0   | UI Framework         |
| **React Router DOM** | 7.11.0   | Client-side Routing  |
| **Tailwind CSS**     | 3.4.19   | Utility-first CSS    |
| **React Hook Form**  | 7.69.0   | Form Validation      |
| **Zustand**          | 5.0.9    | State Management     |
| **Framer Motion**    | 12.23.26 | Animations           |
| **Leaflet**          | 1.9.4    | Interactive Maps     |
| **React Leaflet**    | 5.0.0    | React Map Components |
| **Vite**             | 5.4.11   | Build Tool           |

### Backend & Services

| Technology            | Purpose                     |
| --------------------- | --------------------------- |
| **Supabase**          | Backend as a Service (BaaS) |
| **PostgreSQL**        | Database (via Supabase)     |
| **Supabase Auth**     | Authentication              |
| **Supabase Realtime** | Real-time Subscriptions     |
| **Stripe**            | Payment Processing          |
| **AWS Amplify**       | Hosting & Deployment        |

### Development Tools

| Tool             | Purpose                 |
| ---------------- | ----------------------- |
| **ESLint**       | Code Quality            |
| **PostCSS**      | CSS Processing          |
| **Autoprefixer** | Browser Compatibility   |
| **Terser**       | JavaScript Minification |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Git** version control
- **Supabase Account** (free tier available)
- **Stripe Account** (for donations - test mode available)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Disaster-management.git
cd Disaster-management

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase and Stripe keys

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe Configuration (Optional - for donations)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

---

## User Roles

### 1. 📣 Reporter (Public - No Auth Required)

**Purpose:** Report emergencies and incidents during disasters

**Access:**

- Report missing persons
- Submit disaster reports
- Report animals needing rescue
- View emergency contacts
- Request camp registration

**Interface:** `/report/*` routes

### 2. 🤝 Responder (Public - No Auth Required)

**Purpose:** View and respond to reported incidents

**Access:**

- Browse missing persons reports
- View disaster reports
- See animal rescue needs
- Find relief camps
- Register as volunteer
- Make donations

**Interface:** `/respond/*` routes

### 3. 🛡️ Administrator (Authenticated)

**Purpose:** Manage and coordinate all relief operations

**Access:**

- Review and approve camp requests
- Manage all camps
- View analytics dashboard
- Access all records
- Manage users and settings

**Interface:** `/admin/*` routes (requires login)

---

## Module Documentation

### 1. Missing Persons Module

**Purpose:** Report and track missing individuals during disasters

**Features:**

- Submit detailed missing person reports
- Upload photos
- GPS location of last sighting
- Real-time status updates
- Search and filter capabilities

**Database Table:** `missing_persons`

**Key Fields:**

- Name, Age, Gender
- Last seen location (GPS)
- Photo
- Reporter contact info
- Status (Active/Found/Closed)

### 2. Disaster Reports Module

**Purpose:** Report disaster incidents for response coordination

**Features:**

- Multi-type disaster reporting (Flood, Landslide, Fire, etc.)
- Severity assessment
- Affected population estimation
- Needs assessment
- Resolution tracking

**Database Table:** `disasters`

**Key Fields:**

- Disaster type and severity
- Location (GPS + Address)
- People affected / Casualties
- Immediate needs
- Status and resolution

### 3. Animal Rescue Module

**Purpose:** Coordinate rescue of animals in distress

**Features:**

- Report animals needing rescue
- Danger level assessment
- Location tracking
- Photo uploads
- Rescue status updates

**Database Table:** `animal_rescues`

**Key Fields:**

- Animal type and breed
- Condition assessment
- Danger indicator
- Location
- Status (Pending/In Progress/Rescued)

### 4. Camp Management Module

**Purpose:** Manage relief camps and their resources

**Features:**

- Camp registration (requires admin approval)
- Real-time capacity tracking
- Facility management
- Needs assessment
- Interactive map view

**Database Tables:** `camps`, `camp_requests`

**Camp Types:**

- 🏕️ Temporary Shelter
- 🚨 Emergency Evacuation
- 🏠 Long-term Relief
- 🏥 Medical Facility

### 5. Donations Module

**Purpose:** Facilitate monetary donations for relief efforts

**Features:**

- Secure Stripe payments
- Multiple currency support
- Real-time donation counter
- Donation transparency ledger
- Donor recognition (optional)

**Database Table:** `donations`

**Payment Flow:**

1. User selects amount and fills form
2. Frontend creates Payment Intent via backend
3. Stripe processes payment
4. Success recorded in database
5. Real-time counter updates

### 6. Volunteers Module

**Purpose:** Register and coordinate volunteer groups

**Features:**

- Volunteer registration
- Skill categorization
- Group organization
- Availability tracking

### 7. Emergency Contacts

**Purpose:** Quick access to emergency services

**Contacts Include:**

- Police Emergency: 119
- Ambulance: 110
- Fire & Rescue: 111
- Disaster Management Centre: 117
- Coastguard: 0112-463880

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐
│ missing_persons │     │    disasters    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ name            │     │ disaster_type   │
│ age             │     │ severity        │
│ gender          │     │ description     │
│ description     │     │ people_affected │
│ last_seen_loc   │     │ casualties      │
│ photo           │     │ needs           │
│ status          │     │ location        │
│ created_at      │     │ status          │
└─────────────────┘     │ resolution      │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ animal_rescues  │     │     camps       │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ animal_type     │     │ name            │
│ breed           │     │ type            │
│ condition       │     │ capacity        │
│ is_dangerous    │     │ occupancy       │
│ location        │     │ location        │
│ photo           │     │ district        │
│ status          │     │ facilities      │
└─────────────────┘     │ status          │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  camp_requests  │     │   donations     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ camp_name       │     │ amount          │
│ type            │     │ currency        │
│ capacity        │     │ donor_name      │
│ location        │     │ email           │
│ status          │     │ status          │
│ admin_notes     │     │ stripe_id       │
└─────────────────┘     └─────────────────┘
```

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

| Table             | Public Access            | Authenticated Access |
| ----------------- | ------------------------ | -------------------- |
| `missing_persons` | SELECT, INSERT, UPDATE   | ALL + DELETE         |
| `disasters`       | SELECT, INSERT, UPDATE   | ALL + DELETE         |
| `animal_rescues`  | SELECT, INSERT, UPDATE   | ALL + DELETE         |
| `camps`           | SELECT only (active)     | ALL operations       |
| `camp_requests`   | INSERT (pending), SELECT | ALL operations       |
| `donations`       | SELECT, INSERT           | ALL operations       |

---

## API Reference

### Supabase Client

```javascript
import { supabase } from "./config/supabase";

// Fetch all records
const { data, error } = await supabase.from("table_name").select("*");

// Insert record
const { data, error } = await supabase
  .from("table_name")
  .insert([{ field: "value" }]);

// Update record
const { data, error } = await supabase
  .from("table_name")
  .update({ field: "new_value" })
  .eq("id", recordId);

// Delete record
const { data, error } = await supabase
  .from("table_name")
  .delete()
  .eq("id", recordId);
```

### Service Layer

All database operations are abstracted through service files:

| Service                    | Purpose                   |
| -------------------------- | ------------------------- |
| `supabaseService.js`       | Core database operations  |
| `adminService.js`          | Admin-specific operations |
| `campManagementService.js` | Camp CRUD operations      |

### Store Layer (Zustand)

State management with real-time subscriptions:

```javascript
import { useMissingPersonsStore } from "./store";

// In component
const { missingPersons, fetchMissingPersons, addMissingPerson } =
  useMissingPersonsStore();
```

---

## Deployment

### AWS Amplify Deployment

1. **Push to Repository**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Amplify**

   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect your repository

3. **Configure Environment Variables**

   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Add `VITE_STRIPE_PUBLISHABLE_KEY`

4. **Deploy**
   - Amplify automatically detects `amplify.yml`
   - Build and deploy on every push

### Build Configuration

The project includes an `amplify.yml` file with:

- Node.js 18 environment
- npm install and build commands
- Output directory: `dist`
- Cache configuration for faster builds

---

## Security

### Security Measures Implemented

| Category             | Implementation                    |
| -------------------- | --------------------------------- |
| **API Keys**         | Only anon/public keys in frontend |
| **Authentication**   | Supabase Auth with JWT            |
| **Authorization**    | Row Level Security (RLS)          |
| **Data Validation**  | React Hook Form + Backend         |
| **Payment Security** | Stripe PCI compliance             |
| **Route Protection** | ProtectedRoute component          |

### Security Best Practices

1. **Never expose service role keys** in frontend code
2. **Always validate input** on both client and server
3. **Use RLS policies** to restrict data access
4. **Enable HTTPS** for all communications
5. **Regular security audits** recommended

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make changes and commit**
   ```bash
   git commit -m "feat: add your feature"
   ```
4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- Follow ESLint configuration
- Use functional components with hooks
- Follow component naming conventions
- Write meaningful commit messages

### Folder Structure Guidelines

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level components
├── services/       # API/service layer
├── store/          # Zustand stores
├── contexts/       # React contexts
├── config/         # Configuration files
├── utils/          # Utility functions
└── data/           # Mock/static data
```

---

## Support & Contact

### Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 📚 [React Documentation](https://react.dev)
- 📚 [Stripe Documentation](https://stripe.com/docs)
- 📚 [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Emergency Numbers (Sri Lanka)

| Service             | Number |
| ------------------- | ------ |
| Police Emergency    | 119    |
| Ambulance/Fire      | 110    |
| Disaster Management | 117    |

---

## License

This project is developed for disaster management purposes in Sri Lanka.

---

**Made with ❤️ for Sri Lanka**
