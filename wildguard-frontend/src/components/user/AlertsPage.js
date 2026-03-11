import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaMapMarkerAlt, FaClock, FaFilter, FaSync, FaCheckCircle, FaEye, FaTimes, FaBolt, FaCloudUploadAlt, FaCamera, FaImage, FaVolumeUp, FaUpload, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { PageHeader, Section, AlertBadge } from '../shared/Layout';
import { Button } from '../shared/Button';
import { Form, FormGroup, Label, Select, FormRow } from '../shared/Form';
import api from '../../services/api';

/**
 * Real-Time Alerts Component
 * Display and filter active alerts with interactive functionality
 * Includes Live Detection: Upload image + audio for real-time ML analysis
 */
const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Live Detection state
  const [showLiveDetection, setShowLiveDetection] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [liveDetections, setLiveDetections] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch alerts from API
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);

    try {
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
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  // Fetch cameras when live detection is opened
  useEffect(() => {
    if (showLiveDetection) {
      fetchCameras();
      fetchLiveDetections();
    }
  }, [showLiveDetection]);

  const fetchCameras = async () => {
    try {
      const response = await api.getUserCameras();
      if (response.success) {
        setCameras(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    }
  };

  const fetchLiveDetections = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.getLiveDetections();
      if (response.success) {
        setLiveDetections(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch live detections:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!imageFile && !audioFile) {
      setUploadError('Please upload at least one file (image or audio)');
      return;
    }

    setUploading(true);
    setLiveResult(null);

    try {
      const formData = new FormData();
      if (selectedCamera) {
        formData.append('camera_trap', selectedCamera);
      }
      if (imageFile) formData.append('image', imageFile);
      if (audioFile) formData.append('audio', audioFile);

      const response = await api.uploadLiveDetection(formData);
      if (response.success) {
        setLiveResult(response.detection);
        fetchLiveDetections();
        fetchAlerts();
      } else {
        setUploadError(response.error || 'Upload failed');
      }
    } catch (error) {
      setUploadError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setImageFile(null);
    setAudioFile(null);
    setSelectedCamera('');
    setLiveResult(null);
    setUploadError('');
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowModal(true);
  };

  const handleMarkResolved = (alertId) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'Resolved' }
        : alert
    ));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAlert(null);
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
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
            <LiveDetectionToggle
              onClick={() => setShowLiveDetection(!showLiveDetection)}
              active={showLiveDetection}
            >
              <FaBolt /> Live Detection {showLiveDetection ? <FaChevronUp /> : <FaChevronDown />}
            </LiveDetectionToggle>
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

      {/* Live Detection Section (Collapsible) */}
      {showLiveDetection && (
        <Section>
          <LiveDetectionPanel>
            {/* Upload Form */}
            <UploadCard>
              <UploadHeader>
                <FaCloudUploadAlt size={22} />
                <h3>Upload Evidence for Live Analysis</h3>
              </UploadHeader>
              <UploadDescription>
                Upload a camera trap image and/or audio recording for real-time AI analysis
                using YOLOv5 + Random Forest + Late Fusion with corroboration boost.
              </UploadDescription>

              <UploadForm onSubmit={handleUpload}>
                <FormField>
                  <UploadLabel><FaCamera /> Camera Trap (Optional)</UploadLabel>
                  <UploadSelect
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                  >
                    <option value="">No camera selected (Manual Upload)</option>
                    {cameras.map(cam => (
                      <option key={cam.id} value={cam.id}>
                        {cam.name} — {cam.location}
                      </option>
                    ))}
                  </UploadSelect>
                </FormField>

                <FileInputRow>
                  <FileInputGroup>
                    <UploadLabel><FaImage /> Camera Trap Image</UploadLabel>
                    <FileInput
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      id="live-image-upload"
                    />
                    <FileLabel htmlFor="live-image-upload">
                      {imageFile ? (
                        <><FaCheck /> {imageFile.name}</>
                      ) : (
                        <><FaUpload /> Choose Image</>
                      )}
                    </FileLabel>
                  </FileInputGroup>

                  <FileInputGroup>
                    <UploadLabel><FaVolumeUp /> Audio Recording</UploadLabel>
                    <FileInput
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files[0])}
                      id="live-audio-upload"
                    />
                    <FileLabel htmlFor="live-audio-upload">
                      {audioFile ? (
                        <><FaCheck /> {audioFile.name}</>
                      ) : (
                        <><FaUpload /> Choose Audio</>
                      )}
                    </FileLabel>
                  </FileInputGroup>
                </FileInputRow>

                {uploadError && <UploadErrorMessage>{uploadError}</UploadErrorMessage>}

                <ButtonRow>
                  <AnalyzeButton type="submit" disabled={uploading}>
                    {uploading ? (
                      <><Spinner /> Analyzing...</>
                    ) : (
                      <><FaBolt /> Run Live Detection</>
                    )}
                  </AnalyzeButton>
                  <ResetButton type="button" onClick={resetUploadForm}>
                    Reset
                  </ResetButton>
                </ButtonRow>
              </UploadForm>
            </UploadCard>

            {/* Live Result */}
            {liveResult && (
              <ResultCard>
                <ResultHeader alertLevel={liveResult.alert_level}>
                  <h3>Detection Result</h3>
                  <ResultAlertBadge color={getAlertColor(liveResult.alert_level)}>
                    {liveResult.alert_level?.toUpperCase()}
                  </ResultAlertBadge>
                </ResultHeader>

                <ResultBody>
                  <ResultGrid>
                    <ResultItem>
                      <ResultLabel>Detected Object</ResultLabel>
                      <ResultValue highlight>{liveResult.detected_object}</ResultValue>
                    </ResultItem>
                    <ResultItem>
                      <ResultLabel>Fused Confidence</ResultLabel>
                      <ResultValue>
                        <ConfidenceScore score={liveResult.confidence}>
                          {Math.round(liveResult.confidence * 100)}%
                        </ConfidenceScore>
                      </ResultValue>
                    </ResultItem>
                    <ResultItem>
                      <ResultLabel>Detection Type</ResultLabel>
                      <ResultValue>{liveResult.fusion_type || liveResult.detection_type}</ResultValue>
                    </ResultItem>
                    <ResultItem>
                      <ResultLabel>Camera Location</ResultLabel>
                      <ResultValue>{liveResult.camera_name || 'Manual Upload'}</ResultValue>
                    </ResultItem>
                  </ResultGrid>

                  {/* Fusion Breakdown */}
                  {liveResult.fusion_type === 'full' && (
                    <FusionBreakdown>
                      <FusionBreakdownTitle>Fusion Confidence Breakdown</FusionBreakdownTitle>
                      <FusionBarContainer>
                        <FusionBarItem>
                          <FusionBarLabel>📷 Visual ({liveResult.visual_object})</FusionBarLabel>
                          <FusionBar>
                            <FusionBarFill width={(liveResult.visual_confidence || 0) * 100} color="#4CAF50" />
                          </FusionBar>
                          <FusionBarPercent>{liveResult.visual_confidence ? Math.round(liveResult.visual_confidence * 100) + '%' : 'N/A'}</FusionBarPercent>
                        </FusionBarItem>
                        <FusionBarItem>
                          <FusionBarLabel>🔊 Audio ({liveResult.audio_class})</FusionBarLabel>
                          <FusionBar>
                            <FusionBarFill width={(liveResult.audio_confidence || 0) * 100} color="#2196F3" />
                          </FusionBar>
                          <FusionBarPercent>{liveResult.audio_confidence ? Math.round(liveResult.audio_confidence * 100) + '%' : 'N/A'}</FusionBarPercent>
                        </FusionBarItem>
                        <FusionBarItem>
                          <FusionBarLabel>🔗 Fused</FusionBarLabel>
                          <FusionBar>
                            <FusionBarFill width={(liveResult.fusion_confidence || 0) * 100} color="#9C27B0" />
                          </FusionBar>
                          <FusionBarPercent>{liveResult.fusion_confidence ? Math.round(liveResult.fusion_confidence * 100) + '%' : 'N/A'}</FusionBarPercent>
                        </FusionBarItem>
                      </FusionBarContainer>

                      {liveResult.corroboration_boost_applied && (
                        <BoostBadge>
                          ⚡ Corroboration Boost Applied: +{liveResult.corroboration_boost_percent}%
                        </BoostBadge>
                      )}

                      {liveResult.escalation_applied && (
                        <EscalationBadge>
                          🚨 Cross-Modal Escalation Triggered
                        </EscalationBadge>
                      )}
                    </FusionBreakdown>
                  )}

                  {/* Evidence Preview */}
                  <EvidencePreviewRow>
                    {liveResult.image_url && (
                      <EvidencePreviewItem>
                        <img
                          src={liveResult.image_url}
                          alt="Uploaded evidence"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Image'; }}
                        />
                      </EvidencePreviewItem>
                    )}
                    {liveResult.audio_url && (
                      <EvidencePreviewItem>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔊</div>
                        <audio controls style={{ width: '100%' }}>
                          <source src={liveResult.audio_url} type="audio/wav" />
                        </audio>
                      </EvidencePreviewItem>
                    )}
                  </EvidencePreviewRow>
                </ResultBody>
              </ResultCard>
            )}

            {/* Recent Live Detections */}
            {liveDetections.length > 0 && (
              <RecentLiveSection>
                <SectionSubTitle>Recent Live Detections</SectionSubTitle>
                <LiveHistoryGrid>
                  {liveDetections.slice(0, 6).map((det) => (
                    <LiveHistoryCard key={det.id}>
                      <LiveHistoryHeader>
                        <LiveHistoryObject>{det.detected_object}</LiveHistoryObject>
                        <ResultAlertBadge color={getAlertColor(det.alert_level)} small>
                          {det.alert_level}
                        </ResultAlertBadge>
                      </LiveHistoryHeader>
                      <LiveHistoryDetails>
                        <LiveDetailRow>
                          <span><FaCamera /> {det.camera_name}</span>
                          <ConfidenceScore score={det.confidence}>
                            {Math.round(det.confidence * 100)}%
                          </ConfidenceScore>
                        </LiveDetailRow>
                        <LiveDetailRow>
                          <span><FaClock /> {det.timestamp ? new Date(det.timestamp).toLocaleString() : 'N/A'}</span>
                        </LiveDetailRow>
                      </LiveHistoryDetails>
                    </LiveHistoryCard>
                  ))}
                </LiveHistoryGrid>
              </RecentLiveSection>
            )}
          </LiveDetectionPanel>
        </Section>
      )}

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
                  <BadgeGroup>
                    <AlertBadge severity={alert.severity}>{alert.severity}</AlertBadge>
                    {!alert.is_verified && (
                      <UnverifiedBadge>Unverified</UnverifiedBadge>
                    )}
                  </BadgeGroup>
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
              <DetailRow>
                <DetailLabel>Verified:</DetailLabel>
                <DetailValue>
                  {selectedAlert.is_verified ? (
                    <VerifiedText>✓ Verified by Admin</VerifiedText>
                  ) : (
                    <UnverifiedText>⚠ Pending Verification</UnverifiedText>
                  )}
                </DetailValue>
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

