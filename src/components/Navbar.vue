<!-- src/components/Navbar.vue -->
<template>
    <header class="navbar">
        <div class="navbar-container">
            <!-- Logo -->
            <router-link to="/" class="navbar-brand">
                <div class="logo-wrapper">
                    <Pill class="logo-icon-svg" />
                </div>
                <div class="logo-content">
                    <span class="logo-text">DrugList</span>
                    <span class="logo-subtitle">โรงพยาบาลสระโบสถ์</span>
                </div>
            </router-link>

            <!-- Desktop Navigation -->
            <nav class="desktop-nav">
                <router-link to="/" class="nav-link">
                    <FileText :size="20" />
                    <span>บัญชียา</span>
                </router-link>
                <router-link to="/decommissioned" class="nav-link">
                    <ArchiveRestore :size="20" />
                    <span>ยาที่นำออกจากบัญชี</span>
                </router-link>
            </nav>

            <!-- Desktop Actions -->
            <div class="desktop-actions">
                <div v-if="user" class="user-menu-desktop">
                    <div class="user-info">
                        <span class="user-name">{{ user.user_metadata?.full_name || user.email }}</span>
                        <button class="btn btn-ghost btn-sm" @click="$emit('logout')">
                            ออกจากระบบ
                        </button>
                    </div>
                    <img :src="user.user_metadata?.avatar_url || getAvatarUrl(user.email)" alt="User"
                        class="user-avatar" />
                </div>
                <button v-else class="btn btn-primary" @click="$emit('login')">
                    เข้าสู่ระบบ
                </button>
            </div>

            <button class="vercel-toggle" @click="$emit('toggle-mobile-menu')" aria-label="Toggle menu">
                <div class="vercel-box" :class="{ 'is-active': mobileMenuOpen }">
                    <span class="line"></span>
                    <span class="line"></span>
                </div>
            </button>
        </div>

        <!-- Mobile Menu Overlay -->
        <transition name="fade">
            <div v-show="mobileMenuOpen" class="mobile-overlay">
                <nav class="mobile-nav-links">
                    <router-link to="/" class="mobile-link" @click="$emit('toggle-mobile-menu')">
                        <div class="mobile-icon">
                            <FileText :size="24" />
                        </div>
                        <div class="mobile-text">
                            <strong>บัญชียา</strong>
                            <small>รายการยาทั้งหมด</small>
                        </div>
                    </router-link>
                    <router-link to="/decommissioned" class="mobile-link" @click="$emit('toggle-mobile-menu')">
                        <div class="mobile-icon warning">
                            <ArchiveRestore :size="24" />
                        </div>
                        <div class="mobile-text">
                            <strong>ยาที่นำออกจากบัญชี</strong>
                            <small>ประวัติยาที่ยกเลิกใช้</small>
                        </div>
                    </router-link>
                </nav>

                <div class="mobile-bottom">
                    <div v-if="user" class="mobile-user-card">
                        <div class="mobile-user-info">
                            <img :src="user.user_metadata?.avatar_url || getAvatarUrl(user.email)"
                                class="user-avatar-lg" />
                            <div>
                                <div class="font-bold">{{ user.user_metadata?.full_name || user.email }}</div>
                                <small class="text-muted">ผู้ใช้งานระบบ</small>
                            </div>
                        </div>
                        <button class="btn btn-danger w-full" @click="$emit('logout')">
                            <LogOut :size="16" style="margin-right: 8px;" />
                            ออกจากระบบ
                        </button>
                    </div>
                    <div v-else class="p-4">
                        <p class="text-center text-muted mb-3">กรุณาเข้าสู่ระบบเพื่อจัดการข้อมูล</p>
                        <button class="btn btn-primary w-full" @click="$emit('login'); $emit('toggle-mobile-menu')">
                            <LogIn :size="16" style="margin-right: 8px;" />
                            เข้าสู่ระบบ
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </header>
</template>

<script setup>
import { watch, onUnmounted } from 'vue'
import { Pill, FileText, ArchiveRestore, LogOut, LogIn } from 'lucide-vue-next'

