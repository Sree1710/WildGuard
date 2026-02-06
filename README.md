# 🦁 WildGuard – Intelligent Wildlife Monitoring and Anti-Poaching System

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://mongodb.com)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6F00.svg)](https://ultralytics.com)

---

## 🎯 Project Overview

**WildGuard** is an AI-powered wildlife monitoring and anti-poaching system designed to protect endangered species through real-time detection and intelligent alerting.

### Key Capabilities
- 🎥 **Visual Monitoring** – Camera traps with YOLOv8 object detection
- 🎤 **Acoustic Monitoring** – Audio sensors with Random Forest classification
- 📊 **Real-time Analytics** – Live dashboards with detection trends
- 🚨 **Smart Alerting** – Priority-based alerts (Critical/High/Medium/Low)
- 📄 **Professional Reports** – PDF/JSON export with analytics

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Python 3.11+, Django 4.2, Django REST Framework, PyJWT |
| **Database** | MongoDB Atlas, MongoEngine ODM |
| **ML - Image** | YOLOv8 (Ultralytics), OpenCV |
| **ML - Audio** | Random Forest (scikit-learn), librosa |
| **Frontend** | React 18, Styled Components, React Router |
| **Reports** | ReportLab (PDF generation) |

---

## 📁 Project Structure

```
WildGuard MCA/
├── wildguard_backend/              # Django Backend
│   ├── accounts/                   # JWT Authentication
│   │   └── auth.py                 # JWT handler & decorators
│   ├── admin_module/               # Admin APIs
│   │   └── views.py                # Dashboard, cameras, emergency
│   ├── user_module/                # User/Ranger APIs
│   │   └── views.py                # Dashboard, reports, PDF generation
│   ├── detection/                  # Core detection module
│   │   ├── models.py               # MongoDB models
│   │   └── detection_generator.py  # Auto-detection simulator
│   ├── ml_services/                # Production ML inference
│   │   ├── image_detector.py       # YOLOv8 detector
│   │   └── audio_detector.py       # Random Forest classifier
│   ├── ml_experiments/             # ML training & research
│   │   ├── datasets/               # Training data
│   │   └── trained_models/         # Saved models (yolov8*.pt)
│   ├── config/                     # Django settings
│   └── requirements.txt            # Python dependencies
│
├── wildguard-frontend/             # React Frontend
│   └── src/
│       ├── components/
│       │   ├── HomePage.js         # Landing page
│       │   ├── admin/              # Admin pages
│       │   │   ├── AdminDashboard.js
│       │   │   ├── CameraManagement.js
│       │   │   ├── DetectionHistory.js
│       │   │   ├── EmergencyManagement.js
│       │   │   └── SystemMonitoring.js
│       │   ├── user/               # User pages
│       │   │   ├── UserDashboard.js
│       │   │   ├── ReportsPage.js
│       │   │   ├── AlertsPage.js
│       │   │   ├── ActivityTimeline.js
│       │   │   ├── EmergencyInfo.js
│       │   │   └── EvidenceViewer.js
│       │   ├── auth/               # Authentication
│       │   │   ├── Login.js
│       │   │   ├── Signup.js
│       │   │   └── ProtectedRoute.js
│       │   └── shared/             # Reusable components
│       │       ├── Layout.js
│       │       ├── Navbar.js
│       │       ├── Button.js
│       │       ├── Card.js
│       │       ├── Form.js
│       │       ├── Modal.js
│       │       └── Table.js
│       ├── services/api.js         # API client
│       └── context/AuthContext.js  # Auth state
│
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account

### Backend Setup

```bash
# Clone repository
git clone https://github.com/Sree1710/WildGuard.git
cd "WildGuard MCA"

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

# Install dependencies
cd wildguard_backend
pip install -r requirements.txt

# Configure environment (.env file)
# MONGO_HOST=mongodb+srv://...
# MONGO_DB=wildguard
# SECRET_KEY=your-secret-key

# Run server
python manage.py runserver
```

### Frontend Setup

```bash
cd wildguard-frontend
npm install
npm start
```

### Access URLs
| URL | Description |
|-----|-------------|
| http://localhost:3000 | Frontend |
| http://localhost:8000 | Backend API |
| /admin/dashboard | Admin Panel |
| /user/dashboard | User Panel |

---

## 🧠 ML Components

### Image Detection (YOLOv8)
| Property | Value |
|----------|-------|
| **Model** | YOLOv8 (yolov8_image_classifier.pt) |
| **Accuracy** | ~92% |
| **Objects** | Elephant, Tiger, Deer, Human, Vehicle |

### Audio Classification (Random Forest)
| Property | Value |
|----------|-------|
| **Model** | Random Forest (100 trees) |
| **Features** | 20 MFCC features |
| **Accuracy** | ~89% |
| **Classes** | Gunshot, Chainsaw, Animal, Human, Vehicle |

### Alert Levels
| Level | Triggers |
|-------|----------|
| 🔴 Critical | Human/Poacher, Gunshot |
| 🟠 High | Vehicle, Chainsaw |
| 🟡 Medium | Unusual activity |
| 🟢 Low | Normal wildlife |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/signup/` | Register |
| GET | `/api/auth/profile/` | Current user |
| POST | `/api/auth/logout/` | Logout |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/` | System overview |
| GET | `/api/admin/cameras/` | Camera list |
| GET | `/api/admin/emergency/` | Emergency alerts |
| GET | `/api/admin/system-monitoring/` | System health |

### User APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/dashboard/` | User dashboard |
| GET | `/api/user/alerts/` | User alerts |
| GET | `/api/user/reports/` | Report data |
| GET | `/api/user/reports/pdf/` | Download PDF |

---

## 🎨 Frontend Features

### Admin Module
- **AdminDashboard** – System-wide statistics
- **CameraManagement** – Camera trap CRUD
- **DetectionHistory** – All detections log
- **EmergencyManagement** – Alert triage
- **SystemMonitoring** – Health metrics

### User Module
- **UserDashboard** – Personal stats, critical alerts
- **ReportsPage** – Report generation, PDF export
- **AlertsPage** – Alert timeline
- **ActivityTimeline** – Detection activity
- **EvidenceViewer** – View detection evidence
- **EmergencyInfo** – Emergency contacts

### UI/UX
- Modern design with dark hero sections
- Gradient accents (#2E7D32, #4CAF50)
- Animations (fade-in, hover effects)
- Responsive layouts

---

## 🗄️ Database (MongoDB)

### Collections
- `users` – User accounts with roles
- `camera_traps` – Camera devices
- `detections` – Detection events
- `emergency_alerts` – High-priority alerts
- `activity_logs` – Audit trail
- `system_metrics` – Performance data

---

## 👥 Team

- **Developer**: Sree
- **Institution**: MCA Program

---

<p align="center">
  🦁 <b>WildGuard - Protecting Wildlife Through Intelligent Monitoring</b><br>
  © 2025 WildGuard
</p>
