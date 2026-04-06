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

## Process Flow

The following process flow diagram illustrates the working of the proposed system, "WildGuard – Intelligent Wildlife Monitoring and Anti-Poaching System." It captures the various stages involved in the transformation of raw field sensor data into meaningful outputs like wildlife detections, threat alerts, emergency notifications, and analytical reports.

### 1. Data Collection
The system begins with the collection of raw field data from deployed camera traps. Each camera trap captures two types of input:
- **Image data** – Visual frames from camera sensors positioned across the conservation area
- **Audio data** – Acoustic recordings from microphones attached to camera traps

These multimodal inputs form the core evidence for wildlife detection and poaching threat identification. This stage is critical as it lays the foundation for all downstream ML inference and alerting.

### 2. Data Preprocessing
The collected data is preprocessed to prepare it for machine learning inference:
- **Image preprocessing** – Resizing, normalization, and format conversion using OpenCV and Pillow
- **Audio preprocessing** – Feature extraction using librosa, including 20 MFCC (Mel-Frequency Cepstral Coefficients) features, spectral analysis, and signal normalization
- **Data augmentation** – Applied during model training to improve generalization across diverse field conditions

This step ensures that the raw sensor data is cleaned and converted into a machine-readable format, suitable for model inference.

### 3. Model Training
The preprocessed data is used to train two specialized machine learning models:
- **YOLOv8 (Image Detection)** – Trained using the Ultralytics framework to detect and classify objects in camera trap images (Elephant, Tiger, Deer, Human, Vehicle) with ~92% accuracy
- **Random Forest (Audio Classification)** – Trained using scikit-learn on 20 MFCC features to classify sound events (Gunshot, Chainsaw, Animal, Human, Vehicle) with ~89% accuracy

Training experiments, datasets, and saved model weights are managed under the `ml_experiments/` module.

### 4. Image Detection
When a new image is captured, the system runs YOLOv8-based object detection:
- Identifies objects present in the image (animals, humans, vehicles)
- Produces bounding box coordinates for each detected object
- Assigns a confidence score (0–1) to each detection
- Maps detections to alert levels based on detected object type

This module operates through the `ImageDetector` service within `ml_services/`.

### 5. Audio Classification
Simultaneously, audio recordings are processed through the Random Forest classifier:
- Extracts MFCC features from the audio signal
- Classifies the sound into predefined categories (gunshot, chainsaw, animal call, etc.)
- Produces classification probabilities for each sound class
- Flags threat-related sounds for escalation

This module operates through the `AudioDetector` service within `ml_services/`.

### 6. Late Fusion (Multimodal Decision Fusion)
When both image and audio evidence are available, the system combines them using a Late Fusion Engine:
- **Weighted average** of confidence scores (α=0.6 visual, β=0.4 audio)
- **Corroboration boosting** – When both modalities agree on a threat category (e.g., Human + Gunshot), confidence is boosted by up to 15% based on the principle that independent sensor agreement increases prediction reliability
- **Cross-modal escalation** – Specific combinations trigger automatic alert escalation (e.g., Human + Gunshot → Critical: Armed Poacher)
- **Single-modality fallback** – Works with image-only or audio-only input when one modality is unavailable

This ensures higher-confidence predictions through multimodal evidence fusion.

### 7. Alert Generation and Emergency Response
Based on the detection and fusion results, the system generates priority-based alerts:
- 🔴 **Critical** – Human/Poacher detected, Gunshot heard
- 🟠 **High** – Vehicle in restricted zone, Chainsaw detected
- 🟡 **Medium** – Unusual or unverified activity
- 🟢 **Low** – Normal wildlife activity

For critical and high-severity events, the system automatically creates **Emergency Alerts** with location details, source camera information, and linked detection evidence, enabling rapid ranger response.

### 8. Detection Verification and Feedback
Administrators review and verify detection results through the admin panel:
- Verify or mark detections as false positives
- Add notes and resolution details to emergency alerts
- Resolve emergency alerts and track responding rangers

This human-in-the-loop verification ensures system accuracy and continuously improves detection quality.

### 9. User Interface
An intuitive and responsive user interface built with React JS allows users to:
- **Admin Module** – View system-wide dashboards, manage camera traps (CRUD), review detection history, triage emergency alerts, and monitor system health
- **User Module** – View personal dashboards, browse alerts and activity timeline, inspect detection evidence, access emergency contact information, and generate PDF/JSON analytical reports
- **Authentication** – Secure login, registration, password recovery, and role-based access control (Admin/User)

The interface ensures a smooth experience for both administrators and field rangers.

### 10. Data Storage
All information—including user accounts, camera trap configurations, detection events, emergency alerts, and activity logs—is stored securely in **MongoDB Atlas**. This data is used for:
- Generating analytical reports and PDF exports
- Tracking detection trends and system performance
- Maintaining an audit trail of all user activities
- Supporting dashboard analytics with real-time aggregations

It ensures data persistence, cloud-based accessibility, and supports scalability of the system.

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
│   │   ├── audio_detector.py       # Random Forest classifier
│   │   └── late_fusion.py          # Multimodal late fusion engine
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
│       │   │   ├── ForgotPassword.js
│       │   │   ├── ResetPassword.js
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
| POST | `/api/auth/register/` | Register |
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


---

<p align="center">
  🦁 <b>WildGuard - Protecting Wildlife Through Intelligent Monitoring</b><br>
  © 2025 WildGuard
</p>
