import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserShield, FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

/**
 * Login Page Component
 * Provides authentication interface for both Admin and User roles
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin'); // admin or user

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    const result = login(formData.username, formData.password);
    
    if (result.success) {
      // Redirect based on role
      if (formData.username === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  // Quick login function for testing
  const quickLogin = (role) => {
    const credentials = role === 'admin' 
      ? { username: 'admin', password: 'admin123' }
      : { username: 'user', password: 'user123' };
    
    const result = login(credentials.username, credentials.password);
    
    if (result.success) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoSection>
          <LogoIcon>🌲</LogoIcon>
          <Title>WildGuard</Title>
          <Subtitle>Wildlife Monitoring & Anti-Poaching System</Subtitle>
        </LogoSection>

        <RoleSelector>
          <RoleButton
            active={selectedRole === 'admin'}
            onClick={() => setSelectedRole('admin')}
          >
            <FaUserShield /> Admin
          </RoleButton>
          <RoleButton
            active={selectedRole === 'user'}
            onClick={() => setSelectedRole('user')}
          >
            <FaUser /> Field User
          </RoleButton>
        </RoleSelector>

        <LoginForm onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit">
            Login as {selectedRole === 'admin' ? 'Admin' : 'Field User'}
          </LoginButton>
        </LoginForm>

        <DemoSection>
          <DemoTitle>Quick Access (Demo)</DemoTitle>
          <DemoButtons>
            <DemoButton onClick={() => quickLogin('admin')}>
              <FaUserShield /> Login as Admin
            </DemoButton>
            <DemoButton onClick={() => quickLogin('user')}>
              <FaUser /> Login as User
            </DemoButton>
          </DemoButtons>
          <DemoCredentials>
            <CredentialBox>
              <strong>Admin:</strong> admin / admin123
            </CredentialBox>
            <CredentialBox>
              <strong>User:</strong> user / user123
            </CredentialBox>
          </DemoCredentials>
        </DemoSection>
      </LoginCard>
    </LoginContainer>
  );
};

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  padding: ${props => props.theme.spacing.lg};
`;

const LoginCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.xl};
  padding: ${props => props.theme.spacing.xxl};
  width: 100%;
  max-width: 450px;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const LogoIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin: 0;
`;

const RoleSelector = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const RoleButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.white};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.textPrimary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  transition: all ${props => props.theme.transitions.normal};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.gray};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  padding-left: 3rem;
  border: 2px solid ${props => props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: ${props => props.theme.fontSizes.sm};
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.danger}20;
  border-radius: ${props => props.theme.borderRadius.sm};
`;

const LoginButton = styled.button`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const DemoSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  padding-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.lightGray};
`;

const DemoTitle = styled.h4`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DemoButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DemoButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.secondaryLight};
  }
`;

const DemoCredentials = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const CredentialBox = styled.div`
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.bgLight};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.xs};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
`;

export default Login;
