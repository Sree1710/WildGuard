import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFilter, FaImage, FaSearch } from 'react-icons/fa';
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
    setIsDetailModalOpen(true);
  };

  // Get badge variant based on detection type
  const getTypeBadgeVariant = (type) => {
    const map = {
      'animal': 'success',
      'human': 'warning',
      'vehicle': 'danger',
      'gunshot': 'danger',
    };
    // Map detected_object or backend type to badge
    if (type === 'human') return 'warning';
    if (['gunshot', 'vehicle'].includes(type)) return 'danger';
    return 'success'; // Default to animal
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="7">Loading detections...</TableCell></TableRow>
              ) : detections.length === 0 ? (
                <TableRow><TableCell colSpan="7">No detections found.</TableCell></TableRow>
              ) : (
                detections.map((detection) => (
                  <TableRow key={detection.id}>
                    <TableCell>{detection.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(detection.detected_object)}>
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
                  <Badge variant={getTypeBadgeVariant(selectedDetection.detected_object)}>
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
              {selectedDetection.detection_type === 'audio' ? (
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

export default DetectionHistory;
