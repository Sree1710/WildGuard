import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Button } from '../shared/Button';
import { PageHeader, Section, Badge } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../shared/Table';
import Modal, { ConfirmModal } from '../shared/Modal';
import { Form, FormGroup, Label, Input, Select, FormRow } from '../shared/Form';
import { cameraTrapData as initialCameraData } from '../../data/mockData';

/**
 * Camera Trap Management Component
 * Register and manage camera trap locations
 */
const CameraManagement = () => {
  const [cameras, setCameras] = useState(initialCameraData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    zone: 'North Sector',
    gps: '',
    status: 'Active',
  });

  // Open modal for adding new camera
  const handleAdd = () => {
    setCurrentCamera(null);
    setFormData({ id: '', zone: 'North Sector', gps: '', status: 'Active' });
    setIsModalOpen(true);
  };

  // Open modal for editing camera
  const handleEdit = (camera) => {
    setCurrentCamera(camera);
    setFormData({
      id: camera.id,
      zone: camera.zone,
      gps: camera.gps,
      status: camera.status,
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentCamera) {
      // Update existing camera
      setCameras(cameras.map(cam => 
        cam.id === currentCamera.id 
          ? { ...cam, ...formData, lastPing: 'Just now' }
          : cam
      ));
    } else {
      // Add new camera
      const newCamera = {
        ...formData,
        lastPing: 'Just now',
      };
      setCameras([...cameras, newCamera]);
    }
    
    setIsModalOpen(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setCameras(cameras.filter(cam => cam.id !== currentCamera.id));
    setIsDeleteModalOpen(false);
    setCurrentCamera(null);
  };

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Camera Trap Management</h1>
            <p>Register and monitor camera trap locations</p>
          </div>
          <Button onClick={handleAdd}>
            <FaPlus /> Register Camera
          </Button>
        </HeaderContent>
      </PageHeader>

      <Section>
        <StatsGrid>
          <StatBox>
            <StatIcon color="#4caf50">
              <FaCheckCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{cameras.filter(c => c.status === 'Active').length}</StatValue>
              <StatLabel>Active Cameras</StatLabel>
            </StatInfo>
          </StatBox>
          <StatBox>
            <StatIcon color="#f44336">
              <FaTimesCircle />
            </StatIcon>
            <StatInfo>
              <StatValue>{cameras.filter(c => c.status === 'Inactive').length}</StatValue>
              <StatLabel>Inactive Cameras</StatLabel>
            </StatInfo>
          </StatBox>
          <StatBox>
            <StatIcon color="#2196f3">
              <FaCamera />
            </StatIcon>
            <StatInfo>
              <StatValue>{cameras.length}</StatValue>
              <StatLabel>Total Cameras</StatLabel>
            </StatInfo>
          </StatBox>
        </StatsGrid>
      </Section>

      <Section>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camera ID</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>GPS Coordinates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Ping</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cameras.map((camera) => (
                <TableRow key={camera.id}>
                  <TableCell>
                    <CameraID>
                      <FaCamera /> {camera.id}
                    </CameraID>
                  </TableCell>
                  <TableCell>{camera.zone}</TableCell>
                  <TableCell>{camera.gps}</TableCell>
                  <TableCell>
                    <Badge variant={camera.status === 'Active' ? 'success' : 'danger'}>
                      {camera.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{camera.lastPing}</TableCell>
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
            <Label>Camera ID *</Label>
            <Input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              required
              disabled={!!currentCamera}
              placeholder="e.g., CAM009"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Forest Zone *</Label>
              <Select name="zone" value={formData.zone} onChange={handleChange}>
                <option value="North Sector">North Sector</option>
                <option value="East Sector">East Sector</option>
                <option value="South Sector">South Sector</option>
                <option value="West Sector">West Sector</option>
                <option value="Central Sector">Central Sector</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Status *</Label>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>GPS Coordinates *</Label>
            <Input
              type="text"
              name="gps"
              value={formData.gps}
              onChange={handleChange}
              required
              placeholder="e.g., 28.6139° N, 77.2090° E"
            />
          </FormGroup>

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
        message={`Are you sure you want to delete camera "${currentCamera?.id}"? This action cannot be undone.`}
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
  
  svg {
    color: ${props => props.theme.colors.info};
  }
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => {
    switch(props.variant) {
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
  transition: opacity ${props => props.theme.transitions.fast};
  
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
