import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaUserShield, FaUser, FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaPaw, FaShieldAlt, FaCamera, FaBell, FaChartLine, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const quickLogin = async (role) => {
    setLoading(true);
    setError('');

    const credentials = role === 'admin'
      ? { username: 'admin', password: 'admin123' }
      : { username: 'ranger1', password: 'ranger123' };

    const result = await login(credentials.username, credentials.password);

    setLoading(false);
    if (result.success) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    setLoading(false);
    if (result.success) {
      navigate(
        formData.username === 'admin'
          ? '/admin/dashboard'
          : '/user/dashboard'
      );
    } else {
      setError(result.message);
    }
  };

  return (
    <PageContainer>
      {/* Background Elements */}
      <BackgroundGradient />
      <BackgroundPattern />

      {/* Left Panel - Visual */}
      <VisualPanel>
        <VisualContent>
          <LogoSection>
            <LogoImage src="/images/generated-image.png" alt="WildGuard" />
            <LogoText>WildGuard</LogoText>
          </LogoSection>

          <VisualTitle>
            Protecting Wildlife
            <VisualHighlight>Through Intelligence</VisualHighlight>
          </VisualTitle>

          <VisualDescription>
            AI-powered monitoring system for wildlife conservation
            and anti-poaching operations.
          </VisualDescription>

          <FeatureList>
            <FeatureItem>
              <FeatureIcon><FaPaw /></FeatureIcon>
              <FeatureText>Real-time wildlife detection</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><FaShieldAlt /></FeatureIcon>
              <FeatureText>Instant threat alerts</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon><FaUserShield /></FeatureIcon>
              <FeatureText>Role-based access control</FeatureText>
            </FeatureItem>
          </FeatureList>

          <AbstractVisual>
            <FloatingShape delay="0s" top="10%" left="20%"><FaPaw /></FloatingShape>
            <FloatingShape delay="0.5s" top="30%" left="70%"><FaCamera /></FloatingShape>
            <FloatingShape delay="1s" top="60%" left="15%"><FaBell /></FloatingShape>
            <FloatingShape delay="1.5s" top="75%" left="65%"><FaChartLine /></FloatingShape>
            <FloatingShape delay="2s" top="45%" left="45%"><FaLeaf /></FloatingShape>

            <StatCard style={{ top: '15%', right: '10%' }}>
              <StatIcon color="#4caf50"><FaPaw /></StatIcon>
              <StatInfo>
                <StatValue>92%</StatValue>
                <StatLabel>Detection Accuracy</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard style={{ bottom: '25%', left: '5%' }}>
              <StatIcon color="#ff9800"><FaBell /></StatIcon>
              <StatInfo>
                <StatValue>&lt;2s</StatValue>
                <StatLabel>Alert Response</StatLabel>
              </StatInfo>
            </StatCard>

            <CenterBadge>
              <CenterIcon><FaShieldAlt /></CenterIcon>
              <CenterText>Protected</CenterText>
            </CenterBadge>
          </AbstractVisual>
        </VisualContent>
      </VisualPanel>

      {/* Right Panel - Login Form */}
      <FormPanel>
        <FormContainer>
          <BackButton onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </BackButton>

          <FormHeader>
            <WelcomeText>Welcome back</WelcomeText>
            <SubText>Enter your credentials to continue</SubText>
          </FormHeader>

          {/* Role Tabs */}
          <RoleTabs>
            <RoleTab
              active={selectedRole === 'admin'}
              onClick={() => setSelectedRole('admin')}
            >
              <FaUserShield />
              <span>Admin</span>
            </RoleTab>
            <RoleTab
              active={selectedRole === 'user'}
              onClick={() => setSelectedRole('user')}
            >
              <FaUser />
              <span>Field Staff</span>
            </RoleTab>
          </RoleTabs>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <InputLabel>Username</InputLabel>
              <InputWrapper>
                <InputIcon><FaUser /></InputIcon>
                <StyledInput
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <InputLabel>Password</InputLabel>
              <InputWrapper>
                <InputIcon><FaLock /></InputIcon>
                <StyledInput
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputWrapper>
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <OptionsRow>
              <RememberMe>
                <Checkbox type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </RememberMe>
              <ForgotLink>Forgot password?</ForgotLink>
            </OptionsRow>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <LoadingSpinner />
              ) : (
                'Sign In'
              )}
            </SubmitButton>
          </Form>

          {/* Quick Demo Access */}
          <DemoSection>
            <DemoDivider>
              <DividerLine />
              <DividerText>Quick Demo Access</DividerText>
              <DividerLine />
            </DemoDivider>

            <DemoButtons>
              <DemoBtn variant="admin" onClick={() => quickLogin('admin')} disabled={loading}>
                <FaUserShield />
                Admin Demo
              </DemoBtn>
              <DemoBtn variant="user" onClick={() => quickLogin('user')} disabled={loading}>
                <FaUser />
                User Demo
              </DemoBtn>
            </DemoButtons>
          </DemoSection>

          <SignupPrompt>
            Don't have an account?
            <SignupLink onClick={() => navigate('/signup')}>Create Account</SignupLink>
          </SignupPrompt>
        </FormContainer>
      </FormPanel>
    </PageContainer>
  );
};

