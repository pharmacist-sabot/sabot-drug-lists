<!-- src/components/Navbar.vue -->
<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">💊 DrugList</div>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        <span>บัญชียา</span>
      </a>
      <!-- Add more nav items here in the future -->
    </nav>
    <div class="sidebar-footer">
      <div v-if="user" class="user-profile">
        <img :src="user.user_metadata?.avatar_url || 'https://via.placeholder.com/40'" alt="User Avatar" class="avatar"/>
        <div class="user-info">
          <span class="user-name">{{ user.user_metadata?.full_name || user.email }}</span>
          <button class="logout-btn" @click="$emit('logout')">ออกจากระบบ</button>
        </div>
      </div>
      <button v-else class="btn btn-primary login-btn" @click="$emit('login')">เข้าสู่ระบบ</button>
    </div>
  </aside>
</template>

<script setup>
defineProps({ user: Object })
defineEmits(['login', 'logout'])
</script>

<style scoped>
.sidebar {
  width: 260px;
  background-color: var(--c-surface);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--c-border);
}
.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-primary);
}
.sidebar-nav {
  padding: 1rem;
  flex-grow: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  color: var(--c-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-item:hover {
  background-color: var(--c-primary-light);
  color: var(--c-text-primary);
}
.nav-item.active {
  background-color: var(--c-primary-light);
  color: var(--c-primary);
  font-weight: 700;
}
.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--c-border);
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.user-info {
  line-height: 1.2;
}
.user-name {
  font-weight: 700;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
.logout-btn {
  background: none;
  border: none;
  color: var(--c-text-secondary);
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
}
.logout-btn:hover {
  color: var(--c-primary);
  text-decoration: underline;
}
.login-btn {
  width: 100%;
}

@media (max-width: 768px) {
    .sidebar {
        display: none; /* Hide sidebar on mobile */
    }
}
</style>