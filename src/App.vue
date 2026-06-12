<!-- src/App.vue -->
<!-- Root component: renders the navigation bar and the current route view. -->
<template>
  <div id="app">
    <!-- Show nav only after auth is resolved (prevents flickering) -->
    <NavBar v-if="!auth.loading" />

    <main class="main-content">
      <!-- Loading spinner while Firebase resolves the auth state -->
      <div v-if="auth.loading" class="loading-screen">
        <div class="spinner"></div>
        <p>Loading OLOS…</p>
      </div>
      <router-view v-else />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import NavBar from '@/components/NavBar.vue'

const auth = useAuthStore()
</script>

<style>
/* ── Global resets and base styles ──────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f5f7fa;
  color: #1a1a2e;
  min-height: 100vh;
}

.main-content {
  padding-top: 64px;   /* offset for fixed navbar */
  min-height: calc(100vh - 64px);
}

/* Loading screen */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  gap: 16px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Utility classes (used across multiple components) ───────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-primary   { background: #2563eb; color: white; }
.btn-primary:hover   { background: #1d4ed8; }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-secondary:hover { background: #e5e7eb; }
.btn-danger    { background: #ef4444; color: white; }
.btn-danger:hover    { background: #dc2626; }
.btn-success   { background: #22c55e; color: white; }
.btn-success:hover   { background: #16a34a; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}
.badge-active   { background: #dcfce7; color: #166534; }
.badge-claimed  { background: #dbeafe; color: #1e40af; }
.badge-resolved { background: #f3f4f6; color: #6b7280; }
.badge-pending  { background: #fef9c3; color: #854d0e; }
.badge-approved { background: #dcfce7; color: #166534; }
.badge-rejected { background: #fee2e2; color: #991b1b; }
.badge-lost     { background: #fee2e2; color: #991b1b; }
.badge-found    { background: #dcfce7; color: #166534; }

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
}

.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
}
.form-group textarea { resize: vertical; min-height: 90px; }

.error-msg { color: #ef4444; font-size: 13px; margin-top: 6px; }
.success-msg { color: #22c55e; font-size: 13px; margin-top: 6px; }

.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.page-header { padding: 32px 0 20px; }
.page-header h1 { font-size: 26px; font-weight: 700; }
.page-header p  { color: #6b7280; margin-top: 4px; }
</style>
