import React from 'react';
import styled from 'styled-components';
import { FaPaw, FaUserSecret, FaBell, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  StatCard, StatIcon, StatContent, StatLabel, StatValue, StatChange 
} from '../shared/Card';
import { Grid, PageHeader, Section } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shared/Table';
import { Badge } from '../shared/Layout';
import { dashboardStats, recentActivity, detectionTrendData } from '../../data/mockData';

/**
 * Admin Dashboard Component
 * Displays overview statistics, detection trends, and recent activity
 */
const AdminDashboard = () => {
  return (
    <DashboardContainer>
      <PageHeader>
        <h1>Admin Dashboard</h1>
        <p>Real-time overview of wildlife monitoring system</p>
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
              <StatValue>{dashboardStats.totalDetections}</StatValue>
              <StatChange positive>+12% from last week</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="success">
              <FaPaw />
            </StatIcon>
            <StatContent>
              <StatLabel>Animals Detected</StatLabel>
              <StatValue>{dashboardStats.animalsDetected}</StatValue>
              <StatChange positive>+8% from last week</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="warning">
              <FaUserSecret />
            </StatIcon>
            <StatContent>
              <StatLabel>Human Intrusions</StatLabel>
              <StatValue>{dashboardStats.humanIntrusions}</StatValue>
              <StatChange>-3% from last week</StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="danger">
              <FaBell />
            </StatIcon>
            <StatContent>
              <StatLabel>Critical Alerts</StatLabel>
              <StatValue>{dashboardStats.alertsGenerated}</StatValue>
              <StatChange>+5% from last week</StatChange>
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
              <LineChart data={detectionTrendData}>
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
              {recentActivity.map((activity) => (
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
              ))}
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
