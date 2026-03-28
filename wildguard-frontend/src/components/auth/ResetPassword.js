import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaArrowLeft, FaLock, FaEye, FaEyeSlash, FaPaw, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        return;
      }

      try {
        const response = await api.verifyResetToken(token);
        setTokenValid(response.valid);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      setError('Please enter a new password');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.resetPassword(token, formData.password);
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <PageContainer>
        <BackgroundGradient />
        <BackgroundPattern />
        <ContentCard>
          <LoadingState>
            <LoadingSpinnerLarge />
            <LoadingText>Verifying reset link...</LoadingText>
          </LoadingState>
        </ContentCard>
      </PageContainer>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <PageContainer>
        <BackgroundGradient />
        <BackgroundPattern />
        <ContentCard>
          <ErrorIcon>
            <FaExclamationTriangle />
          </ErrorIcon>
          <ErrorTitle>Invalid Reset Link</ErrorTitle>
          <ErrorDescription>
            This password reset link is invalid or has expired. Please request a new one.
          </ErrorDescription>
          <ActionButton onClick={() => navigate('/forgot-password')}>
            Request New Link
          </ActionButton>
          <BackToLogin onClick={() => navigate('/login')}>
            <FaArrowLeft /> Back to Login
          </BackToLogin>
        </ContentCard>
      </PageContainer>
    );
  }

  // Success state
  if (success) {
    return (
      <PageContainer>
        <BackgroundGradient />
        <BackgroundPattern />
        <ContentCard>
          <SuccessIcon>
            <FaCheckCircle />
          </SuccessIcon>
          <SuccessTitle>Password Reset!</SuccessTitle>
          <SuccessMessage>
            Your password has been reset successfully. You can now log in with your new password.
          </SuccessMessage>
          <ActionButton onClick={() => navigate('/login')}>
            Go to Login
          </ActionButton>
        </ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackgroundGradient />
      <BackgroundPattern />
      
      <ContentCard>
        <BackButton onClick={() => navigate('/login')}>
          <FaArrowLeft /> Back to Login
        </BackButton>

        <LogoSection>
          <LogoIcon><FaShieldAlt /></LogoIcon>
          <LogoText>WildGuard</LogoText>
        </LogoSection>

        <Header>
          <Title>Reset Password</Title>
          <Subtitle>
            Enter your new password below. Make sure it's strong and secure.
          </Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputLabel>New Password</InputLabel>
            <InputWrapper>
              <InputIcon><FaLock /></InputIcon>
              <StyledInput
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
              />
              <PasswordToggle 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
            <PasswordHint>Must be at least 6 characters</PasswordHint>
          </InputGroup>

          <InputGroup>
            <InputLabel>Confirm Password</InputLabel>
            <InputWrapper>
              <InputIcon><FaLock /></InputIcon>
              <StyledInput
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <PasswordToggle 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Reset Password'}
          </SubmitButton>
        </Form>
      </ContentCard>

      {/* Decorative Elements */}
      <FloatingShape delay="0s" top="15%" left="10%"><FaPaw /></FloatingShape>
      <FloatingShape delay="1s" top="70%" left="85%"><FaShieldAlt /></FloatingShape>
    </PageContainer>
  );
};

export default ResetPassword;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
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

const FloatingShape = styled.div`
  position: fixed;
  top: ${props => props.top};
  left: ${props => props.left};
  width: 80px;
  height: 80px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4caf50;
  font-size: 32px;
  animation: ${float} 5s ease-in-out infinite;
  animation-delay: ${props => props.delay};
  z-index: -1;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 480px) {
    padding: 32px 24px;
  }
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

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
`;

const LogoText = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #2e7d32;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #666;
  margin: 0;
  line-height: 1.6;
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
  padding: 16px 48px;
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

const PasswordHint = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 6px;
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
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

// Loading State
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const LoadingSpinnerLarge = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #666;
`;

// Error State
const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #dc2626;
  font-size: 40px;
`;

const ErrorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin: 0 0 12px 0;
`;

const ErrorDescription = styled.p`
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

// Success State
const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #2e7d32;
  font-size: 40px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin: 0 0 12px 0;
`;

const SuccessMessage = styled.p`
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

// Action Buttons
const ActionButton = styled.button`
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
  margin-bottom: 12px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(46, 125, 50, 0.3);
  }
`;

const BackToLogin = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
`;
