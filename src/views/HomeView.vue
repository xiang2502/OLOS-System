<!-- src/views/HomeView.vue -->
<!-- User homepage: welcome banner, quick stats, and recent item listings. -->
<template>
  <div class="container">
    <!-- Welcome banner -->
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome back, {{ auth.displayName }} 👋</h1>
        <p>Browse recent lost &amp; found reports or submit a new one.</p>
        <div class="hero-actions">
          <router-link to="/report" class="btn btn-primary">+ Report Item</router-link>
          <router-link to="/search" class="btn btn-secondary">Browse All Items</router-link>
        </div>
      </div>
      <div class="hero-emoji">🔍</div>
    </section>

    <!-- Quick filter tabs -->
    <div class="tab-bar">
      <button
        v-for="t in tabs"
        :key="t.value"
        :class="['tab-btn', { active: activeTab === t.value }]"
        @click="switchTab(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Item grid -->
    <div v-if="items.loading" class="loading-screen" style="height:200px">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.items.length === 0" class="empty-state">
      <p>No items found. Be the first to report one!</p>
    </div>

    <div v-else class="item-grid">
      <ItemCard
        v-for="item in store.items"
        :key="item.id"
        :item="item"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useItemsStore } from '@/store/items'
import ItemCard from '@/components/ItemCard.vue'

const auth  = useAuthStore()
const store = useItemsStore()
const items = store

const activeTab = ref('all')

const tabs = [
  { value: 'all',   label: 'All Items' },
  { value: 'lost',  label: '❌ Lost'   },
  { value: 'found', label: '✅ Found'  }
]

async function switchTab(tab) {
  activeTab.value = tab
  await store.fetchItems({ type: tab === 'all' ? null : tab })
}

onMounted(() => store.fetchItems())
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 40px 36px;
  border-radius: 16px;
  margin: 28px 0 24px;
}
.hero-content h1 { font-size: 24px; font-weight: 700; }
.hero-content p  { opacity: 0.85; margin: 8px 0 20px; }
.hero-actions { display: flex; gap: 10px; }
.hero-actions .btn-secondary { background: rgba(255,255,255,0.2); color: white; }
.hero-actions .btn-secondary:hover { background: rgba(255,255,255,0.3); }
.hero-emoji { font-size: 72px; opacity: 0.3; }

.tab-bar { display: flex; gap: 8px; margin-bottom: 24px; }
.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1.5px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;
}
.tab-btn.active { background: #2563eb; color: white; border-color: #2563eb; }

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  padding-bottom: 40px;
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}
</style>
