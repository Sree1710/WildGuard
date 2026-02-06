import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  FaPaw, FaCamera, FaBell, FaChartLine, FaShieldAlt, FaLeaf,
  FaArrowRight, FaCheck, FaUsers, FaDatabase, FaSync, FaPlay,
  FaMicrophone, FaImage, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';

/**
 * Professional Homepage Component
 * Google-quality landing page for WildGuard
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Animate stats on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <FaCamera />, title: 'Image Detection', desc: 'YOLO-based object detection identifies wildlife, humans, and threats' },
    { icon: <FaMicrophone />, title: 'Audio Analysis', desc: 'Random Forest classifier detects gunshots, vehicles, and animal calls' },
    { icon: <FaBell />, title: 'Smart Alerts', desc: 'Priority-based notification system for rapid response' },
    { icon: <FaChartLine />, title: 'Analytics', desc: 'Comprehensive reports and ecological insights' },
  ];

  return (
    <Container>
      {/* Floating Navigation */}
      <NavBar>
        <NavContent>
          <LogoWrapper onClick={() => navigate('/')}>
            <LogoImage src="/images/generated-image.png" alt="WildGuard" />
            <LogoText>WildGuard</LogoText>
          </LogoWrapper>
          <NavLinks>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#modules">Modules</NavLink>
          </NavLinks>
          <NavActions>
            <LoginBtn onClick={() => navigate('/login')}>
              Login <FaArrowRight />
            </LoginBtn>
          </NavActions>
        </NavContent>
      </NavBar>

      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <HeroGradient />
        <HeroContent>
          <HeroBadge>
            <FaShieldAlt /> AI-Powered Conservation
          </HeroBadge>
          <HeroTitle>
            Protect Wildlife with
            <HeroHighlight> Intelligent Monitoring</HeroHighlight>
          </HeroTitle>
          <HeroSubtitle>
            Multi-modal detection system using computer vision and acoustic analysis
            to safeguard forests against poaching and intrusion.
          </HeroSubtitle>
          <HeroButtons>
            <PrimaryBtn onClick={() => navigate('/login')}>
              Get Started <FaArrowRight />
            </PrimaryBtn>
            <SecondaryBtn href="#features">
              Learn More
            </SecondaryBtn>
          </HeroButtons>
          <HeroStats>
            <HeroStat>
              <HeroStatValue>92%</HeroStatValue>
              <HeroStatLabel>Detection Accuracy</HeroStatLabel>
            </HeroStat>
            <HeroStatDivider />
            <HeroStat>
              <HeroStatValue>24/7</HeroStatValue>
              <HeroStatLabel>Real-time Monitoring</HeroStatLabel>
            </HeroStat>
            <HeroStatDivider />
            <HeroStat>
              <HeroStatValue>&lt;2s</HeroStatValue>
              <HeroStatLabel>Alert Response</HeroStatLabel>
            </HeroStat>
          </HeroStats>
        </HeroContent>
        <HeroVisual>
          <HeroImageWrapper>
            <HeroImage src="/images/elephant-forest.png" alt="Wildlife" />
            <HeroImageOverlay />
            <FloatingCard style={{ top: '10%', right: '-20px' }}>
              <FloatingIcon color="#4caf50"><FaPaw /></FloatingIcon>
              <FloatingText>
                <strong>Elephant Detected</strong>
                <span>Confidence: 96%</span>
              </FloatingText>
            </FloatingCard>
            <FloatingCard style={{ bottom: '20%', left: '-30px' }}>
              <FloatingIcon color="#ff9800"><FaBell /></FloatingIcon>
              <FloatingText>
                <strong>Alert Triggered</strong>
                <span>Human activity detected</span>
              </FloatingText>
            </FloatingCard>
          </HeroImageWrapper>
        </HeroVisual>
      </HeroSection>

      {/* Trusted By Section */}
      <TrustedSection>
        <TrustedText>Designed for Forest Departments & Conservation Organizations</TrustedText>
        <TrustedLogos>
          <TrustedBadge><FaLeaf /> Open Source</TrustedBadge>
          <TrustedBadge><FaSync /> Real-time</TrustedBadge>
          <TrustedBadge><FaShieldAlt /> Secure</TrustedBadge>
        </TrustedLogos>
      </TrustedSection>

      {/* Features Section */}
      <FeaturesSection id="features" data-animate>
        <SectionHeader>
          <SectionLabel>Features</SectionLabel>
          <SectionTitle>Everything You Need for Wildlife Protection</SectionTitle>
          <SectionSubtitle>
            Comprehensive tools for monitoring, detection, and response
          </SectionSubtitle>
        </SectionHeader>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIconBox color="#4caf50">
              <FaCamera />
            </FeatureIconBox>
            <FeatureContent>
              <FeatureTitle>Camera Trap Integration</FeatureTitle>
              <FeatureDesc>
                Seamlessly connect and manage multiple camera traps across forest regions.
                Track battery levels, storage, and connectivity in real-time.
              </FeatureDesc>
              <FeatureList>
                <FeatureListItem><FaCheck /> GPS location tracking</FeatureListItem>
                <FeatureListItem><FaCheck /> Remote status monitoring</FeatureListItem>
              </FeatureList>
            </FeatureContent>
          </FeatureCard>

          <FeatureCard>
            <FeatureIconBox color="#2196f3">
              <FaImage />
            </FeatureIconBox>
            <FeatureContent>
              <FeatureTitle>YOLO Image Detection</FeatureTitle>
              <FeatureDesc>
                State-of-the-art object detection identifies animals, humans, and vehicles
                with bounding boxes and confidence scores.
              </FeatureDesc>
              <FeatureList>
                <FeatureListItem><FaCheck /> Multi-class detection</FeatureListItem>
                <FeatureListItem><FaCheck /> Real-time processing</FeatureListItem>
              </FeatureList>
            </FeatureContent>
          </FeatureCard>

          <FeatureCard>
            <FeatureIconBox color="#9c27b0">
              <FaMicrophone />
            </FeatureIconBox>
            <FeatureContent>
              <FeatureTitle>Audio Classification</FeatureTitle>
              <FeatureDesc>
                Random Forest classifier analyzes forest sounds to detect gunshots,
                chainsaws, vehicles, and wildlife calls.
              </FeatureDesc>
              <FeatureList>
                <FeatureListItem><FaCheck /> Frequency pattern analysis</FeatureListItem>
                <FeatureListItem><FaCheck /> 20 acoustic features</FeatureListItem>
              </FeatureList>
            </FeatureContent>
          </FeatureCard>

          <FeatureCard>
            <FeatureIconBox color="#ff9800">
              <FaBell />
            </FeatureIconBox>
            <FeatureContent>
              <FeatureTitle>Smart Alert System</FeatureTitle>
              <FeatureDesc>
                Priority-based alerts ensure critical threats get immediate attention
                while routine detections are processed systematically.
              </FeatureDesc>
              <FeatureList>
                <FeatureListItem><FaCheck /> Severity-based filtering</FeatureListItem>
                <FeatureListItem><FaCheck /> Admin verification workflow</FeatureListItem>
              </FeatureList>
            </FeatureContent>
          </FeatureCard>

          <FeatureCard>
            <FeatureIconBox color="#f44336">
              <FaUsers />
            </FeatureIconBox>
            <FeatureContent>
              <FeatureTitle>Role-Based Access</FeatureTitle>
              <FeatureDesc>
                Separate dashboards for administrators and field rangers with
                appropriate permissions and workflows.
              </FeatureDesc>
              <FeatureList>
                <FeatureListItem><FaCheck /> Admin full control</FeatureListItem>
                <FeatureListItem><FaCheck /> Field Ranger view access</FeatureListItem>
              </FeatureList>
            </FeatureContent>
          </FeatureCard>

          <FeatureCard>
            <FeatureIconBox color="#00bcd4">
              <FaChartLine />
            </FeatureIconBox>
            <FeatureContent>
              <FeatureTitle>Analytics & Reports</FeatureTitle>
              <FeatureDesc>
                Generate comprehensive PDF reports with detection trends,
                species activity, and alert statistics.
              </FeatureDesc>
              <FeatureList>
                <FeatureListItem><FaCheck /> Customizable date ranges</FeatureListItem>
                <FeatureListItem><FaCheck /> Export to PDF/JSON</FeatureListItem>
              </FeatureList>
            </FeatureContent>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      {/* How It Works */}
      <HowItWorksSection id="how-it-works">
        <SectionHeaderLight>
          <SectionLabelLight>How It Works</SectionLabelLight>
          <SectionTitleLight>Multi-Modal Detection Pipeline</SectionTitleLight>
          <SectionSubtitleLight>
            Combining visual and acoustic analysis for comprehensive monitoring
          </SectionSubtitleLight>
        </SectionHeaderLight>

        <PipelineContainer>
          <PipelineStep>
            <PipelineNumber>01</PipelineNumber>
            <PipelineIcon><FaCamera /></PipelineIcon>
            <PipelineTitle>Capture</PipelineTitle>
            <PipelineDesc>Camera traps and audio sensors capture data from forest regions</PipelineDesc>
          </PipelineStep>
          <PipelineArrow>→</PipelineArrow>
          <PipelineStep>
            <PipelineNumber>02</PipelineNumber>
            <PipelineIcon><FaDatabase /></PipelineIcon>
            <PipelineTitle>Process</PipelineTitle>
            <PipelineDesc>ML models analyze images and audio for detection</PipelineDesc>
          </PipelineStep>
          <PipelineArrow>→</PipelineArrow>
          <PipelineStep>
            <PipelineNumber>03</PipelineNumber>
            <PipelineIcon><FaBell /></PipelineIcon>
            <PipelineTitle>Alert</PipelineTitle>
            <PipelineDesc>Priority-based alerts notify conservation teams</PipelineDesc>
          </PipelineStep>
          <PipelineArrow>→</PipelineArrow>
          <PipelineStep>
            <PipelineNumber>04</PipelineNumber>
            <PipelineIcon><FaShieldAlt /></PipelineIcon>
            <PipelineTitle>Respond</PipelineTitle>
            <PipelineDesc>Quick action to prevent poaching and protect wildlife</PipelineDesc>
          </PipelineStep>
        </PipelineContainer>
      </HowItWorksSection>

      {/* Modules Section */}
      <ModulesSection id="modules">
        <SectionHeader>
          <SectionLabel>System Modules</SectionLabel>
          <SectionTitle>Comprehensive Conservation Platform</SectionTitle>
        </SectionHeader>

        <ModulesGrid>
          <ModuleCard variant="admin">
            <ModuleHeader>
              <ModuleIcon><FaShieldAlt /></ModuleIcon>
              <ModuleBadge>Admin</ModuleBadge>
            </ModuleHeader>
            <ModuleTitle>Admin Module</ModuleTitle>
            <ModuleDesc>Full system control for forest department officials</ModuleDesc>
            <ModuleFeatures>
              <ModuleFeature><FaCheck /> Dashboard analytics</ModuleFeature>
              <ModuleFeature><FaCheck /> Camera management</ModuleFeature>
              <ModuleFeature><FaCheck /> Detection verification</ModuleFeature>
              <ModuleFeature><FaCheck /> Emergency management</ModuleFeature>
              <ModuleFeature><FaCheck /> System monitoring</ModuleFeature>
            </ModuleFeatures>
          </ModuleCard>

          <ModuleCard variant="user">
            <ModuleHeader>
              <ModuleIcon><FaUsers /></ModuleIcon>
              <ModuleBadge>Field Ranger</ModuleBadge>
            </ModuleHeader>
            <ModuleTitle>User Module</ModuleTitle>
            <ModuleDesc>Essential tools for rangers and field personnel</ModuleDesc>
            <ModuleFeatures>
              <ModuleFeature><FaCheck /> Real-time alerts</ModuleFeature>
              <ModuleFeature><FaCheck /> Evidence viewer</ModuleFeature>
              <ModuleFeature><FaCheck /> Activity timeline</ModuleFeature>
              <ModuleFeature><FaCheck /> Report generation</ModuleFeature>
              <ModuleFeature><FaCheck /> Emergency contacts</ModuleFeature>
            </ModuleFeatures>
          </ModuleCard>
        </ModulesGrid>
      </ModulesSection>

      {/* Stats Section */}
      <StatsSection id="stats" data-animate>
        <StatsGrid>
          <StatCard>
            <StatIcon><FaCamera /></StatIcon>
            <StatValue>12+</StatValue>
            <StatLabel>Camera Traps Supported</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FaPaw /></StatIcon>
            <StatValue>50+</StatValue>
            <StatLabel>Species Detectable</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FaBell /></StatIcon>
            <StatValue>1000+</StatValue>
            <StatLabel>Detections Processed</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon><FaShieldAlt /></StatIcon>
            <StatValue>92%</StatValue>
            <StatLabel>Detection Accuracy</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to Protect Wildlife?</CTATitle>
          <CTADesc>
            Join the fight against poaching with intelligent monitoring technology
          </CTADesc>
          <CTAButton onClick={() => navigate('/login')}>
            Get Started Now <FaArrowRight />
          </CTAButton>
        </CTAContent>
        <CTAPattern />
      </CTASection>

      {/* Footer */}
      <Footer>
        <FooterGrid>
          <FooterBrand>
            <FooterLogo src="/images/generated-image.png" alt="WildGuard" />
            <FooterBrandName>WildGuard</FooterBrandName>
            <FooterTagline>
              Intelligent Wildlife Monitoring and Anti-Poaching System
            </FooterTagline>
          </FooterBrand>

          <FooterLinks>
            <FooterTitle>Quick Links</FooterTitle>
            <FooterLink onClick={() => navigate('/login')}>Login</FooterLink>
            <FooterLink href="#features">Features</FooterLink>
            <FooterLink href="#how-it-works">How It Works</FooterLink>
            <FooterLink href="#modules">Modules</FooterLink>
          </FooterLinks>

          <FooterContact>
            <FooterTitle>Emergency Contacts</FooterTitle>
            <FooterContactItem>
              <strong>Police:</strong> 100
            </FooterContactItem>
            <FooterContactItem>
              <strong>Forest Helpline:</strong> 1926
            </FooterContactItem>
            <FooterContactItem>
              <strong>Fire & Rescue:</strong> 101
            </FooterContactItem>
            <FooterContactItem>
              <strong>Ambulance:</strong> 108
            </FooterContactItem>
          </FooterContact>
        </FooterGrid>

        <FooterBottom>
          <FooterCopyright>© 2025 WildGuard. All rights reserved.</FooterCopyright>
          <FooterCredits>MCA Project • Wildlife Conservation Technology</FooterCredits>
        </FooterBottom>
      </Footer>
    </Container>
  );
};

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: #fafbfc;
  overflow-x: hidden;
