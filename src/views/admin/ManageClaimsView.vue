<!-- src/views/admin/ManageClaimsView.vue -->
<!-- Admin view: review all claim requests, approve or reject each one. -->
<template>
  <div class="container">
    <div class="page-header">
      <h1>Manage Claim Requests</h1>
      <p>Review ownership proofs and approve or reject claims.</p>
    </div>

    <!-- Filter tabs -->
    <div class="tab-bar" style="margin-bottom:20px">
      <button
        v-for="t in tabs"
        :key="t"
        :class="['tab-btn', { active: filterStatus === t }]"
        @click="filterStatus = t"
      >{{ t.charAt(0).toUpperCase() + t.slice(1) }}</button>
    </div>

    <div v-if="store.loading" class="loading-screen" style="height:200px">
      <div class="spinner"></div>
    </div>

    <div v-else-if="filteredClaims.length === 0" class="empty-state card" style="padding:40px; text-align:center">
      <p>No {{ filterStatus === 'all' ? '' : filterStatus }} claims found.</p>
    </div>

    <div v-else class="claims-list">
      <div v-for="claim in filteredClaims" :key="claim.id" class="claim-card card">
        <!-- Header -->
        <div class="claim-header">
          <div>
            <h3>{{ claim.itemTitle || claim.itemId }}</h3>
            <p class="claim-meta">
              Claim ID: {{ claim.id.slice(0, 8) }}… ·
              Submitted: {{ formatDate(claim.createdAt) }}
            </p>
          </div>
          <span :class="`badge badge-${claim.status}`">{{ claim.status }}</span>
        </div>

        <!-- Details -->
        <div class="claim-body">
          <div class="claim-field">
            <label>Ownership Proof</label>
            <p>{{ claim.ownershipProof }}</p>
          </div>
          <div class="claim-field">
            <label>Contact Info</label>
            <p>{{ claim.contactInfo || '—' }}</p>
          </div>
        </div>

        <!-- Actions (only for pending) -->
        <div v-if="claim.status === 'pending'" class="claim-actions">
          <router-link :to="`/items/${claim.itemId}`" class="btn btn-secondary">
            View Item
          </router-link>
          <button
            class="btn btn-success"
            @click="handleUpdate(claim.id, 'approved')"
            :disabled="actionLoading === claim.id"
          >
            ✅ Approve
          </button>
          <button
            class="btn btn-danger"
            @click="handleUpdate(claim.id, 'rejected')"
            :disabled="actionLoading === claim.id"
          >
            ❌ Reject
          </button>
        </div>
        <div v-else class="claim-reviewed">
          Reviewed on {{ formatDate(claim.reviewedAt) }}
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useClaimsStore } from '@/store/claims'

const store        = useClaimsStore()
const filterStatus = ref('all')
const actionLoading = ref(null)
const toast        = ref('')

const tabs = ['all', 'pending', 'approved', 'rejected']

const filteredClaims = computed(() =>
  filterStatus.value === 'all'
    ? store.claims
    : store.claims.filter(c => c.status === filterStatus.value)
)

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { dateStyle: 'medium' })
}

async function handleUpdate(claimId, status) {
  actionLoading.value = claimId
  try {
    await store.updateClaimStatus(claimId, status)
    toast.value = `Claim ${status} successfully.`
    setTimeout(() => toast.value = '', 3000)
  } catch {
    toast.value = 'Action failed. Please try again.'
    setTimeout(() => toast.value = '', 3000)
  } finally {
    actionLoading.value = null
  }
}

onMounted(() => store.fetchAllClaims())
</script>

<style scoped>
.claims-list { display: flex; flex-direction: column; gap: 16px; padding-bottom: 40px; }
.claim-card { padding: 22px 24px; }

.claim-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;
}
.claim-header h3 { font-size: 16px; font-weight: 700; }
.claim-meta     { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.claim-body { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.claim-field label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
.claim-field p     { font-size: 13px; color: #374151; }

.claim-actions { display: flex; gap: 10px; padding-top: 12px; border-top: 1px solid #f3f4f6; }
.claim-reviewed { font-size: 12px; color: #9ca3af; padding-top: 12px; border-top: 1px solid #f3f4f6; }

.tab-bar { display: flex; gap: 8px; }
.tab-btn {
  padding: 7px 16px; border-radius: 20px;
  border: 1.5px solid #d1d5db; background: white;
  cursor: pointer; font-size: 13px; font-weight: 600; color: #374151;
}
.tab-btn.active { background: #2563eb; color: white; border-color: #2563eb; }

.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1a1a2e; color: white;
  padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 3000;
}

@media (max-width: 600px) {
  .claim-body { grid-template-columns: 1fr; }
}
</style>
