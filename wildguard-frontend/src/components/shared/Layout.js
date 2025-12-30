import styled from 'styled-components';

/**
 * Layout Container - Main app layout with sidebar
 */
export const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.colors.bgLight};
`;

/**
 * Main Content Area - Content beside navbar
 */
export const MainContent = styled.main`
  margin-left: 260px;
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
  min-height: 100vh;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-left: 80px;
    padding: ${props => props.theme.spacing.md};
  }
`;

/**
 * Page Header
 */
export const PageHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h1 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    margin: 0;
  }
`;

/**
 * Grid Layout - For responsive cards
 */
export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(280px, 1fr))'};
  gap: ${props => props.gap || props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

/**
 * Flex Container
 */
export const FlexContainer = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || props.theme.spacing.md};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

/**
 * Section - Content section with spacing
 */
export const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xxl};
`;

/**
 * Badge Component
 */
export const Badge = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  background: ${props => {
    switch(props.variant) {
      case 'success': return props.theme.colors.success;
      case 'warning': return props.theme.colors.warning;
      case 'danger': return props.theme.colors.danger;
      case 'info': return props.theme.colors.info;
      default: return props.theme.colors.primary;
    }
  }};
  color: ${props => props.theme.colors.white};
`;

/**
 * Alert Badge - For severity levels
 */
export const AlertBadge = styled(Badge)`
  background: ${props => {
    switch(props.severity) {
      case 'critical': return props.theme.colors.critical;
      case 'high': return props.theme.colors.high;
      case 'medium': return props.theme.colors.medium;
      case 'low': return props.theme.colors.low;
      default: return props.theme.colors.info;
    }
  }};
`;

/**
 * Divider
 */
export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${props => props.theme.colors.lightGray};
  margin: ${props => props.theme.spacing.xl} 0;
`;

/**
 * Loading Spinner
 */
export const Spinner = styled.div`
  border: 4px solid ${props => props.theme.colors.lightGray};
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  animation: spin 1s linear infinite;
  margin: ${props => props.theme.spacing.xl} auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
