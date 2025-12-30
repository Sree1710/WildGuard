/**
 * Mock Data for WildGuard Application
 * Contains sample data for all features
 */

// Dashboard Statistics
export const dashboardStats = {
  totalDetections: 1248,
  animalsDetected: 892,
  humanIntrusions: 156,
  alertsGenerated: 45,
  activeCameras: 28,
  inactiveCameras: 4,
  todayAlerts: 12,
  activeZones: 8,
};

// Species Data
export const speciesData = [
  { id: 1, name: 'Bengal Tiger', category: 'Mammal', riskLevel: 'Critical', notes: 'Endangered species, priority monitoring' },
  { id: 2, name: 'Asian Elephant', category: 'Mammal', riskLevel: 'High', notes: 'Track migration patterns' },
  { id: 3, name: 'Indian Leopard', category: 'Mammal', riskLevel: 'High', notes: 'Nocturnal hunter' },
  { id: 4, name: 'Sloth Bear', category: 'Mammal', riskLevel: 'Medium', notes: 'Common in forest regions' },
  { id: 5, name: 'Sambar Deer', category: 'Mammal', riskLevel: 'Low', notes: 'Prey species monitoring' },
  { id: 6, name: 'Wild Boar', category: 'Mammal', riskLevel: 'Low', notes: 'Population control needed' },
  { id: 7, name: 'Peacock', category: 'Bird', riskLevel: 'Low', notes: 'National bird protection' },
  { id: 8, name: 'King Cobra', category: 'Reptile', riskLevel: 'Medium', notes: 'Venomous species' },
];

// Camera Trap Data
export const cameraTrapData = [
  { id: 'CAM001', zone: 'North Sector', gps: '28.6139° N, 77.2090° E', status: 'Active', lastPing: '2 mins ago' },
  { id: 'CAM002', zone: 'North Sector', gps: '28.6150° N, 77.2100° E', status: 'Active', lastPing: '5 mins ago' },
  { id: 'CAM003', zone: 'East Sector', gps: '28.6200° N, 77.2200° E', status: 'Active', lastPing: '1 min ago' },
  { id: 'CAM004', zone: 'East Sector', gps: '28.6210° N, 77.2210° E', status: 'Inactive', lastPing: '2 hours ago' },
  { id: 'CAM005', zone: 'South Sector', gps: '28.6100° N, 77.2050° E', status: 'Active', lastPing: '3 mins ago' },
  { id: 'CAM006', zone: 'South Sector', gps: '28.6110° N, 77.2060° E', status: 'Active', lastPing: '4 mins ago' },
  { id: 'CAM007', zone: 'West Sector', gps: '28.6050° N, 77.2000° E', status: 'Active', lastPing: '6 mins ago' },
  { id: 'CAM008', zone: 'West Sector', gps: '28.6060° N, 77.2010° E', status: 'Inactive', lastPing: '1 hour ago' },
];

// Detection History
export const detectionHistory = [
  {
    id: 'DET001',
    type: 'Animal',
    species: 'Bengal Tiger',
    timestamp: '2025-12-30 14:23:15',
    location: 'North Sector - CAM001',
    zone: 'North Sector',
    confidence: 0.95,
    image: 'tiger-detection.jpg',
    severity: 'info',
  },
  {
    id: 'DET002',
    type: 'Human',
    species: 'Unauthorized Person',
    timestamp: '2025-12-30 13:45:22',
    location: 'East Sector - CAM003',
    zone: 'East Sector',
    confidence: 0.89,
    image: 'human-detection.jpg',
    severity: 'high',
  },
  {
    id: 'DET003',
    type: 'Suspicious',
    species: 'Potential Poaching Activity',
    timestamp: '2025-12-30 12:10:45',
    location: 'South Sector - CAM005',
    zone: 'South Sector',
    confidence: 0.78,
    image: 'suspicious-activity.jpg',
    severity: 'critical',
  },
  {
    id: 'DET004',
    type: 'Animal',
    species: 'Asian Elephant',
    timestamp: '2025-12-30 11:30:10',
    location: 'West Sector - CAM007',
    zone: 'West Sector',
    confidence: 0.92,
    image: 'elephant-detection.jpg',
    severity: 'info',
  },
  {
    id: 'DET005',
    type: 'Animal',
    species: 'Indian Leopard',
    timestamp: '2025-12-30 10:15:33',
    location: 'North Sector - CAM002',
    zone: 'North Sector',
    confidence: 0.87,
    image: 'leopard-detection.jpg',
    severity: 'info',
  },
  {
    id: 'DET006',
    type: 'Human',
    species: 'Unauthorized Person',
    timestamp: '2025-12-30 09:50:18',
    location: 'East Sector - CAM004',
    zone: 'East Sector',
    confidence: 0.91,
    image: 'human-detection-2.jpg',
    severity: 'medium',
  },
];

