import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        if (!supabase) return;
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            let finalProfile = { ...profileData };

            // If it's a student, fetch their enrollment status
            if (profileData.role === 'student') {
                const { data: studentData } = await supabase
                    .from('students')
                    .select('status, deleted_at')
                    .eq('user_id', userId)
                    .single();

                if (studentData) {
                    finalProfile.studentStatus = studentData.status;
                    finalProfile.isDeleted = !!studentData.deleted_at;
                }
            }

            setProfile(finalProfile);
        } catch (error) {
            console.error('Error fetching profile:', error.message);
        } finally {
            setLoading(false);
        }
    };


    const signIn = (email, password) => {
        if (!supabase) return Promise.reject(new Error('Supabase client not initialized'));
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

    const signOut = () => {
        if (!supabase) return Promise.resolve();
        return supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile: fetchProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
