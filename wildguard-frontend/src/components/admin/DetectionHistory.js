import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFilter, FaImage, FaSearch, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, Section, Badge } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shared/Table';
import { Form, FormGroup, Label, Select, Input, FormRow } from '../shared/Form';
import { Button } from '../shared/Button';
import Modal from '../shared/Modal';
import api from '../../services/api';

/**
 * Detection History Component
 * View and filter detection records
 */
const DetectionHistory = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    alert_level: '',
    object_type: '',
  });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Fetch detections on mount
  React.useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    try {
      setLoading(true);
      const response = await api.getDetections({ limit: 50 });
      if (response.success) {
        setDetections(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch detections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Apply filters - Client side for now (or update create fetchDetections to use filters)
  const handleApplyFilters = () => {
    // Ideally this should trigger a new API call with query params
    // For now, client-side filtering on the fetched batch
    // Implementation pending full server-side filter support
    fetchDetections();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      alert_level: '',
      object_type: '',
    });
    fetchDetections();
  };

  // View detection details
  const handleViewDetails = (detection) => {
    setSelectedDetection(detection);
    setVerificationNotes(detection.notes || '');
    setIsDetailModalOpen(true);
  };

  // Handle verification
  const handleVerify = async (isFalsePositive = false) => {
    if (!selectedDetection) return;

    setVerifying(true);
    try {
      const response = await api.verifyDetection(selectedDetection.id, {
        verified: true,
        false_positive: isFalsePositive,
        notes: verificationNotes
      });

      if (response.success) {
        // Update local state
        setDetections(prev => prev.map(det =>
          det.id === selectedDetection.id
            ? { ...det, is_verified: true, false_positive: isFalsePositive, notes: verificationNotes }
            : det
        ));
        setSelectedDetection(prev => ({ ...prev, is_verified: true, false_positive: isFalsePositive }));
      }
    } catch (error) {
      console.error('Failed to verify detection:', error);
    } finally {
      setVerifying(false);
    }
  };

  // Get badge variant based on detected object and alert level
  const getTypeBadgeVariant = (type, alertLevel) => {
    // Critical/high-threat fused labels
    if (['armed_poacher', 'confirmed_poacher', 'armed_vehicle', 'illegal_logging'].includes(type)) return 'danger';
    // Alert-level based (covers fused + regular detections)
    if (['critical', 'high'].includes(alertLevel)) return 'danger';
    // Known threat types
    if (['gunshot', 'vehicle', 'chainsaw', 'human_activity'].includes(type)) return 'danger';
    // Human presence
    if (type === 'human') return 'warning';
    if (alertLevel === 'medium') return 'warning';
    // Wildlife / low alert
    return 'success';
  };

  return (
    <Container>
      <PageHeader>
        <h1>Detection History</h1>
        <p>View and analyze all detection records</p>
      </PageHeader>

      {/* Filters Section */}
      <Section>
        <FilterCard>
          <FilterHeader>
            <h3><FaFilter /> Filters</h3>
          </FilterHeader>
          <Form>
            <FormRow>
              <FormGroup>
                <Label>Detection Type</Label>
                <Select name="type" value={filters.type} onChange={handleFilterChange}>
                  <option value="all">All Types</option>
                  <option value="Animal">Animal</option>
                  <option value="Human">Human</option>
                  <option value="Suspicious">Suspicious</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Zone</Label>
                <Select name="zone" value={filters.zone} onChange={handleFilterChange}>
                  <option value="all">All Zones</option>
                  <option value="North Sector">North Sector</option>
                  <option value="East Sector">East Sector</option>
                  <option value="South Sector">South Sector</option>
                  <option value="West Sector">West Sector</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Date From</Label>
                <Input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Date To</Label>
                <Input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </FormGroup>
            </FormRow>

            <FilterActions>
              <Button type="button" onClick={handleApplyFilters}>
                <FaSearch /> Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
            </FilterActions>
          </Form>
        </FilterCard>
      </Section>

      {/* Results Section */}
      <Section>
        <ResultsHeader>
          <h3>Detection Records ({detections.length})</h3>
        </ResultsHeader>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Species/Subject</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="8">Loading detections...</TableCell></TableRow>
              ) : detections.length === 0 ? (
                <TableRow><TableCell colSpan="8">No detections found.</TableCell></TableRow>
              ) : (
                detections.map((detection) => (
                  <TableRow key={detection.id}>
                    <TableCell>{detection.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(detection.detected_object, detection.alert_level)}>
                        {detection.detection_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{detection.detected_object}</TableCell>
                    <TableCell>{new Date(detection.created_at).toLocaleString()}</TableCell>
                    <TableCell>{detection.camera_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <ConfidenceBar>
                        <ConfidenceFill width={detection.confidence * 100}>
                          {Math.round(detection.confidence * 100)}%
                        </ConfidenceFill>
                      </ConfidenceBar>
                    </TableCell>
                    <TableCell>
                      {detection.is_verified ? (
                        detection.false_positive ? (
                          <VerificationBadge status="false_positive">False Positive</VerificationBadge>
                        ) : (
                          <VerificationBadge status="verified">Verified</VerificationBadge>
                        )
                      ) : (
                        <VerificationBadge status="pending">Pending</VerificationBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      <ViewButton onClick={() => handleViewDetails(detection)}>
                        <FaImage /> View
                      </ViewButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>

      {/* Detection Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detection Details"
        size="large"
      >
        {selectedDetection && (
          <DetectionDetail>
            <DetailGrid>
              <DetailItem>
                <DetailLabel>Detection ID</DetailLabel>
                <DetailValue>{selectedDetection.id}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Type</DetailLabel>
                <DetailValue>
                  <Badge variant={getTypeBadgeVariant(selectedDetection.detected_object, selectedDetection.alert_level)}>
                    {selectedDetection.detection_type}
                  </Badge>
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Species/Subject</DetailLabel>
                <DetailValue>{selectedDetection.detected_object}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Confidence</DetailLabel>
                <DetailValue>{Math.round(selectedDetection.confidence * 100)}%</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Timestamp</DetailLabel>
                <DetailValue>{new Date(selectedDetection.created_at).toLocaleString()}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Location</DetailLabel>
                <DetailValue>{selectedDetection.camera_name} - {selectedDetection.camera_location}</DetailValue>
              </DetailItem>
            </DetailGrid>

            <ImagePreview>
              {selectedDetection.detection_type === 'fused' ? (
                <>
                  {/* Fused Detection: Show BOTH image and audio */}
                  <FusedBadge>🔗 Late Fusion — Visual + Audio Combined</FusedBadge>

                  {/* Image evidence */}
                  {selectedDetection.image_url ? (
                    <img
                      src={selectedDetection.image_url}
                      alt={selectedDetection.detected_object}
                      style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'contain', marginBottom: '16px' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'; }}
                    />
                  ) : (
                    <ImagePlaceholder>
                      <FaImage size={40} />
                      <p>No Image Available</p>
                    </ImagePlaceholder>
                  )}

                  {/* Audio evidence */}
                  <div style={{ width: '100%', padding: '16px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔊 Audio Evidence</div>
                    {selectedDetection.audio_url ? (
                      <audio controls style={{ width: '100%' }}>
                        <source src={selectedDetection.audio_url} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <p>No audio file available</p>
                    )}
                  </div>

                  {/* Fusion confidence breakdown */}
                  <FusionDetails>
                    <FusionTitle>Fusion Confidence Breakdown</FusionTitle>
                    <FusionGrid>
                      <FusionItem>
                        <FusionLabel>📷 Visual</FusionLabel>
                        <FusionValue>{selectedDetection.visual_confidence ? Math.round(selectedDetection.visual_confidence * 100) + '%' : 'N/A'}</FusionValue>
                      </FusionItem>
                      <FusionItem>
                        <FusionLabel>🔊 Audio</FusionLabel>
                        <FusionValue>{selectedDetection.audio_confidence ? Math.round(selectedDetection.audio_confidence * 100) + '%' : 'N/A'}</FusionValue>
                      </FusionItem>
                      <FusionItem highlight>
                        <FusionLabel>🔗 Fused</FusionLabel>
                        <FusionValue>{selectedDetection.fusion_confidence ? Math.round(selectedDetection.fusion_confidence * 100) + '%' : 'N/A'}</FusionValue>
                      </FusionItem>
                    </FusionGrid>
                    {selectedDetection.fusion_method && (
                      <FusionMethod>Method: {selectedDetection.fusion_method}</FusionMethod>
                    )}
                  </FusionDetails>
                </>
              ) : selectedDetection.detection_type === 'audio' ? (
                <div style={{ width: '100%', padding: '20px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔊</div>
                  {selectedDetection.audio_url ? (
                    <audio controls style={{ width: '100%' }}>
                      <source src={selectedDetection.audio_url} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p>No audio file available</p>
                  )}
                </div>
              ) : selectedDetection.image_url ? (
                <img
                  src={selectedDetection.image_url}
                  alt={selectedDetection.detected_object}
                  style={{ width: '100%', borderRadius: '8px', maxHeight: '500px', objectFit: 'contain' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'; }}
                />
              ) : (
                <ImagePlaceholder>
                  <FaImage size={60} />
                  <p>No Image Available</p>
                </ImagePlaceholder>
              )}
            </ImagePreview>

            {/* Verification Section */}
            <VerificationSection>
              <VerificationHeader>
                <h4>Verification Status</h4>
                {selectedDetection.is_verified ? (
                  selectedDetection.false_positive ? (
                    <VerificationBadge status="false_positive">Marked as False Positive</VerificationBadge>
                  ) : (
                    <VerificationBadge status="verified">✓ Verified</VerificationBadge>
                  )
                ) : (
                  <VerificationBadge status="pending">⏳ Pending Verification</VerificationBadge>
                )}
              </VerificationHeader>

              {!selectedDetection.is_verified && (
                <>
                  <NotesInput
                    placeholder="Add verification notes (optional)..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                  />
                  <VerificationActions>
                    <VerifyButton onClick={() => handleVerify(false)} disabled={verifying}>
                      <FaCheck /> {verifying ? 'Verifying...' : 'Verify as Correct'}
                    </VerifyButton>
                    <FalsePositiveButton onClick={() => handleVerify(true)} disabled={verifying}>
                      <FaTimes /> Mark False Positive
                    </FalsePositiveButton>
                  </VerificationActions>
                </>
              )}

              {selectedDetection.notes && (
                <NotesDisplay>
                  <strong>Notes:</strong> {selectedDetection.notes}
                </NotesDisplay>
              )}
            </VerificationSection>
          </DetectionDetail>
        )}
      </Modal>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const FilterCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.xl};
`;

const FilterHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const ResultsHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  
  h3 {
    color: ${props => props.theme.colors.primary};
  }
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const ConfidenceBar = styled.div`
  width: 100px;
  height: 20px;
  background: ${props => props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.sm};
  overflow: hidden;
  position: relative;
`;

const ConfidenceFill = styled.div`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.width > 80 ? props.theme.colors.success :
    props.width > 60 ? props.theme.colors.warning : props.theme.colors.danger};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.white};
  font-weight: ${props => props.theme.fontWeights.semibold};
  transition: width ${props => props.theme.transitions.normal};
`;

const ViewButton = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.info};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.fontSizes.sm};
  transition: opacity ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
`;

const DetectionDetail = styled.div``;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DetailValue = styled.div`
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
`;

const ImagePreview = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 300px;
  background: ${props => props.theme.colors.bgLight};
  border: 2px dashed ${props => props.theme.colors.gray};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray};
  
  p {
    margin-top: ${props => props.theme.spacing.md};
    font-weight: ${props => props.theme.fontWeights.medium};
  }
  
  small {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

// Verification Styled Components
const VerificationBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  ${props => {
    switch (props.status) {
      case 'verified':
        return `
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
        `;
      case 'false_positive':
        return `
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          color: white;
        `;
      case 'pending':
      default:
        return `
          background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          color: white;
        `;
    }
  }}
`;

const VerificationSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e9ecef;
`;

const VerificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    color: #333;
  }
`;

const VerificationActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const VerifyButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FalsePositiveButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  background: #f8f9fa;
  color: #dc3545;
  border: 2px solid #dc3545;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #dc3545;
    color: white;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NotesInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #28a745;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const NotesDisplay = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #495057;
`;

// Late Fusion Styled Components
const FusedBadge = styled.div`
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
`;

const FusionDetails = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 16px;
`;

const FusionTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  margin-bottom: 12px;
`;

const FusionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const FusionItem = styled.div`
  text-align: center;
  padding: 12px;
  background: ${props => props.highlight ? 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)' : 'white'};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  color: ${props => props.highlight ? 'white' : 'inherit'};
`;

const FusionLabel = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.85;
`;

const FusionValue = styled.div`
  font-size: 22px;
  font-weight: 700;
`;

const FusionMethod = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export default DetectionHistory;

