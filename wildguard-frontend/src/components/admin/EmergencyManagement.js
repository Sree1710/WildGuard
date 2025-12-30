import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaPhone } from 'react-icons/fa';
import { Button } from '../shared/Button';
import { PageHeader, Section } from '../shared/Layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions } from '../shared/Table';
import Modal, { ConfirmModal } from '../shared/Modal';
import { Form, FormGroup, Label, Input, FormRow } from '../shared/Form';
import { emergencyContacts as initialContacts } from '../../data/mockData';

/**
 * Emergency Resource Management Component
 * Manage emergency contacts and resources
 */
const EmergencyManagement = () => {
  const [contacts, setContacts] = useState(initialContacts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    location: '',
  });

  // Open modal for adding new contact
  const handleAdd = () => {
    setCurrentContact(null);
    setFormData({ name: '', role: '', phone: '', location: '' });
    setIsModalOpen(true);
  };

  // Open modal for editing contact
  const handleEdit = (contact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      location: contact.location,
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (contact) => {
    setCurrentContact(contact);
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
    
    if (currentContact) {
      // Update existing contact
      setContacts(contacts.map(contact => 
        contact.id === currentContact.id 
          ? { ...contact, ...formData }
          : contact
      ));
    } else {
      // Add new contact
      const newContact = {
        id: Math.max(...contacts.map(c => c.id)) + 1,
        ...formData,
      };
      setContacts([...contacts, newContact]);
    }
    
    setIsModalOpen(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setContacts(contacts.filter(contact => contact.id !== currentContact.id));
    setIsDeleteModalOpen(false);
    setCurrentContact(null);
  };

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Emergency Resource Management</h1>
            <p>Manage emergency contacts and response teams</p>
          </div>
          <Button onClick={handleAdd}>
            <FaPlus /> Add Contact
          </Button>
        </HeaderContent>
      </PageHeader>

      <Section>
        <InfoCard>
          <InfoIcon>
            <FaPhone />
          </InfoIcon>
          <InfoText>
            <h3>Emergency Hotline: 1800-XXX-XXXX</h3>
            <p>Available 24/7 for urgent wildlife incidents and poaching alerts</p>
          </InfoText>
        </InfoCard>
      </Section>

      <Section>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <ContactName>
                      <FaPhone /> {contact.name}
                    </ContactName>
                  </TableCell>
                  <TableCell>{contact.role}</TableCell>
                  <TableCell>
                    <PhoneNumber href={`tel:${contact.phone}`}>
                      {contact.phone}
                    </PhoneNumber>
                  </TableCell>
                  <TableCell>{contact.location}</TableCell>
                  <TableCell>
                    <TableActions>
                      <ActionButton onClick={() => handleEdit(contact)} variant="info">
                        <FaEdit />
                      </ActionButton>
                      <ActionButton onClick={() => handleDeleteClick(contact)} variant="danger">
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
        title={currentContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
      >
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Contact Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter contact name"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Role *</Label>
              <Input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                placeholder="e.g., Field Operations"
              />
            </FormGroup>

            <FormGroup>
              <Label>Location *</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., North Sector"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Phone Number *</Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+91-XXXXXXXXXX"
            />
          </FormGroup>

          <ModalActions>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {currentContact ? 'Update' : 'Add'} Contact
            </Button>
          </ModalActions>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        message={`Are you sure you want to delete "${currentContact?.name}"? This action cannot be undone.`}
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

const InfoCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.danger} 0%, ${props => props.theme.colors.high} 100%);
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.md};
`;

const InfoIcon = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
`;

const InfoText = styled.div`
  h3 {
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    font-size: ${props => props.theme.fontSizes.xl};
  }
  
  p {
    margin: 0;
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
`;

const ContactName = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.primary};
  
  svg {
    color: ${props => props.theme.colors.success};
  }
`;

const PhoneNumber = styled.a`
  color: ${props => props.theme.colors.info};
  font-weight: ${props => props.theme.fontWeights.medium};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
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

export default EmergencyManagement;
