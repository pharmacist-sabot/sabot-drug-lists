import type { User } from '@supabase/supabase-js';

import { defineStore } from 'pinia';
import { ref } from 'vue';

import { supabase } from '@/supabaseClient';

// ต้องมี export const ตรงนี้
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const isAdmin = ref<boolean>(false);
  const loading = ref<boolean>(true);

  async function checkAdminRole(userId: string) {
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
      isAdmin.value = data?.role === 'admin';
    }
    catch (error) {
      console.error('Error fetching admin role:', error);
      isAdmin.value = false;
    }
  }

  async function initializeAuth() {
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

  async function login(email: string, password: string): Promise<any> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw error;
    return data;
  }

  async function logout() {
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
