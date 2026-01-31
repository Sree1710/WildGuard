import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  FaHome, FaPaw, FaCamera, FaHistory, FaPhone, FaServer,
  FaSignOutAlt, FaUser, FaBell, FaChartLine, FaFileAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

/**
 * Navbar Component
 * Displays different navigation based on user role (Admin/User)
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Admin navigation links
  const adminLinks = [
    { path: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/cameras', icon: <FaCamera />, label: 'Cameras' },
    { path: '/admin/detections', icon: <FaHistory />, label: 'Detections' },
    { path: '/admin/emergency', icon: <FaPhone />, label: 'Emergency' },
    { path: '/admin/monitoring', icon: <FaServer />, label: 'Monitoring' },
  ];

  // User navigation links
  const userLinks = [
    { path: '/user/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/user/alerts', icon: <FaBell />, label: 'Alerts' },
    { path: '/user/evidence', icon: <FaCamera />, label: 'Evidence' },
    { path: '/user/timeline', icon: <FaChartLine />, label: 'Timeline' },
    { path: '/user/reports', icon: <FaFileAlt />, label: 'Reports' },
    { path: '/user/emergency', icon: <FaPhone />, label: 'Emergency' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <NavbarContainer>
      <NavbarTop>
        <Logo>
          <LogoIcon src="/images/generated-image.png" alt="WildGuard Logo" />
        </Logo>
      </NavbarTop>

      <NavMenu>
        {links.map((link) => (
          <NavItem key={link.path} to={link.path}>
            {link.icon}
            <span>{link.label}</span>
          </NavItem>
        ))}
      </NavMenu>

      <NavbarBottom>
        <UserInfo>
          <UserIcon><FaUser /></UserIcon>
          <UserDetails>
            <UserName>{isAdmin ? 'Admin' : user.name}</UserName>
            <UserRole>{isAdmin ? 'Administrator' : 'Field Ranger'}</UserRole>
          </UserDetails>
        </UserInfo>
        <Divider />
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </LogoutButton>
      </NavbarBottom>
    </NavbarContainer>
  );
};

// Styled Components
const NavbarContainer = styled.nav`
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: ${props => props.theme.colors.white};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: ${props => props.theme.shadows.lg};
  z-index: 100;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: 80px;
  }
`;

const NavbarTop = styled.div`
  padding: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xs};
  justify-content: center;
`;

const LogoIcon = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  background: transparent;
  mix-blend-mode: multiply; /* visually removes white backgrounds on colored header */
`;

const LogoText = styled.div`
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.bold};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const UserIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.round};
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const UserDetails = styled.div`
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.fontWeights.semibold};
  font-size: ${props => props.theme.fontSizes.md};
`;

const UserRole = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  opacity: 0.8;
`;

const NavMenu = styled.div`
  flex: 1;
  padding: ${props => props.theme.spacing.lg} 0;
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.xl};
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.fontSizes.md};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${props => props.theme.colors.white};
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.colors.white};
    border-left: 4px solid ${props => props.theme.colors.secondaryLight};
  }

  svg {
    font-size: ${props => props.theme.fontSizes.lg};
    min-width: 20px;
  }

  span {
    @media (max-width: ${props => props.theme.breakpoints.tablet}) {
      display: none;
    }
  }
`;

const NavbarBottom = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: ${props => props.theme.spacing.md} 0;
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: ${props => props.theme.fontSizes.md};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.danger};
  }

  svg {
    font-size: ${props => props.theme.fontSizes.lg};
  }

  span {
    @media (max-width: ${props => props.theme.breakpoints.tablet}) {
      display: none;
    }
  }
`;

export default Navbar;
