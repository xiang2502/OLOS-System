<!-- src/components/NavBar.vue -->
<!-- Responsive navigation bar with role-aware links. -->
<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="nav-logo">
        🔍 OLOS
      </router-link>

      <!-- Desktop links -->
      <div class="nav-links" :class="{ open: menuOpen }">
        <template v-if="auth.isAuthenticated">
          <router-link to="/" @click="menuOpen = false">Home</router-link>
          <router-link to="/search" @click="menuOpen = false">Browse Items</router-link>
          <router-link to="/report" @click="menuOpen = false">Report Item</router-link>
          <router-link to="/my-claims" @click="menuOpen = false">My Claims</router-link>

          <!-- Admin-only links -->
          <template v-if="auth.isAdmin">
            <router-link to="/admin" @click="menuOpen = false">Dashboard</router-link>
            <router-link to="/admin/users" @click="menuOpen = false">Users</router-link>
            <router-link to="/admin/claims" @click="menuOpen = false">Claims</router-link>
          </template>

          <button class="btn btn-secondary nav-logout" @click="handleLogout">
            Sign Out
          </button>
        </template>
        <template v-else>
          <router-link to="/login" @click="menuOpen = false">Sign In</router-link>
          <router-link to="/register" @click="menuOpen = false" class="btn btn-primary">
            Register
          </router-link>
        </template>
      </div>

      <!-- User badge -->
      <div v-if="auth.isAuthenticated" class="nav-user">
        <span class="user-badge">{{ auth.displayName.charAt(0).toUpperCase() }}</span>
      </div>

      <!-- Hamburger -->
      <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 1000;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 24px;
}
.nav-logo {
  font-size: 20px;
  font-weight: 800;
  color: #2563eb;
  text-decoration: none;
  letter-spacing: -0.5px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.nav-links a {
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}
.nav-links a:hover,
.nav-links a.router-link-active { background: #eff6ff; color: #2563eb; }
.nav-logout { padding: 6px 14px; font-size: 13px; }
.user-badge {
  width: 34px; height: 34px;
  background: #2563eb; color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
.hamburger { display: none; background: none; border: none; font-size: 22px; cursor: pointer; margin-left: auto; }

@media (max-width: 768px) {
  .hamburger { display: block; }
  .nav-user { display: none; }
  .nav-links {
    display: none;
    position: absolute;
    top: 64px; left: 0; right: 0;
    background: white;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 20px;
    border-bottom: 1px solid #e5e7eb;
    gap: 4px;
  }
  .nav-links.open { display: flex; }
  .nav-links a { width: 100%; }
}
</style>
