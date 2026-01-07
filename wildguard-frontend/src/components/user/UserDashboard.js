import React from 'react';
import styled from 'styled-components';
import { FaBell, FaExclamationTriangle, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { PageHeader, Section, Grid, AlertBadge } from '../shared/Layout';
import { StatCard, StatIcon, StatContent, StatLabel, StatValue } from '../shared/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shared/Table';
import { dashboardStats, recentActivity, alertsData } from '../../data/mockData';

/**
 * User Dashboard Component
 * Live alerts and quick stats for field staff
 */
const UserDashboard = () => {
  const criticalAlerts = alertsData.filter(a => a.severity === 'critical');
  const activeAlerts = alertsData.filter(a => a.status === 'Active');

  return (
    <Container>
      <PageHeader>
        <h1>Field Ranger Dashboard</h1>
        <p>Real-time alerts and detection overview</p>
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
              <StatValue>{dashboardStats.todayAlerts}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="warning">
              <FaExclamationTriangle />
            </StatIcon>
            <StatContent>
              <StatLabel>Active Alerts</StatLabel>
              <StatValue>{activeAlerts.length}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="success">
              <FaMapMarkerAlt />
            </StatIcon>
            <StatContent>
              <StatLabel>Active Zones</StatLabel>
              <StatValue>{dashboardStats.activeZones}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="info">
              <FaClock />
            </StatIcon>
            <StatContent>
              <StatLabel>Recent Detections</StatLabel>
              <StatValue>{dashboardStats.animalsDetected}</StatValue>
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
              {recentActivity.slice(0, 5).map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.message}</TableCell>
                  <TableCell>{activity.time}</TableCell>
                  <TableCell>
                    <AlertBadge severity={activity.severity}>
                      {activity.severity}
                    </AlertBadge>
                  </TableCell>
                </TableRow>
              ))}
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