export default Login;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
`;

// Styled Components
const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const BackgroundGradient = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #f8fdf8 0%, #e8f5e9 50%, #c8e6c9 100%);
  z-index: -2;
`;

const BackgroundPattern = styled.div`
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232e7d32' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: -1;
`;

const VisualPanel = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const VisualContent = styled.div`
  max-width: 500px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
`;

const LogoText = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #4caf50;
`;

const VisualTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin: 0 0 20px 0;
`;

const VisualHighlight = styled.span`
  display: block;
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const VisualDescription = styled.p`
  font-size: 16px;
  color: #aaa;
  line-height: 1.7;
  margin: 0 0 32px 0;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(76, 175, 80, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 16px;
`;

const FeatureText = styled.span`
  color: #ddd;
  font-size: 15px;
`;

// Abstract Visual Elements (no external images)
const AbstractVisual = styled.div`
  position: relative;
  height: 320px;
  margin-top: 40px;
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const FloatingShape = styled.div`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: 60px;
  height: 60px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 24px;
  animation: ${floatAnimation} 4s ease-in-out infinite;
  animation-delay: ${props => props.delay};
`;

const StatCard = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  animation: ${float} 5s ease-in-out infinite;
`;

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  background: ${props => props.color}20;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
  font-size: 20px;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
`;

const CenterBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 50px rgba(76, 175, 80, 0.4),
              0 0 80px rgba(76, 175, 80, 0.2);
`;

const CenterIcon = styled.div`
  font-size: 36px;
  color: white;
  margin-bottom: 4px;
`;

const CenterText = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FormPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 440px;
  animation: ${fadeIn} 0.8s ease-out 0.2s both;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #666;
  border: none;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  margin-bottom: 32px;
  
  &:hover {
    color: #2e7d32;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 32px;
`;

const WelcomeText = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const SubText = styled.p`
  font-size: 16px;
  color: #888;
  margin: 0;
`;

const RoleTabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
`;

const RoleTab = styled.button`
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  border: 2px solid ${props => props.active ? '#2e7d32' : '#e5e7eb'};
  background: ${props => props.active ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#555'};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:hover {
    border-color: #2e7d32;
    ${props => !props.active && 'background: #f8fdf8;'}
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div``;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #aaa;
  font-size: 16px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.1);
  }
  
  &::placeholder {
    color: #bbb;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #555;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
`;

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RememberMe = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 14px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #2e7d32;
  cursor: pointer;
`;

const ForgotLink = styled.span`
  color: #2e7d32;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(46, 125, 50, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const DemoSection = styled.div`
  margin-top: 32px;
`;

const DemoDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: #e5e7eb;
`;

const DividerText = styled.span`
  color: #888;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DemoButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const DemoBtn = styled.button`
  flex: 1;
  padding: 14px 20px;
  background: ${props => props.variant === 'admin'
    ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'
    : 'linear-gradient(135deg, #ff8f00 0%, #ffa726 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SignupPrompt = styled.div`
  text-align: center;
  margin-top: 32px;
  color: #666;
  font-size: 15px;
`;

const SignupLink = styled.span`
  color: #2e7d32;
  font-weight: 600;
  margin-left: 6px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;
