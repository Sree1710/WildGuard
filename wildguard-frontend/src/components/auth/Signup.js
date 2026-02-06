import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaUser, FaArrowLeft, FaEnvelope, FaLock, FaIdCard, FaShieldAlt, FaUserPlus, FaPaw, FaCamera, FaBell, FaChartLine, FaLeaf, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import api from '../../services/api';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const data = await api.register(formData);

      if (data.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
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
            Join the
            <VisualHighlight>Conservation Team</VisualHighlight>
          </VisualTitle>

          <VisualDescription>
            Sign up to access advanced wildlife monitoring tools
            and help protect endangered species with AI technology.
          </VisualDescription>

          <BenefitsList>
            <BenefitItem>
              <BenefitIcon><FaCheck /></BenefitIcon>
              <BenefitText>Real-time wildlife detection alerts</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon><FaCheck /></BenefitIcon>
              <BenefitText>Access camera trap dashboards</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon><FaCheck /></BenefitIcon>
              <BenefitText>Generate conservation reports</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon><FaCheck /></BenefitIcon>
              <BenefitText>Collaborate with forest teams</BenefitText>
            </BenefitItem>
          </BenefitsList>

          <AbstractVisual>
            <FloatingShape delay="0s" top="5%" left="15%"><FaPaw /></FloatingShape>
            <FloatingShape delay="0.7s" top="25%" left="75%"><FaCamera /></FloatingShape>
            <FloatingShape delay="1.4s" top="65%" left="10%"><FaBell /></FloatingShape>
            <FloatingShape delay="2.1s" top="80%" left="70%"><FaLeaf /></FloatingShape>

            <CenterBadge>
              <CenterIcon><FaUserPlus /></CenterIcon>
              <CenterText>Join Us</CenterText>
            </CenterBadge>
          </AbstractVisual>
        </VisualContent>
      </VisualPanel>

      {/* Right Panel - Signup Form */}
      <FormPanel>
        <FormContainer>
          <BackButton onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </BackButton>

          <FormHeader>
            <WelcomeText>Create Account</WelcomeText>
            <SubText>Join WildGuard as a Field Ranger</SubText>
          </FormHeader>

          <Form onSubmit={handleSubmit}>
            <InputRow>
              <InputGroup>
                <InputLabel>Full Name</InputLabel>
                <InputWrapper>
                  <InputIcon><FaIdCard /></InputIcon>
                  <StyledInput
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <InputLabel>Username</InputLabel>
                <InputWrapper>
                  <InputIcon><FaUser /></InputIcon>
                  <StyledInput
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </InputWrapper>
              </InputGroup>
            </InputRow>

            <InputGroup>
              <InputLabel>Email</InputLabel>
              <InputWrapper>
                <InputIcon><FaEnvelope /></InputIcon>
                <StyledInput
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </InputWrapper>
            </InputGroup>

            <InputRow>
              <InputGroup>
                <InputLabel>Password</InputLabel>
                <InputWrapper>
                  <InputIcon><FaLock /></InputIcon>
                  <StyledInput
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <PasswordToggle onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <InputLabel>Confirm Password</InputLabel>
                <InputWrapper>
                  <InputIcon><FaLock /></InputIcon>
                  <StyledInput
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <PasswordToggle onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
              </InputGroup>
            </InputRow>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Create Account'}
            </SubmitButton>
          </Form>

          <SigninPrompt>
            Already have an account?
            <SigninLink onClick={() => navigate('/login')}>Sign In</SigninLink>
          </SigninPrompt>
        </FormContainer>
      </FormPanel>
    </PageContainer>
  );
};

export default Signup;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 40px;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const BenefitIcon = styled.div`
  width: 28px;
  height: 28px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 12px;
`;

const BenefitText = styled.span`
  color: #ddd;
  font-size: 15px;
`;

const AbstractVisual = styled.div`
  position: relative;
  height: 200px;
`;

const FloatingShape = styled.div`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: 50px;
  height: 50px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 20px;
  animation: ${floatAnimation} 4s ease-in-out infinite;
  animation-delay: ${props => props.delay};
`;

const CenterBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 50px rgba(76, 175, 80, 0.4),
              0 0 80px rgba(76, 175, 80, 0.2);
`;

const CenterIcon = styled.div`
  font-size: 32px;
  color: white;
  margin-bottom: 4px;
`;

const CenterText = styled.div`
  font-size: 11px;
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
  max-width: 520px;
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
  margin-bottom: 24px;
  
  &:hover {
    color: #2e7d32;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 28px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
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
  left: 14px;
  color: #aaa;
  font-size: 15px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 14px 14px 44px;
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
  right: 14px;
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

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  color: #16a34a;
  font-size: 14px;
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
  margin-top: 8px;
  
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

const SigninPrompt = styled.div`
  text-align: center;
  margin-top: 28px;
  color: #666;
  font-size: 15px;
`;

const SigninLink = styled.span`
  color: #2e7d32;
  font-weight: 600;
  margin-left: 6px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;
