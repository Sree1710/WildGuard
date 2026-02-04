import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaArrowLeft, FaEnvelope, FaLock, FaIdCard } from 'react-icons/fa';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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

    // Email validation
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
        // Token is already set by api.register
        setTimeout(() => {
          navigate('/login'); // Direct to dashboard since we auto-login
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
    <Page>
      {/* LEFT */}
      <FormSection>
        <FormWrapper>
          <BackRow>
            <BackButton type="button" onClick={() => navigate('/')}>
              <FaArrowLeft /> Back to Home
            </BackButton>
          </BackRow>
          <Heading>Create an account</Heading>
          <SubHeading>Join WildGuard as a Field Ranger</SubHeading>

          <Form onSubmit={handleSubmit}>
            <Label>Full Name</Label>
            <Input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />

            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
            />

            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />

            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {error && <Error>{error}</Error>}
            {success && <Success>{success}</Success>}

            <Submit type="submit">
              Create Account
            </Submit>
          </Form>

          <SigninLink>
            Already have an account? <LinkButton onClick={() => navigate('/login')}>Sign in</LinkButton>
          </SigninLink>
        </FormWrapper>
      </FormSection>

      {/* RIGHT */}
      <ImageSection>
        <Overlay>
          <HeroTitle>Join the Conservation Team</HeroTitle>
          <HeroText>
            Sign up to access advanced wildlife monitoring tools and help protect endangered species with AI-powered technology.
          </HeroText>
        </Overlay>
      </ImageSection>
    </Page>
  );
};

export default Signup;

/* ---------------- styled components ---------------- */

const Page = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  min-height: 100vh;
`;

const FormSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2rem;
`;

const BackRow = styled.div`
  margin-bottom: 0.75rem;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #14532d;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const SubHeading = styled.p`
  color: #6b7280;
  margin-bottom: 2rem;
`;

const RoleSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const RoleButton = styled.button`
  flex: 1;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid ${({ active }) => (active ? '#14532d' : '#e5e7eb')};
  background: ${({ active }) => (active ? '#14532d' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#111')};
  cursor: pointer;
  display: flex;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #14532d;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #14532d;
  }
`;

const Submit = styled.button`
  background: #14532d;
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #0f3d1a;
    transform: translateY(-1px);
  }
`;

const Error = styled.div`
  color: #b91c1c;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  background: #fee2e2;
  padding: 0.6rem;
  border-radius: 6px;
`;

const Success = styled.div`
  color: #15803d;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  background: #dcfce7;
  padding: 0.6rem;
  border-radius: 6px;
`;

const SigninLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #14532d;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: #0f3d1a;
  }
`;

const ImageSection = styled.div`
  background: url('/images/login-bg.webp') center/cover no-repeat;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  color: white;
  max-width: 420px;
`;

const HeroTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
`;

const HeroText = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`;
