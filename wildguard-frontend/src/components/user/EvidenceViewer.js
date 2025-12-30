import React, { useState } from 'react';
import styled from 'styled-components';
import { FaImage, FaVolumeUp, FaMapMarkerAlt, FaClock, FaChartBar } from 'react-icons/fa';
import { PageHeader, Section, Grid, Badge } from '../shared/Layout';
import { Card } from '../shared/Card';
import { detectionHistory, audioEvidence } from '../../data/mockData';

/**
 * Detection Evidence Viewer Component
 * View image and audio evidence from detections
 */
const EvidenceViewer = () => {
  const [selectedEvidence, setSelectedEvidence] = useState(detectionHistory[0]);
  const [evidenceType, setEvidenceType] = useState('image'); // 'image' or 'audio'

  return (
    <Container>
      <PageHeader>
        <h1>Detection Evidence</h1>
        <p>Review captured images and audio recordings</p>
      </PageHeader>

      {/* Evidence Type Toggle */}
      <Section>
        <TypeToggle>
          <ToggleButton 
            active={evidenceType === 'image'} 
            onClick={() => setEvidenceType('image')}
          >
            <FaImage /> Images ({detectionHistory.length})
          </ToggleButton>
          <ToggleButton 
            active={evidenceType === 'audio'} 
            onClick={() => setEvidenceType('audio')}
          >
            <FaVolumeUp /> Audio ({audioEvidence.length})
          </ToggleButton>
        </TypeToggle>
      </Section>

      {evidenceType === 'image' ? (
        <>
          {/* Main Evidence Display */}
          <Section>
            <Grid columns="1fr 350px">
              {/* Image Preview */}
              <ImageCard>
                <ImagePreview>
                  <FaImage size={80} />
                  <p>Image: {selectedEvidence.image}</p>
                  <small>Actual image would display here in production</small>
                </ImagePreview>
              </ImageCard>

              {/* Metadata Panel */}
              <MetadataPanel>
                <PanelHeader>
                  <h3>Detection Metadata</h3>
                </PanelHeader>

                <MetadataItem>
                  <MetadataLabel>Detection ID</MetadataLabel>
                  <MetadataValue>{selectedEvidence.id}</MetadataValue>
                </MetadataItem>

                <MetadataItem>
                  <MetadataLabel>Type</MetadataLabel>
                  <MetadataValue>
                    <Badge variant={
                      selectedEvidence.type === 'Animal' ? 'success' : 
                      selectedEvidence.type === 'Human' ? 'warning' : 'danger'
                    }>
                      {selectedEvidence.type}
                    </Badge>
                  </MetadataValue>
                </MetadataItem>

                <MetadataItem>
                  <MetadataLabel>Species/Subject</MetadataLabel>
                  <MetadataValue>{selectedEvidence.species}</MetadataValue>
                </MetadataItem>

                <MetadataItem>
                  <MetadataLabel>
                    <FaMapMarkerAlt /> Location
                  </MetadataLabel>
                  <MetadataValue>{selectedEvidence.location}</MetadataValue>
                </MetadataItem>

                <MetadataItem>
                  <MetadataLabel>
                    <FaClock /> Timestamp
                  </MetadataLabel>
                  <MetadataValue>{selectedEvidence.timestamp}</MetadataValue>
                </MetadataItem>

                <MetadataItem>
                  <MetadataLabel>
                    <FaChartBar /> Confidence Score
                  </MetadataLabel>
                  <MetadataValue>
                    <ConfidenceScore score={selectedEvidence.confidence}>
                      {Math.round(selectedEvidence.confidence * 100)}%
                    </ConfidenceScore>
                  </MetadataValue>
                </MetadataItem>
              </MetadataPanel>
            </Grid>
          </Section>

          {/* Evidence Thumbnails */}
          <Section>
            <SectionTitle>All Image Evidence</SectionTitle>
            <ThumbnailGrid>
              {detectionHistory.map((evidence) => (
                <Thumbnail
                  key={evidence.id}
                  active={selectedEvidence.id === evidence.id}
                  onClick={() => setSelectedEvidence(evidence)}
                >
                  <ThumbnailIcon>
                    <FaImage />
                  </ThumbnailIcon>
                  <ThumbnailInfo>
                    <ThumbnailTitle>{evidence.species}</ThumbnailTitle>
                    <ThumbnailTime>{evidence.timestamp}</ThumbnailTime>
                  </ThumbnailInfo>
                </Thumbnail>
              ))}
            </ThumbnailGrid>
          </Section>
        </>
      ) : (
        <>
          {/* Audio Evidence */}
          <Section>
            <AudioGrid>
              {audioEvidence.map((audio) => (
                <AudioCard key={audio.id}>
                  <AudioHeader>
                    <AudioIcon>
                      <FaVolumeUp />
                    </AudioIcon>
                    <AudioTitle>{audio.type} Detection</AudioTitle>
                  </AudioHeader>

                  <AudioDetails>
                    <DetailRow>
                      <DetailLabel><FaClock /> Timestamp</DetailLabel>
                      <DetailValue>{audio.timestamp}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel><FaMapMarkerAlt /> Location</DetailLabel>
                      <DetailValue>{audio.location}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Duration</DetailLabel>
                      <DetailValue>{audio.duration}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>Confidence</DetailLabel>
                      <DetailValue>
                        <ConfidenceScore score={audio.confidence}>
                          {Math.round(audio.confidence * 100)}%
                        </ConfidenceScore>
                      </DetailValue>
                    </DetailRow>
                  </AudioDetails>

                  <AudioPlayer>
                    <PlayButton>▶</PlayButton>
                    <AudioWaveform>
                      <WaveformBar height={40} />
                      <WaveformBar height={70} />
                      <WaveformBar height={50} />
                      <WaveformBar height={80} />
                      <WaveformBar height={60} />
                      <WaveformBar height={90} />
                      <WaveformBar height={70} />
                      <WaveformBar height={50} />
                    </AudioWaveform>
                  </AudioPlayer>

                  <AudioFileName>{audio.audioFile}</AudioFileName>
                </AudioCard>
              ))}
            </AudioGrid>
          </Section>
        </>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const TypeToggle = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ToggleButton = styled.button`
  flex: 1;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightGray};
  color: ${props => props.active ? props.theme.colors.white : props.theme.colors.textPrimary};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
  }
`;

const ImageCard = styled(Card)`
  height: 500px;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme.colors.bgLight};
  border: 2px dashed ${props => props.theme.colors.gray};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray};

  p {
    margin-top: ${props => props.theme.spacing.md};
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.textPrimary};
  }

  small {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const MetadataPanel = styled(Card)`
  height: 500px;
  overflow-y: auto;
`;

const PanelHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 2px solid ${props => props.theme.colors.lightGray};

  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
  }
`;

const MetadataItem = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const MetadataLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const MetadataValue = styled.div`
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
`;

const ConfidenceScore = styled.span`
  display: inline-block;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.score > 0.8 ? props.theme.colors.success : 
                props.score > 0.6 ? props.theme.colors.warning : props.theme.colors.danger};
  color: ${props => props.theme.colors.white};
  font-weight: ${props => props.theme.fontWeights.semibold};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const Thumbnail = styled.div`
  background: ${props => props.theme.colors.white};
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.lightGray};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const ThumbnailIcon = styled.div`
  width: 100%;
  height: 120px;
  background: ${props => props.theme.colors.bgLight};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.gray};
  font-size: 2rem;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ThumbnailInfo = styled.div``;

const ThumbnailTitle = styled.div`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.xs};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const ThumbnailTime = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const AudioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const AudioCard = styled(Card)``;

const AudioHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const AudioIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const AudioTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.textPrimary};
`;

const AudioDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.lightGray};
`;

const DetailLabel = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const DetailValue = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
`;

const AudioPlayer = styled.div`
  background: ${props => props.theme.colors.bgLight};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const PlayButton = styled.button`
  width: 50px;
  height: 50px;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius.round};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: scale(1.1);
  }
`;

const AudioWaveform = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100px;
  gap: ${props => props.theme.spacing.xs};
`;

const WaveformBar = styled.div`
  width: 8px;
  height: ${props => props.height}%;
  background: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: height ${props => props.theme.transitions.fast};
`;

const AudioFileName = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
`;

export default EvidenceViewer;
