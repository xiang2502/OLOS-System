// src/store/auth.js
// Pinia store that manages authentication state across the entire application.
// Tracks the currently signed-in user and their role (user | admin).

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const user = ref(null)          // Firebase Auth user object
  const userData = ref(null)      // Firestore user document (name, role, etc.)
  const loading = ref(true)       // True while the auth state is being resolved

  // ── Computed ───────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userData.value?.role === 'admin')
  const displayName = computed(() => userData.value?.name || user.value?.displayName || 'User')

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Register a new user.
   * Creates a Firebase Auth account and a matching Firestore document under /users/{uid}.
   */
  async function register({ name, email, password, contactNumber }) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })

    // Store extra user data in Firestore
    await setDoc(doc(db, 'users', credential.user.uid), {
      name,
      email,
      contactNumber,
      role: 'user',         // Default role; change to 'admin' manually in Firestore Console
      createdAt: serverTimestamp()
    })

    await fetchUserData(credential.user.uid)
  }

  /**
   * Sign in an existing user with email and password.
   */
  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    await fetchUserData(credential.user.uid)
  }

  /**
   * Sign out the current user.
   */
  async function logout() {
    await signOut(auth)
    user.value = null
    userData.value = null
  }

  /**
   * Send a password-reset email.
   */
  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  /**
   * Load user profile document from Firestore.
   */
  async function fetchUserData(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      userData.value = { id: snap.id, ...snap.data() }
    }
  }

  /**
   * Bootstrap: listen to Firebase Auth state changes.
   * Called once in main.js so the store stays in sync for the full session.
   */
  function init() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid)
      } else {
        userData.value = null
      }
      loading.value = false
    })
  }

  return {
    user, userData, loading,
    isAuthenticated, isAdmin, displayName,
    register, login, logout, resetPassword, init
  }
})
