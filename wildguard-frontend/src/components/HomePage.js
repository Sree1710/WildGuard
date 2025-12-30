import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaPaw, FaCamera, FaBell, FaChartLine, FaShieldAlt, FaLeaf,
  FaArrowRight, FaCheck, FaUsers, FaDatabase, FaSync
} from 'react-icons/fa';

/**
 * Professional Homepage Component
 * Landing page showing project overview and features
 */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Navigation Header */}
      <Header>
        <Logo>
          <LogoIcon>🌲</LogoIcon>
          <LogoText>WildGuard</LogoText>
        </Logo>
        <LoginButton onClick={() => navigate('/login')}>
          Login <FaArrowRight />
        </LoginButton>
      </Header>

      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>Intelligent Wildlife Monitoring & Anti-Poaching System</HeroTitle>
          <HeroSubtitle>
            Advanced AI-powered conservation technology protecting endangered species and forests
          </HeroSubtitle>
          <HeroButtons>
            <PrimaryButton onClick={() => navigate('/login')}>
              Get Started <FaArrowRight />
            </PrimaryButton>
            <SecondaryButton onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </SecondaryButton>
          </HeroButtons>
        </HeroContent>
        <HeroImage>🦁🐘🐯</HeroImage>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection id="features">
        <SectionTitle>Key Features</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon color="#4caf50">
              <FaCamera />
            </FeatureIcon>
            <FeatureTitle>Real-Time Detection</FeatureTitle>
            <FeatureDescription>
              AI-powered camera traps detect animals, humans, and suspicious activities in real-time
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="#ff9800">
              <FaBell />
            </FeatureIcon>
            <FeatureTitle>Instant Alerts</FeatureTitle>
            <FeatureDescription>
              Immediate notifications for critical events with severity levels and location details
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="#2196f3">
              <FaChartLine />
            </FeatureIcon>
            <FeatureTitle>Analytics & Reports</FeatureTitle>
            <FeatureDescription>
              Comprehensive data analysis and customizable reports for wildlife trends and patterns
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="#9c27b0">
              <FaShieldAlt />
            </FeatureIcon>
            <FeatureTitle>Anti-Poaching</FeatureTitle>
            <FeatureDescription>
              Detects unauthorized presence and suspicious activities to prevent illegal poaching
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="#f44336">
              <FaUsers />
            </FeatureIcon>
            <FeatureTitle>Multi-User Support</FeatureTitle>
            <FeatureDescription>
              Role-based access for admins and field rangers with real-time collaboration
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon color="#00bcd4">
              <FaSync />
            </FeatureIcon>
            <FeatureTitle>Offline Access</FeatureTitle>
            <FeatureDescription>
              Critical data cached for offline access ensuring continuous operation in remote areas
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* Modules Section */}
      <ModulesSection>
        <SectionTitle>System Modules</SectionTitle>
        <ModulesGrid>
          {/* Admin Module */}
          <ModuleCard>
            <ModuleHeader color="#2d5016">
              <ModuleIcon>👨‍💼</ModuleIcon>
              <ModuleTitle>Admin Module</ModuleTitle>
            </ModuleHeader>
            <ModuleFeatures>
              <ModuleFeature>
                <FaCheck /> Dashboard with analytics
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Species management
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Camera trap configuration
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Detection history & filters
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Emergency resource management
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> System health monitoring
              </ModuleFeature>
            </ModuleFeatures>
            <ModuleDescription>
              For authorized administrators and forest officials to manage the entire system
            </ModuleDescription>
          </ModuleCard>

          {/* User Module */}
          <ModuleCard>
            <ModuleHeader color="#8b6914">
              <ModuleIcon>👮</ModuleIcon>
              <ModuleTitle>User Module</ModuleTitle>
            </ModuleHeader>
            <ModuleFeatures>
              <ModuleFeature>
                <FaCheck /> Real-time alerts
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Live detection feed
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Evidence viewer (images/audio)
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Activity timeline
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Report generation
              </ModuleFeature>
              <ModuleFeature>
                <FaCheck /> Emergency contacts
              </ModuleFeature>
            </ModuleFeatures>
            <ModuleDescription>
              For field staff and rangers to monitor wildlife and respond to alerts
            </ModuleDescription>
          </ModuleCard>
        </ModulesGrid>
      </ModulesSection>

      {/* Tech Stack Section */}
      <TechSection>
        <SectionTitle>Built With Modern Technology</SectionTitle>
        <TechGrid>
          <TechItem>
            <TechIcon>⚛️</TechIcon>
            <TechName>React.js</TechName>
          </TechItem>
          <TechItem>
            <TechIcon>🎨</TechIcon>
            <TechName>styled-components</TechName>
          </TechItem>
          <TechItem>
            <TechIcon>🗺️</TechIcon>
            <TechName>React Router</TechName>
          </TechItem>
          <TechItem>
            <TechIcon>📊</TechIcon>
            <TechName>Recharts</TechName>
          </TechItem>
          <TechItem>
            <TechIcon>🎯</TechIcon>
            <TechName>React Icons</TechName>
          </TechItem>
          <TechItem>
            <TechIcon>🔐</TechIcon>
            <TechName>Auth Context</TechName>
          </TechItem>
        </TechGrid>
      </TechSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to Get Started?</CTATitle>
          <CTADescription>
            Login to WildGuard and start monitoring wildlife conservation efforts
          </CTADescription>
          <CTAButton onClick={() => navigate('/login')}>
            Go to Login <FaArrowRight />
          </CTAButton>
        </CTAContent>
      </CTASection>

      {/* Stats Section */}
      <StatsSection>
        <StatItem>
          <StatNumber>12</StatNumber>
          <StatLabel>Camera Traps</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>1248</StatNumber>
          <StatLabel>Detections</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>28</StatNumber>
          <StatLabel>Active Zones</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>92%</StatNumber>
          <StatLabel>AI Accuracy</StatLabel>
        </StatItem>
      </StatsSection>

      {/* Footer */}
      <Footer>
        <FooterContent>
          <FooterSection>
            <FooterTitle>WildGuard</FooterTitle>
            <FooterText>
              Intelligent Wildlife Monitoring and Anti-Poaching System for forest conservation
            </FooterText>
          </FooterSection>
          <FooterSection>
            <FooterTitle>Quick Links</FooterTitle>
            <FooterLink onClick={() => navigate('/login')}>Login</FooterLink>
            <FooterLink onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              Features
            </FooterLink>
          </FooterSection>
          <FooterSection>
            <FooterTitle>Demo Accounts</FooterTitle>
            <FooterText>Admin: admin / admin123</FooterText>
            <FooterText>User: user / user123</FooterText>
          </FooterSection>
        </FooterContent>
        <FooterBottom>
          <p>© 2025 WildGuard - Master's Project. All rights reserved.</p>
        </FooterBottom>
      </Footer>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.bgLight} 0%, #f0f7f0 100%);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xl};
  background: ${props => props.theme.colors.white};
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  cursor: pointer;
`;

const LogoIcon = styled.div`
  font-size: 2.5rem;
