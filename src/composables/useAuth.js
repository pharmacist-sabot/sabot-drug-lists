// src/composables/useAuth.js
import { ref } from "vue";
import { supabase } from "../supabaseClient";

// State is defined outside the function to act as a Singleton (shared state)
const user = ref(null);
const isAdmin = ref(false);
const loading = ref(true);

export function useAuth() {
  /**
   * Checks the user's role against the database profile
   * @param {string} userId
   */
  async function checkAdminRole(userId) {
    if (!userId) {
      isAdmin.value = false;
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles_drugcupsabot")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      isAdmin.value = data?.role === "admin";
    } catch (error) {
      console.error("Error fetching admin role:", error);
      isAdmin.value = false;
    }
  }

  /**
   * Initializes auth state listener
   */
  async function initializeAuth() {
    loading.value = true;
    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      user.value = session.user;
      await checkAdminRole(session.user.id);
    }

    // Listen for changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        user.value = session.user;
        // Only re-check role if user changed or we don't have it yet
        if (!isAdmin.value) await checkAdminRole(session.user.id);
      } else {
        user.value = null;
        isAdmin.value = false;
      }
      loading.value = false;
    });
  }

  /**
   * Handle user login
   */
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Role check happens in onAuthStateChange, but we wait a bit to ensure UI updates
    return data;
  }

  /**
   * Handle user logout
   */
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.value = null;
    isAdmin.value = false;
  }

  return {
    user,
    isAdmin,
    loading,
    initializeAuth,
    login,
    logout,
  };
}
