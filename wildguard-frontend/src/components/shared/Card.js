import styled from 'styled-components';

/**
 * Reusable Card Component
 * Used throughout the application for containing content
 */
export const Card = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.noPadding ? '0' : props.theme.spacing.xl};
  transition: all ${props => props.theme.transitions.normal};
  
  ${props => props.hoverable && `
    &:hover {
      box-shadow: ${props.theme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`;

/**
 * Card Header - Title section of card
 */
export const CardHeader = styled.div`
  padding-bottom: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.lightGray};
  
  h2, h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
  }
`;

/**
 * Card Body - Main content area
 */
export const CardBody = styled.div`
  padding: ${props => props.noPadding ? '0' : props.theme.spacing.md};
`;

/**
 * Card Footer - Bottom section of card
 */
export const CardFooter = styled.div`
  padding-top: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.lightGray};
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
`;

/**
 * Stat Card - For displaying statistics
 */
export const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
`;

export const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => {
    switch(props.color) {
      case 'success': return `${props.theme.colors.success}20`;
      case 'warning': return `${props.theme.colors.warning}20`;
      case 'danger': return `${props.theme.colors.danger}20`;
      case 'info': return `${props.theme.colors.info}20`;
      default: return `${props.theme.colors.primary}20`;
    }
  }};
  color: ${props => {
    switch(props.color) {
      case 'success': return props.theme.colors.success;
      case 'warning': return props.theme.colors.warning;
      case 'danger': return props.theme.colors.danger;
      case 'info': return props.theme.colors.info;
      default: return props.theme.colors.primary;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

export const StatContent = styled.div`
  flex: 1;
`;

export const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

export const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.xxl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.textPrimary};
`;

export const StatChange = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  margin-top: ${props => props.theme.spacing.xs};
`;
