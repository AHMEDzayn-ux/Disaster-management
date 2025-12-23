# 📋 Project Architecture & Guidelines

## 🏗️ Complete File Structure

```
Disaster-management/
├── public/                      # Static assets
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Navbar.jsx          ✅ Done - Navigation bar
│   │   ├── MissingPersonForm.jsx ✅ Done - Example form
│   │   ├── Footer.jsx          📝 TODO
│   │   ├── LoadingSpinner.jsx  📝 TODO
│   │   └── ErrorMessage.jsx    📝 TODO
│   │
│   ├── pages/                   # Page components (one per route)
│   │   ├── Dashboard.jsx       ✅ Done - Main dashboard
│   │   ├── MissingPersons.jsx  ✅ Done - With working form
│   │   ├── DisasterReports.jsx ✅ Done - Placeholder
│   │   ├── AnimalRescue.jsx    ✅ Done - Placeholder
│   │   ├── CampManagement.jsx  ✅ Done - Placeholder
│   │   ├── Volunteers.jsx      ✅ Done - Placeholder
│   │   ├── Donations.jsx       ✅ Done - Placeholder
│   │   └── EmergencyContacts.jsx ✅ Done - With numbers
│   │
│   ├── services/                # API and external services
│   │   ├── api.js              ✅ Done - Axios config
│   │   ├── firebase.js         📝 TODO - If using Firebase
│   │   ├── sms-service.js      📝 TODO - SMS gateway
│   │   └── ai-service.js       📝 TODO - AI processing
│   │
│   ├── store/                   # Zustand state management
│   │   ├── index.js            ✅ Done - All stores
│   │   ├── useMissingPersonStore.js  📝 Optional - Split later
│   │   ├── useDisasterStore.js       📝 Optional
│   │   └── useAuthStore.js           📝 TODO
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js          📝 TODO
│   │   ├── useGeolocation.js   📝 TODO
│   │   └── useFileUpload.js    📝 TODO
│   │
│   ├── utils/                   # Utility functions
│   │   ├── validation.js       📝 TODO
│   │   ├── formatters.js       📝 TODO
│   │   └── constants.js        📝 TODO
│   │
│   ├── App.jsx                 ✅ Done - Main app with routing
│   ├── App.css                 ✅ Done
│   ├── main.jsx                ✅ Done - Entry point
│   └── index.css               ✅ Done - Tailwind setup
│
├── .env.example                ✅ Done - Environment template
├── .gitignore                  ✅ Exists
├── eslint.config.js            ✅ Done
├── index.html                  ✅ Done
├── package.json                ✅ Done
├── postcss.config.js           ✅ Done
├── tailwind.config.js          ✅ Done
├── vite.config.js              ✅ Done
├── README.md                   ✅ Done - Full documentation
└── QUICK_START.md              ✅ Done - Team guide
```

## 🎯 Module Implementation Priority

### Phase 1: Core Features (Week 1-2)

**Person 1:**

- ✅ Missing Person Form (EXAMPLE COMPLETE)
- 📝 Disaster Report Form (follow same pattern)
- 📝 Add image upload capability

**Person 2:**

- 📝 Animal Rescue Form
- 📝 Volunteer Registration Form
- 📝 Emergency Contacts enhancement

**Person 3:**

- 📝 Choose backend (Firebase vs Node.js)
- 📝 Set up database schema
- 📝 Create basic API endpoints
- 📝 Camp Management Form

### Phase 2: Integration (Week 3-4)

- Connect forms to backend APIs
- Add authentication system
- Implement file uploads (images)
- Add map integration for locations

### Phase 3: Advanced Features (Week 5-6)

- SMS gateway integration
- AI processing for SMS
- Real-time notifications
- Admin dashboard for approvals

### Phase 4: Polish & Launch (Week 7-8)

- Payment gateway for donations
- Performance optimization
- Mobile responsiveness testing
- Deployment

## 🎨 Component Design Patterns

### 1. Form Components (Example: MissingPersonForm.jsx)

**Pattern:**

```jsx
import { useForm } from "react-hook-form";
import { useYourStore } from "../store";

function YourForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const { addItem } = useYourStore();

  const onSubmit = async (data) => {
    try {
      // Process and save data
      addItem(data);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* Form fields */}</form>;
}
```

### 2. Page Components

**Pattern:**

```jsx
import YourForm from "../components/YourForm";
import { useYourStore } from "../store";

function YourPage() {
  const { items } = useYourStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Page Title</h1>
      <YourForm />
      <ItemList items={items} />
    </div>
  );
}
```

### 3. Reusable Components

Create these as needed:

**LoadingSpinner.jsx:**

```jsx
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
```

**ErrorMessage.jsx:**

```jsx
function ErrorMessage({ message }) {
  return (
    <div className="bg-danger-100 border border-danger-500 text-danger-700 px-4 py-3 rounded">
      ⚠️ {message}
    </div>
  );
}
```

## 🗄️ Database Schema (Recommended)

### Missing Persons

```javascript
{
  id: string,
  name: string,
  age: number,
  gender: string,
  height: number,
  description: string,
  lastSeenLocation: string,
  lastSeenDate: datetime,
  reporterName: string,
  contactNumber: string,
  email: string,
  additionalInfo: string,
  status: 'Active' | 'Found' | 'Closed',
  photos: [url],
  createdAt: datetime,
  updatedAt: datetime
}
```