`;

const NavBar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
`;

const LogoText = styled.span`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 40px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: color 0.2s;
  
  &:hover {
    color: #2e7d32;
  }
`;

const NavActions = styled.div`
  display: flex;
  gap: 12px;
`;

const LoginBtn = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(46, 125, 50, 0.3);
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  padding: 120px 40px 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: 140px;
  }
`;

const HeroBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fdf8 0%, #e8f5e9 50%, #c8e6c9 100%);
  z-index: -2;
`;

const HeroGradient = styled.div`
  position: fixed;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%);
  z-index: -1;
`;

const HeroContent = styled.div`
  animation: ${fadeInUp} 1s ease-out;
`;

const HeroBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 1px solid rgba(46, 125, 50, 0.2);
  border-radius: 50px;
  color: #2e7d32;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.2;
  margin: 0 0 24px 0;
`;

const HeroHighlight = styled.span`
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 32px 0;
  max-width: 540px;
  
  @media (max-width: 1024px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
  
  @media (max-width: 1024px) {
    justify-content: center;
  }
`;

const PrimaryBtn = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(46, 125, 50, 0.35);
  }
`;

const SecondaryBtn = styled.a`
  padding: 16px 32px;
  background: white;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  border-radius: 50px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s;
  
  &:hover {
    background: #2e7d32;
    color: white;
  }
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  
  @media (max-width: 1024px) {
    justify-content: center;
  }
`;

const HeroStat = styled.div``;

const HeroStatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #2e7d32;
`;

const HeroStatLabel = styled.div`
  font-size: 13px;
  color: #888;
  font-weight: 500;
`;

const HeroStatDivider = styled.div`
  width: 1px;
  height: 40px;
  background: #ddd;
`;

const HeroVisual = styled.div`
  position: relative;
  animation: ${fadeInUp} 1s ease-out 0.3s both;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const HeroImageWrapper = styled.div`
  position: relative;
  border-radius: 24px;
  overflow: visible;
`;

const HeroImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
`;

const HeroImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.3) 100%);
  border-radius: 24px;
`;

const FloatingCard = styled.div`
  position: absolute;
  background: white;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${float} 4s ease-in-out infinite;
  z-index: 10;
`;

const FloatingIcon = styled.div`
  width: 44px;
  height: 44px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const FloatingText = styled.div`
  strong {
    display: block;
    font-size: 14px;
    color: #333;
  }
  span {
    font-size: 12px;
    color: #888;
  }
`;

const TrustedSection = styled.section`
  background: white;
  padding: 40px;
  text-align: center;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
`;

const TrustedText = styled.p`
  color: #888;
  font-size: 14px;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TrustedLogos = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const TrustedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f8f9fa;
  border-radius: 50px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px;
`;

const SectionLabel = styled.div`
  color: #4caf50;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 16px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin: 0;
`;

const FeaturesSection = styled.section`
  padding: 100px 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIconBox = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const FeatureContent = styled.div``;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px 0;
`;

const FeatureDesc = styled.p`
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FeatureListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  
  svg {
    color: #4caf50;
    font-size: 12px;
  }
`;

const HowItWorksSection = styled.section`
  padding: 120px 40px;
  background: linear-gradient(180deg, #0d1f0d 0%, #1a2f1a 50%, #0d1f0d 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #4caf50, transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #4caf50, transparent);
  }
`;

const SectionHeaderLight = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px;
`;

const SectionLabelLight = styled.div`
  color: #4caf50;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 16px;
`;

const SectionTitleLight = styled.h2`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  color: white;
  margin: 0 0 20px 0;
  text-shadow: 0 0 40px rgba(76, 175, 80, 0.3);
`;

const SectionSubtitleLight = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
`;

const PipelineContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
`;

const PipelineStep = styled.div`
  text-align: center;
  width: 240px;
  padding: 30px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 24px;
  transition: all 0.4s;
  
  &:hover {
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.5);
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(76, 175, 80, 0.2);
  }
`;

const PipelineNumber = styled.div`
  font-size: 56px;
  font-weight: 900;
  background: linear-gradient(180deg, rgba(76, 175, 80, 0.4) 0%, rgba(76, 175, 80, 0.1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
`;

const PipelineIcon = styled.div`
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  margin: 0 auto 24px;
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4),
              0 0 60px rgba(76, 175, 80, 0.2);
  transition: all 0.3s;
  
  ${PipelineStep}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 15px 40px rgba(76, 175, 80, 0.5),
                0 0 80px rgba(76, 175, 80, 0.3);
  }
`;

const PipelineTitle = styled.h4`
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
`;

const PipelineDesc = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.6;
`;

const PipelineArrow = styled.div`
  font-size: 36px;
  color: #4caf50;
  margin-top: 100px;
  text-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 1100px) {
    display: none;
  }
