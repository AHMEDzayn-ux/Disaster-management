# 🚨 Disaster Management Platform - Sri Lanka

A comprehensive web-based disaster management system for Sri Lanka, enabling efficient coordination of emergency response, resource management, and community support during disasters.

## 🎯 Features

### Core Modules

1. **Missing Person Reporting** - Report and track missing individuals during disasters
2. **Disaster Reporting** - Submit and monitor disaster incidents with location data
3. **Animal Rescue** - Coordinate rescue operations for animals in distress
4. **Camp Management** - Manage relief camps, supplies, and facilities
5. **Volunteer Registration** - Register and coordinate volunteer groups
6. **Donation Facilitation** - Enable monetary and material donations
7. **Emergency Contacts** - Quick access to emergency services
8. **SMS Reporting** - AI-powered SMS processing for network-challenged areas

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **React Router DOM 7** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form validation and handling
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API requests
- **Vite** - Build tool and dev server

### Development Tools

- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.jsx      # Navigation bar
├── pages/              # Page components for each route
│   ├── Dashboard.jsx
│   ├── MissingPersons.jsx
│   ├── DisasterReports.jsx
│   ├── AnimalRescue.jsx
│   ├── CampManagement.jsx
│   ├── Volunteers.jsx
│   ├── Donations.jsx
│   └── EmergencyContacts.jsx
├── services/           # API and external services
│   └── api.js         # Axios configuration and API endpoints
├── store/             # Zustand state management
│   └── index.js       # Global stores
├── hooks/             # Custom React hooks (create as needed)
├── utils/             # Utility functions (create as needed)
├── App.jsx            # Main app component with routing
└── main.jsx           # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Disaster-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open browser**
   - Navigate to `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Tailwind CSS Usage

We've created custom utility classes in index.css:

```jsx
// Buttons
<button className="btn-primary">Primary Action</button>
<button className="btn-danger">Delete</button>
<button className="btn-success">Success</button>

// Cards
<div className="card">Content here</div>

// Input Fields
<input className="input-field" />
```

## 📦 State Management (Zustand)

Example usage of global stores:

```jsx
import { useMissingPersonStore } from "./store";

function MyComponent() {
  const { missingPersons, addMissingPerson } = useMissingPersonStore();

  const handleSubmit = (data) => {
    addMissingPerson(data);
  };

  return <div>{/* Your component */}</div>;
}
```

## 🔌 API Integration

Example API call:

```jsx
import { missingPersonsAPI } from "./services/api";

// Fetch all missing persons
const response = await missingPersonsAPI.getAll();

// Create new report
const newReport = await missingPersonsAPI.create({
  name: "John Doe",
  age: 35,
  location: "Colombo",
});
```

## 📝 Form Handling (React Hook Form)

Example form with validation:

```jsx
import { useForm } from "react-hook-form";

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("name", { required: "Name is required" })}
        className="input-field"
      />
      {errors.name && (
        <span className="text-red-500">{errors.name.message}</span>
      )}

      <button type="submit" className="btn-primary">
        Submit
      </button>
    </form>
  );
}
```

## 👥 Team Development Workflow

### Branch Strategy

```bash
main              # Production-ready code
├── develop       # Integration branch
├── feature/missing-persons
├── feature/disaster-reports
└── feature/sms-integration
```

### Recommended Division of Work

**Person 1: Frontend Core**

- Missing Person module
- Disaster Reports module
- Shared components

**Person 2: Frontend Features**

- Animal Rescue
- Volunteer Registration
- Donation pages

**Person 3: Integration & Backend**

- Camp Management
- Emergency Contacts
- SMS AI integration
- Backend API development

### Daily Sync

- Share progress and blockers
- Review and merge PRs
- Plan next tasks

## 🔮 Next Steps

### Phase 1: MVP (Week 1-2)

- [ ] Implement Missing Person form with React Hook Form
- [ ] Build Disaster Report submission
- [ ] Create Emergency Contacts database
- [ ] Set up basic backend (Firebase/Node.js)

### Phase 2: Advanced Features (Week 3-4)

- [ ] Add map integration (Leaflet/Google Maps)
- [ ] Implement image upload for reports
- [ ] Build Volunteer registration system
- [ ] Create Camp management dashboard

### Phase 3: SMS & AI (Week 5-6)

- [ ] Integrate SMS gateway (Twilio/Dialog)
- [ ] Build AI processing pipeline (OpenAI/Hugging Face)
- [ ] Create admin approval workflow
- [ ] Add real-time notifications

### Phase 4: Polish & Deploy (Week 7-8)

- [ ] Implement authentication (Firebase Auth/JWT)
- [ ] Add payment integration (PayHere/Stripe)
- [ ] Performance optimization
- [ ] Deploy to production

## 🌐 Deployment

### Frontend Deployment Options

- **Vercel** (Recommended) - Zero config for Vite
- **Netlify** - Easy deployment
- **GitHub Pages** - Free hosting

### Backend Deployment Options

- **Firebase** (Easiest for beginners)
- **Railway** (Simple Node.js hosting)
- **Render** (Free tier available)
- **AWS/Azure** (More advanced)

## 📚 Learning Resources

### React Basics

- [React Official Docs](https://react.dev/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zustand Guide](https://zustand-demo.pmnd.rs/)

### Tailwind CSS

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind Components](https://tailwindcomponents.com/)

### Backend Development

- [Firebase Quickstart](https://firebase.google.com/docs/web/setup)
- [Express.js Guide](https://expressjs.com/)

## 🆘 Support

For questions or issues:

- Create an issue on GitHub
- Contact team members
- Check documentation

---

**Built with ❤️ for Sri Lanka's disaster resilience**