### Disaster Reports

```javascript
{
  id: string,
  type: 'Flood' | 'Landslide' | 'Fire' | 'Earthquake' | 'Other',
  severity: 'Low' | 'Medium' | 'High' | 'Critical',
  location: string,
  coordinates: { lat: number, lng: number },
  description: string,
  affectedPeople: number,
  reporterName: string,
  contactNumber: string,
  photos: [url],
  status: 'Reported' | 'Responding' | 'Resolved',
  createdAt: datetime
}
```

### Volunteers

```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  address: string,
  skills: [string],
  availability: string,
  experience: string,
  emergencyContact: string,
  status: 'Available' | 'Deployed' | 'Inactive',
  registeredAt: datetime
}
```

### Camps

```javascript
{
  id: string,
  name: string,
  location: string,
  coordinates: { lat: number, lng: number },
  capacity: number,
  currentOccupancy: number,
  facilitiesAvailable: [string],
  resourcesNeeded: [
    { item: string, quantity: number, priority: string }
  ],
  managerName: string,
  contactNumber: string,
  status: 'Active' | 'Full' | 'Closed',
  createdAt: datetime
}
```

### Donations

```javascript
{
  id: string,
  donorName: string,
  email: string,
  phone: string,
  type: 'Money' | 'Items',
  amount: number, // For money
  items: [
    { name: string, quantity: number }
  ],
  paymentMethod: string,
  transactionId: string,
  status: 'Pending' | 'Completed' | 'Failed',
  createdAt: datetime
}
```

## 🔐 Authentication Strategy

### Option 1: Firebase Auth (Recommended for beginners)

- Email/Password
- Google Sign-in
- Phone number OTP

### Option 2: JWT with Node.js

- Custom user database
- More control, more complexity

### User Roles

```javascript
{
  id: string,
  email: string,
  name: string,
  role: 'admin' | 'volunteer' | 'reporter',
  phone: string,
  createdAt: datetime
}
```

## 🗺️ Map Integration

### Option 1: Leaflet (Free, Open Source)

```bash
npm install react-leaflet leaflet
```

### Option 2: Google Maps

- Needs API key ($200 free monthly credit)
- Better geocoding features

## 💳 Payment Integration (for Donations)

### For Sri Lanka:

1. **PayHere** - Local payment gateway

   - Credit/Debit cards
   - Mobile payments

2. **Stripe** - International
   - More features
   - Better documentation

## 📱 SMS Integration

### Gateway Options:

1. **Twilio** - International, easy to use
2. **Dialog/Mobitel API** - Local Sri Lankan providers
3. **TextLocal** - Alternative

### AI Processing:

```javascript
// Example SMS input:
"Missing person: Kasun Silva, age 35, last seen Colombo Fort, wearing blue shirt"

// AI parses to:
{
  type: "missing_person",
  name: "Kasun Silva",
  age: 35,
  location: "Colombo Fort",
  description: "wearing blue shirt"
}
```

## 🚀 Deployment Guide

### Frontend (Choose one):

**1. Vercel (Recommended)**

```bash
npm install -g vercel
vercel login
vercel
```

**2. Netlify**

- Drag and drop `dist` folder after `npm run build`
- Or connect GitHub repo for auto-deployment

**3. GitHub Pages**

```bash
npm run build
# Push dist folder to gh-pages branch
```

### Backend (Choose one):

**1. Firebase**

- Free tier generous
- No server management

**2. Railway**

```bash
npm install -g railway
railway login
railway init
railway up
```

**3. Render**

- Free tier available
- Easy deployment from GitHub

## 📊 Performance Optimization

1. **Code Splitting**

```jsx
import { lazy, Suspense } from "react";

const MissingPersons = lazy(() => import("./pages/MissingPersons"));

<Suspense fallback={<LoadingSpinner />}>
  <MissingPersons />
</Suspense>;
```

2. **Image Optimization**

- Compress before upload
- Use WebP format
- Lazy load images

3. **Caching**

- Use React Query for API caching
- Service Workers for offline support

## 🧪 Testing (Optional, Later Phase)

```bash
npm install -D @testing-library/react vitest
```

## 📝 Git Workflow

```bash
# Pull latest
git pull origin main

# Create feature branch
git checkout -b feature/disaster-form

# Make changes, then:
git add .
git commit -m "feat: add disaster report form"

# Push
git push origin feature/disaster-form

# Create PR on GitHub
```

### Commit Message Convention:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring

## 🆘 Common Errors & Solutions

### 1. Module not found

```bash
npm install
```

### 2. Tailwind not working

- Check if dev server is running
- Verify tailwind.config.js includes src files

### 3. Form not submitting

- Check browser console (F12)
- Verify all required fields have values

### 4. State not updating

- Make sure you're using the store correctly
- Check Zustand devtools

## 📚 Recommended VS Code Extensions

1. **ES7+ React/Redux/React-Native snippets**
2. **Tailwind CSS IntelliSense**
3. **Prettier - Code formatter**
4. **ESLint**
5. **Auto Rename Tag**

## ✨ Next Steps for Team

1. **Review the example form** (`src/components/MissingPersonForm.jsx`)
2. **Pick your module** from the division of work
3. **Copy the pattern** from MissingPersonForm
4. **Build one feature at a time**
5. **Test frequently** in the browser
6. **Commit often** to save progress

---

**Questions?** Check QUICK_START.md or ask your teammates!
