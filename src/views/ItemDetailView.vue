<!-- src/views/ItemDetailView.vue -->
<!-- Full item detail: photos, info, map marker, and claim form. -->
<template>
  <div class="container" style="padding-top:20px; padding-bottom:40px">
    <!-- Back link -->
    <router-link to="/search" class="back-link">← Back to Browse</router-link>

    <div v-if="store.loading" class="loading-screen" style="height:300px">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!item" class="empty-state">Item not found.</div>

    <div v-else class="detail-layout">
      <!-- ── Left: photos + info ────────────────────────────── -->
      <div class="detail-main card">
        <!-- Photo gallery -->
        <div class="photo-gallery">
          <img
            v-if="item.photoUrls?.length"
            :src="item.photoUrls[activePhoto]"
            class="main-photo"
            alt="Item photo"
          />
          <div v-else class="no-photo-lg">{{ categoryIcon }}</div>

          <div v-if="item.photoUrls?.length > 1" class="thumb-row">
            <img
              v-for="(url, i) in item.photoUrls"
              :key="i"
              :src="url"
              :class="['thumb', { active: i === activePhoto }]"
              @click="activePhoto = i"
              alt="Thumbnail"
            />
          </div>
        </div>

        <!-- Info -->
        <div class="detail-info">
          <div class="detail-tags">
            <span :class="`badge badge-${item.type}`">{{ item.type.toUpperCase() }}</span>
            <span :class="`badge badge-${item.status}`">{{ item.status }}</span>
          </div>

          <h1 class="detail-title">{{ item.title }}</h1>

          <table class="info-table">
            <tr><th>Category</th><td>{{ item.category }}</td></tr>
            <tr><th>Date / Time</th><td>{{ item.dateLost }}</td></tr>
            <tr><th>Location</th><td>{{ item.location || '—' }}</td></tr>
            <tr><th>Reported on</th><td>{{ formatDate(item.createdAt) }}</td></tr>
          </table>

          <h3 style="margin:18px 0 8px">Description</h3>
          <p class="detail-desc">{{ item.description }}</p>
        </div>
      </div>

      <!-- ── Right: claim form ──────────────────────────────── -->
      <div class="detail-side">
        <!-- Claim form (only for active items that the current user didn't report) -->
        <div class="card claim-card" v-if="item.status === 'active' && item.reportedBy !== auth.user?.uid">
          <h2>Claim This Item</h2>
          <p>Provide proof of ownership so the admin can verify your claim.</p>

          <div v-if="claimSuccess" class="success-msg" style="margin:12px 0">
            ✅ Claim request submitted! The admin will review it shortly.
          </div>

          <form v-else @submit.prevent="handleClaim">
            <div class="form-group" style="margin-top:12px">
              <label>Proof of Ownership</label>
              <textarea
                v-model="claimForm.ownershipProof"
                placeholder="Describe identifying features (serial number, sticker, contents, etc.)"
                required
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Contact Number</label>
              <input v-model="claimForm.contactInfo" type="tel" placeholder="01X-XXXXXXX" required />
            </div>

            <p v-if="claimError" class="error-msg">{{ claimError }}</p>

            <button type="submit" class="btn btn-primary full-btn" :disabled="claimLoading">
              {{ claimLoading ? 'Submitting…' : 'Submit Claim' }}
            </button>
          </form>
        </div>

        <!-- Status notice for non-active items -->
        <div class="card claim-card" v-else-if="item.status !== 'active'">
          <p style="color:#6b7280">This item is marked as <strong>{{ item.status }}</strong> and is no longer accepting claims.</p>
        </div>

        <!-- Own item notice -->
        <div class="card claim-card" v-else>
          <p style="color:#6b7280">This is your own report.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useItemsStore } from '@/store/items'
import { useClaimsStore } from '@/store/claims'
import { useAuthStore } from '@/store/auth'

const route  = useRoute()
const store  = useItemsStore()
const claims = useClaimsStore()
const auth   = useAuthStore()

const item        = computed(() => store.currentItem)
const activePhoto = ref(0)
const claimSuccess = ref(false)
const claimLoading = ref(false)
const claimError   = ref('')
const claimForm    = ref({ ownershipProof: '', contactInfo: '' })

const icons = {
  Electronics: '📱', 'Daily Necessities': '🎒', Stationery: '✏️',
  'Student Card / ID': '🪪', Keys: '🔑', Wallet: '👝', Others: '📦'
}
const categoryIcon = computed(() => icons[item.value?.category] || '📦')

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { dateStyle: 'medium' })
}

async function handleClaim() {
  claimError.value   = ''
  claimLoading.value = true
  try {
    await claims.submitClaim({
      itemId:        item.value.id,
      itemTitle:     item.value.title,
      ownershipProof: claimForm.value.ownershipProof,
      contactInfo:   claimForm.value.contactInfo
    }, auth.user.uid)
    claimSuccess.value = true
  } catch {
    claimError.value = 'Failed to submit claim. Please try again.'
  } finally {
    claimLoading.value = false
  }
}

onMounted(() => store.fetchItem(route.params.id))
</script>

<style scoped>
.back-link { color: #2563eb; text-decoration: none; font-size: 14px; font-weight: 500; }
.detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; margin-top: 20px; }

.main-photo { width: 100%; height: 340px; object-fit: cover; }
.no-photo-lg { height: 240px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 72px; }
.thumb-row { display: flex; gap: 8px; padding: 10px 16px; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; }
.thumb.active { border-color: #2563eb; }

.detail-info { padding: 20px 24px 24px; }
.detail-tags { display: flex; gap: 8px; margin-bottom: 12px; }
.detail-title { font-size: 22px; font-weight: 700; margin-bottom: 16px; }

.info-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.info-table th { width: 120px; text-align: left; color: #6b7280; font-weight: 600; padding: 6px 0; }
.info-table td { color: #1a1a2e; }

.detail-desc { color: #374151; font-size: 14px; line-height: 1.7; }

.claim-card { padding: 24px; }
.claim-card h2 { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
.claim-card p  { font-size: 13px; color: #6b7280; }
.full-btn { width: 100%; justify-content: center; }

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; }
}
</style>