// ===== Styled Components =====

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

const LiveDetectionToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: ${props => props.active
    ? 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)'
    : 'linear-gradient(135deg, #6f42c1 0%, #7952b3 100%)'};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(111, 66, 193, 0.4);
  }
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

// ===== Live Detection Styled Components =====

const LiveDetectionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const UploadCard = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 28px;
  border: 2px solid #e0d4f5;
`;

const UploadHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  color: #6f42c1;

  h3 { margin: 0; font-size: 18px; }
`;

const UploadDescription = styled.p`
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const UploadForm = styled.form``;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const UploadLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const UploadSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus { outline: none; border-color: #6f42c1; }
`;

const FileInputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 16px;
`;

const FileInputGroup = styled.div``;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #6c757d;
  transition: all 0.2s;
  background: #f8f9fa;

  &:hover {
    border-color: #6f42c1;
    color: #6f42c1;
    background: #f3f0ff;
  }
`;

const UploadErrorMessage = styled.div`
  background: #fff5f5;
  color: #dc3545;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 14px;
  border: 1px solid #f5c6cb;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const AnalyzeButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(111, 66, 193, 0.4);
  }

  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const ResetButton = styled.button`
  padding: 12px 20px;
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #e9ecef; }
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spinAnim 0.8s linear infinite;

  @keyframes spinAnim {
    to { transform: rotate(360deg); }
  }
