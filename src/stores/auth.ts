import type { Session, User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { supabase } from '../services/supabase-client';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAdmin = ref<boolean>(false);
  const loading = ref<boolean>(true);

  async function checkAdminRole(userId: string): Promise<void> {
    if (!userId) {
      isAdmin.value = false;
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles_drugcupsabot')
        .select('role')
        .eq('id', userId)
        .single();

      if (error)
        throw error;
      // FIX: Supabase without generated DB types returns `any` for query results.
      // Runtime guarantee: `profiles_drugcupsabot` table always has a `role: string` column.
      isAdmin.value = data?.role === 'admin';
    }
    catch (error) {
      console.error('Error fetching admin role:', error);
      isAdmin.value = false;
    }
  }

  async function initializeAuth(): Promise<void> {
    loading.value = true;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      user.value = session.user;
      await checkAdminRole(session.user.id);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        user.value = session.user;
        if (!isAdmin.value)
          await checkAdminRole(session.user.id);
      }
      else {
        user.value = null;
        isAdmin.value = false;
      }
      loading.value = false;
    });
  }

  async function login(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw error;
    return data;
  }

  /**
   * Production-Grade Fail-safe Logout
   * Ensures client state is cleared even if server returns 401/403
   */
  async function logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Logout warning (Supabase):', error.message);
      }
    }
    catch (err) {
      console.error('Logout Exception:', err);
    }
    finally {
      // Always clear user state on client side
      user.value = null;
      isAdmin.value = false;
    }
  }

  return {
    user,
    isAdmin,
    loading,
    initializeAuth,
    login,
    logout,
  };
});
