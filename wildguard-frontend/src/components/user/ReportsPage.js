import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFileDownload, FaCalendar, FaFilter } from 'react-icons/fa';
import { PageHeader, Section } from '../shared/Layout';
import { Button } from '../shared/Button';
import { Form, FormGroup, Label, Input, Select, FormRow } from '../shared/Form';
import { Card } from '../shared/Card';

/**
 * Reports Page Component
 * Generate and download reports
 */
const ReportsPage = () => {
  const [reportConfig, setReportConfig] = useState({
    reportType: 'detections',
    dateFrom: '',
    dateTo: '',
    zone: 'all',
    format: 'pdf',
  });

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
    alert(`Generating ${reportConfig.reportType} report in ${reportConfig.format.toUpperCase()} format...`);
    // In production, this would call an API to generate the report
  };

  return (
    <Container>
      <PageHeader>
        <h1>Reports & Analytics</h1>
        <p>Generate custom reports for analysis and documentation</p>
      </PageHeader>

      {/* Report Configuration */}
      <Section>
        <ConfigCard>
          <CardHeader>
            <h3><FaFilter /> Configure Report</h3>
          </CardHeader>

          <Form onSubmit={handleGenerateReport}>
            <FormGroup>
              <Label>Report Type *</Label>
              <Select 
                name="reportType" 
                value={reportConfig.reportType} 
                onChange={handleChange}
              >
                <option value="detections">All Detections Report</option>
                <option value="animals">Animal Detections Only</option>
                <option value="humans">Human Intrusions Only</option>
                <option value="alerts">Critical Alerts Summary</option>
                <option value="camera-status">Camera Status Report</option>
                <option value="monthly">Monthly Summary</option>
              </Select>
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>
                  <FaCalendar /> Date From *
                </Label>
                <Input
                  type="date"
                  name="dateFrom"
                  value={reportConfig.dateFrom}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaCalendar /> Date To *
                </Label>
                <Input
                  type="date"
                  name="dateTo"
                  value={reportConfig.dateTo}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Zone Filter</Label>
                <Select name="zone" value={reportConfig.zone} onChange={handleChange}>
                  <option value="all">All Zones</option>
                  <option value="North Sector">North Sector</option>
                  <option value="East Sector">East Sector</option>
                  <option value="South Sector">South Sector</option>
                  <option value="West Sector">West Sector</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Export Format *</Label>
                <Select name="format" value={reportConfig.format} onChange={handleChange}>
                  <option value="pdf">PDF Document</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="excel">Excel Workbook</option>
                  <option value="json">JSON Data</option>
                </Select>
              </FormGroup>
            </FormRow>

            <GenerateButton type="submit">
              <FaFileDownload /> Generate Report
            </GenerateButton>
          </Form>
        </ConfigCard>
      </Section>

      {/* Quick Reports */}
      <Section>
        <SectionTitle>Quick Reports</SectionTitle>
        <QuickReportsGrid>
          <QuickReportCard>
            <QuickReportIcon>📊</QuickReportIcon>
            <QuickReportTitle>Today's Summary</QuickReportTitle>
            <QuickReportDescription>
              All detections and alerts from today
            </QuickReportDescription>
            <QuickReportButton>
              <FaFileDownload /> Download
            </QuickReportButton>
          </QuickReportCard>

          <QuickReportCard>
            <QuickReportIcon>📅</QuickReportIcon>
            <QuickReportTitle>Weekly Report</QuickReportTitle>
            <QuickReportDescription>
              Last 7 days activity summary
            </QuickReportDescription>
            <QuickReportButton>
              <FaFileDownload /> Download
            </QuickReportButton>
          </QuickReportCard>

          <QuickReportCard>
            <QuickReportIcon>🚨</QuickReportIcon>
            <QuickReportTitle>Critical Alerts</QuickReportTitle>
            <QuickReportDescription>
              All high-priority incidents
            </QuickReportDescription>
            <QuickReportButton>
              <FaFileDownload /> Download
            </QuickReportButton>
          </QuickReportCard>

          <QuickReportCard>
            <QuickReportIcon>🐾</QuickReportIcon>
            <QuickReportTitle>Wildlife Activity</QuickReportTitle>
            <QuickReportDescription>
              Animal detection patterns
            </QuickReportDescription>
            <QuickReportButton>
              <FaFileDownload /> Download
            </QuickReportButton>
          </QuickReportCard>
        </QuickReportsGrid>
      </Section>

      {/* Recent Reports */}
      <Section>
        <SectionTitle>Recent Reports</SectionTitle>
        <RecentReportsCard>
          <ReportHistory>
            <HistoryItem>
              <HistoryIcon>📄</HistoryIcon>
              <HistoryInfo>
                <HistoryTitle>Monthly Detection Report - December 2025</HistoryTitle>
                <HistoryMeta>Generated on 2025-12-29 | PDF | 2.4 MB</HistoryMeta>
              </HistoryInfo>
              <DownloadLink href="#">Download</DownloadLink>
            </HistoryItem>

            <HistoryItem>
              <HistoryIcon>📄</HistoryIcon>
              <HistoryInfo>
                <HistoryTitle>Critical Alerts Summary - Week 51</HistoryTitle>
                <HistoryMeta>Generated on 2025-12-25 | CSV | 128 KB</HistoryMeta>
              </HistoryInfo>
              <DownloadLink href="#">Download</DownloadLink>
            </HistoryItem>

            <HistoryItem>
              <HistoryIcon>📄</HistoryIcon>
              <HistoryInfo>
                <HistoryTitle>Camera Status Report - December 2025</HistoryTitle>
                <HistoryMeta>Generated on 2025-12-20 | Excel | 856 KB</HistoryMeta>
              </HistoryInfo>
              <DownloadLink href="#">Download</DownloadLink>
            </HistoryItem>
          </ReportHistory>
        </RecentReportsCard>
      </Section>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
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

const GenerateButton = styled(Button)`
  width: 100%;
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.fontSizes.lg};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const QuickReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const QuickReportCard = styled(Card)`
  text-align: center;
  transition: all ${props => props.theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const QuickReportIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const QuickReportTitle = styled.h4`
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  color: ${props => props.theme.colors.textPrimary};
`;

const QuickReportDescription = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const QuickReportButton = styled(Button)`
  width: 100%;
`;

const RecentReportsCard = styled(Card)``;

const ReportHistory = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.bgLight};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryLight}15;
  }
`;

const HistoryIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;
`;

const HistoryInfo = styled.div`
  flex: 1;
`;

const HistoryTitle = styled.div`
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const HistoryMeta = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const DownloadLink = styled.a`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSizes.sm};
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

export default ReportsPage;
