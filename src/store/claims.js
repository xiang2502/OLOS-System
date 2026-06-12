// src/store/claims.js
// Manages claim requests submitted by users for lost/found items.
// Admins review, approve, or reject claims from this store.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, getDoc, doc,
  query, where, orderBy, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

export const useClaimsStore = defineStore('claims', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const claims = ref([])
  const loading = ref(false)

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Submit a claim request for an item.
   * @param {Object} data   - { itemId, ownershipProof, contactInfo }
   * @param {string} userId - UID of the claimant
   */
  async function submitClaim(data, userId) {
    loading.value = true
    try {
      const docRef = await addDoc(collection(db, 'claims'), {
        ...data,
        claimedBy: userId,
        status: 'pending',      // pending | approved | rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all claims submitted by a specific user.
   */
  async function fetchUserClaims(userId) {
    loading.value = true
    try {
      const q = query(
        collection(db, 'claims'),
        where('claimedBy', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      claims.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return claims.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all pending claims (admin view).
   */
  async function fetchAllClaims() {
    loading.value = true
    try {
      const q = query(collection(db, 'claims'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      claims.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return claims.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Approve or reject a claim (admin action).
   * Also updates the parent item's status when a claim is approved.
   * @param {string} claimId - Claim document ID
   * @param {string} status  - 'approved' | 'rejected'
   */
  async function updateClaimStatus(claimId, status) {
    const claimRef = doc(db, 'claims', claimId)
    await updateDoc(claimRef, {
      status,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // If approved, mark the related item as 'claimed'
    if (status === 'approved') {
      const snap = await getDoc(claimRef)
      if (snap.exists()) {
        const { itemId } = snap.data()
        await updateDoc(doc(db, 'items', itemId), {
          status: 'claimed',
          updatedAt: serverTimestamp()
        })
      }
    }

    // Update local state
    const idx = claims.value.findIndex(c => c.id === claimId)
    if (idx !== -1) claims.value[idx].status = status
  }

  return {
    claims, loading,
    submitClaim, fetchUserClaims, fetchAllClaims, updateClaimStatus
  }
})
