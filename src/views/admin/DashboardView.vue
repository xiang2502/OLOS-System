<!-- src/views/admin/DashboardView.vue -->
<!-- Admin analytics dashboard: summary cards, category breakdown, and loss hotspot counts. -->
<template>
  <div class="container">
    <div class="page-header">
      <h1>Admin Dashboard</h1>
      <p>Overview of OLOS activity at TAR UMT.</p>
    </div>

    <div v-if="loading" class="loading-screen" style="height:200px">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <!-- ── Summary cards ──────────────────────────────────── -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-icon" style="background:#dbeafe">📋</div>
          <div>
            <p class="stat-label">Total Reports</p>
            <p class="stat-value">{{ stats.total }}</p>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background:#fee2e2">❌</div>
          <div>
            <p class="stat-label">Lost Items</p>
            <p class="stat-value">{{ stats.lost }}</p>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background:#dcfce7">✅</div>
          <div>
            <p class="stat-label">Found Items</p>
            <p class="stat-value">{{ stats.found }}</p>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon" style="background:#fef9c3">⏳</div>
          <div>
            <p class="stat-label">Pending Claims</p>
            <p class="stat-value">{{ stats.pendingClaims }}</p>
          </div>
        </div>
      </div>

      <!-- ── Category breakdown ──────────────────────────────── -->
      <div class="section-grid">
        <div class="card section-card">
          <h2>Items by Category</h2>
          <div class="bar-chart">
            <div
              v-for="(count, cat) in stats.byCategory"
              :key="cat"
              class="bar-row"
            >
              <span class="bar-label">{{ cat }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="`width:${(count / stats.total * 100).toFixed(0)}%`"
                ></div>
              </div>
              <span class="bar-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- ── Recent activity ──────────────────────────────── -->
        <div class="card section-card">
          <h2>Recent Reports</h2>
          <table class="activity-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recentItems" :key="item.id">
                <td>
                  <router-link :to="`/items/${item.id}`">{{ item.title }}</router-link>
                </td>
                <td><span :class="`badge badge-${item.type}`">{{ item.type }}</span></td>
                <td><span :class="`badge badge-${item.status}`">{{ item.status }}</span></td>
                <td>{{ formatDate(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Quick links ──────────────────────────────────────── -->
      <div class="quick-links">
        <router-link to="/admin/users"  class="btn btn-secondary">👥 Manage Users</router-link>
        <router-link to="/admin/claims" class="btn btn-secondary">📋 Manage Claims</router-link>
        <router-link to="/search"       class="btn btn-secondary">🔍 Browse Items</router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDocs, collection, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '@/firebase'

const loading     = ref(true)
const recentItems = ref([])
const stats       = ref({
  total: 0, lost: 0, found: 0, pendingClaims: 0, byCategory: {}
})

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { dateStyle: 'short' })
}

onMounted(async () => {
  try {
    // Fetch all items for stats
    const itemSnap = await getDocs(collection(db, 'items'))
    const all = itemSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    stats.value.total = all.length
    stats.value.lost  = all.filter(i => i.type === 'lost').length
    stats.value.found = all.filter(i => i.type === 'found').length

    // Category breakdown
    const byCat = {}
    for (const item of all) {
      byCat[item.category] = (byCat[item.category] || 0) + 1
    }
    stats.value.byCategory = byCat

    // Recent items (last 8)
    const recentSnap = await getDocs(
      query(collection(db, 'items'), orderBy('createdAt', 'desc'), limit(8))
    )
    recentItems.value = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Pending claims count
    const claimSnap = await getDocs(
      query(collection(db, 'claims'), where('status', '==', 'pending'))
    )
    stats.value.pendingClaims = claimSnap.size
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
}
.stat-label { font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 2px; }
.stat-value { font-size: 26px; font-weight: 800; }

.section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.section-card { padding: 24px; }
.section-card h2 { font-size: 16px; font-weight: 700; margin-bottom: 18px; }

.bar-chart { display: flex; flex-direction: column; gap: 12px; }
.bar-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.bar-label { width: 130px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-track { flex: 1; height: 10px; background: #f3f4f6; border-radius: 99px; overflow: hidden; }
.bar-fill   { height: 100%; background: #2563eb; border-radius: 99px; transition: width 0.5s; min-width: 4px; }
.bar-count  { width: 24px; text-align: right; color: #6b7280; font-weight: 600; }

.activity-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.activity-table th { text-align: left; padding: 6px 8px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #f3f4f6; }
.activity-table td { padding: 8px 8px; border-bottom: 1px solid #f9fafb; }
.activity-table a  { color: #2563eb; text-decoration: none; font-weight: 500; }

.quick-links { display: flex; gap: 10px; flex-wrap: wrap; padding-bottom: 40px; }

@media (max-width: 768px) {
  .section-grid { grid-template-columns: 1fr; }
}
</style>
