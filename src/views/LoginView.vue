<!-- src/views/LoginView.vue -->
<!-- Login screen: email + password, link to register and reset password. -->
<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <div class="auth-logo">🔍</div>
        <h1>Sign in to OLOS</h1>
        <p>TAR UMT Lost &amp; Found System</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Email Address</label>
          <input v-model="email" type="email" placeholder="your@email.com" required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter your password" required />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn btn-primary full-btn" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/reset-password">Forgot password?</router-link>
        <span>·</span>
        <router-link to="/register">Create account</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    // Redirect to the originally requested page (or home)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (e) {
    error.value = mapAuthError(e.code)
  } finally {
    loading.value = false
  }
}

// Translate Firebase error codes into human-friendly messages
function mapAuthError(code) {
  const map = {
    'auth/user-not-found':  'No account found with this email.',
    'auth/wrong-password':  'Incorrect password.',
    'auth/invalid-email':   'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
  }
  return map[code] || 'Login failed. Please check your credentials.'
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
}
.auth-header { text-align: center; margin-bottom: 28px; }
.auth-logo { font-size: 48px; margin-bottom: 12px; }
.auth-header h1 { font-size: 22px; font-weight: 700; }
.auth-header p  { color: #6b7280; font-size: 14px; margin-top: 4px; }
.full-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }
.auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 13px;
  color: #6b7280;
}
.auth-footer a { color: #2563eb; text-decoration: none; font-weight: 500; }
</style>
