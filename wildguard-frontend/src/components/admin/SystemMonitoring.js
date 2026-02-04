import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaServer, FaCamera, FaMemory, FaMicrochip, FaWifi, FaCheckCircle, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { PageHeader, Section, Grid } from '../shared/Layout';
import { Card } from '../shared/Card';
import api from '../../services/api';

/**
 * System Monitoring Component
 * Display real-time system health and performance metrics from API
 */
const SystemMonitoring = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.getSystemMonitoring();
      if (response.success && response.data) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
      setError('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state
  if (loading && !metrics) {
    return (
      <Container>
        <PageHeader>
          <h1>System Monitoring</h1>
          <p>Loading metrics...</p>
        </PageHeader>
      </Container>
    );
  }

  // Default values if metrics not available
  const cameraMetrics = metrics?.camera_metrics || {
    total_cameras: 0,
    active_cameras: 0,
    online_cameras: 0,
    offline_cameras: 0
  };

  const detectionMetrics = metrics?.detection_metrics || {
    detections_today: 0,
    alerts_today: 0,
    total_detections: 0,
    false_positive_rate: 0
  };

  const systemHealth = metrics?.system_health || {
    avg_inference_time_ms: 0,
    database_size_mb: 0,
    uptime_percentage: 99.9
  };

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>System Monitoring</h1>
            <p>Real-time system health and performance metrics</p>
          </div>
          <RefreshButton onClick={fetchMetrics} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </HeaderContent>
      </PageHeader>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* System Status Overview */}
      <Section>
        <StatusCard>
          <StatusHeader>
            <StatusIcon status="healthy">
              <FaCheckCircle />
            </StatusIcon>
            <StatusInfo>
              <StatusTitle>System Status: Operational</StatusTitle>
              <StatusUptime>Uptime: {systemHealth.uptime_percentage}%</StatusUptime>
            </StatusInfo>
          </StatusHeader>
        </StatusCard>
      </Section>

      {/* Camera Network Status - Using Real Data */}
      <Section>
        <SectionTitle>Camera Network Status</SectionTitle>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
          <CameraStatusCard>
            <CameraIcon status="active">
              <FaCamera />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Total Cameras</CameraLabel>
              <CameraValue>{cameraMetrics.total_cameras}</CameraValue>
            </CameraInfo>
          </CameraStatusCard>

          <CameraStatusCard>
            <CameraIcon status="active">
              <FaCheckCircle />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Active Cameras</CameraLabel>
              <CameraValue>{cameraMetrics.active_cameras}</CameraValue>
              <ProgressBar>
                <ProgressFill
                  width={cameraMetrics.total_cameras > 0 ? (cameraMetrics.active_cameras / cameraMetrics.total_cameras) * 100 : 0}
                  color="#4caf50"
                />
              </ProgressBar>
            </CameraInfo>
          </CameraStatusCard>

          <CameraStatusCard>
            <CameraIcon status="detection">
              <FaWifi />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Online Cameras</CameraLabel>
              <CameraValue>{cameraMetrics.online_cameras}</CameraValue>
            </CameraInfo>
          </CameraStatusCard>

          <CameraStatusCard>
            <CameraIcon status="inactive">
              <FaExclamationTriangle />
            </CameraIcon>
            <CameraInfo>
              <CameraLabel>Offline Cameras</CameraLabel>
              <CameraValue>{cameraMetrics.offline_cameras}</CameraValue>
            </CameraInfo>
          </CameraStatusCard>
        </Grid>
      </Section>

      {/* Detection Metrics */}
      <Section>
        <SectionTitle>Detection Metrics</SectionTitle>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
          <MetricCard>
            <MetricIcon color="#2196f3">
              <FaCamera />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Detections Today</MetricLabel>
              <MetricValue>{detectionMetrics.detections_today}</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#f44336">
              <FaExclamationTriangle />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Alerts Today</MetricLabel>
              <MetricValue>{detectionMetrics.alerts_today}</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#9c27b0">
              <FaServer />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Total Detections</MetricLabel>
              <MetricValue>{detectionMetrics.total_detections}</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#ff9800">
              <FaCheckCircle />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>False Positive Rate</MetricLabel>
              <MetricValue>{detectionMetrics.false_positive_rate}%</MetricValue>
            </MetricContent>
          </MetricCard>
        </Grid>
      </Section>

      {/* System Performance */}
      <Section>
        <SectionTitle>System Performance</SectionTitle>
        <Grid columns="repeat(auto-fit, minmax(250px, 1fr))">
          <MetricCard>
            <MetricIcon color="#4caf50">
              <FaMicrochip />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Avg Inference Time</MetricLabel>
              <MetricValue>{systemHealth.avg_inference_time_ms}ms</MetricValue>
              <MetricSubtext>AI model processing time</MetricSubtext>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#2196f3">
              <FaMemory />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Database Size</MetricLabel>
              <MetricValue>{systemHealth.database_size_mb}MB</MetricValue>
              <MetricSubtext>Total storage used</MetricSubtext>
            </MetricContent>
          </MetricCard>
        </Grid>
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
  align-items: center;
  justify-content: space-between;
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
  
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  
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
  margin: 16px 0;
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
  height: 8px;
  background: ${props => props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.sm};
`;

const ProgressFill = styled.div`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color || props.theme.colors.primary};
  transition: width 0.3s ease;
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
    switch (props.status) {
      case 'active': return props.theme.colors.success + '20';
      case 'inactive': return props.theme.colors.danger + '20';
      case 'detection': return props.theme.colors.info + '20';
      default: return props.theme.colors.gray + '20';
    }
  }};
  color: ${props => {
    switch (props.status) {
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

export default SystemMonitoring;
