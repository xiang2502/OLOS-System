<!-- src/views/ReportView.vue -->
<!-- Form to report a lost or found item with up to 5 photos and a campus map location pin. -->
<template>
  <div class="container">
    <div class="page-header">
      <h1>Report an Item</h1>
      <p>Fill in the details below. The more information you provide, the faster the item can be recovered.</p>
    </div>

    <div class="report-layout">
      <!-- ── Form ──────────────────────────────────────────── -->
      <div class="card form-card">
        <form @submit.prevent="handleSubmit">
          <!-- Type -->
          <div class="form-group">
            <label>Report Type *</label>
            <div class="type-toggle">
              <button
                type="button"
                :class="['type-btn', { active: form.type === 'lost' }]"
                @click="form.type = 'lost'"
              >❌ I Lost an Item</button>
              <button
                type="button"
                :class="['type-btn', { active: form.type === 'found' }]"
                @click="form.type = 'found'"
              >✅ I Found an Item</button>
            </div>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label>Item Name *</label>
            <input v-model="form.title" type="text" placeholder="e.g. Blue water bottle" required />
          </div>

          <!-- Category -->
          <div class="form-group">
            <label>Category *</label>
            <select v-model="form.category" required>
              <option value="" disabled>Select a category</option>
              <option v-for="c in categories" :key="c">{{ c }}</option>
            </select>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label>Description *</label>
            <textarea
              v-model="form.description"
              placeholder="Describe the item in detail: colour, brand, markings, contents, etc."
              rows="4"
              required
            ></textarea>
          </div>

          <!-- Date & Time -->
          <div class="form-row">
            <div class="form-group">
              <label>Date Lost / Found *</label>
              <input v-model="form.dateLost" type="date" required :max="today" />
            </div>
            <div class="form-group">
              <label>Approximate Time</label>
              <input v-model="form.timeLost" type="time" />
            </div>
          </div>

          <!-- Location text -->
          <div class="form-group">
            <label>Location (text)</label>
            <input v-model="form.location" type="text" placeholder="e.g. Library, Block A, Bus Stop 3" />
          </div>

          <!-- Map pin -->
          <div class="form-group">
            <label>Pin on Campus Map <span style="color:#9ca3af;font-weight:400">(click to place marker)</span></label>
            <div id="campus-map" class="campus-map"></div>
            <p v-if="form.mapLat" class="map-coords">
              📍 Pinned: {{ form.mapLat.toFixed(5) }}, {{ form.mapLng.toFixed(5) }}
            </p>
          </div>

          <!-- Photos -->
          <div class="form-group">
            <label>Photos <span style="color:#9ca3af;font-weight:400">(up to 5)</span></label>
            <div class="photo-upload" @click="$refs.fileInput.click()">
              <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="handleFiles" />
              <span>📷 Click to upload photos</span>
            </div>
            <div v-if="previewUrls.length" class="preview-row">
              <div v-for="(url, i) in previewUrls" :key="i" class="preview-item">
                <img :src="url" alt="Preview" />
                <button type="button" class="remove-photo" @click="removePhoto(i)">✕</button>
              </div>
            </div>
          </div>

          <p v-if="error"   class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>

          <button type="submit" class="btn btn-primary full-btn" :disabled="loading">
            {{ loading ? 'Submitting…' : 'Submit Report' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/store/items'
import { useAuthStore } from '@/store/auth'

const store   = useItemsStore()
const auth    = useAuthStore()
const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const success = ref('')
const photoFiles  = ref([])
const previewUrls = ref([])

const today = new Date().toISOString().split('T')[0]

const categories = [
  'Electronics', 'Daily Necessities', 'Stationery',
  'Student Card / ID', 'Keys', 'Wallet', 'Others'
]

const form = reactive({
  type: 'lost', title: '', category: '', description: '',
  dateLost: today, timeLost: '', location: '', mapLat: null, mapLng: null
})

// ── Photo handling ────────────────────────────────────────────────────────────
function handleFiles(e) {
  const files = Array.from(e.target.files).slice(0, 5 - photoFiles.value.length)
  for (const f of files) {
    photoFiles.value.push(f)
    previewUrls.value.push(URL.createObjectURL(f))
  }
}

function removePhoto(i) {
  photoFiles.value.splice(i, 1)
  URL.revokeObjectURL(previewUrls.value[i])
  previewUrls.value.splice(i, 1)
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!form.type) { error.value = 'Please select Lost or Found.'; return }
  error.value   = ''
  success.value = ''
  loading.value = true

  try {
    const id = await store.createItem({ ...form }, photoFiles.value, auth.user.uid)
    success.value = 'Report submitted successfully!'
    setTimeout(() => router.push(`/items/${id}`), 1500)
  } catch {
    error.value = 'Failed to submit report. Please try again.'
  } finally {
    loading.value = false
  }
}

// ── Leaflet map (TAR UMT campus centred) ──────────────────────────────────────
onMounted(async () => {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  // TAR UMT KL campus coordinates
  const campusCenter = [3.215352, 101.726482]

  const map = L.map('campus-map').setView(campusCenter, 17)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  // Custom marker icon (fixes missing icon issue in Vite builds)
  const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41]
  })

  let marker = null
  map.on('click', e => {
    form.mapLat = e.latlng.lat
    form.mapLng = e.latlng.lng
    if (marker) marker.setLatLng(e.latlng)
    else marker = L.marker(e.latlng, { icon }).addTo(map)
  })
})
</script>

<style scoped>
.report-layout { max-width: 680px; margin: 0 auto 40px; }
.form-card { padding: 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.type-toggle { display: flex; gap: 10px; }
.type-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}
.type-btn.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }

.campus-map { height: 260px; border-radius: 8px; border: 1.5px solid #d1d5db; z-index: 0; }
.map-coords { font-size: 12px; color: #6b7280; margin-top: 6px; }

.photo-upload {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: border-color 0.2s;
}
.photo-upload:hover { border-color: #2563eb; color: #2563eb; }

.preview-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.preview-item { position: relative; }
.preview-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
.remove-photo {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px;
  background: #ef4444; color: white;
  border: none; border-radius: 50%; cursor: pointer;
  font-size: 10px; display: flex; align-items: center; justify-content: center;
}

.full-btn { width: 100%; justify-content: center; margin-top: 8px; }
</style>
