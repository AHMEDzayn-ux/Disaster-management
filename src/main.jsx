import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { useMissingPersonStore, useAnimalRescueStore, useDisasterStore, useCampStore } from './store'
import { mockMissingPersons } from './data/mockMissingPersons'
import mockAnimalRescues from './data/mockAnimalRescues'
import mockDisasterReports from './data/mockDisasterReports'
import mockCamps from './data/mockCamps'

// Initialize store with mock data on app load
// This will be replaced with Firebase data fetching later
const initializeApp = () => {
  const { initializeMissingPersons } = useMissingPersonStore.getState();
  const { initializeAnimalRescues } = useAnimalRescueStore.getState();
  const { initializeDisasters } = useDisasterStore.getState();
  const { initializeCamps } = useCampStore.getState();

  // Check if data already exists in store (prevents reinit on hot reload)
  const currentMissingPersons = useMissingPersonStore.getState().missingPersons;
  const currentAnimalRescues = useAnimalRescueStore.getState().animalRescues;
  const currentDisasters = useDisasterStore.getState().disasters;
  const currentCamps = useCampStore.getState().camps;

  if (currentMissingPersons.length === 0) {
    initializeMissingPersons(mockMissingPersons);
  }

  if (currentAnimalRescues.length === 0) {
    initializeAnimalRescues(mockAnimalRescues);
  }

  if (currentDisasters.length === 0) {
    initializeDisasters(mockDisasterReports);
  }

  if (currentCamps.length === 0) {
    initializeCamps(mockCamps);
  }
};

initializeApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
