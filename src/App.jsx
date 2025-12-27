import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Eager load only critical pages
import RoleSelection from './pages/RoleSelection';
import EmergencyContacts from './pages/EmergencyContacts';

// Lazy load all other pages for code splitting
const ReportDashboard = lazy(() => import('./pages/ReportDashboard'));
const RespondDashboard = lazy(() => import('./pages/RespondDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MissingPersons = lazy(() => import('./pages/MissingPersons'));
const MissingPersonDetail = lazy(() => import('./pages/MissingPersonDetail'));
const DisasterReports = lazy(() => import('./pages/DisasterReports'));
const DisasterReportDetail = lazy(() => import('./pages/DisasterReportDetail'));
const AnimalRescue = lazy(() => import('./pages/AnimalRescue'));
const AnimalRescueDetail = lazy(() => import('./pages/AnimalRescueDetail'));
const CampDetail = lazy(() => import('./pages/CampDetail'));
const CampManagement = lazy(() => import('./pages/CampManagement'));
const Volunteers = lazy(() => import('./pages/Volunteers'));
const Donations = lazy(() => import('./pages/Donations'));
const BulkTestData = lazy(() => import('./pages/BulkTestData'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing - Role Selection (No Navbar) - Eager loaded */}
          <Route path="/" element={<RoleSelection />} />

          {/* Report Interface (for victims/reporters) - Lazy loaded */}
          <Route path="/report" element={<><Navbar userType="reporter" /><ReportDashboard /></>} />
          <Route path="/missing-persons" element={<><Navbar userType="reporter" /><MissingPersons /></>} />
          <Route path="/missing-persons/:id" element={<><Navbar userType="reporter" /><MissingPersonDetail role="reporter" /></>} />
          <Route path="/disasters" element={<><Navbar userType="reporter" /><DisasterReports /></>} />
          <Route path="/disasters/:id" element={<><Navbar userType="reporter" /><DisasterReportDetail role="reporter" /></>} />
          <Route path="/animal-rescue" element={<><Navbar userType="reporter" /><AnimalRescue /></>} />
          <Route path="/animal-rescue/:id" element={<><Navbar userType="reporter" /><AnimalRescueDetail role="reporter" /></>} />
          <Route path="/emergency" element={<><Navbar userType="reporter" /><EmergencyContacts /></>} />

          {/* Respond Interface (for helpers/responders) - Lazy loaded */}
          <Route path="/respond" element={<><Navbar userType="responder" /><RespondDashboard /></>} />
          <Route path="/missing-persons-list" element={<><Navbar userType="responder" /><Dashboard role="responder" /></>} />
          <Route path="/missing-persons-list/:id" element={<><Navbar userType="responder" /><MissingPersonDetail role="responder" /></>} />
          <Route path="/disasters-list" element={<><Navbar userType="responder" /><Dashboard role="responder" /></>} />
          <Route path="/disasters-list/:id" element={<><Navbar userType="responder" /><DisasterReportDetail role="responder" /></>} />
          <Route path="/animal-rescue-list" element={<><Navbar userType="responder" /><Dashboard role="responder" /></>} />
          <Route path="/animal-rescue-list/:id" element={<><Navbar userType="responder" /><AnimalRescueDetail role="responder" /></>} />
          <Route path="/camps" element={<><Navbar userType="responder" /><Dashboard role="responder" /></>} />
          <Route path="/camps/:id" element={<><Navbar userType="responder" /><CampDetail /></>} />
          <Route path="/volunteers" element={<><Navbar userType="responder" /><Volunteers /></>} />
          <Route path="/donations" element={<><Navbar userType="responder" /><Donations /></>} />

          {/* Bulk Test Data Generator */}
          <Route path="/bulk-test-data" element={<BulkTestData />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
