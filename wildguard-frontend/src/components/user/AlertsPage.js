import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaMapMarkerAlt, FaClock, FaFilter, FaSync, FaCheckCircle, FaEye, FaTimes } from 'react-icons/fa';
import { PageHeader, Section, AlertBadge } from '../shared/Layout';
import { Button } from '../shared/Button';
import { Form, FormGroup, Label, Select, FormRow } from '../shared/Form';
import api from '../../services/api';

/**
 * Real-Time Alerts Component
 * Display and filter active alerts with interactive functionality
 */
const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch alerts from API
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch alerts from last 2 days only
      const params = { days: 2 };
      if (filter !== 'all') {
        params.severity = filter;
      }
      const response = await api.getUserAlerts(params);

      if (response.success && response.data) {
        setAlerts(response.data);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setError('Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // View alert details
  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  // Mark alert as resolved (local only for now)
  const handleMarkResolved = (alertId) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'Resolved' }
        : alert
    ));
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Real-Time Alerts</h1>
            <p>Monitor and respond to active alerts</p>
          </div>
          <HeaderActions>
            <RefreshButton onClick={fetchAlerts} disabled={loading}>
              <FaSync className={loading ? 'spinning' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </RefreshButton>
            <LiveIndicator>
              <LiveDot /> Live
            </LiveIndicator>
          </HeaderActions>
        </HeaderContent>
        {error && <ErrorBanner>{error}</ErrorBanner>}
      </PageHeader>

      {/* Filter Section */}
      <Section>
        <FilterCard>
          <Form>
            <FormRow>
              <FormGroup>
                <Label><FaFilter /> Filter by Severity</Label>
                <Select value={filter} onChange={handleFilterChange}>
                  <option value="all">All Alerts</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </FormGroup>
              <AlertCount>
                Showing {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
              </AlertCount>
            </FormRow>
          </Form>
        </FilterCard>
      </Section>

      {/* Alerts List */}
      <Section>
        {loading && alerts.length === 0 ? (
          <LoadingMessage>Loading alerts...</LoadingMessage>
        ) : alerts.length === 0 ? (
          <EmptyMessage>
            <FaBell />
            <p>No alerts found</p>
          </EmptyMessage>
        ) : (
          <AlertsGrid>
            {alerts.map(alert => (
              <AlertCard key={alert.id} severity={alert.severity}>
                <AlertHeader>
                  <AlertBadge severity={alert.severity}>{alert.severity}</AlertBadge>
                  <AlertStatus status={alert.status || 'Active'}>
                    {alert.status || 'Active'}
                  </AlertStatus>
                </AlertHeader>

                <AlertTitle>{alert.type || 'Detection Alert'}</AlertTitle>

                <AlertInfo>
                  <InfoItem>
                    <FaMapMarkerAlt /> {alert.location || alert.camera_name || 'Unknown Location'}
                  </InfoItem>
                  <InfoItem>
                    <FaClock /> {alert.timestamp || 'Recent'}
                  </InfoItem>
                </AlertInfo>

                <AlertDescription>
                  {alert.description || `${alert.type} detected with ${(alert.confidence * 100).toFixed(0)}% confidence`}
                </AlertDescription>

                <AlertActions>
                  <ActionButton
                    variant="primary"
                    onClick={() => handleViewDetails(alert)}
                  >
                    <FaEye /> View Details
                  </ActionButton>
                  <ActionButton
                    variant="outline"
                    onClick={() => handleMarkResolved(alert.id)}
                    disabled={alert.status === 'Resolved'}
                  >
                    <FaCheckCircle /> {alert.status === 'Resolved' ? 'Resolved' : 'Mark Resolved'}
                  </ActionButton>
                </AlertActions>
              </AlertCard>
            ))}
          </AlertsGrid>
        )}
      </Section>

      {/* Alert Details Modal */}
      {showModal && selectedAlert && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Alert Details</h2>
              <CloseButton onClick={closeModal}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailRow>
                <DetailLabel>Type:</DetailLabel>
                <DetailValue>{selectedAlert.type || 'Detection'}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Severity:</DetailLabel>
                <AlertBadge severity={selectedAlert.severity}>{selectedAlert.severity}</AlertBadge>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Location:</DetailLabel>
                <DetailValue>{selectedAlert.location || selectedAlert.camera_name}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Time:</DetailLabel>
                <DetailValue>{selectedAlert.timestamp}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Confidence:</DetailLabel>
                <DetailValue>{(selectedAlert.confidence * 100).toFixed(1)}%</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Description:</DetailLabel>
                <DetailValue>{selectedAlert.description}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue>{selectedAlert.status || 'Active'}</DetailValue>
              </DetailRow>

              {/* Image Evidence */}
              {selectedAlert.image_url && (
                <MediaSection>
                  <MediaLabel>📷 Image Evidence</MediaLabel>
                  <MediaImage src={selectedAlert.image_url} alt="Detection" />
                </MediaSection>
              )}

              {/* Audio Evidence */}
              {selectedAlert.audio_url && (
                <MediaSection>
                  <MediaLabel>🔊 Audio Evidence</MediaLabel>
                  <AudioPlayer controls>
                    <source src={selectedAlert.audio_url} type="audio/wav" />
                    Your browser does not support audio playback.
                  </AudioPlayer>
                </MediaSection>
              )}
            </ModalBody>

            <ModalActions>
              <ActionButton
                variant="primary"
                onClick={() => {
                  handleMarkResolved(selectedAlert.id);
                  closeModal();
                }}
                disabled={selectedAlert.status === 'Resolved'}
              >
                <FaCheckCircle /> Mark as Resolved
              </ActionButton>
              <ActionButton variant="outline" onClick={closeModal}>
                Close
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
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

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
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

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.danger};
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const LiveDot = styled.span`
  width: 10px;
  height: 10px;
  background: ${props => props.theme.colors.white};
  border-radius: 50%;
  animation: blink 1s infinite;

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const ErrorBanner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
`;

const FilterCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
`;

const AlertCount = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  display: flex;
  align-items: center;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 40px;
  color: ${props => props.theme.colors.textSecondary};
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const AlertCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.xl};
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'critical': return props.theme.colors.critical || '#dc3545';
      case 'high': return props.theme.colors.high || '#fd7e14';
      case 'medium': return props.theme.colors.medium || '#ffc107';
      case 'low': return props.theme.colors.low || '#28a745';
      default: return props.theme.colors.info || '#17a2b8';
    }
  }};
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const AlertStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'Active' ? '#d4edda' : '#e2e3e5'};
  color: ${props => props.status === 'Active' ? '#155724' : '#6c757d'};
`;

const AlertTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 12px 0;
  font-size: 18px;
  text-transform: capitalize;
`;

const AlertInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const AlertDescription = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(Button)`
  flex: 1;
  font-size: 13px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  
  &:hover { color: #333; }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  min-width: 100px;
  color: #666;
`;

const DetailValue = styled.span`
  color: #333;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
`;

const MediaSection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const MediaLabel = styled.div`
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  font-size: 14px;
`;

const MediaImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  background: #f0f0f0;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 8px;
`;

export default AlertsPage;