`;

// Result Card
const ResultCard = styled.div`
  background: white;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${props => {
    switch (props.alertLevel) {
      case 'critical': return 'linear-gradient(135deg, #dc3545, #c82333)';
      case 'high': return 'linear-gradient(135deg, #fd7e14, #e8590c)';
      case 'medium': return 'linear-gradient(135deg, #ffc107, #e0a800)';
      default: return 'linear-gradient(135deg, #28a745, #20c997)';
    }
  }};
  color: white;

  h3 { margin: 0; font-size: 16px; }
`;

const ResultAlertBadge = styled.span`
  padding: ${props => props.small ? '3px 8px' : '5px 12px'};
  background: ${props => props.color};
  color: white;
  border-radius: 16px;
  font-size: ${props => props.small ? '10px' : '12px'};
  font-weight: 700;
  text-transform: uppercase;
`;

const ResultBody = styled.div`
  padding: 20px;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
`;

const ResultItem = styled.div``;

const ResultLabel = styled.div`
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
`;

const ResultValue = styled.div`
  font-size: ${props => props.highlight ? '18px' : '14px'};
  font-weight: ${props => props.highlight ? '700' : '500'};
  color: #333;
  text-transform: capitalize;
`;

const ConfidenceScore = styled.span`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  background: ${props => props.score > 0.8 ? '#28a745' :
    props.score > 0.6 ? '#ffc107' : '#dc3545'};
  color: white;
  font-weight: 600;
  font-size: 13px;
