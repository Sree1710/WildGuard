# WildGuard Frontend - Project Structure

## 📁 Complete File Structure

```
WildGuard MCA/
├── public/
│   └── index.html                    # HTML entry point
│
├── src/
│   ├── components/
│   │   ├── admin/                    # Admin Module Components
│   │   │   ├── AdminDashboard.js     # Dashboard with stats & charts
│   │   │   ├── SpeciesManagement.js  # Species CRUD operations
│   │   │   ├── CameraManagement.js   # Camera trap management
│   │   │   ├── DetectionHistory.js   # Detection records with filters
│   │   │   ├── EmergencyManagement.js# Emergency contacts
│   │   │   └── SystemMonitoring.js   # System health metrics
│   │   │
│   │   ├── user/                     # User Module Components
│   │   │   ├── UserDashboard.js      # Field staff dashboard
│   │   │   ├── AlertsPage.js         # Real-time alerts
│   │   │   ├── EvidenceViewer.js     # Image/audio evidence
│   │   │   ├── ActivityTimeline.js   # Chronological timeline
│   │   │   ├── ReportsPage.js        # Report generation
│   │   │   └── EmergencyInfo.js      # Emergency contacts
│   │   │
│   │   ├── auth/                     # Authentication Components
│   │   │   ├── Login.js              # Login page
│   │   │   └── ProtectedRoute.js     # Route protection
│   │   │
│   │   └── shared/                   # Reusable Components
│   │       ├── Button.js             # Button components
│   │       ├── Card.js               # Card components
│   │       ├── Modal.js              # Modal components
│   │       ├── Table.js              # Table components
│   │       ├── Form.js               # Form components
│   │       ├── Navbar.js             # Navigation sidebar
│   │       └── Layout.js             # Layout components
│   │
│   ├── context/
│   │   └── AuthContext.js            # Authentication context
│   │
│   ├── data/
│   │   └── mockData.js               # Mock JSON data
│   │
│   ├── styles/
│   │   ├── theme.js                  # Theme configuration
│   │   └── GlobalStyles.js           # Global styles
│   │
│   ├── App.js                        # Main app with routing
│   └── index.js                      # React entry point
│
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
└── README.md                         # Project documentation
```

## 🎨 Features Implemented

### ✅ Admin Module (6 screens)
1. **Dashboard** - Overview cards, detection trends chart, recent activity
2. **Species Management** - Add/edit/delete species with risk levels
3. **Camera Management** - Register and monitor camera traps
4. **Detection History** - Filterable detection records with preview
5. **Emergency Management** - Manage emergency contacts
6. **System Monitoring** - System health metrics and camera status

### ✅ User Module (6 screens)
1. **User Dashboard** - Live alerts, quick stats
2. **Alerts Page** - Real-time alerts with severity filtering
3. **Evidence Viewer** - Image and audio evidence display
4. **Activity Timeline** - Chronological event timeline
5. **Reports Page** - Generate and download reports
6. **Emergency Info** - Quick access emergency contacts

### ✅ Shared Components
- Button, Card, Modal, Table, Form, Navbar, Layout
- All styled with styled-components
- Fully reusable and customizable

### ✅ Authentication
- Login page with role selection
- Protected routes for Admin/User
- Session persistence with localStorage

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

## 🔐 Login Credentials

**Admin Access:**
- Username: `admin`
- Password: `admin123`

**User Access:**
- Username: `user`
- Password: `user123`

## 🎯 Key Features

- ✅ Forest-inspired green theme
- ✅ Fully responsive design
- ✅ Role-based access control
- ✅ Mock data for all features
- ✅ Interactive charts (Recharts)
- ✅ Modal forms for CRUD operations
- ✅ Filterable tables and lists
- ✅ Clean component architecture
- ✅ Well-commented code

## 📚 Tech Stack

- **React.js** - UI framework
- **styled-components** - Styling
- **react-router-dom** - Routing
- **Recharts** - Charts
- **react-icons** - Icons

## 💡 Understanding the Code

### Component Structure
Each component follows this pattern:
```javascript
// 1. Imports
import React, { useState } from 'react';
import styled from 'styled-components';

// 2. Main Component Function
const MyComponent = () => {
  // State and logic here
  return <Container>...</Container>;
};

// 3. Styled Components
const Container = styled.div`
  // Styles here
`;

// 4. Export
export default MyComponent;
```

### Styled Components Usage
```javascript
// Define styled component
const Button = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 10px 20px;
`;

// Use it
<Button>Click Me</Button>
```

### Mock Data Access
```javascript
import { dashboardStats, speciesData } from '../../data/mockData';

// Use in component
console.log(dashboardStats.totalDetections);
```

## 📝 Notes for Students

1. **Styled Components**: All styling is done in JavaScript using styled-components. No separate CSS files.

2. **Mock Data**: All data is in `src/data/mockData.js`. In production, replace with API calls.

3. **Authentication**: Simple localStorage-based auth. In production, use JWT tokens and secure backend.

4. **Routing**: Uses React Router v6 with nested routes for Admin/User modules.

5. **State Management**: Uses React hooks (useState, useEffect). Redux not required for this project.

## 🔧 Customization

### Change Theme Colors
Edit `src/styles/theme.js`:
```javascript
colors: {
  primary: '#2d5016',  // Change this
  // ... other colors
}
```

### Add New Component
1. Create file in appropriate folder
2. Import in App.js or parent component
3. Add route if needed

### Modify Mock Data
Edit `src/data/mockData.js` to change sample data.

## 📱 Responsive Design

The app is responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (576px - 768px)

## 🎓 Learning Resources

- React: https://react.dev
- styled-components: https://styled-components.com
- React Router: https://reactrouter.com
- Recharts: https://recharts.org

---

**Built for MCA Project - WildGuard Wildlife Monitoring System**
