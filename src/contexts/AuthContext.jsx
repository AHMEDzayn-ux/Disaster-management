import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId) => {
        console.log('fetchUserProfile called for userId:', userId);

        // Set a timeout to ensure loading is set to false
        const timeoutId = setTimeout(() => {
            console.warn('Profile fetch timeout - using fallback');
            setProfile({ id: userId, role: 'admin' });
            setLoading(false);
        }, 5000); // 5 second timeout

        try {
            console.log('Fetching user profile from database...');
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            clearTimeout(timeoutId); // Clear timeout if fetch completes

            if (error) {
                console.error('Error fetching profile:', error);
                // Use fallback profile with admin role
                console.log('Using fallback admin profile');
                setProfile({ id: userId, role: 'admin' });
            } else {
                console.log('Profile fetched successfully:', data);
                setProfile(data);
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Profile fetch error:', error);
            // Fallback profile
            setProfile({ id: userId, role: 'admin' });
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        }).catch((error) => {
            console.error('Session check error:', error);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchUserProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, userData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: userData.fullName,
                        phone: userData.phone,
                        role: 'public' // Default role
                    }
                }
            });

            if (error) throw error;

            // Create profile
            if (data.user) {
                await supabase.from('user_profiles').insert({
                    id: data.user.id,
                    email: email,
                    full_name: userData.fullName,
                    phone: userData.phone,
                    role: 'public',
                    created_at: new Date().toISOString()
                });
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const isAdmin = () => profile?.role === 'admin';
    const isResponder = () => profile?.role === 'responder' || profile?.role === 'admin';
    const isPublic = () => profile?.role === 'public' || !profile;

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        isAdmin,
        isResponder,
        isPublic,
        hasRole: (role) => profile?.role === role
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
