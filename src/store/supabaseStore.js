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

    // Initialize real-time listener
    subscribeToMissingPersons: async () => {
        set({ loading: true });
        const unsubscribe = await subscribeToTable(
            TABLES.MISSING_PERSONS,
            (persons) => {
                set({ missingPersons: persons, loading: false, error: null });
            }
        );
        set({ unsubscribe });
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

    subscribeToDisasters: async () => {
        set({ loading: true });
        const unsubscribe = await subscribeToTable(
            TABLES.DISASTERS,
            (disasters) => {
                set({ disasters, loading: false, error: null });
            }
        );
        set({ unsubscribe });
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

    subscribeToAnimalRescues: async () => {
        set({ loading: true });
        const unsubscribe = await subscribeToTable(
            TABLES.ANIMAL_RESCUES,
            (rescues) => {
                set({ animalRescues: rescues, loading: false, error: null });
            }
        );
        set({ unsubscribe });
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

    subscribeToCamps: async () => {
        set({ loading: true });
        const unsubscribe = await subscribeToTable(
            TABLES.CAMPS,
            (camps) => {
                set({ camps, loading: false, error: null });
            }
        );
        set({ unsubscribe });
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
