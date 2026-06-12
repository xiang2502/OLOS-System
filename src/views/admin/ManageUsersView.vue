<!-- src/views/admin/ManageUsersView.vue -->
<!-- Admin view to list all registered users, reset passwords, and delete accounts. -->
<template>
  <div class="container">
    <div class="page-header">
      <h1>Manage Users</h1>
      <p>View and manage all registered OLOS accounts.</p>
    </div>

    <div v-if="loading" class="loading-screen" style="height:200px">
      <div class="spinner"></div>
    </div>

    <div v-else class="card table-card">
      <table class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td><strong>{{ u.name }}</strong></td>
            <td>{{ u.email }}</td>
            <td>{{ u.contactNumber || '—' }}</td>
            <td>
              <span :class="`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-active'}`">
                {{ u.role }}
              </span>
            </td>
            <td>{{ formatDate(u.createdAt) }}</td>
            <td class="actions">
              <button
                class="btn btn-secondary action-btn"
                @click="handleResetPassword(u)"
                :disabled="resetLoading === u.id"
                title="Send password reset email"
              >
                🔑 Reset PW
              </button>
              <button
                class="btn btn-danger action-btn"
                @click="confirmDelete(u)"
                title="Delete this account from Firestore"
              >
                🗑 Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal card">
        <h2>Delete Account?</h2>
        <p>
          Are you sure you want to remove <strong>{{ deleteTarget.name }}</strong>?
          This will delete their Firestore profile but not their Firebase Auth account
          (use the Firebase Console to remove auth records).
        </p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="handleDelete" :disabled="deleteLoading">
            {{ deleteLoading ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDocs, collection, deleteDoc, doc, orderBy, query } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'

const loading      = ref(true)
const users        = ref([])
const deleteTarget = ref(null)
const deleteLoading = ref(false)
const resetLoading  = ref(null)
const toast        = ref('')

function showToast(msg) {
  toast.value = msg
  setTimeout(() => toast.value = '', 3000)
}

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { dateStyle: 'medium' })
}

async function handleResetPassword(user) {
  resetLoading.value = user.id
  try {
    await sendPasswordResetEmail(auth, user.email)
    showToast(`Password reset email sent to ${user.email}`)
  } catch {
    showToast('Failed to send reset email.')
  } finally {
    resetLoading.value = null
  }
}

function confirmDelete(user) {
  deleteTarget.value = user
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await deleteDoc(doc(db, 'users', deleteTarget.value.id))
    users.value = users.value.filter(u => u.id !== deleteTarget.value.id)
    showToast('User profile deleted.')
    deleteTarget.value = null
  } catch {
    showToast('Failed to delete user.')
  } finally {
    deleteLoading.value = false
  }
}

onMounted(async () => {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
  users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  loading.value = false
})
</script>

<style scoped>
.table-card { overflow-x: auto; padding-bottom: 20px; }
.user-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.user-table th {
  text-align: left; padding: 12px 16px;
  background: #f9fafb; font-weight: 600; color: #374151;
  border-bottom: 1px solid #e5e7eb;
}
.user-table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
.user-table tr:last-child td { border-bottom: none; }
.actions { display: flex; gap: 8px; }
.action-btn { padding: 6px 10px; font-size: 12px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal { padding: 32px; max-width: 440px; width: 90%; }
.modal h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
.modal p  { color: #4b5563; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* Toast */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1a1a2e; color: white;
  padding: 12px 24px; border-radius: 8px;
  font-size: 14px; z-index: 3000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
</style>
