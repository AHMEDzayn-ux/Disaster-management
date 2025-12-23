import { create } from 'zustand';

// Example store for missing persons
export const useMissingPersonStore = create((set) => ({
  missingPersons: [],
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
}));

// Example store for disaster reports
export const useDisasterStore = create((set) => ({
  disasters: [],
  addDisaster: (disaster) => set((state) => ({ 
    disasters: [...state.disasters, disaster] 
  })),
  updateDisaster: (id, updatedDisaster) => set((state) => ({
    disasters: state.disasters.map(disaster => 
      disaster.id === id ? { ...disaster, ...updatedDisaster } : disaster
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
