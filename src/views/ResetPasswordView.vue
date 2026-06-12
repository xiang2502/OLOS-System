<!-- src/views/ResetPasswordView.vue -->
<!-- Sends a Firebase password-reset email to the user's inbox. -->
<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <div class="auth-logo">🔑</div>
        <h1>Reset Password</h1>
        <p>Enter your email to receive reset instructions.</p>
      </div>

      <form @submit.prevent="handleReset">
        <div class="form-group">
          <label>Email Address</label>
          <input v-model="email" type="email" placeholder="your@email.com" required />
        </div>

        <p v-if="error"   class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>

        <button type="submit" class="btn btn-primary full-btn" :disabled="loading || !!success">
          {{ loading ? 'Sending…' : 'Send Reset Link' }}
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/login">← Back to Sign In</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'

const auth    = useAuthStore()
const email   = ref('')
const loading = ref(false)
const error   = ref('')
const success = ref('')

async function handleReset() {
  error.value   = ''
  success.value = ''
  loading.value = true
  try {
    await auth.resetPassword(email.value)
    success.value = 'Reset link sent! Check your inbox (and spam folder).'
  } catch (e) {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/invalid-email':  'Please enter a valid email address.'
    }
    error.value = map[e.code] || 'Failed to send reset email.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
}
.auth-card { width: 100%; max-width: 400px; padding: 40px; }
.auth-header { text-align: center; margin-bottom: 28px; }
.auth-logo { font-size: 40px; margin-bottom: 10px; }
.auth-header h1 { font-size: 22px; font-weight: 700; }
.auth-header p  { color: #6b7280; font-size: 14px; margin-top: 4px; }
.full-btn { width: 100%; justify-content: center; padding: 12px; }
.auth-footer { text-align: center; margin-top: 20px; font-size: 13px; }
.auth-footer a { color: #2563eb; text-decoration: none; }
</style>
