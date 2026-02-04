import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaFileDownload, FaCalendar, FaFilter, FaSync, FaChartBar, FaPaw, FaExclamationTriangle } from 'react-icons/fa';
import { PageHeader, Section } from '../shared/Layout';
import { Button } from '../shared/Button';
import { Form, FormGroup, Label, Select, FormRow } from '../shared/Form';
import { Card } from '../shared/Card';
import api from '../../services/api';

/**
 * Reports Page Component
 * Generate and view real-time analytics reports
 */
const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportConfig, setReportConfig] = useState({
    reportType: 'detections',
    days: '7',
  });

  // Fetch report data
  const fetchReport = async (overrideConfig = null) => {
    try {
      setLoading(true);
      setError(null);
      const config = overrideConfig || reportConfig;
      const response = await api.getUserReports({
        days: config.days,
        report_type: config.reportType
      });
      if (response.success && response.report) {
        setReport(response.report);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setReportConfig({
      ...reportConfig,
      [e.target.name]: e.target.value,
    });
  };

  // Handle report generation
  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetchReport();
  };

  // Quick report handlers
  const handleQuickReport = (type, days) => {
    const config = { reportType: type, days: days.toString() };
    setReportConfig(config);
    fetchReport(config);
  };

  // Export as JSON
  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wildguard_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Export as PDF
  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        days: reportConfig.days,
        report_type: reportConfig.reportType
      });

      const response = await fetch(`http://localhost:8000/api/user/reports/pdf/?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `WildGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError('Failed to generate PDF report');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <PageHeader>
        <HeaderContent>
          <div>
            <h1>Reports & Analytics</h1>
            <p>Real-time detection analytics and report generation</p>
          </div>
          <RefreshButton onClick={() => fetchReport()} disabled={loading}>
            <FaSync className={loading ? 'spinning' : ''} />
            {loading ? 'Loading...' : 'Refresh'}
          </RefreshButton>
        </HeaderContent>
      </PageHeader>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* Report Configuration */}
      <Section>
        <ConfigCard>
          <CardHeader>
            <h3><FaFilter /> Configure Report</h3>
          </CardHeader>

          <Form onSubmit={handleGenerateReport}>
            <FormRow>
              <FormGroup>
                <Label>Report Type</Label>
                <Select
                  name="reportType"
                  value={reportConfig.reportType}
                  onChange={handleChange}
                >
                  <option value="detections">All Detections</option>
                  <option value="animals">Wildlife Only</option>
                  <option value="humans">Human Activity Only</option>
                  <option value="alerts">Critical Alerts Only</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Time Period</Label>
                <Select name="days" value={reportConfig.days} onChange={handleChange}>
                  <option value="1">Today</option>
                  <option value="7">Last 7 Days</option>
                  <option value="14">Last 14 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </Select>
              </FormGroup>
            </FormRow>

            <ButtonRow>
              <GenerateButton type="submit" disabled={loading}>
                <FaChartBar /> Generate Report
              </GenerateButton>
              <ExportButton type="button" onClick={handleExportJSON} disabled={!report}>
                <FaFileDownload /> Export JSON
              </ExportButton>
              <PDFButton type="button" onClick={handleExportPDF} disabled={loading}>
                <FaFileDownload /> Download PDF
              </PDFButton>
            </ButtonRow>
          </Form>
        </ConfigCard>
      </Section>

      {/* Quick Reports */}
      <Section>
        <SectionTitle>Quick Reports</SectionTitle>
        <QuickReportsGrid>
          <QuickReportCard onClick={() => handleQuickReport('detections', 1)}>
            <QuickReportIcon>📊</QuickReportIcon>
            <QuickReportTitle>Today's Summary</QuickReportTitle>
            <QuickReportDescription>
              All detections from today
            </QuickReportDescription>
          </QuickReportCard>

          <QuickReportCard onClick={() => handleQuickReport('detections', 7)}>
            <QuickReportIcon>📅</QuickReportIcon>
            <QuickReportTitle>Weekly Report</QuickReportTitle>
            <QuickReportDescription>
              Last 7 days activity
            </QuickReportDescription>
          </QuickReportCard>

          <QuickReportCard onClick={() => handleQuickReport('alerts', 30)}>
            <QuickReportIcon>🚨</QuickReportIcon>
            <QuickReportTitle>Critical Alerts</QuickReportTitle>
            <QuickReportDescription>
              High-priority incidents
            </QuickReportDescription>
          </QuickReportCard>

          <QuickReportCard onClick={() => handleQuickReport('animals', 30)}>
            <QuickReportIcon>🐾</QuickReportIcon>
            <QuickReportTitle>Wildlife Activity</QuickReportTitle>
            <QuickReportDescription>
              Animal detection patterns
            </QuickReportDescription>
          </QuickReportCard>
        </QuickReportsGrid>
      </Section>

      {/* Report Results */}
      {report && (
        <Section>
          <SectionTitle>Report Results: {report.period}</SectionTitle>

          {/* Summary Stats */}
          <StatsGrid>
            <StatBox>
              <StatIcon color="#2196f3">
                <FaChartBar />
              </StatIcon>
              <StatInfo>
                <StatValue>{report.summary?.total_detections || 0}</StatValue>
                <StatLabel>Total Detections</StatLabel>
              </StatInfo>
            </StatBox>

            <StatBox>
              <StatIcon color="#f44336">
                <FaExclamationTriangle />
              </StatIcon>
              <StatInfo>
                <StatValue>{report.summary?.total_alerts || 0}</StatValue>
                <StatLabel>Total Alerts</StatLabel>
              </StatInfo>
            </StatBox>

            <StatBox>
              <StatIcon color="#4caf50">
                <FaPaw />
              </StatIcon>
              <StatInfo>
                <StatValue>{report.summary?.by_type?.image || 0}</StatValue>
                <StatLabel>Image Detections</StatLabel>
              </StatInfo>
            </StatBox>

            <StatBox>
              <StatIcon color="#9c27b0">
                🔊
              </StatIcon>
              <StatInfo>
                <StatValue>{report.summary?.by_type?.audio || 0}</StatValue>
                <StatLabel>Audio Detections</StatLabel>
              </StatInfo>
            </StatBox>
          </StatsGrid>

          {/* Alert Severity Breakdown */}
          {report.summary?.by_severity && (
            <BreakdownCard>
              <CardHeader><h3>Alert Severity Breakdown</h3></CardHeader>
              <SeverityGrid>
                <SeverityItem color="#d32f2f">
                  <SeverityCount>{report.summary.by_severity.critical || 0}</SeverityCount>
                  <SeverityLabel>Critical</SeverityLabel>
                </SeverityItem>
                <SeverityItem color="#f57c00">
                  <SeverityCount>{report.summary.by_severity.high || 0}</SeverityCount>
                  <SeverityLabel>High</SeverityLabel>
                </SeverityItem>
                <SeverityItem color="#ffa726">
                  <SeverityCount>{report.summary.by_severity.medium || 0}</SeverityCount>
                  <SeverityLabel>Medium</SeverityLabel>
                </SeverityItem>
              </SeverityGrid>
            </BreakdownCard>
          )}

          {/* Top Detected Objects */}
          {report.top_detected_objects && report.top_detected_objects.length > 0 && (
            <TopObjectsCard>
              <CardHeader><h3>Top Detected Objects</h3></CardHeader>
              <ObjectsList>
                {report.top_detected_objects.map((item, index) => (
                  <ObjectItem key={index}>
                    <ObjectRank>#{index + 1}</ObjectRank>
                    <ObjectName>{item.object}</ObjectName>
                    <ObjectCount>{item.count} detections</ObjectCount>
                  </ObjectItem>
                ))}
              </ObjectsList>
            </TopObjectsCard>
          )}

          {/* Daily Trends */}
          {report.daily_trends && report.daily_trends.length > 0 && (
            <TrendsCard>
              <CardHeader><h3>Daily Detection Trends</h3></CardHeader>
              <TrendsChart>
                {report.daily_trends.map((item, index) => (
                  <TrendBar key={index}>
                    <TrendBarFill height={Math.min((item.count / Math.max(...report.daily_trends.map(d => d.count))) * 100, 100)} />
                    <TrendLabel>{item.date.split('-').slice(1).join('/')}</TrendLabel>
                    <TrendValue>{item.count}</TrendValue>
                  </TrendBar>
                ))}
              </TrendsChart>
            </TrendsCard>
          )}

          {/* Camera Status */}
          {report.camera_status && (
            <CameraStatusCard>
              <CardHeader><h3>Camera Status</h3></CardHeader>
              <CameraStats>
                <CameraStat>
                  <CameraStatValue>{report.camera_status.total}</CameraStatValue>
                  <CameraStatLabel>Total Cameras</CameraStatLabel>
                </CameraStat>
                <CameraStat>
                  <CameraStatValue style={{ color: '#4caf50' }}>{report.camera_status.active}</CameraStatValue>
                  <CameraStatLabel>Active</CameraStatLabel>
                </CameraStat>
                <CameraStat>
                  <CameraStatValue style={{ color: '#f44336' }}>{report.camera_status.inactive}</CameraStatValue>
                  <CameraStatLabel>Inactive</CameraStatLabel>
                </CameraStat>
              </CameraStats>
            </CameraStatusCard>
          )}
        </Section>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-size: 14px;
  
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; }
  
  .spinning { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

const ErrorBanner = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 4px;
  margin: 16px 0;
`;

const ConfigCard = styled(Card)``;

const CardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 2px solid ${props => props.theme.colors.lightGray};

  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: ${props => props.theme.spacing.lg};
`;

const GenerateButton = styled(Button)`
  flex: 1;
`;

const ExportButton = styled(Button)`
  background: ${props => props.theme.colors.success};
`;

const PDFButton = styled(Button)`
  background: ${props => props.theme.colors.danger || '#d32f2f'};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const QuickReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const QuickReportCard = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const QuickReportIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const QuickReportTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.textPrimary};
`;

const QuickReportDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatBox = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSizes.xxl};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.textPrimary};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const BreakdownCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SeverityGrid = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  justify-content: center;
`;

const SeverityItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.color}15;
  border-radius: ${props => props.theme.borderRadius.lg};
  min-width: 100px;
`;

const SeverityCount = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.textPrimary};
`;

const SeverityLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const TopObjectsCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ObjectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ObjectItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.bgLight};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const ObjectRank = styled.div`
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  width: 30px;
`;

const ObjectName = styled.div`
  flex: 1;
  font-weight: 500;
`;

const ObjectCount = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
`;

const TrendsCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const TrendsChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 150px;
  padding-top: 20px;
`;

const TrendBar = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
`;

const TrendBarFill = styled.div`
  width: 100%;
  height: ${props => props.height}%;
  background: linear-gradient(180deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
`;

const TrendLabel = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 4px;
`;

const TrendValue = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: ${props => props.theme.colors.textPrimary};
`;

const CameraStatusCard = styled(Card)``;

const CameraStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xl};
  justify-content: center;
`;

const CameraStat = styled.div`
  text-align: center;
`;

const CameraStatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

const CameraStatLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

export default ReportsPage;
