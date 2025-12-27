import { supabase } from '../config/supabase';
import { getCachedData, setCachedData, invalidateCache } from '../utils/cacheManager';

/**
 * Supabase service layer
 * Provides CRUD operations and real-time subscriptions for all collections
 */

// Table names
export const TABLES = {
    MISSING_PERSONS: 'missing_persons',
    DISASTERS: 'disasters',
    ANIMAL_RESCUES: 'animal_rescues',
    CAMPS: 'camps',
    DONATIONS: 'donations'
};

// Create a new document
export const createDocument = async (table, data) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        
        // Invalidate cache when new data is created
        invalidateCache(table);
        
        return result;
    } catch (error) {
        console.error(`Error creating document in ${table}:`, error);
        throw error;
    }
};

// Get a single document by ID
export const getDocument = async (table, id) => {
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error getting document from ${table}:`, error);
        throw error;
    }
};

// Get all documents from a table
export const getAllDocuments = async (table, options = {}) => {
    try {
        const { limit, offset = 0 } = options;
        let query = supabase
            .from(table)
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });
        
        if (limit) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: data || [], total: count };
    } catch (error) {
        console.error(`Error getting all documents from ${table}:`, error);
        throw error;
    }
};

// Update a document
export const updateDocument = async (table, id, updates) => {
    try {
        const { data, error } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        // Invalidate cache when data is updated
        invalidateCache(table);
        
        return data;
    } catch (error) {
        console.error(`Error updating document in ${table}:`, error);
        throw error;
    }
};

// Delete a document
export const deleteDocument = async (table, id) => {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        // Invalidate cache when data is deleted
        invalidateCache(table);
        
        return true;
    } catch (error) {
        console.error(`Error deleting document from ${table}:`, error);
        throw error;
    }
};

// Subscribe to real-time changes - progressive loading with caching
export const subscribeToTable = async (table, callback) => {
    const INITIAL_CHUNK = 30; // Show first 30 immediately
    const CHUNK_SIZE = 50; // Load remaining in 50-record batches

    // Check cache first
    const cachedResult = getCachedData(table);
    if (cachedResult) {
        // Use cached data immediately - instant load!
        callback(cachedResult.data || []);
        
        // Still subscribe to real-time updates in background
        const subscription = supabase
            .channel(`${table}_changes`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table }, 
                async (payload) => {
                    // Invalidate cache on any change
                    invalidateCache(table);
                    
                    // Refetch all data
                    const { data: updatedData, count } = await supabase
                        .from(table)
                        .select('*', { count: 'exact' })
                        .order('created_at', { ascending: false });
                    
                    const allData = updatedData || [];
                    callback(allData, false); // false = replace mode
                    
                    // Update cache
                    setCachedData(table, allData, count);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }

    // No cache - fetch and show first chunk INSTANTLY
    const { data: initialData, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, INITIAL_CHUNK - 1);
    
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        callback([]);
        return () => {};
    }

    // Show first chunk immediately - user sees data right away!
    callback(initialData || []);

    // Array to collect all data for caching
    let allData = [...(initialData || [])];

    // Load remaining data in background (if any)
    const totalRecords = count || 0;
    if (totalRecords > INITIAL_CHUNK) {
        // Load remaining chunks without blocking
        let offset = INITIAL_CHUNK;
        
        const loadRemainingChunks = async () => {
            while (offset < totalRecords) {
                const { data: nextChunk } = await supabase
                    .from(table)
                    .select('*')
                    .order('created_at', { ascending: false })
                    .range(offset, offset + CHUNK_SIZE - 1);
                
                if (nextChunk && nextChunk.length > 0) {
                    // Append new data as it arrives (no delay!)
                    callback(nextChunk, true); // true = append mode
                    allData = [...allData, ...nextChunk];
                    offset += nextChunk.length;
                } else {
                    break;
                }
            }
            
            // Cache all data after loading completes
            setCachedData(table, allData, totalRecords);
        };
        
        // Load in background without blocking UI
        loadRemainingChunks();
    } else {
        // Cache the initial data if it's all we have
        setCachedData(table, allData, totalRecords);
    }

    // Subscribe to real-time updates
    const subscription = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', 
            { event: '*', schema: 'public', table }, 
            async (payload) => {
                // Invalidate cache on any change
                invalidateCache(table);
                
                // Refetch all data on changes to ensure consistency
                const { data: updatedData, count } = await supabase
                    .from(table)
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false });
                
                const freshData = updatedData || [];
                callback(freshData, false); // false = replace mode
                
                // Update cache with fresh data
                setCachedData(table, freshData, count);
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
};

// Upload photo to Supabase Storage
export const uploadPhoto = async (file, bucket, path) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { url: publicUrl, path: filePath };
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

// Delete photo from Supabase Storage
export const deletePhoto = async (bucket, path) => {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};
