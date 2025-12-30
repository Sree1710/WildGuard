import React from 'react';
import styled from 'styled-components';
import { FaClock, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, Section, AlertBadge } from '../shared/Layout';
import { timelineEvents } from '../../data/mockData';

/**
 * Activity Timeline Component
 * Chronological view of all detection events
 */
const ActivityTimeline = () => {
  return (
    <Container>
      <PageHeader>
        <h1>Activity Timeline</h1>
        <p>Chronological view of detection events and alerts</p>
      </PageHeader>

      <Section>
        <TimelineContainer>
          {timelineEvents.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineMarker severity={event.severity}>
                <MarkerDot />
                {index !== timelineEvents.length - 1 && <TimelineLine />}
              </TimelineMarker>

              <TimelineContent>
                <EventCard severity={event.severity}>
                  <EventHeader>
                    <EventTime>
                      <FaClock /> {event.time} - {event.date}
                    </EventTime>
                    <AlertBadge severity={event.severity}>
                      {event.severity}
                    </AlertBadge>
                  </EventHeader>

                  <EventTitle>{event.event}</EventTitle>

                  <EventLocation>
                    <FaMapMarkerAlt /> {event.location}
                  </EventLocation>

                  <EventDetails>{event.details}</EventDetails>
                </EventCard>
              </TimelineContent>
            </TimelineItem>
          ))}
        </TimelineContainer>
      </Section>

      {/* Legend */}
      <Section>
        <LegendCard>
          <LegendTitle>Severity Levels</LegendTitle>
          <LegendItems>
            <LegendItem>
              <LegendDot color="#d32f2f" /> Critical - Immediate action required
            </LegendItem>
            <LegendItem>
              <LegendDot color="#f57c00" /> High - Urgent attention needed
            </LegendItem>
            <LegendItem>
              <LegendDot color="#ffa726" /> Medium - Monitor situation
            </LegendItem>
            <LegendItem>
              <LegendDot color="#ffd54f" /> Low - Informational
            </LegendItem>
          </LegendItems>
        </LegendCard>
      </Section>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const TimelineContainer = styled.div`
  position: relative;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineMarker = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

const MarkerDot = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => {
    switch(props.severity) {
      case 'critical': return props.theme.colors.critical;
      case 'high': return props.theme.colors.high;
      case 'medium': return props.theme.colors.medium;
      case 'low': return props.theme.colors.low;
      default: return props.theme.colors.info;
    }
  }};
  border: 4px solid ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 2;
`;

const TimelineLine = styled.div`
  width: 2px;
  flex: 1;
  background: ${props => props.theme.colors.lightGray};
  margin-top: ${props => props.theme.spacing.xs};
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const EventCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
  border-left: 4px solid ${props => {
    switch(props.severity) {
      case 'critical': return props.theme.colors.critical;
      case 'high': return props.theme.colors.high;
      case 'medium': return props.theme.colors.medium;
      case 'low': return props.theme.colors.low;
      default: return props.theme.colors.info;
    }
  }};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    transform: translateX(4px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const EventHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EventTime = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};

  svg {
    color: ${props => props.theme.colors.info};
  }
`;

const EventTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const EventLocation = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.sm};

  svg {
    color: ${props => props.theme.colors.danger};
  }
`;

const EventDetails = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.fontSizes.sm};
  line-height: 1.5;
`;

const LegendCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
`;

const LegendTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.primary};
`;

const LegendItems = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const LegendDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

export default ActivityTimeline;