`;

const LogoText = styled.h1`
  margin: 0;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.fontSizes.xxl};
`;

const LoginButton = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const HeroSection = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xxl};
  align-items: center;
  padding: ${props => props.theme.spacing.xxl};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    padding: ${props => props.theme.spacing.xl};
  }
`;

const HeroContent = styled.div``;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.fontSizes.xxxl};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: 1.6;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xxl};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const SecondaryButton = styled.button`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xxl};
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    background: ${props => props.theme.colors.primary}15;
    transform: translateY(-4px);
  }
`;

const HeroImage = styled.div`
  font-size: 8rem;
  text-align: center;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;

const FeaturesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl};
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  text-align: center;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xxl};
  font-size: ${props => props.theme.fontSizes.xxxl};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const FeatureCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.normal};
  text-align: center;

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: ${props => props.theme.borderRadius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto ${props => props.theme.spacing.md};
`;

const FeatureTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const ModulesSection = styled.section`
  padding: ${props => props.theme.spacing.xxl};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10 0%, ${props => props.theme.colors.secondary}10 100%);
  max-width: 1400px;
  margin: 0 auto;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${props => props.theme.spacing.xl};
`;

const ModuleCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ModuleHeader = styled.div`
  background: ${props => props.color};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
`;

const ModuleIcon = styled.div`
  font-size: 3rem;
`;

const ModuleTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xl};
`;

const ModuleFeatures = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const ModuleFeature = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.textPrimary};
  font-size: ${props => props.theme.fontSizes.md};

  svg {
    color: ${props => props.theme.colors.success};
    flex-shrink: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ModuleDescription = styled.p`
  padding: 0 ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin: 0;
`;

const TechSection = styled.section`
  padding: ${props => props.theme.spacing.xxl};
  max-width: 1400px;
  margin: 0 auto;
`;

const TechGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const TechItem = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const TechIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const TechName = styled.div`
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xxl};
  text-align: center;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  font-size: ${props => props.theme.fontSizes.xxxl};
`;

const CTADescription = styled.p`
  font-size: ${props => props.theme.fontSizes.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  opacity: 0.95;
`;

const CTAButton = styled.button`
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.xxl};
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.primary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.bold};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const StatsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.xxl};
  max-width: 1400px;
  margin: 0 auto;
`;

const StatItem = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const StatNumber = styled.div`
  font-size: ${props => props.theme.fontSizes.xxxl};
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeights.bold};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const Footer = styled.footer`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.xxl};
  margin-top: ${props => props.theme.spacing.xxl};
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto ${props => props.theme.spacing.xl};
`;

const FooterSection = styled.div``;

const FooterTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.fontSizes.lg};
`;

const FooterText = styled.p`
  margin: ${props => props.theme.spacing.sm} 0;
  opacity: 0.9;
  font-size: ${props => props.theme.fontSizes.sm};
`;

const FooterLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.white};
  text-decoration: underline;
  cursor: pointer;
  font-size: ${props => props.theme.fontSizes.sm};
  padding: 0;
  margin: ${props => props.theme.spacing.xs} 0;
  opacity: 0.9;

  &:hover {
    opacity: 1;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  opacity: 0.8;

  p {
    margin: 0;
  }
`;

export default HomePage;
