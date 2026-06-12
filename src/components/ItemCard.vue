<!-- src/components/ItemCard.vue -->
<!-- Reusable card displayed in the Home grid and Search results. -->
<template>
  <router-link :to="`/items/${item.id}`" class="item-card card">
    <!-- Photo -->
    <div class="card-img">
      <img v-if="item.photoUrls?.length" :src="item.photoUrls[0]" :alt="item.title" />
      <div v-else class="no-photo">{{ categoryIcon }}</div>
    </div>

    <!-- Info -->
    <div class="card-body">
      <div class="card-tags">
        <span :class="`badge badge-${item.type}`">{{ item.type.toUpperCase() }}</span>
        <span :class="`badge badge-${item.status}`">{{ item.status }}</span>
      </div>
      <h3 class="card-title">{{ item.title }}</h3>
      <p class="card-desc">{{ item.description }}</p>

      <div class="card-meta">
        <span>📂 {{ item.category }}</span>
        <span>📅 {{ formatDate(item.createdAt) }}</span>
      </div>

      <div v-if="item.location" class="card-location">
        📍 {{ item.location }}
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ item: { type: Object, required: true } })

const icons = {
  Electronics: '📱', 'Daily Necessities': '🎒', Stationery: '✏️',
  'Student Card / ID': '🪪', Keys: '🔑', Wallet: '👝', Others: '📦'
}

const categoryIcon = computed(() => icons[props.item.category] || '📦')

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
}
</script>

<style scoped>
.item-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.item-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

.card-img {
  height: 160px;
  background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.card-img img { width: 100%; height: 100%; object-fit: cover; }
.no-photo { font-size: 48px; }

.card-body { padding: 14px 16px 16px; }
.card-tags { display: flex; gap: 6px; margin-bottom: 8px; }
.card-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-desc  { font-size: 13px; color: #6b7280; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-meta {
  display: flex; gap: 12px;
  margin-top: 10px;
  font-size: 12px; color: #9ca3af;
}
.card-location { font-size: 12px; color: #6b7280; margin-top: 4px; }
</style>
