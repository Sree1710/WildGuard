# 🌲 WildGuard - Setup & Usage Guide

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## 🚀 Installation Steps

### Step 1: Open Terminal
Navigate to the project directory:
```bash
cd "d:\WildGuard MCA"
```

### Step 2: Install Dependencies
Run this command to install all required packages:
```bash
npm install
```

This will install:
- react & react-dom
- react-router-dom (routing)
- styled-components (styling)
- recharts (charts)
- react-icons (icons)
- react-scripts (build tools)

### Step 3: Start Development Server
```bash
npm start
```

The application will automatically open in your browser at:
```
http://localhost:3000
```

## 🔐 Login Instructions

### Admin Login
1. Go to `http://localhost:3000`
2. Click "Login as Admin" button, OR
3. Manually enter:
   - Username: `admin`
   - Password: `admin123`
4. You'll be redirected to Admin Dashboard

### User Login
1. Go to `http://localhost:3000`
2. Click "Login as User" button, OR
3. Manually enter:
   - Username: `user`
   - Password: `user123`
4. You'll be redirected to User Dashboard

## 📱 Navigation

### Admin Module Pages
After logging in as Admin, use the sidebar to access:
- 🏠 **Dashboard** - Overview statistics and charts
- 🐾 **Species** - Manage wildlife species
- 📷 **Cameras** - Manage camera traps
- 📜 **Detections** - View detection history
- 📞 **Emergency** - Manage emergency contacts
- 🖥️ **Monitoring** - System health metrics

### User Module Pages
After logging in as User, use the sidebar to access:
- 🏠 **Dashboard** - Quick overview
- 🔔 **Alerts** - Real-time alerts
- 📸 **Evidence** - View images and audio
- 📊 **Timeline** - Activity timeline
- 📄 **Reports** - Generate reports
- 🚨 **Emergency** - Emergency contacts

## 🎨 Features Demonstration

### Try These Features:

#### Admin Module
1. **Add a Species**
   - Go to Species page
   - Click "Add Species"
   - Fill form and submit

2. **Register a Camera**
   - Go to Cameras page
   - Click "Register Camera"
   - Add camera details

3. **View Detections**
   - Go to Detections page
   - Apply filters
   - Click "View" on any detection

#### User Module
1. **View Alerts**
   - Go to Alerts page
   - Filter by severity
   - See critical alerts highlighted

2. **View Evidence**
   - Go to Evidence page
   - Toggle between Images and Audio
   - Click thumbnails to view details

3. **Generate Report**
   - Go to Reports page
   - Configure report settings
   - Click "Generate Report"

## 🛠️ Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Windows
netstat -ano | findstr :3000
# Then kill the process

# Or use a different port
set PORT=3001 && npm start
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
npm install
```

### Page Not Loading
1. Check console for errors (F12 in browser)
2. Ensure all files are created correctly
3. Restart the development server (Ctrl+C, then `npm start`)

## 📂 File Organization

```
src/
├── components/       # All React components
├── context/         # Authentication context
├── data/            # Mock data
├── styles/          # Theme and global styles
├── App.js           # Main app with routing
└── index.js         # Entry point
```

## 💾 Building for Production

To create an optimized production build:
```bash
npm run build
```

This creates a `build/` folder with optimized files ready for deployment.

## 🎓 Understanding the Code

### Component Example
```javascript
// Every component follows this pattern:

import React, { useState } from 'react';
import styled from 'styled-components';

// 1. Component Function
const MyComponent = () => {
  // 2. State (if needed)
  const [data, setData] = useState([]);

  // 3. JSX Return
  return (
    <Container>
      <Title>Hello WildGuard!</Title>
    </Container>
  );
};

// 4. Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  color: green;
`;

// 5. Export
export default MyComponent;
```

### Adding Mock Data
Edit `src/data/mockData.js`:
```javascript
export const myNewData = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];
```

Then import and use:
```javascript
import { myNewData } from '../../data/mockData';

// Use in component
myNewData.map(item => <div>{item.name}</div>)
```

## 🎨 Customization

### Change Colors
Edit `src/styles/theme.js`:
```javascript
colors: {
  primary: '#2d5016',     // Main green
  secondary: '#8b6914',   // Brown
  success: '#4caf50',     // Success green
  // ... change any color
}
```

### Add New Page
1. Create component file in `src/components/admin/` or `src/components/user/`
2. Import in `src/App.js`
3. Add route:
```javascript
<Route path="newpage" element={<NewPage />} />
```

## 📊 Mock Data Available

All mock data is in `src/data/mockData.js`:
- `dashboardStats` - Dashboard statistics
- `speciesData` - Wildlife species list
- `cameraTrapData` - Camera locations
- `detectionHistory` - Detection records
- `emergencyContacts` - Emergency contacts
- `alertsData` - Alert notifications
- `timelineEvents` - Timeline events
- And more...

## 🔧 Scripts

```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests (if configured)
```

## 📞 Common Questions

**Q: Can I add more admin users?**
A: Yes! Edit `src/context/AuthContext.js` and add to `mockUsers` object.

**Q: How do I connect to a real backend?**
A: Replace mock data imports with API calls using `fetch()` or `axios`.

**Q: Can I deploy this?**
A: Yes! Run `npm run build` and deploy the `build/` folder to any hosting service.

**Q: The charts aren't showing?**
A: Ensure Recharts is installed: `npm install recharts`

## 🎯 Next Steps for Students

1. **Understand the flow**: Login → Protected Route → Module Layout → Page Components
2. **Modify mock data**: Change values in `mockData.js` to see updates
3. **Customize styling**: Edit theme colors and component styles
4. **Add features**: Try adding new fields to forms or new data columns
5. **Connect backend**: Replace mock data with real API calls

## 📚 Learning Resources

- **React Basics**: https://react.dev/learn
- **Styled Components**: https://styled-components.com/docs
- **React Router**: https://reactrouter.com/en/main
- **React Icons**: https://react-icons.github.io/react-icons/

## ⚠️ Important Notes

1. This is an **academic project** - authentication is simplified
2. All data is **mock data** - stored in browser
3. For production, implement:
   - Real authentication with JWT
   - Backend API integration
   - Database connection
   - Proper error handling
   - Security measures

## 🎉 You're Ready!

Your WildGuard application is complete and ready to run!

```bash
npm install
npm start
```

Then open http://localhost:3000 and login!

---

**Need Help?**
- Check console for errors (F12 in browser)
- Read component comments for understanding
- Review mock data structure in `src/data/mockData.js`

**Good luck with your MCA project! 🌲🐾**
