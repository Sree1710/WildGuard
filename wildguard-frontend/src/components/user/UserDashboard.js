import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaExclamationTriangle, FaMapMarkerAlt, FaClock, FaSync } from 'react-icons/fa';
import { PageHeader, Section, Grid, AlertBadge } from '../shared/Layout';
import { StatCard, StatIcon, StatContent, StatLabel, StatValue } from '../shared/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shared/Table';
import api from '../../services/api';

// Fallback data when API is unavailable
const fallbackStats = {
  todayAlerts: 0,
  activeAlerts: 0,
  activeZones: 0,
  recentDetections: 0
};

/**
 * User Dashboard Component
 * Live alerts and quick stats for field staff
 */
const UserDashboard = () => {
  const [stats, setStats] = useState(fallbackStats);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user dashboard data
      const dashboardResponse = await api.getUserDashboard();
      
      if (dashboardResponse.success) {
        const dashboard = dashboardResponse.dashboard;
        setStats({
          todayAlerts: dashboard.stats_today?.alerts || 0,
          activeAlerts: dashboard.stats_today?.alerts || 0,
          activeZones: dashboard.assigned_cameras || 0,
          recentDetections: dashboard.stats_today?.detections || 0
        });
        
        // Convert recent detections to activity format
        if (dashboard.recent_detections) {
          setRecentActivity(dashboard.recent_detections.map(det => ({
            id: det.id,
            message: `${det.object} detected at ${det.camera_name}`,
            time: det.timestamp ? new Date(det.timestamp).toLocaleTimeString() : 'Unknown',
            severity: det.alert_level || 'info'
          })));
        }
      }
      
      // Fetch alerts for critical alerts panel
      const alertsResponse = await api.getUserAlerts({ severity: 'critical' });
      if (alertsResponse.success && alertsResponse.data) {
        setCriticalAlerts(alertsResponse.data.filter(a => a.severity === 'critical'));
      }
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Field Ranger Dashboard</h1>
            <p>Real-time alerts and detection overview</p>
          </div>
          <RefreshButton onClick={fetchDashboardData} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} /> 
            {loading ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </HeaderContent>
        {error && <ErrorBanner>{error}</ErrorBanner>}
      </PageHeader>

      {/* Quick Stats */}
      <Section>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
          <StatCard>
            <StatIcon color="danger">
              <FaBell />
            </StatIcon>
            <StatContent>
              <StatLabel>Today's Alerts</StatLabel>
              <StatValue>{stats.todayAlerts}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="warning">
              <FaExclamationTriangle />
            </StatIcon>
            <StatContent>
              <StatLabel>Active Alerts</StatLabel>
              <StatValue>{stats.activeAlerts}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="success">
              <FaMapMarkerAlt />
            </StatIcon>
            <StatContent>
              <StatLabel>Active Zones</StatLabel>
              <StatValue>{stats.activeZones}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="info">
              <FaClock />
            </StatIcon>
            <StatContent>
              <StatLabel>Recent Detections</StatLabel>
              <StatValue>{stats.recentDetections}</StatValue>
            </StatContent>
          </StatCard>
        </Grid>
      </Section>

      {/* Critical Alerts Panel */}
      {criticalAlerts.length > 0 && (
        <Section>
          <AlertPanel>
            <AlertPanelHeader>
              <h3>🚨 Critical Alerts - Immediate Action Required</h3>
            </AlertPanelHeader>
            {criticalAlerts.map(alert => (
              <CriticalAlertCard key={alert.id}>
                <AlertCardHeader>
                  <AlertBadge severity={alert.severity}>{alert.severity}</AlertBadge>
                  <AlertType>{alert.type}</AlertType>
                </AlertCardHeader>
                <AlertLocation>
                  <FaMapMarkerAlt /> {alert.location}
                </AlertLocation>
                <AlertDescription>{alert.description}</AlertDescription>
                <AlertTime>
                  <FaClock /> {alert.timestamp}
                </AlertTime>
              </CriticalAlertCard>
            ))}
          </AlertPanel>
        </Section>
      )}

      {/* Recent Activity */}
      <Section>
        <ActivityCard>
          <ActivityHeader>
            <h3>Recent Activity</h3>
          </ActivityHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.message}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                    <TableCell>
                      <AlertBadge severity={activity.severity}>
                        {activity.severity}
                      </AlertBadge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} style={{ textAlign: 'center', color: '#888' }}>
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ActivityCard>
      </Section>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorBanner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  font-size: 14px;
`;

const AlertPanel = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.critical}10 0%, ${props => props.theme.colors.danger}10 100%);
  border: 2px solid ${props => props.theme.colors.critical};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
`;

const AlertPanelHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h3 {
    color: ${props => props.theme.colors.critical};
    margin: 0;
    font-size: ${props => props.theme.fontSizes.xl};
  }
`;

const CriticalAlertCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AlertType = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const AlertLocation = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  svg {
    color: ${props => props.theme.colors.danger};
  }
`;

const AlertDescription = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  margin: ${props => props.theme.spacing.sm} 0;
`;

const AlertTime = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  
  svg {
    color: ${props => props.theme.colors.info};
  }
`;

const ActivityCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.xl};
`;

const ActivityHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
  }
`;

export default UserDashboard;
