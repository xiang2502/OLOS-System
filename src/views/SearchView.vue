<!-- src/views/SearchView.vue -->
<!-- Search and filter lost/found items by keyword, type, and category. -->
<template>
  <div class="container">
    <div class="page-header">
      <h1>Browse Items</h1>
      <p>Search for lost or found items across TAR UMT campus.</p>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar card">
      <input
        v-model="filters.keyword"
        type="search"
        placeholder="Search by title, description, or category…"
        class="search-input"
        @keyup.enter="doSearch"
      />

      <select v-model="filters.type">
        <option value="">All Types</option>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>

      <select v-model="filters.category">
        <option value="">All Categories</option>
        <option v-for="c in categories" :key="c">{{ c }}</option>
      </select>

      <button class="btn btn-primary" @click="doSearch">Search</button>
      <button class="btn btn-secondary" @click="resetFilters">Reset</button>
    </div>

    <!-- Results count -->
    <p class="results-count" v-if="!store.loading">
      {{ store.items.length }} item(s) found
    </p>

    <!-- Grid -->
    <div v-if="store.loading" class="loading-screen" style="height:200px">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.items.length === 0" class="empty-state">
      <p>No items match your search. Try adjusting the filters.</p>
    </div>

    <div v-else class="item-grid">
      <ItemCard v-for="item in store.items" :key="item.id" :item="item" />
    </div>

    <!-- Load more -->
    <div class="load-more" v-if="store.items.length >= pageSize && !store.loading">
      <button class="btn btn-secondary" @click="loadMore">Load More</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useItemsStore } from '@/store/items'
import ItemCard from '@/components/ItemCard.vue'

const store = useItemsStore()
const pageSize = 12

const categories = [
  'Electronics', 'Daily Necessities', 'Stationery',
  'Student Card / ID', 'Keys', 'Wallet', 'Others'
]

const filters = reactive({ keyword: '', type: '', category: '' })

async function doSearch() {
  await store.fetchItems({
    type:     filters.type     || null,
    category: filters.category || null,
    keyword:  filters.keyword,
    pageSize
  })
}

async function resetFilters() {
  filters.keyword  = ''
  filters.type     = ''
  filters.category = ''
  await store.fetchItems({ pageSize })
}

async function loadMore() {
  await store.fetchItems({
    type:     filters.type     || null,
    category: filters.category || null,
    keyword:  filters.keyword,
    pageSize,
    nextPage: true
  })
}

onMounted(() => store.fetchItems({ pageSize }))
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  margin-bottom: 20px;
  align-items: center;
}
.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}
.search-input:focus { outline: none; border-color: #2563eb; }
.filter-bar select {
  padding: 10px 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.results-count { font-size: 13px; color: #6b7280; margin-bottom: 16px; }

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.empty-state { text-align: center; padding: 60px; color: #9ca3af; }
.load-more { text-align: center; padding: 30px; }
</style>