// Emergency Contacts
export const emergencyContacts = [
  { id: 1, name: 'Ranger Station Alpha', role: 'Field Operations', phone: '+91-9876543210', location: 'North Sector' },
  { id: 2, name: 'Wildlife Vet Unit', role: 'Medical Support', phone: '+91-9876543211', location: 'Central Hub' },
  { id: 3, name: 'Forest Department HQ', role: 'Administration', phone: '+91-9876543212', location: 'Main Office' },
  { id: 4, name: 'Anti-Poaching Squad', role: 'Security', phone: '+91-9876543213', location: 'Mobile Unit' },
  { id: 5, name: 'Ranger Station Beta', role: 'Field Operations', phone: '+91-9876543214', location: 'South Sector' },
];

// Recent Activity (for dashboard)
export const recentActivity = [
  { id: 1, type: 'detection', message: 'Bengal Tiger detected in North Sector', time: '5 mins ago', severity: 'info' },
  { id: 2, type: 'alert', message: 'Unauthorized human detected in East Sector', time: '15 mins ago', severity: 'high' },
  { id: 3, type: 'system', message: 'Camera CAM004 went offline', time: '1 hour ago', severity: 'warning' },
  { id: 4, type: 'detection', message: 'Asian Elephant herd detected in West Sector', time: '2 hours ago', severity: 'info' },
  { id: 5, type: 'alert', message: 'Suspicious activity in South Sector', time: '3 hours ago', severity: 'critical' },
];

// Detection Trend Data (for charts)
export const detectionTrendData = [
  { day: 'Mon', animals: 45, humans: 3, suspicious: 1 },
  { day: 'Tue', animals: 52, humans: 5, suspicious: 2 },
  { day: 'Wed', animals: 48, humans: 2, suspicious: 0 },
  { day: 'Thu', animals: 61, humans: 4, suspicious: 1 },
  { day: 'Fri', animals: 55, humans: 6, suspicious: 3 },
  { day: 'Sat', animals: 58, humans: 8, suspicious: 2 },
  { day: 'Sun', animals: 50, humans: 4, suspicious: 1 },
];

// Alerts Data (for user module)
export const alertsData = [
  {
    id: 'ALT001',
    type: 'Poaching Suspected',
    timestamp: '2025-12-30 14:30:00',
    location: 'South Sector - Zone 5',
    severity: 'critical',
    status: 'Active',
    description: 'Multiple unauthorized humans detected with suspicious equipment',
  },
  {
    id: 'ALT002',
    type: 'Human Intrusion',
    timestamp: '2025-12-30 13:45:00',
    location: 'East Sector - Zone 3',
    severity: 'high',
    status: 'Active',
    description: 'Unauthorized person detected near protected area',
  },
  {
    id: 'ALT003',
    type: 'Camera Offline',
    timestamp: '2025-12-30 12:00:00',
    location: 'West Sector - CAM008',
    severity: 'medium',
    status: 'Investigating',
    description: 'Camera trap stopped transmitting data',
  },
  {
    id: 'ALT004',
    type: 'Wildlife Movement',
    timestamp: '2025-12-30 11:20:00',
    location: 'North Sector - Zone 1',
    severity: 'low',
    status: 'Resolved',
    description: 'Tiger spotted near village perimeter',
  },
];

// Audio Evidence Data
export const audioEvidence = [
  {
    id: 'AUD001',
    type: 'Gunshot',
    timestamp: '2025-12-30 14:25:00',
    location: 'South Sector',
    confidence: 0.88,
    duration: '2.3s',
    audioFile: 'gunshot-detection.mp3',
  },
  {
    id: 'AUD002',
    type: 'Chainsaw',
    timestamp: '2025-12-30 10:15:00',
    location: 'East Sector',
    confidence: 0.76,
    duration: '15.2s',
    audioFile: 'chainsaw-detection.mp3',
  },
];

// Timeline Events
export const timelineEvents = [
  {
    id: 1,
    time: '14:30',
    date: '2025-12-30',
    event: 'Critical Alert - Poaching Suspected',
    severity: 'critical',
    location: 'South Sector',
    details: 'Multiple unauthorized humans with equipment',
  },
  {
    id: 2,
    time: '13:45',
    date: '2025-12-30',
    event: 'Human Intrusion Detected',
    severity: 'high',
    location: 'East Sector',
    details: 'Unauthorized person detected',
  },
  {
    id: 3,
    time: '12:10',
    date: '2025-12-30',
    event: 'Suspicious Activity',
    severity: 'medium',
    location: 'South Sector',
    details: 'Unusual movement patterns detected',
  },
  {
    id: 4,
    time: '11:30',
    date: '2025-12-30',
    event: 'Elephant Herd Detected',
    severity: 'low',
    location: 'West Sector',
    details: 'Asian Elephant family group',
  },
  {
    id: 5,
    time: '10:15',
    date: '2025-12-30',
    event: 'Tiger Sighting',
    severity: 'low',
    location: 'North Sector',
    details: 'Bengal Tiger adult male',
  },
];

// System Health Metrics
export const systemHealthMetrics = {
  cpuUsage: 45,
  memoryUsage: 62,
  diskUsage: 38,
  networkLatency: 23,
  activeCameras: 28,
  totalCameras: 32,
  detectionAccuracy: 92,
  uptime: '15 days 8 hours',
};
