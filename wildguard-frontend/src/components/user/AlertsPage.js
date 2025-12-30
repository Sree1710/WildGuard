import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBell, FaMapMarkerAlt, FaClock, FaFilter } from 'react-icons/fa';
import { PageHeader, Section, AlertBadge } from '../shared/Layout';
import { Button } from '../shared/Button';
import { Form, FormGroup, Label, Select, FormRow } from '../shared/Form';
import { alertsData as allAlerts } from '../../data/mockData';

/**
 * Real-Time Alerts Component
 * Display and filter active alerts
 */
const AlertsPage = () => {
  const [alerts, setAlerts] = useState(allAlerts);
  const [filter, setFilter] = useState('all');

  // Handle filter change
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    if (value === 'all') {
      setAlerts(allAlerts);
    } else {
      setAlerts(allAlerts.filter(alert => alert.severity === value));
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
          <LiveIndicator>
            <LiveDot /> Live
          </LiveIndicator>
        </HeaderContent>
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
            </FormRow>
          </Form>
        </FilterCard>
      </Section>

      {/* Alerts List */}
      <Section>
        <AlertsGrid>
          {alerts.map(alert => (
            <AlertCard key={alert.id} severity={alert.severity}>
              <AlertHeader>
                <AlertBadge severity={alert.severity}>{alert.severity}</AlertBadge>
                <AlertStatus status={alert.status}>{alert.status}</AlertStatus>
              </AlertHeader>

              <AlertTitle>{alert.type}</AlertTitle>

              <AlertInfo>
                <InfoItem>
                  <FaMapMarkerAlt /> {alert.location}
                </InfoItem>
                <InfoItem>
                  <FaClock /> {alert.timestamp}
                </InfoItem>
              </AlertInfo>

              <AlertDescription>{alert.description}</AlertDescription>

              <AlertActions>
                <ActionButton variant="primary">View Details</ActionButton>
                <ActionButton variant="outline">Mark Resolved</ActionButton>
              </AlertActions>
            </AlertCard>
          ))}
        </AlertsGrid>
      </Section>
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

const FilterCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
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
    switch(props.severity) {
      case 'critical': return props.theme.colors.critical;
      case 'high': return props.theme.colors.high;
      case 'medium': return props.theme.colors.medium;
      case 'low': return props.theme.colors.low;
      default: return props.theme.colors.info;
    }
  }};
  transition: transform ${props => props.theme.transitions.fast};

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
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  background: ${props => props.status === 'Active' ? props.theme.colors.success + '20' : props.theme.colors.gray + '20'};
  color: ${props => props.status === 'Active' ? props.theme.colors.success : props.theme.colors.gray};
`;

const AlertTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const AlertInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};

  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const AlertDescription = styled.p`
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.5;
`;

const AlertActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const ActionButton = styled(Button)`
  flex: 1;
  font-size: ${props => props.theme.fontSizes.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
`;

export default AlertsPage;
