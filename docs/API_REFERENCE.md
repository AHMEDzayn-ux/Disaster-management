# 📖 API Reference - Disaster Management Platform

**Version:** 1.0.0  
**Last Updated:** January 2, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Supabase Client](#supabase-client)
3. [Service Layer](#service-layer)
4. [Store Layer (Zustand)](#store-layer-zustand)
5. [Database Tables](#database-tables)
6. [Real-time Subscriptions](#real-time-subscriptions)
7. [Authentication](#authentication)
8. [File Upload](#file-upload)
9. [Payment Integration](#payment-integration)

---

## Overview

The Disaster Management Platform uses a layered architecture:

```
┌─────────────────────────────────────────────┐
│           React Components (UI)              │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Zustand Stores (State)               │
│  - useMissingPersonStore                     │
│  - useDisasterStore                          │
│  - useAnimalRescueStore                      │
│  - useCampStore                              │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Service Layer (Logic)                │
│  - supabaseService.js                        │
│  - adminService.js                           │
│  - campManagementService.js                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Supabase Client (Database)           │
│  - supabase.js                               │
└─────────────────────────────────────────────┘
```

---

## Supabase Client

### Configuration

**File:** `src/config/supabase.js`

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Usage

```javascript
import { supabase } from "./config/supabase";

// Direct usage (prefer service layer instead)
const { data, error } = await supabase.from("table_name").select("*");
```

---

## Service Layer

### supabaseService.js

**File:** `src/services/supabaseService.js`

#### Available Tables

```javascript
export const TABLES = {
  MISSING_PERSONS: "missing_persons",
  DISASTERS: "disasters",
  ANIMAL_RESCUES: "animal_rescues",
  CAMPS: "camps",
  CAMP_REQUESTS: "camp_requests",
  DONATIONS: "donations",
};
```

#### createDocument(table, data)

Creates a new record in the specified table.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name from TABLES |
| `data` | object | Record data to insert |

**Returns:** `Promise<object>` - Created record with ID

**Example:**

```javascript
import { createDocument, TABLES } from "./services/supabaseService";

const newPerson = await createDocument(TABLES.MISSING_PERSONS, {
  name: "John Doe",
  age: 35,
  gender: "Male",
  description: "Last seen wearing blue shirt",
  last_seen_location: { lat: 6.9271, lng: 79.8612, address: "Colombo" },
  reporter_name: "Jane Doe",
  contact_number: "0771234567",
});
```

#### getDocument(table, id)

Retrieves a single record by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name from TABLES |
| `id` | string | Record UUID |

**Returns:** `Promise<object>` - Record data

**Example:**

```javascript
const person = await getDocument(TABLES.MISSING_PERSONS, "uuid-here");
```

#### getAllDocuments(table, options)

Retrieves all records from a table with optional pagination.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name from TABLES |
| `options.limit` | number | (Optional) Max records to return |
| `options.offset` | number | (Optional) Skip first N records |

**Returns:** `Promise<{data: array, total: number}>`

**Example:**

```javascript
// Get all records
const { data, total } = await getAllDocuments(TABLES.MISSING_PERSONS);

// With pagination
const { data, total } = await getAllDocuments(TABLES.MISSING_PERSONS, {
  limit: 20,
  offset: 0,
});
```

#### updateDocument(table, id, updates)

Updates an existing record.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name from TABLES |
| `id` | string | Record UUID |
| `updates` | object | Fields to update |

**Returns:** `Promise<object>` - Updated record

**Example:**

```javascript
await updateDocument(TABLES.MISSING_PERSONS, "uuid-here", {
  status: "Found",
  updated_at: new Date().toISOString(),
});
```

#### deleteDocument(table, id)

Deletes a record by ID.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name from TABLES |
| `id` | string | Record UUID |

**Returns:** `Promise<boolean>` - true on success

**Example:**

```javascript
await deleteDocument(TABLES.MISSING_PERSONS, "uuid-here");
```

#### subscribeToTable(table, callback)

Subscribes to real-time changes with progressive loading and caching.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `table` | string | Table name from TABLES |
| `callback` | function | Called with (data, appendMode) |

**Returns:** `Promise<function>` - Unsubscribe function

**Example:**

```javascript
const unsubscribe = await subscribeToTable(
  TABLES.MISSING_PERSONS,
  (persons, appendMode) => {
    if (appendMode) {
      // Append to existing data
      setPersons((prev) => [...prev, ...persons]);
    } else {
      // Replace all data
      setPersons(persons);
    }
  }
);

// Cleanup
return () => unsubscribe();
```

#### uploadPhoto(file, folder)

Uploads a photo to Supabase Storage.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | File | File object to upload |
| `folder` | string | Storage folder name |

**Returns:** `Promise<string>` - Public URL of uploaded file

**Example:**

```javascript
const photoUrl = await uploadPhoto(file, "missing-persons");
```

---

## Store Layer (Zustand)

### useMissingPersonStore

**File:** `src/store/supabaseStore.js`

```javascript
import { useMissingPersonStore } from "./store";

// In component
const {
  missingPersons, // Array of records
  loading, // Boolean loading state
  error, // Error message or null
  subscribeToMissingPersons,
  unsubscribeFromMissingPersons,
  fetchMissingPersons,
  addMissingPerson,
  updateMissingPerson,
  deleteMissingPerson,
  markFoundByResponder,
} = useMissingPersonStore();
```

#### State Properties

| Property         | Type        | Description                  |
| ---------------- | ----------- | ---------------------------- |
| `missingPersons` | array       | All missing person records   |
| `loading`        | boolean     | Loading state                |
| `error`          | string/null | Error message                |
| `isInitialized`  | boolean     | Whether store is initialized |

#### Actions

| Action                                     | Description              |
| ------------------------------------------ | ------------------------ |
| `subscribeToMissingPersons()`              | Start real-time sync     |
| `unsubscribeFromMissingPersons()`          | Stop real-time sync      |
| `fetchMissingPersons()`                    | Manual fetch all records |
| `addMissingPerson(person)`                 | Add new record           |
| `updateMissingPerson(id, updates)`         | Update record            |
| `deleteMissingPerson(id)`                  | Delete record            |
| `markFoundByResponder(id, contact, notes)` | Mark as found            |

**Usage Example:**

```javascript
import { useEffect } from "react";
import { useMissingPersonStore } from "../store";

function MissingPersonsList() {
  const {
    missingPersons,
    loading,
    subscribeToMissingPersons,
    unsubscribeFromMissingPersons,
  } = useMissingPersonStore();

  useEffect(() => {
    subscribeToMissingPersons();
    return () => unsubscribeFromMissingPersons();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {missingPersons.map((person) => (
        <li key={person.id}>{person.name}</li>
      ))}
    </ul>
  );
}
```

### useDisasterStore

```javascript
import { useDisasterStore } from "./store";

const {
  disasters,
  loading,
  error,
  subscribeToDisasters,
  unsubscribeFromDisasters,
  fetchDisasters,
  addDisaster,
  updateDisaster,
  deleteDisaster,
} = useDisasterStore();
```

### useAnimalRescueStore

```javascript
import { useAnimalRescueStore } from "./store";

const {
  rescues,
  loading,
  error,
  subscribeToAnimalRescues,
  unsubscribeFromAnimalRescues,
  fetchAnimalRescues,
  addAnimalRescue,
  updateAnimalRescue,
  deleteAnimalRescue,
} = useAnimalRescueStore();
```

### useCampStore

```javascript
import { useCampStore } from "./store";

const {
  camps,
  loading,
  error,
  subscribeToCamps,
  unsubscribeFromCamps,
  fetchCamps,
  addCamp,
  updateCamp,
  deleteCamp,
} = useCampStore();
```

---

## Database Tables

### missing_persons

| Column               | Type      | Nullable | Default             | Description           |
| -------------------- | --------- | -------- | ------------------- | --------------------- |
| `id`                 | UUID      | No       | `gen_random_uuid()` | Primary key           |
| `name`               | TEXT      | No       | -                   | Full name             |
| `age`                | INTEGER   | No       | -                   | Age in years          |
| `gender`             | TEXT      | No       | -                   | Male/Female/Other     |
| `description`        | TEXT      | Yes      | -                   | Physical description  |
| `last_seen_location` | JSONB     | No       | -                   | `{lat, lng, address}` |
| `last_seen_date`     | TIMESTAMP | No       | -                   | When last seen        |
| `reporter_name`      | TEXT      | No       | -                   | Who reported          |
| `contact_number`     | TEXT      | No       | -                   | Reporter phone        |
| `additional_info`    | TEXT      | Yes      | -                   | Extra details         |
| `photo`              | TEXT      | Yes      | -                   | Photo URL             |
| `status`             | TEXT      | Yes      | `'Active'`          | Active/Found/Closed   |
| `found_at`           | TIMESTAMP | Yes      | -                   | When found            |
| `found_by_contact`   | TEXT      | Yes      | -                   | Finder contact        |
| `found_notes`        | TEXT      | Yes      | -                   | Resolution notes      |
| `created_at`         | TIMESTAMP | Yes      | `NOW()`             | Record created        |
| `updated_at`         | TIMESTAMP | Yes      | `NOW()`             | Last updated          |

### disasters

| Column               | Type      | Nullable | Default             | Description              |
| -------------------- | --------- | -------- | ------------------- | ------------------------ |
| `id`                 | UUID      | No       | `gen_random_uuid()` | Primary key              |
| `disaster_type`      | TEXT      | No       | -                   | Flood/Landslide/Fire/etc |
| `severity`           | TEXT      | No       | -                   | Low/Medium/High/Critical |
| `description`        | TEXT      | No       | -                   | Incident details         |
| `people_affected`    | TEXT      | Yes      | -                   | Estimated affected       |
| `casualties`         | TEXT      | Yes      | -                   | Casualty count           |
| `needs`              | JSONB     | Yes      | -                   | `["Food", "Water", ...]` |
| `location`           | JSONB     | No       | -                   | `{lat, lng, address}`    |
| `occurred_date`      | TIMESTAMP | Yes      | -                   | When disaster occurred   |
| `area_size`          | TEXT      | Yes      | -                   | Affected area            |
| `reporter_name`      | TEXT      | No       | -                   | Who reported             |
| `contact_number`     | TEXT      | No       | -                   | Reporter phone           |
| `photo`              | TEXT      | Yes      | -                   | Photo URL                |
| `status`             | TEXT      | Yes      | `'Active'`          | Active/Resolved          |
| `resolution_summary` | TEXT      | Yes      | -                   | How resolved             |
| `resolution_date`    | TIMESTAMP | Yes      | -                   | When resolved            |
| `created_at`         | TIMESTAMP | Yes      | `NOW()`             | Record created           |
| `updated_at`         | TIMESTAMP | Yes      | `NOW()`             | Last updated             |

### animal_rescues

| Column           | Type      | Nullable | Default             | Description                 |
| ---------------- | --------- | -------- | ------------------- | --------------------------- |
| `id`             | UUID      | No       | `gen_random_uuid()` | Primary key                 |
| `animal_type`    | TEXT      | No       | -                   | Dog/Cat/Bird/etc            |
| `breed`          | TEXT      | Yes      | -                   | Breed if known              |
| `description`    | TEXT      | No       | -                   | Condition details           |
| `condition`      | TEXT      | No       | -                   | Injured/Trapped/etc         |
| `is_dangerous`   | BOOLEAN   | Yes      | `FALSE`             | Safety warning              |
| `location`       | JSONB     | No       | -                   | `{lat, lng, address}`       |
| `reporter_name`  | TEXT      | No       | -                   | Who reported                |
| `contact_number` | TEXT      | No       | -                   | Reporter phone              |
| `photo`          | TEXT      | Yes      | -                   | Photo URL                   |
| `status`         | TEXT      | Yes      | `'Pending'`         | Pending/In Progress/Rescued |
| `created_at`     | TIMESTAMP | Yes      | `NOW()`             | Record created              |
| `updated_at`     | TIMESTAMP | Yes      | `NOW()`             | Last updated                |

### camps

| Column              | Type      | Nullable | Default             | Description                                                              |
| ------------------- | --------- | -------- | ------------------- | ------------------------------------------------------------------------ |
| `id`                | UUID      | No       | `gen_random_uuid()` | Primary key                                                              |
| `name`              | TEXT      | No       | -                   | Camp name                                                                |
| `type`              | TEXT      | No       | -                   | temporary-shelter/emergency-evacuation/long-term-relief/medical-facility |
| `capacity`          | INTEGER   | No       | -                   | Max occupants                                                            |
| `current_occupancy` | INTEGER   | Yes      | `0`                 | Current count                                                            |
| `location`          | JSONB     | No       | -                   | `{lat, lng, address, district}`                                          |
| `district`          | TEXT      | Yes      | -                   | Sri Lankan district                                                      |
| `address`           | TEXT      | Yes      | -                   | Full address                                                             |
| `ds_division`       | TEXT      | Yes      | -                   | DS Division                                                              |
| `latitude`          | DECIMAL   | Yes      | -                   | GPS latitude                                                             |
| `longitude`         | DECIMAL   | Yes      | -                   | GPS longitude                                                            |
| `contact_person`    | TEXT      | No       | -                   | Manager name                                                             |
| `contact_number`    | TEXT      | No       | -                   | Contact phone                                                            |
| `managed_by`        | TEXT      | Yes      | -                   | Managing organization                                                    |
| `facilities`        | JSONB     | Yes      | -                   | `["Food", "Water", ...]`                                                 |
| `needs`             | TEXT[]    | Yes      | -                   | Supply needs                                                             |
| `status`            | TEXT      | Yes      | `'Active'`          | Active/Closed                                                            |
| `created_at`        | TIMESTAMP | Yes      | `NOW()`             | Record created                                                           |
| `updated_at`        | TIMESTAMP | Yes      | `NOW()`             | Last updated                                                             |

### camp_requests

| Column           | Type      | Nullable | Default             | Description               |
| ---------------- | --------- | -------- | ------------------- | ------------------------- |
| `id`             | UUID      | No       | `gen_random_uuid()` | Primary key               |
| `camp_name`      | TEXT      | No       | -                   | Proposed name             |
| `type`           | TEXT      | No       | -                   | Camp type                 |
| `capacity`       | INTEGER   | No       | -                   | Proposed capacity         |
| `location`       | JSONB     | No       | -                   | Location data             |
| `contact_person` | TEXT      | No       | -                   | Contact name              |
| `contact_number` | TEXT      | No       | -                   | Contact phone             |
| `facilities`     | JSONB     | Yes      | -                   | Available facilities      |
| `status`         | TEXT      | Yes      | `'pending'`         | pending/approved/rejected |
| `admin_notes`    | TEXT      | Yes      | -                   | Admin feedback            |
| `reviewed_at`    | TIMESTAMP | Yes      | -                   | Review timestamp          |
| `created_at`     | TIMESTAMP | Yes      | `NOW()`             | Request created           |

### donations

| Column                     | Type      | Nullable | Default             | Description              |
| -------------------------- | --------- | -------- | ------------------- | ------------------------ |
| `id`                       | UUID      | No       | `gen_random_uuid()` | Primary key              |
| `amount`                   | DECIMAL   | No       | -                   | Donation amount          |
| `currency`                 | TEXT      | Yes      | `'LKR'`             | Currency code            |
| `donor_name`               | TEXT      | Yes      | -                   | Donor name (optional)    |
| `email`                    | TEXT      | Yes      | -                   | Donor email              |
| `message`                  | TEXT      | Yes      | -                   | Donor message            |
| `is_anonymous`             | BOOLEAN   | Yes      | `FALSE`             | Hide donor name          |
| `stripe_payment_intent_id` | TEXT      | Yes      | -                   | Stripe reference         |
| `status`                   | TEXT      | Yes      | `'pending'`         | pending/completed/failed |
| `created_at`               | TIMESTAMP | Yes      | `NOW()`             | Donation time            |

---

## Real-time Subscriptions

### How It Works

1. **Progressive Loading**

   - First 30 records load immediately
   - Remaining records load in background chunks
   - User sees data instantly

2. **Caching**

   - Data is cached in memory
   - Instant load on subsequent visits
   - Background refresh ensures freshness

3. **Debouncing**
   - Real-time updates are debounced (500ms)
   - Prevents UI thrashing from rapid updates

### Implementation

```javascript
// In Zustand store
subscribeToMissingPersons: async () => {
  const unsubscribeFn = await subscribeToTable(
    TABLES.MISSING_PERSONS,
    (persons, appendMode) => {
      if (appendMode) {
        // Append new chunk
        set((state) => ({
          missingPersons: [...state.missingPersons, ...persons],
        }));
      } else {
        // Replace all data
        set({ missingPersons: persons });
      }
    }
  );
  set({ unsubscribe: unsubscribeFn });
};
```

---

## Authentication

### Admin Authentication

**File:** `src/contexts/AuthContext.jsx`

```javascript
import { useAuth } from "../contexts/AuthContext";

const {
  user, // Current user object
  loading, // Auth loading state
  login, // Login function
  logout, // Logout function
  isAuthenticated, // Boolean auth status
} = useAuth();
```

#### Login

```javascript
await login(email, password);
```

#### Logout

```javascript
await logout();
```

### Protected Routes

**File:** `src/components/ProtectedRoute.jsx`

```jsx
import ProtectedRoute from "./components/ProtectedRoute";

// In App.jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>;
```

---

## File Upload

### Upload Photo

```javascript
import { uploadPhoto } from "./services/supabaseService";

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  const url = await uploadPhoto(file, "missing-persons");
  setPhotoUrl(url);
};
```

### Storage Buckets

| Bucket            | Purpose                  |
| ----------------- | ------------------------ |
| `missing-persons` | Missing person photos    |
| `disasters`       | Disaster incident photos |
| `animal-rescues`  | Animal rescue photos     |
| `camps`           | Camp photos              |

---

## Payment Integration

### Stripe Setup

**Frontend Integration:**

```javascript
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function DonationsPage() {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm />
    </Elements>
  );
}
```

### Payment Flow

1. **Create Payment Intent** (Backend)

```javascript
// Supabase Edge Function or API endpoint
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // Convert to cents
  currency: "usd",
  receipt_email: email,
});
```

2. **Confirm Payment** (Frontend)

```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement },
});
```

3. **Record Donation** (Database)

```javascript
await createDocument(TABLES.DONATIONS, {
  amount,
  currency,
  donor_name,
  email,
  stripe_payment_intent_id: paymentIntent.id,
  status: "completed",
});
```

---

## Error Handling

### Service Layer Errors

All service functions throw errors on failure:

```javascript
try {
  await createDocument(TABLES.MISSING_PERSONS, data);
} catch (error) {
  console.error("Failed to create record:", error.message);
  // Handle error (show toast, update UI, etc.)
}
```

### Store Error State

```javascript
const { error } = useMissingPersonStore();

if (error) {
  return <ErrorMessage message={error} />;
}
```

---

## Best Practices

### 1. Always Use Stores for Data

```javascript
// ✅ Good - Use store
const { missingPersons } = useMissingPersonStore();

// ❌ Bad - Direct service calls in components
const data = await getAllDocuments(TABLES.MISSING_PERSONS);
```

### 2. Subscribe on Mount, Unsubscribe on Unmount

```javascript
useEffect(() => {
  subscribeToMissingPersons();
  return () => unsubscribeFromMissingPersons();
}, []);
```

### 3. Handle Loading States

```javascript
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
return <DataList data={data} />;
```

### 4. Validate Input Before Submission

```javascript
import { useForm } from "react-hook-form";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
```

---

**End of API Reference**
