/**
 * API Service Layer for WildGuard
 * ================================
 * Centralized API communication with JWT authentication.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * API client with automatic token handling
 */
class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get stored access token
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Store tokens after login
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  /**
   * Clear tokens on logout
   */
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Build headers with authentication
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearTokens();
      }
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  }

  /**
   * Generic API request method
   */
  async request(endpoint, options = {}) {
    const { method = 'GET', body, auth = true } = options;

    const config = {
      method,
      headers: this.getHeaders(auth),
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // =====================
  // AUTH ENDPOINTS
  // =====================

  async login(username, password) {
    const data = await this.request('/auth/login/', {
      method: 'POST',
      body: { username, password },
      auth: false,
    });

    if (data.success) {
      this.setTokens(data.access_token, data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout/', { method: 'POST' });
    } catch {
      // Ignore logout errors
    } finally {
      this.clearTokens();
    }
  }

  async getProfile() {
    return this.request('/auth/profile/');
  }

  // =====================
  // ADMIN ENDPOINTS
  // =====================

  async getAdminDashboard() {
    return this.request('/admin/dashboard/');
  }





  async getCameraList() {
    return this.request('/admin/cameras/');
  }

  async createCamera(cameraData) {
    return this.request('/admin/cameras/create/', {
      method: 'POST',
      body: cameraData,
    });
  }

  async updateCamera(cameraId, cameraData) {
    return this.request(`/admin/cameras/${cameraId}/`, {
      method: 'PUT',
      body: cameraData,
    });
  }

  async deleteCamera(cameraId) {
    return this.request(`/admin/cameras/${cameraId}/`, {
      method: 'DELETE',
    });
  }

  async getEmergencyAlerts() {
    return this.request('/admin/emergency/');
  }

  async resolveEmergency(alertId, resolution) {
    return this.request(`/admin/emergency/${alertId}/resolve/`, {
      method: 'POST',
      body: resolution,
    });
  }

  async getSystemMonitoring() {
    return this.request('/admin/system-monitoring/');
  }

  // =====================
  // DETECTION ENDPOINTS
  // =====================

  async getDetections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/detections/?${queryString}` : '/detections/';
    return this.request(endpoint);
  }

  async getDetectionDetail(detectionId) {
    return this.request(`/detections/${detectionId}/`);
  }

  async verifyDetection(detectionId, verificationData) {
    return this.request(`/detections/${detectionId}/verify/`, {
      method: 'POST',
      body: verificationData,
    });
  }

  // =====================
  // USER ENDPOINTS
  // =====================

  async getUserDashboard() {
    return this.request('/user/dashboard/');
  }

  async getUserAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/user/alerts/?${queryString}` : '/user/alerts/';
    return this.request(endpoint);
  }

  async getActivityTimeline(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/user/activity-timeline/?${queryString}` : '/user/activity-timeline/';
    return this.request(endpoint);
  }

  async getEvidence(detectionId) {
    return this.request(`/user/evidence/${detectionId}/`);
  }

  async getUserReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/user/reports/?${queryString}` : '/user/reports/';
    return this.request(endpoint);
  }

  async getEmergencyInfo() {
    return this.request('/user/emergency-info/');
  }
}

// Export singleton instance
const api = new ApiService();
export default api;
