import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUserShield, FaUser, FaArrowLeft } from 'react-icons/fa';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Quick login shortcuts for demo accounts
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
    <Page>
      {/* LEFT */}
      <FormSection>
        <FormWrapper>
          <BackRow>
            <BackButton type="button" onClick={() => navigate('/')}> 
              <FaArrowLeft /> Back to Home
            </BackButton>
          </BackRow>
          <Heading>Welcome back</Heading>
          <SubHeading>Please enter your details</SubHeading>

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

          <Form onSubmit={handleSubmit}>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              placeholder="Enter your username"
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

            {error && <Error>{error}</Error>}

            <Options>
              <Checkbox>
                <input type="checkbox" />
                Remember for 30 days
              </Checkbox>
              <Forgot>Forgot Password?</Forgot>
            </Options>

            <Submit type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Submit>
          </Form>

          <DemoSection>
            <DemoTitle>Quick Access (Demo)</DemoTitle>
            <DemoButtons>
              <DemoButton onClick={() => quickLogin('admin')} disabled={loading}>
                <FaUserShield /> Login as Admin
              </DemoButton>
              <DemoButton onClick={() => quickLogin('user')}>
                <FaUser /> Login as User
              </DemoButton>
            </DemoButtons>
            {/* <DemoCredentials>
              <CredentialBox>
                <strong>Admin:</strong> admin / admin123
              </CredentialBox>
              <CredentialBox>
                <strong>User:</strong> user / user123
              </CredentialBox>
            </DemoCredentials> */}
          </DemoSection>
          
          <SignupLink>
            Don't have an account? <LinkButton onClick={() => navigate('/signup')}>Sign up</LinkButton>
          </SignupLink>
        </FormWrapper>
      </FormSection>

      {/* RIGHT */}
      <ImageSection>
        <Overlay>
          {/* <Badge>Trusted by 10,000+ users</Badge> */}
          <HeroTitle>Protect Wildlife with Intelligence</HeroTitle>
          <HeroText>
            WildGuard helps conservation teams detect threats,
            monitor wildlife, and respond faster using AI.
          </HeroText>
        </Overlay>
      </ImageSection>
    </Page>
  );
};

export default Login;

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
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
`;

const Options = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
`;

const Checkbox = styled.label`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Forgot = styled.span`
  color: #14532d;
  cursor: pointer;
`;

const Submit = styled.button`
  background: #14532d;
  color: white;
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
`;

const DemoSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e7eb;
`;

const DemoTitle = styled.h4`
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
`;

const DemoButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DemoButton = styled.button`
  flex: 1;
  padding: 0.7rem;
  background: #8b6914;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }
`;

const DemoCredentials = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.75rem;
`;

const CredentialBox = styled.div`
  padding: 0.6rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  color: #475569;
`;

const Error = styled.div`
  color: #b91c1c;
  margin-bottom: 1rem;
  font-size: 0.85rem;
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

const Badge = styled.div`
  background: rgba(0,0,0,0.5);
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  display: inline-block;
  margin-bottom: 1rem;
`;

const HeroTitle = styled.h2`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
`;

const HeroText = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

const LinkButton = styled.span`
  color: #14532d;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;