`;

const ModulesSection = styled.section`
  padding: 100px 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ModulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
`;

const ModuleCard = styled.div`
  background: ${props => props.variant === 'admin'
    ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'
    : 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'};
  border-radius: 24px;
  padding: 40px;
  color: white;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 50px ${props => props.variant === 'admin'
    ? 'rgba(26, 35, 126, 0.3)'
    : 'rgba(46, 125, 50, 0.3)'};
  }
`;

const ModuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const ModuleIcon = styled.div`
  font-size: 32px;
  opacity: 0.9;
`;

const ModuleBadge = styled.div`
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ModuleTitle = styled.h3`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const ModuleDesc = styled.p`
  font-size: 16px;
  opacity: 0.85;
  margin: 0 0 28px 0;
`;

const ModuleFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ModuleFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  
  svg {
    opacity: 0.9;
  }
`;

const StatsSection = styled.section`
  padding: 80px 40px;
  background: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 40px 20px;
  background: #fafbfc;
  border-radius: 20px;
  transition: all 0.3s;
  
  &:hover {
    background: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 20px;
`;

const StatValue = styled.div`
  font-size: 42px;
  font-weight: 800;
  color: #2e7d32;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 15px;
  color: #666;
`;

const CTASection = styled.section`
  padding: 100px 40px;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  position: relative;
  overflow: hidden;
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const CTAPattern = styled.div`
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
`;

const CTATitle = styled.h2`
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  color: white;
  margin: 0 0 20px 0;
`;

const CTADesc = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px 0;
`;

const CTAButton = styled.button`
  padding: 18px 40px;
  background: white;
  color: #2e7d32;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }
`;

const Footer = styled.footer`
  background: #1a1a1a;
  color: white;
  padding: 80px 40px 40px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto 60px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FooterBrand = styled.div``;

const FooterLogo = styled.img`
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
`;

const FooterBrandName = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const FooterTagline = styled.p`
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin: 0;
`;

const FooterLinks = styled.div``;

const FooterTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const FooterLink = styled.a`
  display: block;
  color: #888;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #4caf50;
  }
`;

const FooterContact = styled.div``;

const FooterContactItem = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 10px;
  
  strong {
    color: #ccc;
  }
`;

const FooterTech = styled.div``;

const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TechBadge = styled.span`
  padding: 6px 12px;
  background: #2d2d2d;
  border-radius: 6px;
  font-size: 12px;
  color: #aaa;
`;

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 40px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const FooterCopyright = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const FooterCredits = styled.p`
  margin: 0;
  font-size: 14px;
  color: #555;
`;

export default HomePage;
