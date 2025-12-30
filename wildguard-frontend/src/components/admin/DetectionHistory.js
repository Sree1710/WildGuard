import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFilter, FaImage, FaSearch } from 'react-icons/fa';
import { PageHeader, Section, Badge } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../shared/Table';
import { Form, FormGroup, Label, Select, Input, FormRow } from '../shared/Form';
import { Button } from '../shared/Button';
import Modal from '../shared/Modal';
import { detectionHistory as allDetections } from '../../data/mockData';

/**
 * Detection History Component
 * View and filter detection records
 */
const DetectionHistory = () => {
  const [detections, setDetections] = useState(allDetections);
  const [filters, setFilters] = useState({
    type: 'all',
    zone: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    let filtered = [...allDetections];

    if (filters.type !== 'all') {
      filtered = filtered.filter(d => d.type === filters.type);
    }

    if (filters.zone !== 'all') {
      filtered = filtered.filter(d => d.zone === filters.zone);
    }

    setDetections(filtered);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      zone: 'all',
      dateFrom: '',
      dateTo: '',
    });
    setDetections(allDetections);
  };

  // View detection details
  const handleViewDetails = (detection) => {
    setSelectedDetection(detection);
    setIsDetailModalOpen(true);
  };

  // Get badge variant based on detection type
  const getTypeBadgeVariant = (type) => {
    const map = {
      'Animal': 'success',
      'Human': 'warning',
      'Suspicious': 'danger',
    };
    return map[type] || 'info';
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
              {detections.map((detection) => (
                <TableRow key={detection.id}>
                  <TableCell>{detection.id}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(detection.type)}>
                      {detection.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{detection.species}</TableCell>
                  <TableCell>{detection.timestamp}</TableCell>
                  <TableCell>{detection.location}</TableCell>
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
              ))}
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
                  <Badge variant={getTypeBadgeVariant(selectedDetection.type)}>
                    {selectedDetection.type}
                  </Badge>
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Species/Subject</DetailLabel>
                <DetailValue>{selectedDetection.species}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Confidence</DetailLabel>
                <DetailValue>{Math.round(selectedDetection.confidence * 100)}%</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Timestamp</DetailLabel>
                <DetailValue>{selectedDetection.timestamp}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Location</DetailLabel>
                <DetailValue>{selectedDetection.location}</DetailValue>
              </DetailItem>
            </DetailGrid>

            <ImagePreview>
              <ImagePlaceholder>
                <FaImage size={60} />
                <p>Image: {selectedDetection.image}</p>
                <small>Image preview would display here in production</small>
              </ImagePlaceholder>
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
