<!-- src/views/RegisterView.vue -->
<!-- Create account screen: name, email, contact number, password. -->
<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-header">
        <div class="auth-logo">📝</div>
        <h1>Create Account</h1>
        <p>Join OLOS – TAR UMT Lost &amp; Found</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="form.name" type="text" placeholder="Your full name" required />
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input v-model="form.email" type="email" placeholder="your@email.com" required />
        </div>

        <div class="form-group">
          <label>Contact Number</label>
          <input v-model="form.contactNumber" type="tel" placeholder="01X-XXXXXXX" required />
        </div>

        <div class="form-group">
          <label>Password <span style="color:#9ca3af;font-weight:400">(min. 6 characters)</span></label>
          <input v-model="form.password" type="password" placeholder="Create a password" required minlength="6" />
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input v-model="form.confirmPassword" type="password" placeholder="Repeat your password" required />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="success" class="success-msg">{{ success }}</p>

        <button type="submit" class="btn btn-primary full-btn" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <div class="auth-footer">
        Already have an account?
        <router-link to="/login">Sign in</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth    = useAuthStore()
const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const success = ref('')

const form = reactive({
  name: '', email: '', contactNumber: '', password: '', confirmPassword: ''
})

async function handleRegister() {
  error.value   = ''
  success.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await auth.register({
      name:          form.name,
      email:         form.email,
      password:      form.password,
      contactNumber: form.contactNumber
    })
    router.push('/')
  } catch (e) {
    const map = {
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email':        'Please enter a valid email address.',
      'auth/weak-password':        'Password must be at least 6 characters.'
    }
    error.value = map[e.code] || 'Registration failed. Please try again.'
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
.auth-card { width: 100%; max-width: 440px; padding: 40px; }
.auth-header { text-align: center; margin-bottom: 28px; }
.auth-logo { font-size: 40px; margin-bottom: 10px; }
.auth-header h1 { font-size: 22px; font-weight: 700; }
.auth-header p  { color: #6b7280; font-size: 14px; margin-top: 4px; }
.full-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }
.auth-footer {
  text-align: center; margin-top: 20px;
  font-size: 13px; color: #6b7280; display: flex; gap: 6px; justify-content: center;
}
.auth-footer a { color: #2563eb; text-decoration: none; font-weight: 500; }
</style>
