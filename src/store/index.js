import { create } from 'zustand';

// Status values: Active, Resolved
export const useMissingPersonStore = create((set) => ({
  missingPersons: [],
  
  // Initialize with data (call this on app load with mock data)
  initializeMissingPersons: (data) => set({ missingPersons: data }),
  
  addMissingPerson: (person) => set((state) => ({ 
    missingPersons: [...state.missingPersons, person] 
  })),
  
  updateMissingPerson: (id, updatedPerson) => set((state) => ({
    missingPersons: state.missingPersons.map(person => 
      person.id === id ? { ...person, ...updatedPerson } : person
    )
  })),
  
  removeMissingPerson: (id) => set((state) => ({
    missingPersons: state.missingPersons.filter(person => person.id !== id)
  })),
  
  // Mark as found by responder - directly resolves the case
  markFoundByResponder: (id, foundByContact = null) => set((state) => ({
    missingPersons: state.missingPersons.map(person =>
      person.id === id
        ? {
            ...person,
            status: 'Resolved',
            foundAt: new Date().toISOString(),
            foundByContact: foundByContact || null
          }
        : person
    )
  })),
}));

// Animal Rescue Store - Status values: Active, Resolved
export const useAnimalRescueStore = create((set) => ({
  animalRescues: [],
  
  // Initialize with data (call this on app load with mock data)
  initializeAnimalRescues: (data) => set({ animalRescues: data }),
  
  addAnimalRescue: (rescue) => set((state) => ({ 
    animalRescues: [...state.animalRescues, rescue] 
  })),
  
  updateAnimalRescue: (id, updatedRescue) => set((state) => ({
    animalRescues: state.animalRescues.map(rescue => 
      rescue.id === id ? { ...rescue, ...updatedRescue } : rescue
    )
  })),
  
  removeAnimalRescue: (id) => set((state) => ({
    animalRescues: state.animalRescues.filter(rescue => rescue.id !== id)
  })),
  
  // Mark as found/rescued by responder - directly resolves the case
  markFoundByResponder: (id, foundByContact = null) => set((state) => ({
    animalRescues: state.animalRescues.map(rescue =>
      rescue.id === id
        ? {
            ...rescue,
            status: 'Resolved',
            foundAt: new Date().toISOString(),
            foundByContact: foundByContact || null
          }
        : rescue
    )
  })),
}));

// Disaster Reports Store - Status values: Active, Resolved
export const useDisasterStore = create((set) => ({
  disasters: [],
  
  // Initialize with data (call this on app load with mock data)
  initializeDisasters: (data) => set({ disasters: data }),
  
  addDisaster: (disaster) => set((state) => ({ 
    disasters: [...state.disasters, disaster] 
  })),
  
  updateDisaster: (id, updatedDisaster) => set((state) => ({
    disasters: state.disasters.map(disaster => 
      disaster.id === id ? { ...disaster, ...updatedDisaster } : disaster
    )
  })),
  
  removeDisaster: (id) => set((state) => ({
    disasters: state.disasters.filter(disaster => disaster.id !== id)
  })),
  
  // Mark disaster as resolved by responder
  markResolvedByResponder: (id, resolvedBy, responderNotes = null) => set((state) => ({
    disasters: state.disasters.map(disaster =>
      disaster.id === id
        ? {
            ...disaster,
            status: 'Resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: resolvedBy || 'Disaster Response Team',
            responderNotes: responderNotes || null
          }
        : disaster
    )
  })),
}));

// Camps Store - For post-disaster management
export const useCampStore = create((set) => ({
  camps: [],
  
  // Initialize with data (call this on app load with mock data)
  initializeCamps: (data) => set({ camps: data }),
  
  addCamp: (camp) => set((state) => ({ 
    camps: [...state.camps, camp] 
  })),
  
  updateCamp: (id, updatedCamp) => set((state) => ({
    camps: state.camps.map(camp => 
      camp.id === id ? { ...camp, ...updatedCamp } : camp
    )
  })),
  
  removeCamp: (id) => set((state) => ({
    camps: state.camps.filter(camp => camp.id !== id)
  })),
  
  // Update camp supplies
  updateSupplies: (id, supplies) => set((state) => ({
    camps: state.camps.map(camp =>
      camp.id === id
        ? { ...camp, supplies: { ...camp.supplies, ...supplies } }
        : camp
    )
  })),
  
  // Update camp occupancy
  updateOccupancy: (id, currentOccupancy) => set((state) => ({
    camps: state.camps.map(camp =>
      camp.id === id
        ? { ...camp, currentOccupancy }
        : camp
    )
  })),
  
  // Close camp
  closeCamp: (id) => set((state) => ({
    camps: state.camps.map(camp =>
      camp.id === id
        ? {
            ...camp,
            status: 'Closed',
            closedDate: new Date().toISOString(),
            currentOccupancy: 0
          }
        : camp
    )
  })),
}));

// Example store for volunteers
export const useVolunteerStore = create((set) => ({
  volunteers: [],
  addVolunteer: (volunteer) => set((state) => ({ 
    volunteers: [...state.volunteers, volunteer] 
  })),
  updateVolunteer: (id, updatedVolunteer) => set((state) => ({
    volunteers: state.volunteers.map(volunteer => 
      volunteer.id === id ? { ...volunteer, ...updatedVolunteer } : volunteer
    )
  })),
}));

// Global app store for user authentication and settings
export const useAppStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  language: 'en',
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLanguage: (language) => set({ language }),
}));