const props = defineProps({
    user: Object,
    mobileMenuOpen: Boolean,
    isAdmin: Boolean
})

defineEmits(['login', 'logout', 'toggle-mobile-menu'])

const getAvatarUrl = (email) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=3b82f6&color=fff&bold=true`
}

watch(() => props.mobileMenuOpen, (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
})

onUnmounted(() => {
    document.body.style.overflow = ''
})
</script>

<style scoped>
.navbar {
    height: var(--nav-height);
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--c-border);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    z-index: 1001;
}

.logo-wrapper {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-sm);
}

.logo-icon-svg {
    color: white;
    width: 20px;
    height: 20px;
}

.logo-content {
    display: flex;
    flex-direction: column;
}

.logo-text {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-dark) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.3;
    padding-bottom: 2px;
    margin-bottom: -4px;
}

.logo-subtitle {
    font-size: 0.75rem;
    color: var(--c-text-secondary);
    font-weight: 500;
}

/* Desktop Nav */
.desktop-nav,
.desktop-actions {
    display: none;
}

@media (min-width: 769px) {
    .desktop-nav {
        display: flex;
        gap: 0.5rem;
    }

    .desktop-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    color: var(--c-text-secondary);
    text-decoration: none;
    font-weight: 600;
    font-size: var(--fs-small);
    transition: var(--transition);
}

.nav-link:hover {
    background-color: var(--c-background);
    color: var(--c-primary);
}

.nav-link.router-link-active {
    background-color: var(--c-primary-light);
    color: var(--c-primary-dark);
}

.user-menu-desktop {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-info {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.user-name {
    font-size: var(--fs-small);
    font-weight: 600;
    color: var(--c-text-primary);
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid var(--c-background);
    box-shadow: var(--shadow-sm);
}

.vercel-toggle {
    appearance: none;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    padding: 0;
    margin: 0;
    outline: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.vercel-toggle:hover {
    border-color: var(--c-text-muted);
}

.vercel-box {
    width: 16px;
    height: 12px;
    position: relative;
    display: block;
}

.line {
    position: absolute;
    width: 100%;
    height: 1.5px;
    background-color: var(--c-text-primary);
    border-radius: 4px;
    left: 0;
    transition: transform 0.25s cubic-bezier(0.5, 0.1, 0.1, 1),
        top 0.25s cubic-bezier(0.5, 0.1, 0.1, 1),
        opacity 0.2s ease;
}

.vercel-box .line:nth-child(1) {
    top: 0;
}

.vercel-box .line:nth-child(2) {
    top: 100%;
    transform: translateY(-100%);
}

.vercel-box.is-active .line:nth-child(1) {
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
}

.vercel-box.is-active .line:nth-child(2) {
    top: 50%;
    transform: translateY(-50%) rotate(-45deg);
}

@media (min-width: 769px) {
    .vercel-toggle {
        display: none;
    }
}

.mobile-overlay {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    width: 100%;
    height: calc(100vh - var(--nav-height));
    background-color: var(--c-surface);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 1000;
    overflow-y: auto;
}

.mobile-nav-links {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.mobile-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: var(--radius-lg);
    background-color: var(--c-background);
    text-decoration: none;
    color: var(--c-text-primary);
    border: 1px solid var(--c-border);
    transition: var(--transition);
}

.mobile-link.router-link-active {
    border-color: var(--c-primary);
    background-color: var(--c-primary-light);
    color: var(--c-primary-dark);
}

.mobile-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--c-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    color: var(--c-primary);
}

.mobile-icon.warning {
    color: var(--c-warning);
}

.mobile-text {
    display: flex;
    flex-direction: column;
}

.mobile-bottom {
    padding: 1.5rem;
    background-color: var(--c-background);
    border-top: 1px solid var(--c-border);
}

.mobile-user-card {
    background: var(--c-surface);
    padding: 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--c-border);
    box-shadow: var(--shadow-sm);
}

.mobile-user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.user-avatar-lg {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.w-full {
    width: 100%;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: var(--fs-xs);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
