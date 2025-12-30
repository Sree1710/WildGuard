import styled from 'styled-components';

/**
 * Reusable Button Component
 * Supports different variants: primary, secondary, success, danger, warning
 * Supports different sizes: small, medium, large
 */
export const Button = styled.button`
  padding: ${props => {
    switch(props.size) {
      case 'small': return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
      case 'large': return `${props.theme.spacing.lg} ${props.theme.spacing.xl}`;
      default: return `${props.theme.spacing.md} ${props.theme.spacing.lg}`;
    }
  }};
  
  background: ${props => {
    switch(props.variant) {
      case 'secondary': return props.theme.colors.secondary;
      case 'success': return props.theme.colors.success;
      case 'danger': return props.theme.colors.danger;
      case 'warning': return props.theme.colors.warning;
      case 'outline': return 'transparent';
      default: return props.theme.colors.primary;
    }
  }};
  
  color: ${props => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.white};
  border: ${props => props.variant === 'outline' ? `2px solid ${props.theme.colors.primary}` : 'none'};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.size === 'small' ? props.theme.fontSizes.sm : props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
    opacity: 0.9;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Icon Button - Circular button for icons
 */
export const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.round};
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.lightGray};
  color: ${props => props.variant === 'primary' ? props.theme.colors.white : props.theme.colors.textPrimary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadows.sm};
  }
`;
