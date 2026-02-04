import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPaw, FaUserSecret, FaBell, FaChartLine, FaCamera, FaSync } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  StatCard, StatIcon, StatContent, StatLabel, StatValue, StatChange 
} from '../shared/Card';
import { Grid, PageHeader, Section } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shared/Table';
import { Badge } from '../shared/Layout';
import api from '../../services/api';

// Fallback mock data for when API is unavailable
const fallbackStats = {
  totalDetections: 0,
  animalsDetected: 0,
  humanIntrusions: 0,
  alertsGenerated: 0,
  activeCameras: 0
};

const fallbackTrendData = [
  { day: 'Mon', animals: 0, humans: 0, suspicious: 0 },
  { day: 'Tue', animals: 0, humans: 0, suspicious: 0 },
  { day: 'Wed', animals: 0, humans: 0, suspicious: 0 },
  { day: 'Thu', animals: 0, humans: 0, suspicious: 0 },
  { day: 'Fri', animals: 0, humans: 0, suspicious: 0 },
  { day: 'Sat', animals: 0, humans: 0, suspicious: 0 },
  { day: 'Sun', animals: 0, humans: 0, suspicious: 0 },
];

/**
 * Admin Dashboard Component
 * Displays overview statistics, detection trends, and recent activity
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(fallbackStats);
  const [trendData, setTrendData] = useState(fallbackTrendData);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getAdminDashboard();
      
      if (response.success) {
        const dashboard = response.dashboard;
        setStats({
          totalDetections: dashboard.total_detections || 0,
          animalsDetected: dashboard.animals_detected || 0,
          humanIntrusions: dashboard.human_intrusions || 0,
          alertsGenerated: dashboard.alerts_today || 0,
          activeCameras: dashboard.active_cameras || 0
        });
        
        if (dashboard.trend_data) {
          setTrendData(dashboard.trend_data);
        }
        
        if (dashboard.recent_activity) {
          setRecentActivity(dashboard.recent_activity);
        }
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
    <DashboardContainer>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Admin Dashboard</h1>
            <p>Real-time overview of wildlife monitoring system</p>
          </div>
          <RefreshButton onClick={fetchDashboardData} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} /> 
            {loading ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </HeaderContent>
        {error && <ErrorBanner>{error}</ErrorBanner>}
      </PageHeader>

      {/* Statistics Cards */}
      <Section>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
          <StatCard>
            <StatIcon color="primary">
              <FaChartLine />
            </StatIcon>
            <StatContent>
              <StatLabel>Total Detections</StatLabel>
              <StatValue>{stats.totalDetections}</StatValue>
              <StatChange positive>Today's count</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="success">
              <FaPaw />
            </StatIcon>
            <StatContent>
              <StatLabel>Animals Detected</StatLabel>
              <StatValue>{stats.animalsDetected}</StatValue>
              <StatChange positive>Wildlife activity</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="warning">
              <FaUserSecret />
            </StatIcon>
            <StatContent>
              <StatLabel>Human Intrusions</StatLabel>
              <StatValue>{stats.humanIntrusions}</StatValue>
              <StatChange>Potential threats</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="danger">
              <FaBell />
            </StatIcon>
            <StatContent>
              <StatLabel>Critical Alerts</StatLabel>
              <StatValue>{stats.alertsGenerated}</StatValue>
              <StatChange>Requires attention</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="info">
              <FaCamera />
            </StatIcon>
            <StatContent>
              <StatLabel>Active Cameras</StatLabel>
              <StatValue>{stats.activeCameras}</StatValue>
              <StatChange positive>Online now</StatChange>
            </StatContent>
          </StatCard>
        </Grid>
      </Section>

      {/* Detection Trend Chart */}
      <Section>
        <ChartCard>
          <ChartHeader>
            <h3>Detection Trends (Last 7 Days)</h3>
          </ChartHeader>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="animals" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  name="Animals"
                />
                <Line 
                  type="monotone" 
                  dataKey="humans" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                  name="Humans"
                />
                <Line 
                  type="monotone" 
                  dataKey="suspicious" 
                  stroke="#f44336" 
                  strokeWidth={2}
                  name="Suspicious"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </Section>

      {/* Recent Activity Table */}
      <Section>
        <ActivityCard>
          <ActivityHeader>
            <h3>Recent Activity</h3>
            <ViewAllLink href="#">View All</ViewAllLink>
          </ActivityHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <TypeBadge type={activity.type}>
                        {activity.type}
                      </TypeBadge>
                    </TableCell>
                    <TableCell>{activity.message}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(activity.severity)}>
                        {activity.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} style={{ textAlign: 'center', color: '#888' }}>
                    No recent activity
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ActivityCard>
      </Section>
    </DashboardContainer>
  );
};

// Helper function to map severity to badge variant
const getSeverityVariant = (severity) => {
  const map = {
    critical: 'danger',
    high: 'warning',
    warning: 'warning',
    info: 'info',
  };
  return map[severity] || 'info';
};

// Styled Components
const DashboardContainer = styled.div`
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

const ChartCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.xl};
`;

const ChartHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
  }
`;

const ChartContainer = styled.div`
  width: 100%;
`;

const ActivityCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.xl};
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
  }
`;

const ViewAllLink = styled.a`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.fontSizes.sm};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  background: ${props => {
    switch(props.type) {
      case 'detection': return props.theme.colors.success + '30';
      case 'alert': return props.theme.colors.danger + '30';
      case 'system': return props.theme.colors.info + '30';
      default: return props.theme.colors.gray + '30';
    }
  }};
  color: ${props => {
    switch(props.type) {
      case 'detection': return props.theme.colors.success;
      case 'alert': return props.theme.colors.danger;
      case 'system': return props.theme.colors.info;
      default: return props.theme.colors.gray;
    }
  }};
  text-transform: capitalize;
`;

export default AdminDashboard;