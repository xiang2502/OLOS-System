# OLOS – Online Lost and Found System
### BMCS3403 Project I | TAR UMT | Developer: Loo Zhe Xiang

---

## Project Overview

OLOS is a web-based lost-and-found management system built with **Vue.js 3** and **Firebase**. It enables TAR UMT students, staff, and administrators to:

- Report lost or found items with photo uploads and campus map location pinning
- Search and filter item listings by keyword, type, and category
- Submit and track item claim requests
- Admin: manage users, approve/reject claims, and view analytics

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Frontend      | Vue.js 3 (Composition API) + Pinia  |
| Router        | Vue Router 4                        |
| Backend / DB  | Firebase Cloud Firestore            |
| Auth          | Firebase Authentication (Email/PW)  |
| Storage       | Firebase Cloud Storage              |
| Map           | Leaflet.js (OpenStreetMap tiles)    |
| Build tool    | Vite                                |
| Deployment    | Firebase Hosting                    |

---

## Project Structure

```
olos/
├── index.html
├── vite.config.js
├── firebase.json
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Required Firestore composite indexes
├── storage.rules          # Cloud Storage security rules
└── src/
    ├── main.js            # App entry – mounts Vue, Pinia, Router
    ├── App.vue            # Root component (NavBar + <router-view>)
    ├── firebase.js        # Firebase SDK initialisation
    ├── assets/
    │   └── main.css
    ├── router/
    │   └── index.js       # All routes + navigation guards
    ├── store/
    │   ├── auth.js        # User auth state (Pinia)
    │   ├── items.js       # Lost/found items CRUD (Pinia)
    │   └── claims.js      # Claim requests CRUD (Pinia)
    ├── components/
    │   ├── NavBar.vue     # Top navigation bar
    │   └── ItemCard.vue   # Reusable item summary card
    └── views/
        ├── LoginView.vue
        ├── RegisterView.vue
        ├── ResetPasswordView.vue
        ├── HomeView.vue          # User homepage
        ├── SearchView.vue        # Search & filter
        ├── ItemDetailView.vue    # Full item + claim form
        ├── ReportView.vue        # Report lost/found item
        ├── MyClaimsView.vue      # Track own claims
        └── admin/
            ├── DashboardView.vue    # Analytics dashboard
            ├── ManageUsersView.vue  # User management
            └── ManageClaimsView.vue # Claim approval
```

---

## Setup Instructions

### 1. Create a Firebase Project

1. Go to <https://console.firebase.google.com>
2. Click **Add project** → name it `OLOS`
3. Disable Google Analytics (optional) → **Create project**

### 2. Enable Firebase Services

| Service                         | Steps                                                           |
|---------------------------------|-----------------------------------------------------------------|
| **Authentication**              | Build → Authentication → Get started → Email/Password → Enable |
| **Firestore Database**          | Build → Firestore → Create database → Start in **test mode**   |
| **Storage**                     | Build → Storage → Get started → Start in **test mode**         |

### 3. Register a Web App

1. Project Overview → **</>** (Web) icon → Register app
2. Copy the `firebaseConfig` object

### 4. Configure the App

Open `src/firebase.js` and replace the placeholder config:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
}
```

### 5. Install Dependencies & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

### 6. Create the First Admin Account

1. Register a normal account through the app
2. In **Firebase Console → Firestore → users → {your-uid}**
3. Edit the `role` field from `"user"` to `"admin"`
4. Refresh the app – admin nav links will appear

### 7. Deploy Firestore Rules & Indexes

```bash
npm install -g firebase-tools
firebase login
firebase init          # select Hosting, Firestore, Storage
firebase deploy
```

---

## Firestore Data Model

### `users/{uid}`
```
name            : string
email           : string
contactNumber   : string
role            : "user" | "admin"
createdAt       : timestamp
```

### `items/{itemId}`
```
type            : "lost" | "found"
title           : string
category        : string
description     : string
dateLost        : string (YYYY-MM-DD)
timeLost        : string (HH:MM)
location        : string
mapLat          : number | null
mapLng          : number | null
photoUrls       : string[]
status          : "active" | "claimed" | "resolved"
reportedBy      : uid (string)
createdAt       : timestamp
updatedAt       : timestamp
```

### `claims/{claimId}`
```
itemId          : string
itemTitle       : string
claimedBy       : uid (string)
ownershipProof  : string
contactInfo     : string
status          : "pending" | "approved" | "rejected"
createdAt       : timestamp
updatedAt       : timestamp
reviewedAt      : timestamp | null
```

---

## Key Features

| Feature | Implementation |
|---|---|
| User registration & login | Firebase Auth + Pinia `auth.js` |
| Role-based access control | `router/index.js` guards + `isAdmin()` |
| Report item with photos | `ReportView.vue` + `items.js` store |
| Campus map location pin | Leaflet.js + OpenStreetMap (TAR UMT centred) |
| Search & filter | `SearchView.vue` + Firestore queries |
| Claim request flow | `ItemDetailView.vue` + `claims.js` store |
| Admin analytics | `DashboardView.vue` + aggregated Firestore reads |
| Manage users | `ManageUsersView.vue` + Firebase Auth reset |
| Manage claims | `ManageClaimsView.vue` + status updates |
| Security rules | `firestore.rules` + `storage.rules` |
