# 🎨 WildGuard UI Feature Guide

## 🔐 Login Page

**Location:** `http://localhost:3000`

**Features:**
- Role selector (Admin/User tabs)
- Login form with username/password
- Quick login buttons for demo
- Credential display for easy testing
- Forest-themed gradient background

---

## 👨‍💼 ADMIN MODULE

### 1. Admin Dashboard
**Route:** `/admin/dashboard`

**Components:**
- 4 Statistics cards:
  - Total Detections (with chart icon)
  - Animals Detected (paw icon)
  - Human Intrusions (user icon)
  - Critical Alerts (bell icon)
- Line chart showing detection trends (7 days)
- Recent activity table with:
  - Event type badges
  - Event messages
  - Timestamps
  - Status indicators

**Color Scheme:** Green primary, earthy tones

---

### 2. Species Management
**Route:** `/admin/species`

**Features:**
- "Add Species" button (top right)
- Table displaying:
  - Species name with icon
  - Category (Mammal, Bird, etc.)
  - Risk level badge (Critical/High/Medium/Low)
  - Notes
  - Action buttons (Edit/Delete)

**Modal Forms:**
- Add/Edit species form with:
  - Name input
  - Category dropdown
  - Risk level dropdown
  - Notes textarea
- Delete confirmation modal

**Interactive:** Click edit to modify, delete to remove

---

### 3. Camera Trap Management
**Route:** `/admin/cameras`

**Features:**
- Status cards showing:
  - Active cameras count
  - Inactive cameras count
  - Total cameras
- "Register Camera" button
- Table with:
  - Camera ID
  - Zone
  - GPS coordinates
  - Status badge (Active/Inactive)
  - Last ping time
  - Edit/Delete actions

**Modal:** Camera registration form with zone selector and GPS input

---

### 4. Detection History
**Route:** `/admin/detections`

**Features:**
- Filter panel with:
  - Detection type dropdown
  - Zone filter
  - Date range selectors
  - Apply/Reset buttons
- Results table showing:
  - Detection ID
  - Type badge (Animal/Human/Suspicious)
  - Species/Subject
  - Timestamp
  - Location
  - Confidence bar (visual percentage)
  - View button

**Detail Modal:**
- Detection metadata grid
- Image preview placeholder
- Confidence score display

---

### 5. Emergency Resource Management
**Route:** `/admin/emergency`

**Features:**
- Emergency hotline card (red gradient)
- "Add Contact" button
- Contacts table with:
  - Contact name with icon
  - Role
  - Phone number (clickable link)
  - Location
  - Edit/Delete actions

**Form Fields:**
- Contact name
- Role
- Phone number
- Location

---

### 6. System Monitoring
**Route:** `/admin/monitoring`

**Features:**
- System status card (green, showing operational)
- Performance metrics with progress bars:
  - CPU Usage
  - Memory Usage
  - Disk Usage
  - Network Latency
- Camera network status:
  - Active cameras count
  - Offline cameras list
  - Detection accuracy percentage
- Recent system alerts timeline

**Visual Indicators:**
- Green (<60%), Orange (60-80%), Red (>80%)

---

## 👮 USER MODULE

### 1. User Dashboard
**Route:** `/user/dashboard`

**Features:**
- 4 Quick stat cards:
  - Today's Alerts
  - Active Alerts
  - Active Zones
  - Recent Detections
- Critical alerts panel (red border):
  - Alert type
  - Location with icon
  - Description
  - Timestamp
  - Severity badge
- Recent activity table

**Highlights:** Critical alerts prominently displayed

---

### 2. Real-Time Alerts Page
**Route:** `/user/alerts`

**Features:**
- "Live" indicator (pulsing red)
- Severity filter dropdown
- Alert cards grid showing:
  - Severity badge
  - Status (Active/Resolved)
  - Alert type as title
  - Location and time
  - Description
  - Action buttons (View Details/Mark Resolved)

**Card Colors:** Left border matches severity (red/orange/yellow)

---

