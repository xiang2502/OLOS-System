// src/store/items.js
// Manages all lost/found item records from Firestore.
// Provides create, read, search, filter, and status-update operations.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, getDoc, doc,
  query, where, orderBy, updateDoc, deleteDoc,
  serverTimestamp, limit, startAfter
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/firebase'

export const useItemsStore = defineStore('items', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)
  const lastDoc = ref(null)           // Used for Firestore pagination

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Upload up to 5 photos to Firebase Storage.
   * Returns an array of public download URLs.
   */
  async function uploadPhotos(files, itemId) {
    const urls = []
    for (const file of files.slice(0, 5)) {
      const path = `items/${itemId}/${Date.now()}_${file.name}`
      const ref = storageRef(storage, path)
      await uploadBytes(ref, file)
      const url = await getDownloadURL(ref)
      urls.push(url)
    }
    return urls
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Create a new lost/found item report.
   * @param {Object} data  - Form fields from ReportForm component
   * @param {File[]} files - Photo files selected by the user (max 5)
   * @param {string} userId
   */
  async function createItem(data, files, userId) {
    loading.value = true
    try {
      // 1. Create the Firestore document first to get the auto-generated ID
      const docRef = await addDoc(collection(db, 'items'), {
        ...data,
        reportedBy: userId,
        status: 'active',         // active | claimed | resolved
        photoUrls: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // 2. Upload photos using the document ID as folder name
      if (files && files.length > 0) {
        const urls = await uploadPhotos(files, docRef.id)
        await updateDoc(docRef, { photoUrls: urls })
      }

      return docRef.id
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch items from Firestore with optional filters.
   * Supports: type (lost|found), category, keyword search, pagination.
   */
  async function fetchItems({ type = null, category = null, keyword = '', pageSize = 12, nextPage = false } = {}) {
    loading.value = true
    try {
      let q = collection(db, 'items')
      const conditions = [orderBy('createdAt', 'desc')]

      if (type) conditions.unshift(where('type', '==', type))
      if (category) conditions.unshift(where('category', '==', category))

      q = query(q, ...conditions, limit(pageSize))

      // Pagination: start after the last document from the previous page
      if (nextPage && lastDoc.value) {
        q = query(q, ...conditions, startAfter(lastDoc.value), limit(pageSize))
      }

      const snap = await getDocs(q)
      lastDoc.value = snap.docs[snap.docs.length - 1] || null

      let results = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Client-side keyword filter (Firestore free tier lacks full-text search)
      if (keyword.trim()) {
        const kw = keyword.toLowerCase()
        results = results.filter(item =>
          item.title?.toLowerCase().includes(kw) ||
          item.description?.toLowerCase().includes(kw) ||
          item.category?.toLowerCase().includes(kw)
        )
      }

      if (nextPage) {
        items.value.push(...results)
      } else {
        items.value = results
      }

      return results
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single item by its Firestore document ID.
   */
  async function fetchItem(id) {
    loading.value = true
    try {
      const snap = await getDoc(doc(db, 'items', id))
      if (!snap.exists()) throw new Error('Item not found')
      currentItem.value = { id: snap.id, ...snap.data() }
      return currentItem.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an item's status (admin action).
   * @param {string} id     - Item document ID
   * @param {string} status - 'active' | 'claimed' | 'resolved'
   */
  async function updateItemStatus(id, status) {
    await updateDoc(doc(db, 'items', id), {
      status,
      updatedAt: serverTimestamp()
    })
    // Reflect change locally
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx].status = status
    if (currentItem.value?.id === id) currentItem.value.status = status
  }

  /**
   * Delete an item document (admin only).
   */
  async function deleteItem(id) {
    await deleteDoc(doc(db, 'items', id))
    items.value = items.value.filter(i => i.id !== id)
  }

  return {
    items, currentItem, loading,
    createItem, fetchItems, fetchItem, updateItemStatus, deleteItem
  }
})
