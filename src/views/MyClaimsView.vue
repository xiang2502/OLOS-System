<!-- src/views/MyClaimsView.vue -->
<!-- Shows the current user's submitted claim requests and their statuses. -->
<template>
  <div class="container">
    <div class="page-header">
      <h1>My Claim Requests</h1>
      <p>Track the status of items you have claimed.</p>
    </div>

    <div v-if="store.loading" class="loading-screen" style="height:200px">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.claims.length === 0" class="empty-state card">
      <p>You haven't submitted any claims yet.</p>
      <router-link to="/search" class="btn btn-primary" style="margin-top:16px">
        Browse Items
      </router-link>
    </div>

    <div v-else class="claims-list">
      <div v-for="claim in store.claims" :key="claim.id" class="claim-row card">
        <div class="claim-info">
          <h3>{{ claim.itemTitle || claim.itemId }}</h3>
          <p class="claim-proof">{{ claim.ownershipProof }}</p>
          <p class="claim-date">Submitted: {{ formatDate(claim.createdAt) }}</p>
        </div>
        <div class="claim-status">
          <span :class="`badge badge-${claim.status}`">{{ claim.status }}</span>
          <router-link :to="`/items/${claim.itemId}`" class="btn btn-secondary" style="margin-top:10px; font-size:12px">
            View Item
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useClaimsStore } from '@/store/claims'
import { useAuthStore } from '@/store/auth'

const store = useClaimsStore()
const auth  = useAuthStore()

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { dateStyle: 'medium' })
}

onMounted(() => store.fetchUserClaims(auth.user.uid))
</script>

<style scoped>
.claims-list { display: flex; flex-direction: column; gap: 14px; padding-bottom: 40px; }
.claim-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  gap: 16px;
}
.claim-info h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.claim-proof   { font-size: 13px; color: #6b7280; max-width: 500px; margin-bottom: 6px; }
.claim-date    { font-size: 12px; color: #9ca3af; }
.claim-status  { display: flex; flex-direction: column; align-items: flex-end; min-width: 120px; }
.empty-state   { text-align: center; padding: 60px; }
</style>
