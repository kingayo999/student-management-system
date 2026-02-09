import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(() => {
        try {
            const cached = localStorage.getItem('registry_profile');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Initialize session and listen for changes
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Background sync
                fetchProfile(currentUser.id);
                // If we have a cached profile matching this user, stop loading immediately
                if (profile && profile.id === currentUser.id) {
                    setLoading(false);
                }
            } else {
                setProfile(null);
                localStorage.removeItem('registry_profile');
                setLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            } else {
                setProfile(null);
                localStorage.removeItem('registry_profile');
                setLoading(false);
            }
        });

        initializeAuth();

        return () => subscription.unsubscribe();
    }, []);


    const fetchProfile = async (userId, retryCount = 0) => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile connection timed out (Registry Latency)')), 10000)
            );

            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const response = await Promise.race([profilePromise, timeoutPromise]);
            const { data: profileData, error: profileError } = response;

            if (profileError) throw profileError;

            let finalProfile = { ...profileData };

            if (profileData.role === 'student') {
                const { data: studentData } = await supabase
                    .from('students')
                    .select('status, deleted_at')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (studentData) {
                    finalProfile.studentStatus = studentData.status;
                    finalProfile.isDeleted = !!studentData.deleted_at;
                }
            }

            setProfile(finalProfile);
            localStorage.setItem('registry_profile', JSON.stringify(finalProfile));
        } catch (error) {
            console.error(`Auth Error (Attempt ${retryCount + 1}):`, error.message);

            // Retry logic for network/timeout errors (not 406 or explicit role failures)
            if (retryCount < 2 && (error.message.includes('timeout') || error.message.includes('fetch'))) {
                const delay = Math.pow(2, retryCount) * 1000;
                await new Promise(res => setTimeout(res, delay));
                return fetchProfile(userId, retryCount + 1);
            }

            // Preservation rule: Only clear profile if it's an explicit auth failure (403, 401, etc)
            // If it's just a timeout/network error, we KEEP the old profile to avoid kicking the user out.
            const isExplicitAuthFailure = error.code === 'PGRST116' || error.status === 403 || error.status === 401;

            if (isExplicitAuthFailure) {
                setProfile(null);
            }

            // Note: If profile is already null and we fail to fetch, the user will be redirected.
            // If profile exists and we fail to fetch (temporary network), they stay logged in.
        } finally {
            setLoading(false);
        }
    };


    const signIn = (email, password) => {
        if (!supabase) return Promise.reject(new Error('Supabase client not initialized'));
        setLoading(true); // Set loading to true while we re-fetch profile on success
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = (email, password, metadata) => {
        if (!supabase) return Promise.reject(new Error('Supabase client not initialized'));
        return supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
    };

    const signOut = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            localStorage.removeItem('registry_profile');
        } catch (error) {
            console.error('Sign Out Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            role: profile?.role, // Explicitly expose role in global state
            loading,
            signIn,
            signUp,
            signOut,
            refreshProfile: fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
