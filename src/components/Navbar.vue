<!-- src/components/Navbar.vue -->
<template>
  <header class="navbar" :class="{ 'mobile-menu-active': mobileMenuOpen }">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-brand">
        <div class="logo-wrapper">
          <span class="logo-icon">💊</span>
        </div>
        <div class="logo-content">
          <span class="logo-text">DrugList</span>
          <span class="logo-subtitle">โรงพยาบาลสระโบสถ์</span>
        </div>
      </div>

      <!-- Desktop Navigation -->
      <nav class="navbar-nav desktop-nav">
        <router-link to="/" class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span>บัญชียา</span>
        </router-link>
        <router-link to="/decommissioned" class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="9"></line>
            <line x1="15" y1="15" x2="9" y2="9"></line>
          </svg>
          <span>ยาที่นำออกจากบัญชี</span>
        </router-link>
      </nav>

      <!-- User Section -->
      <div class="navbar-actions">
        <div v-if="user" class="user-menu">
          <div class="user-avatar-wrapper">
            <img 
              :src="user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email) + '&background=3b82f6&color=fff'" 
              alt="User Avatar" 
              class="user-avatar"
            />
          </div>
          <div class="user-info">
            <span class="user-name">{{ user.user_metadata?.full_name || user.email }}</span>
            <button class="logout-link" @click="$emit('logout')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              ออกจากระบบ
            </button>
          </div>
        </div>
        <button v-else class="btn btn-primary" @click="$emit('login')">
          เข้าสู่ระบบ
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" @click="$emit('toggle-mobile-menu')" aria-label="Toggle menu">
          <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <nav class="navbar-nav mobile-nav" :class="{ 'mobile-nav-open': mobileMenuOpen }">
      <router-link to="/" class="nav-link" @click="$emit('toggle-mobile-menu')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        <span>บัญชียา</span>
      </router-link>
      <router-link to="/decommissioned" class="nav-link" @click="$emit('toggle-mobile-menu')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="9"></line>
          <line x1="15" y1="15" x2="9" y2="9"></line>
        </svg>
        <span>ยาที่นำออกจากบัญชี</span>
      </router-link>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({ 
  user: Object, 
  mobileMenuOpen: Boolean,
  isAdmin: Boolean
})
defineEmits(['login', 'logout', 'toggle-mobile-menu'])
</script>

<style scoped>
.navbar {
  background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
  border-bottom: 2px solid var(--c-border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  backdrop-filter: blur(8px);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* Logo */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.logo-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  position: relative;
}

.logo-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.logo-icon {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.logo-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.logo-text {
  font-family: 'Inter', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.03em;
  line-height: 1;
}

.logo-subtitle {
  font-size: 0.8rem;
  color: var(--c-text-secondary);
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  color: var(--c-text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: var(--transition);
  white-space: nowrap;
  position: relative;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--c-primary), transparent);
  border-radius: 2px;
  transition: transform 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(59, 130, 246, 0.08);
  color: var(--c-primary);
  transform: translateY(-1px);
}

.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%);
  color: var(--c-primary);
  font-weight: 700;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.nav-link.router-link-exact-active::before {
  transform: translateX(-50%) scaleX(1);
}

.nav-link svg {
  flex-shrink: 0;
}

/* User Section */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.04);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.user-avatar-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid var(--c-primary);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--c-text-primary);
  line-height: 1.2;
}

.logout-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  color: var(--c-text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0;
  transition: var(--transition);
  font-weight: 500;
}

.logout-link:hover {
  color: var(--c-danger);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--c-primary);
  cursor: pointer;
  padding: 0.625rem;
  border-radius: var(--radius-md);
  transition: var(--transition);
}

.mobile-menu-toggle:hover {
  background: rgba(59, 130, 246, 0.15);
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    height: 64px;
  }

  .navbar-container {
    padding: 0 1rem;
  }

  .logo-wrapper {
    width: 40px;
    height: 40px;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    font-size: 1.375rem;
  }

  .logo-subtitle {
    font-size: 0.7rem;
  }

  .desktop-nav {
    display: none;
  }

  .user-info {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);
    border-top: 1px solid var(--c-border);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .mobile-nav-open {
    max-height: 300px;
    padding: 0.75rem;
    border-top: 2px solid var(--c-primary);
  }

  .mobile-nav .nav-link {
    width: 100%;
    justify-content: flex-start;
    padding: 1rem 1.25rem;
    font-size: 1.0625rem;
  }
}
</style>