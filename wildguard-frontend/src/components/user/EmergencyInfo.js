import React from 'react';
import styled from 'styled-components';
import { FaPhone, FaMapMarkerAlt, FaUserMd, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, Section, Grid } from '../shared/Layout';
import { Card } from '../shared/Card';
import { emergencyContacts } from '../../data/mockData';

/**
 * Emergency Information Page Component
 * Quick access to emergency contacts - offline friendly
 */
const EmergencyInfo = () => {
  return (
    <Container>
      <PageHeader>
        <h1>Emergency Information</h1>
        <p>Quick access to emergency contacts and protocols</p>
      </PageHeader>

      {/* Emergency Hotline */}
      <Section>
        <HotlineCard>
          <HotlineIcon>
            <FaPhone />
          </HotlineIcon>
          <HotlineContent>
            <HotlineTitle>Emergency Hotline</HotlineTitle>
            <HotlineNumber href="tel:1800-XXX-XXXX">1800-XXX-XXXX</HotlineNumber>
            <HotlineDescription>
              Available 24/7 for immediate assistance
            </HotlineDescription>
          </HotlineContent>
        </HotlineCard>
      </Section>

      {/* Emergency Protocols */}
      <Section>
        <ProtocolTitle>Emergency Response Protocols</ProtocolTitle>
        <ProtocolsGrid>
          <ProtocolCard>
            <ProtocolIcon color="#f44336">
              <FaExclamationTriangle />
            </ProtocolIcon>
            <ProtocolName>Poaching Alert</ProtocolName>
            <ProtocolSteps>
              <ProtocolStep>1. Call emergency hotline immediately</ProtocolStep>
              <ProtocolStep>2. Note exact location and time</ProtocolStep>
              <ProtocolStep>3. Do not approach suspects</ProtocolStep>
              <ProtocolStep>4. Document with photos if safe</ProtocolStep>
            </ProtocolSteps>
          </ProtocolCard>

          <ProtocolCard>
            <ProtocolIcon color="#ff9800">
              <FaUserMd />
            </ProtocolIcon>
            <ProtocolName>Wildlife Injury</ProtocolName>
            <ProtocolSteps>
              <ProtocolStep>1. Contact wildlife vet unit</ProtocolStep>
              <ProtocolStep>2. Keep safe distance from animal</ProtocolStep>
              <ProtocolStep>3. Monitor animal's condition</ProtocolStep>
              <ProtocolStep>4. Secure the area if needed</ProtocolStep>
            </ProtocolSteps>
          </ProtocolCard>

          <ProtocolCard>
            <ProtocolIcon color="#2196f3">
              <FaShieldAlt />
            </ProtocolIcon>
            <ProtocolName>Human-Wildlife Conflict</ProtocolName>
            <ProtocolSteps>
              <ProtocolStep>1. Alert nearby communities</ProtocolStep>
              <ProtocolStep>2. Contact ranger station</ProtocolStep>
              <ProtocolStep>3. Deploy conflict mitigation team</ProtocolStep>
              <ProtocolStep>4. Monitor situation continuously</ProtocolStep>
            </ProtocolSteps>
          </ProtocolCard>
        </ProtocolsGrid>
      </Section>

      {/* Emergency Contacts */}
      <Section>
        <ContactsTitle>Emergency Contacts</ContactsTitle>
        <ContactsGrid>
          {emergencyContacts.map((contact) => (
            <ContactCard key={contact.id}>
              <ContactHeader>
                <ContactIcon>
                  {getContactIcon(contact.role)}
                </ContactIcon>
                <ContactName>{contact.name}</ContactName>
              </ContactHeader>

              <ContactDetails>
                <ContactDetail>
                  <DetailLabel>Role:</DetailLabel>
                  <DetailValue>{contact.role}</DetailValue>
                </ContactDetail>
                <ContactDetail>
                  <DetailLabel>
                    <FaPhone /> Phone:
                  </DetailLabel>
                  <PhoneLink href={`tel:${contact.phone}`}>
                    {contact.phone}
                  </PhoneLink>
                </ContactDetail>
                <ContactDetail>
                  <DetailLabel>
                    <FaMapMarkerAlt /> Location:
                  </DetailLabel>
                  <DetailValue>{contact.location}</DetailValue>
                </ContactDetail>
              </ContactDetails>

              <CallButton href={`tel:${contact.phone}`}>
                <FaPhone /> Call Now
              </CallButton>
            </ContactCard>
          ))}
        </ContactsGrid>
      </Section>

      {/* Offline Notice */}
      <Section>
        <OfflineNotice>
          <NoticeIcon>ℹ️</NoticeIcon>
          <NoticeText>
            <strong>Offline Access:</strong> This page is designed to work offline. 
            All emergency contacts and protocols are cached on your device for quick access.
          </NoticeText>
        </OfflineNotice>
      </Section>
    </Container>
  );
};

// Helper function to get icon based on role
const getContactIcon = (role) => {
  if (role.includes('Medical') || role.includes('Vet')) return <FaUserMd />;
  if (role.includes('Security') || role.includes('Anti-Poaching')) return <FaShieldAlt />;
  return <FaPhone />;
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const HotlineCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.danger} 0%, ${props => props.theme.colors.high} 100%);
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xxl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.lg};
`;

const HotlineIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
`;

const HotlineContent = styled.div`
  flex: 1;
`;

const HotlineTitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.fontSizes.xxl};
`;

const HotlineNumber = styled.a`
  display: block;
  font-size: ${props => props.theme.fontSizes.xxxl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.white};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HotlineDescription = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: ${props => props.theme.fontSizes.md};
`;

const ProtocolTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ProtocolsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const ProtocolCard = styled(Card)``;

const ProtocolIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const ProtocolName = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.textPrimary};
`;

const ProtocolSteps = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ProtocolStep = styled.li`
  padding: ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  line-height: 1.5;
`;

const ContactsTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ContactsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const ContactCard = styled(Card)`
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ContactHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 2px solid ${props => props.theme.colors.lightGray};
`;

const ContactIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ContactName = styled.h4`
  margin: 0;
  color: ${props => props.theme.colors.textPrimary};
  flex: 1;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ContactDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const DetailValue = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
`;

const PhoneLink = styled.a`
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CallButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.success}dd;
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const OfflineNotice = styled.div`
  background: ${props => props.theme.colors.info}15;
  border: 2px solid ${props => props.theme.colors.info};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const NoticeIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const NoticeText = styled.div`
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.fontSizes.sm};
  line-height: 1.6;

  strong {
    color: ${props => props.theme.colors.info};
  }
`;

export default EmergencyInfo;
