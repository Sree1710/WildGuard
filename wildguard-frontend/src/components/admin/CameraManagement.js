import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaCheckCircle, FaTimesCircle, FaSync } from 'react-icons/fa';
import { Button } from '../shared/Button';
import { PageHeader, Section, Badge } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../shared/Table';
import Modal, { ConfirmModal } from '../shared/Modal';
import { Form, FormGroup, Label, Input, Select, FormRow } from '../shared/Form';
import api from '../../services/api';

/**
 * Camera Trap Management Component
 * Register and manage camera trap locations - fetches from real API
 */
const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: 'North Sector',
    latitude: '',
    longitude: '',
    is_active: true,
  });

  // Fetch cameras from API
  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await api.getCameraList();
      if (response.success && response.data) {
        setCameras(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
      setError('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  // Open modal for adding new camera
  const handleAdd = () => {
    setCurrentCamera(null);
    setFormData({ name: '', location: 'North Sector', latitude: '', longitude: '', is_active: true });
    setIsModalOpen(true);
  };

  // Open modal for editing camera
  const handleEdit = (camera) => {
    setCurrentCamera(camera);
    setFormData({
      name: camera.name || camera.id,
      location: camera.location,
      latitude: camera.latitude || '',
      longitude: camera.longitude || '',
      is_active: camera.is_active,
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (camera) => {
    setCurrentCamera(camera);
    setIsDeleteModalOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentCamera) {
        // Update existing camera via API
        await api.updateCamera(currentCamera.id, formData);
      } else {
        // Add new camera via API
        await api.createCamera(formData);
      }
      // Refresh camera list
      fetchCameras();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save camera:', err);
      setError('Failed to save camera');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      // Note: Delete API may not exist, just refresh for now
      setCameras(cameras.filter(cam => cam.id !== currentCamera.id));
      setIsDeleteModalOpen(false);
      setCurrentCamera(null);
    } catch (err) {
      console.error('Failed to delete camera:', err);
    }
  };

  // Calculate stats
  const activeCameras = cameras.filter(c => c.is_active).length;
  const inactiveCameras = cameras.filter(c => !c.is_active).length;
  const totalCameras = cameras.length;

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Camera Trap Management</h1>
            <p>Register and monitor camera trap locations</p>
          </div>
          <ButtonGroup>
            <RefreshButton onClick={fetchCameras} disabled={loading}>
              <FaSync className={loading ? 'spinning' : ''} />
            </RefreshButton>
            <Button onClick={handleAdd}>
              <FaPlus /> Register Camera
            </Button>
          </ButtonGroup>
        </HeaderContent>
      </PageHeader>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <Section>
        <StatsGrid>
          <StatBox>
            <StatIcon color="#4caf50">
              <FaCheckCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{activeCameras}</StatValue>
              <StatLabel>Active Cameras</StatLabel>
            </StatInfo>
          </StatBox>
          <StatBox>
            <StatIcon color="#f44336">
              <FaTimesCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{inactiveCameras}</StatValue>
              <StatLabel>Inactive Cameras</StatLabel>
            </StatInfo>
          </StatBox>
          <StatBox>
            <StatIcon color="#2196f3">
              <FaCamera />
            </StatIcon>
            <StatInfo>
              <StatValue>{totalCameras}</StatValue>
              <StatLabel>Total Cameras</StatLabel>
            </StatInfo>
          </StatBox>
        </StatsGrid>
      </Section>

      <Section>
        <TableContainer>
          {loading && cameras.length === 0 ? (
            <LoadingMessage>Loading cameras...</LoadingMessage>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camera ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Last Ping</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cameras.map((camera) => (
                  <TableRow key={camera.id}>
                    <TableCell>
                      <CameraID>
                        <FaCamera /> {camera.id.substring(0, 8)}...
                      </CameraID>
                    </TableCell>
                    <TableCell>{camera.name}</TableCell>
                    <TableCell>{camera.location}</TableCell>
                    <TableCell>
                      <Badge variant={camera.is_active ? 'success' : 'danger'}>
                        {camera.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{camera.battery_level || 0}%</TableCell>
                    <TableCell>{camera.last_ping ? new Date(camera.last_ping).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      <TableActions>
                        <ActionButton onClick={() => handleEdit(camera)} variant="info">
                          <FaEdit />
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteClick(camera)} variant="danger">
                          <FaTrash />
                        </ActionButton>
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Section>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCamera ? 'Edit Camera' : 'Register New Camera'}
      >
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Camera Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Camera North Waterhole"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Location *</Label>
              <Select name="location" value={formData.location} onChange={handleChange}>
                <option value="North Sector">North Sector</option>
                <option value="East Sector">East Sector</option>
                <option value="South Sector">South Sector</option>
                <option value="West Sector">West Sector</option>
                <option value="Central Sector">Central Sector</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <Select name="is_active" value={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Latitude</Label>
              <Input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 28.6139"
              />
            </FormGroup>
            <FormGroup>
              <Label>Longitude</Label>
              <Input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 77.2090"
              />
            </FormGroup>
          </FormRow>

          <ModalActions>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {currentCamera ? 'Update' : 'Register'} Camera
            </Button>
          </ModalActions>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Camera"
        message={`Are you sure you want to delete camera "${currentCamera?.name}"? This action cannot be undone.`}
      />
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const RefreshButton = styled.button`
  padding: 10px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; }
  
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const StatBox = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.xxl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.textPrimary};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const CameraID = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  
  svg {
    color: ${props => props.theme.colors.info};
  }
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => {
    switch (props.variant) {
      case 'info': return props.theme.colors.info;
      case 'danger': return props.theme.colors.danger;
      default: return props.theme.colors.gray;
    }
  }};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.lg};
`;

export default CameraManagement;
