import styled from 'styled-components';

/**
 * Reusable Table Component
 */
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

export const TableHeader = styled.thead`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
`;

export const TableBody = styled.tbody`
  tr:nth-child(even) {
    background: ${props => props.theme.colors.bgLight};
  }
  
  tr:hover {
    background: ${props => props.theme.colors.primaryLight}15;
  }
`;

export const TableRow = styled.tr``;

export const TableHead = styled.th`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  text-align: left;
  font-weight: ${props => props.theme.fontWeights.semibold};
  font-size: ${props => props.theme.fontSizes.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TableCell = styled.td`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textPrimary};
  border-bottom: 1px solid ${props => props.theme.colors.lightGray};
`;

/**
 * Table Actions - For action buttons in table rows
 */
export const TableActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

/**
 * Empty State - When table has no data
 */
export const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.md};
`;