`;

// Fusion Breakdown
const FusionBreakdown = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
`;

const FusionBreakdownTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
`;

const FusionBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FusionBarItem = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 45px;
  align-items: center;
  gap: 10px;
`;

const FusionBarLabel = styled.div`
  font-size: 12px;
  color: #495057;
`;

const FusionBar = styled.div`
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
`;

const FusionBarFill = styled.div`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  border-radius: 5px;
  transition: width 0.6s ease;
`;

const FusionBarPercent = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-align: right;
`;

const BoostBadge = styled.div`
  margin-top: 12px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
`;

const EscalationBadge = styled.div`
  margin-top: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border: 1px solid #dc3545;
  border-radius: 6px;
  color: #721c24;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
`;

const EvidencePreviewRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const EvidencePreviewItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;

  img {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: 6px;
  }
`;

// Recent Live Detections
const RecentLiveSection = styled.div``;

const SectionSubTitle = styled.h4`
  color: #495057;
  margin-bottom: 12px;
  font-size: 15px;
`;

const LiveHistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const LiveHistoryCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  padding: 14px;
  border: 1px solid #e9ecef;
`;

const LiveHistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const LiveHistoryObject = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #333;
  text-transform: capitalize;
`;

const LiveHistoryDetails = styled.div``;

const LiveDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6c757d;
  padding: 3px 0;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

// ===== Original Alerts Styled Components =====

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

const BadgeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UnverifiedBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse-orange 2s infinite;
  
  @keyframes pulse-orange {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
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
  display: flex;
  align-items: center;
`;

const VerifiedText = styled.span`
  color: #28a745;
  font-weight: 600;
`;

const UnverifiedText = styled.span`
  color: #ff9800;
  font-weight: 600;
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
