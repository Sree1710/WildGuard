import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaPaw } from 'react-icons/fa';
import { Button } from '../shared/Button';
import { PageHeader, Section } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../shared/Table';
import Modal, { ConfirmModal } from '../shared/Modal';
import { Form, FormGroup, Label, Input, Select, TextArea } from '../shared/Form';
import { Badge } from '../shared/Layout';
import { speciesData as initialSpeciesData } from '../../data/mockData';

/**
 * Species Management Component
 * Allows admin to add, edit, and delete species records
 */
const SpeciesManagement = () => {
  const [species, setSpecies] = useState(initialSpeciesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSpecies, setCurrentSpecies] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mammal',
    riskLevel: 'Low',
    notes: '',
  });

  // Open modal for adding new species
  const handleAdd = () => {
    setCurrentSpecies(null);
    setFormData({ name: '', category: 'Mammal', riskLevel: 'Low', notes: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing species
  const handleEdit = (sp) => {
    setCurrentSpecies(sp);
    setFormData({
      name: sp.name,
      category: sp.category,
      riskLevel: sp.riskLevel,
      notes: sp.notes,
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (sp) => {
    setCurrentSpecies(sp);
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
    
    if (currentSpecies) {
      // Update existing species
      setSpecies(species.map(sp => 
        sp.id === currentSpecies.id 
          ? { ...sp, ...formData }
          : sp
      ));
    } else {
      // Add new species
      const newSpecies = {
        id: Math.max(...species.map(s => s.id)) + 1,
        ...formData,
      };
      setSpecies([...species, newSpecies]);
    }
    
    setIsModalOpen(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setSpecies(species.filter(sp => sp.id !== currentSpecies.id));
    setIsDeleteModalOpen(false);
    setCurrentSpecies(null);
  };

  // Get badge variant for risk level
  const getRiskBadgeVariant = (riskLevel) => {
    const map = {
      'Critical': 'danger',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success',
    };
    return map[riskLevel] || 'info';
  };

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Species Management</h1>
            <p>Manage wildlife species database and conservation status</p>
          </div>
          <Button onClick={handleAdd}>
            <FaPlus /> Add Species
          </Button>
        </HeaderContent>
      </PageHeader>

      <Section>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Species Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {species.map((sp) => (
                <TableRow key={sp.id}>
                  <TableCell>
                    <SpeciesName>
                      <FaPaw /> {sp.name}
                    </SpeciesName>
                  </TableCell>
                  <TableCell>{sp.category}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(sp.riskLevel)}>
                      {sp.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{sp.notes}</TableCell>
                  <TableCell>
                    <TableActions>
                      <ActionButton onClick={() => handleEdit(sp)} variant="info">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteClick(sp)} variant="danger">
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
        title={currentSpecies ? 'Edit Species' : 'Add New Species'}
      >
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Species Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter species name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Category *</Label>
            <Select name="category" value={formData.category} onChange={handleChange}>
              <option value="Mammal">Mammal</option>
              <option value="Bird">Bird</option>
              <option value="Reptile">Reptile</option>
              <option value="Amphibian">Amphibian</option>
              <option value="Fish">Fish</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Risk Level *</Label>
            <Select name="riskLevel" value={formData.riskLevel} onChange={handleChange}>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Notes</Label>
            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information about the species"
            />
          </FormGroup>

          <ModalActions>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {currentSpecies ? 'Update' : 'Add'} Species
            </Button>
          </ModalActions>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Species"
        message={`Are you sure you want to delete "${currentSpecies?.name}"? This action cannot be undone.`}
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

const TableContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const SpeciesName = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.primary};
  
  svg {
    color: ${props => props.theme.colors.success};
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

export default SpeciesManagement;