### 3. Detection Evidence Viewer
**Route:** `/user/evidence`

**Features:**
- Type toggle (Images/Audio)
- Main display area:
  - Large image/audio preview
  - Metadata panel showing:
    - Detection ID
    - Type badge
    - Species
    - Location
    - Timestamp
    - Confidence score (colored)
- Thumbnail grid for all evidence
- Audio player with:
  - Play button
  - Waveform visualization
  - File name

**Interactive:** Click thumbnails to switch evidence

---

### 4. Activity Timeline
**Route:** `/user/timeline`

**Features:**
- Vertical timeline with:
  - Colored dots (severity-based)
  - Connecting lines
  - Event cards showing:
    - Time and date
    - Severity badge
    - Event title
    - Location
    - Details
- Legend showing severity levels

**Visual:** Timeline flows top to bottom chronologically

---

### 5. Reports Page
**Route:** `/user/reports`

**Features:**
- Report configuration form:
  - Report type selector
  - Date range pickers
  - Zone filter
  - Export format selector
  - Generate button
- Quick report cards (4 pre-configured):
  - Today's Summary
  - Weekly Report
  - Critical Alerts
  - Wildlife Activity
- Recent reports history list

**Exports:** PDF, CSV, Excel, JSON formats

---

### 6. Emergency Info Page
**Route:** `/user/emergency`

**Features:**
- Emergency hotline card (large, red gradient)
- Emergency protocols section:
  - Poaching alert steps
  - Wildlife injury steps
  - Human-wildlife conflict steps
- Emergency contacts grid:
  - Contact cards with icon
  - Name, role, phone, location
  - "Call Now" button
- Offline access notice

**Offline-Friendly:** All info cached locally

---

## 🎨 Design System

### Colors
- **Primary:** Forest Green (#2d5016)
- **Secondary:** Earthy Brown (#8b6914)
- **Success:** Green (#4caf50)
- **Warning:** Orange (#ff9800)
- **Danger:** Red (#f44336)
- **Info:** Blue (#2196f3)

### Typography
- **Headings:** Semibold, Green
- **Body:** Regular, Dark Gray
- **Small Text:** Light Gray

### Components
- **Cards:** White background, subtle shadow, rounded corners
- **Buttons:** Colored, hover lift effect
- **Tables:** Striped rows, hover highlight
- **Modals:** Centered overlay, white background
- **Badges:** Small, colored pills for status

### Responsive
- Desktop: Full sidebar, multi-column grids
- Tablet: Compressed sidebar, 2-column grids
- Mobile: Icon-only sidebar, single column

---

## 🔄 User Flow

### Admin Workflow
1. Login as admin
2. View dashboard overview
3. Manage species/cameras
4. Review detections
5. Monitor system health
6. Manage emergency resources

### User Workflow
1. Login as field staff
2. Check critical alerts
3. View evidence
4. Review timeline
5. Generate reports
6. Access emergency info

---

## 🎯 Interactive Elements

### Clickable Items
- ✅ Navigation menu items
- ✅ Table action buttons
- ✅ Modal open/close buttons
- ✅ Form submit buttons
- ✅ Evidence thumbnails
- ✅ Phone number links
- ✅ Filter apply buttons

### Hover Effects
- ✅ Cards lift slightly
- ✅ Buttons change color
- ✅ Table rows highlight
- ✅ Links underline

### Animated Elements
- ✅ Live indicator pulse
- ✅ Progress bars fill
- ✅ Modal slide in
- ✅ Page transitions

---

## 📱 Responsive Behavior

**Desktop (1024px+)**
- Full sidebar with text
- Multi-column grids (3-4 columns)
- Large charts
- Expanded tables

**Tablet (768-1024px)**
- Compressed sidebar
- 2-column grids
- Medium charts
- Scrollable tables

**Mobile (<768px)**
- Icon-only sidebar
- Single column layout
- Stacked cards
- Mobile-optimized tables

---

This guide describes all visual and interactive features. Run `npm start` to see them in action!
