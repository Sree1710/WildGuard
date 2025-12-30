import React from 'react';
import styled from 'styled-components';
import { FaServer, FaCamera, FaMemory, FaMicrochip, FaWifi, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, Section, Grid } from '../shared/Layout';
import { Card } from '../shared/Card';
import { systemHealthMetrics } from '../../data/mockData';

/**
 * System Monitoring Component
 * Display system health and performance metrics
 */
const SystemMonitoring = () => {
  const { cpuUsage, memoryUsage, diskUsage, networkLatency, activeCameras, totalCameras, detectionAccuracy, uptime } = systemHealthMetrics;

  return (
    <Container>
      <PageHeader>
        <h1>System Monitoring</h1>
        <p>Monitor system health and performance metrics</p>
      </PageHeader>

      {/* System Status Overview */}
      <Section>
        <StatusCard>
          <StatusHeader>
            <StatusIcon status="healthy">
              <FaCheckCircle />
            </StatusIcon>
            <StatusInfo>
              <StatusTitle>System Status: Operational</StatusTitle>
              <StatusUptime>Uptime: {uptime}</StatusUptime>
            </StatusInfo>
          </StatusHeader>
        </StatusCard>
      </Section>

      {/* Performance Metrics */}
      <Section>
        <SectionTitle>Performance Metrics</SectionTitle>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
          <MetricCard>
            <MetricIcon color="#2196f3">
              <FaMicrochip />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>CPU Usage</MetricLabel>
              <ProgressBar>
                <ProgressFill width={cpuUsage} color={getStatusColor(cpuUsage)}>
                  {cpuUsage}%
                </ProgressFill>
              </ProgressBar>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#9c27b0">
              <FaMemory />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Memory Usage</MetricLabel>
              <ProgressBar>
                <ProgressFill width={memoryUsage} color={getStatusColor(memoryUsage)}>
                  {memoryUsage}%
                </ProgressFill>
              </ProgressBar>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#ff9800">
              <FaServer />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Disk Usage</MetricLabel>
              <ProgressBar>
                <ProgressFill width={diskUsage} color={getStatusColor(diskUsage)}>
                  {diskUsage}%
                </ProgressFill>
              </ProgressBar>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#4caf50">
              <FaWifi />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Network Latency</MetricLabel>
              <MetricValue>{networkLatency}ms</MetricValue>
              <MetricSubtext>Average response time</MetricSubtext>
            </MetricContent>
          </MetricCard>
        </Grid>
      </Section>

      {/* Camera Network Status */}
      <Section>
        <SectionTitle>Camera Network Status</SectionTitle>
        <Grid columns="repeat(auto-fit, minmax(300px, 1fr))">
          <CameraStatusCard>
            <CameraIcon status="active">
              <FaCamera />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Active Cameras</CameraLabel>
              <CameraValue>{activeCameras} / {totalCameras}</CameraValue>
              <ProgressBar>
                <ProgressFill 
                  width={(activeCameras / totalCameras) * 100} 
                  color="#4caf50"
                />
              </ProgressBar>
            </CameraInfo>
          </CameraStatusCard>

          <CameraStatusCard>
            <CameraIcon status="inactive">
              <FaExclamationTriangle />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Offline Cameras</CameraLabel>
              <CameraValue>{totalCameras - activeCameras}</CameraValue>
              <OfflineList>
                <li>CAM004 - East Sector</li>
                <li>CAM008 - West Sector</li>
                <li>CAM015 - South Sector</li>
                <li>CAM022 - North Sector</li>
              </OfflineList>
            </CameraInfo>
          </CameraStatusCard>

          <CameraStatusCard>
            <CameraIcon status="detection">
              <FaCheckCircle />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Detection Accuracy</CameraLabel>
              <CameraValue>{detectionAccuracy}%</CameraValue>
              <MetricSubtext>AI model performance</MetricSubtext>
            </CameraInfo>
          </CameraStatusCard>
        </Grid>
      </Section>

      {/* System Alerts */}
      <Section>
        <SectionTitle>Recent System Alerts</SectionTitle>
        <AlertsList>
          <AlertItem severity="warning">
            <AlertIcon>⚠️</AlertIcon>
            <AlertContent>
              <AlertTitle>Camera CAM008 offline for 2 hours</AlertTitle>
              <AlertTime>2 hours ago</AlertTime>
            </AlertContent>
          </AlertItem>
          <AlertItem severity="info">
            <AlertIcon>ℹ️</AlertIcon>
            <AlertContent>
              <AlertTitle>System maintenance scheduled for tomorrow</AlertTitle>
              <AlertTime>5 hours ago</AlertTime>
            </AlertContent>
          </AlertItem>
          <AlertItem severity="success">
            <AlertIcon>✅</AlertIcon>
            <AlertContent>
              <AlertTitle>Database backup completed successfully</AlertTitle>
              <AlertTime>8 hours ago</AlertTime>
            </AlertContent>
          </AlertItem>
        </AlertsList>
      </Section>
    </Container>
  );
};

// Helper function to get status color based on percentage
const getStatusColor = (percentage) => {
  if (percentage < 60) return '#4caf50';  // Green
  if (percentage < 80) return '#ff9800';  // Orange
  return '#f44336';  // Red
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const StatusCard = styled(Card)`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: ${props => props.theme.colors.white};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
`;

const StatusIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const StatusInfo = styled.div``;

const StatusTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  font-size: ${props => props.theme.fontSizes.xxl};
`;

const StatusUptime = styled.p`
  margin: 0;
  opacity: 0.9;
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetricCard = styled(Card)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
`;

const MetricIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.fontSizes.xxl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.textPrimary};
`;

const MetricSubtext = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: ${props => props.theme.spacing.xs};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 24px;
  background: ${props => props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.white};
  transition: width ${props => props.theme.transitions.normal};
`;

const CameraStatusCard = styled(Card)`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
`;

const CameraIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  background: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success + '20';
      case 'inactive': return props.theme.colors.danger + '20';
      case 'detection': return props.theme.colors.info + '20';
      default: return props.theme.colors.gray + '20';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'active': return props.theme.colors.success;
      case 'inactive': return props.theme.colors.danger;
      case 'detection': return props.theme.colors.info;
      default: return props.theme.colors.gray;
    }
  }};
`;

const CameraInfo = styled.div`
  flex: 1;
`;

const CameraLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CameraValue = styled.div`
  font-size: ${props => props.theme.fontSizes.xxl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const OfflineList = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${props => props.theme.spacing.md} 0 0 0;
  
  li {
    padding: ${props => props.theme.spacing.xs} 0;
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.danger};
    
    &:before {
      content: '• ';
      margin-right: ${props => props.theme.spacing.xs};
    }
  }
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const AlertItem = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'warning': return props.theme.colors.warning;
      case 'success': return props.theme.colors.success;
      case 'info': return props.theme.colors.info;
      default: return props.theme.colors.gray;
    }
  }};
`;

const AlertIcon = styled.div`
  font-size: 1.5rem;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const AlertTime = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

export default SystemMonitoring;
