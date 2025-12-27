import { create } from 'zustand';
import { 
    createDocument, 
    getAllDocuments, 
    updateDocument, 
    deleteDocument,
    subscribeToTable,
    uploadPhoto,
    TABLES 
} from '../services/supabaseService';

/**
 * Supabase-integrated Zustand stores
 * Combines local state management with Supabase real-time sync
 */

// Missing Persons Store
export const useMissingPersonStore = create((set, get) => ({
    missingPersons: [],
    loading: false,
    error: null,
    unsubscribe: null,
    isInitialized: false,

    // Initialize real-time listener
    subscribeToMissingPersons: async () => {
        // Skip if already initialized and subscribed
        const { isInitialized, unsubscribe } = get();
        if (isInitialized && unsubscribe) {
            return;
        }
        
        set({ loading: true });
        const unsubscribeFn = await subscribeToTable(
            TABLES.MISSING_PERSONS,
            (persons, appendMode = false) => {
                if (appendMode) {
                    // Append new data, filtering out duplicates
                    set((state) => {
                        const existingIds = new Set(state.missingPersons.map(p => p.id));
                        const newPersons = persons.filter(p => !existingIds.has(p.id));
                        return { 
                            missingPersons: [...state.missingPersons, ...newPersons]
                        };
                    });
                } else {
                    // Replace all data
                    set({ 
                        missingPersons: persons, 
                        loading: false, 
                        error: null, 
                        isInitialized: true 
                    });
                }
            }
        );
        set({ unsubscribe: unsubscribeFn });
    },

    // Unsubscribe from listener
    unsubscribeFromMissingPersons: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    // Fetch all
    fetchMissingPersons: async () => {
        try {
            set({ loading: true, error: null });
            const persons = await getAllDocuments(TABLES.MISSING_PERSONS);
            set({ missingPersons: persons, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    // Add missing person
    addMissingPerson: async (person) => {
        try {
            set({ loading: true, error: null });
            const newPerson = await createDocument(TABLES.MISSING_PERSONS, person);
            set((state) => ({
                missingPersons: [newPerson, ...state.missingPersons],
                loading: false
            }));
            return newPerson;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Update missing person
    updateMissingPerson: async (id, updatedPerson) => {
        try {
            set({ loading: true, error: null });
            await updateDocument(TABLES.MISSING_PERSONS, id, updatedPerson);
            set((state) => ({
                missingPersons: state.missingPersons.map(person =>
                    person.id === id ? { ...person, ...updatedPerson } : person
                ),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    // Delete missing person
    deleteMissingPerson: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDocument(TABLES.MISSING_PERSONS, id);
            set((state) => ({
                missingPersons: state.missingPersons.filter(person => person.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },
}));

// Disaster Reports Store
export const useDisasterStore = create((set, get) => ({
    disasters: [],
    loading: false,
    error: null,
    unsubscribe: null,
    isInitialized: false,

    subscribeToDisasters: async () => {
        // Skip if already initialized and subscribed
        const { isInitialized, unsubscribe } = get();
        if (isInitialized && unsubscribe) {
            return;
        }
        
        set({ loading: true });
        const unsubscribeFn = await subscribeToTable(
            TABLES.DISASTERS,
            (disasters, appendMode = false) => {
                if (appendMode) {
                    set((state) => {
                        const existingIds = new Set(state.disasters.map(d => d.id));
                        const newDisasters = disasters.filter(d => !existingIds.has(d.id));
                        return { 
                            disasters: [...state.disasters, ...newDisasters]
                        };
                    });
                } else {
                    set({ 
                        disasters, 
                        loading: false, 
                        error: null, 
                        isInitialized: true 
                    });
                }
            }
        );
        set({ unsubscribe: unsubscribeFn });
    },

    unsubscribeFromDisasters: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    fetchDisasters: async () => {
        try {
            set({ loading: true, error: null });
            const disasters = await getAllDocuments(TABLES.DISASTERS);
            set({ disasters, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addDisaster: async (disaster) => {
        try {
            set({ loading: true, error: null });
            const newDisaster = await createDocument(TABLES.DISASTERS, disaster);
            set((state) => ({
                disasters: [newDisaster, ...state.disasters],
                loading: false
            }));
            return newDisaster;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateDisaster: async (id, updatedDisaster) => {
        try {
            set({ loading: true, error: null });
            await updateDocument(TABLES.DISASTERS, id, updatedDisaster);
            set((state) => ({
                disasters: state.disasters.map(disaster =>
                    disaster.id === id ? { ...disaster, ...updatedDisaster } : disaster
                ),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteDisaster: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDocument(TABLES.DISASTERS, id);
            set((state) => ({
                disasters: state.disasters.filter(disaster => disaster.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },
}));

// Animal Rescue Store
export const useAnimalRescueStore = create((set, get) => ({
    animalRescues: [],
    loading: false,
    error: null,
    unsubscribe: null,
    isInitialized: false,

    subscribeToAnimalRescues: async () => {
        // Skip if already initialized and subscribed
        const { isInitialized, unsubscribe } = get();
        if (isInitialized && unsubscribe) {
            return;
        }
        
        set({ loading: true });
        const unsubscribeFn = await subscribeToTable(
            TABLES.ANIMAL_RESCUES,
            (rescues, appendMode = false) => {
                if (appendMode) {
                    set((state) => {
                        const existingIds = new Set(state.animalRescues.map(r => r.id));
                        const newRescues = rescues.filter(r => !existingIds.has(r.id));
                        return { 
                            animalRescues: [...state.animalRescues, ...newRescues]
                        };
                    });
                } else {
                    set({ 
                        animalRescues: rescues, 
                        loading: false, 
                        error: null, 
                        isInitialized: true 
                    });
                }
            }
        );
        set({ unsubscribe: unsubscribeFn });
    },

    unsubscribeFromAnimalRescues: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    fetchAnimalRescues: async () => {
        try {
            set({ loading: true, error: null });
            const rescues = await getAllDocuments(TABLES.ANIMAL_RESCUES);
            set({ animalRescues: rescues, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addAnimalRescue: async (rescue) => {
        try {
            set({ loading: true, error: null });
            const newRescue = await createDocument(TABLES.ANIMAL_RESCUES, rescue);
            set((state) => ({
                animalRescues: [newRescue, ...state.animalRescues],
                loading: false
            }));
            return newRescue;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateAnimalRescue: async (id, updatedRescue) => {
        try {
            set({ loading: true, error: null });
            await updateDocument(TABLES.ANIMAL_RESCUES, id, updatedRescue);
            set((state) => ({
                animalRescues: state.animalRescues.map(rescue =>
                    rescue.id === id ? { ...rescue, ...updatedRescue } : rescue
                ),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteAnimalRescue: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDocument(TABLES.ANIMAL_RESCUES, id);
            set((state) => ({
                animalRescues: state.animalRescues.filter(rescue => rescue.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },
}));

// Camps Store
export const useCampStore = create((set, get) => ({
    camps: [],
    loading: false,
    error: null,
    unsubscribe: null,
    isInitialized: false,

    subscribeToCamps: async () => {
        // Skip if already initialized and subscribed
        const { isInitialized, unsubscribe } = get();
        if (isInitialized && unsubscribe) {
            return;
        }
        
        set({ loading: true });
        const unsubscribeFn = await subscribeToTable(
            TABLES.CAMPS,
            (camps, appendMode = false) => {
                if (appendMode) {
                    set((state) => {
                        const existingIds = new Set(state.camps.map(c => c.id));
                        const newCamps = camps.filter(c => !existingIds.has(c.id));
                        return { 
                            camps: [...state.camps, ...newCamps]
                        };
                    });
                } else {
                    set({ 
                        camps, 
                        loading: false, 
                        error: null, 
                        isInitialized: true 
                    });
                }
            }
        );
        set({ unsubscribe: unsubscribeFn });
    },

    unsubscribeFromCamps: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    },

    fetchCamps: async () => {
        try {
            set({ loading: true, error: null });
            const camps = await getAllDocuments(TABLES.CAMPS);
            set({ camps, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addCamp: async (camp) => {
        try {
            set({ loading: true, error: null });
            const newCamp = await createDocument(TABLES.CAMPS, camp);
            set((state) => ({
                camps: [newCamp, ...state.camps],
                loading: false
            }));
            return newCamp;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateCamp: async (id, updatedCamp) => {
        try {
            set({ loading: true, error: null });
            await updateDocument(TABLES.CAMPS, id, updatedCamp);
            set((state) => ({
                camps: state.camps.map(camp =>
                    camp.id === id ? { ...camp, ...updatedCamp } : camp
                ),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteCamp: async (id) => {
        try {
            set({ loading: true, error: null });
            await deleteDocument(TABLES.CAMPS, id);
            set((state) => ({
                camps: state.camps.filter(camp => camp.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },
}));
