import { createGlobalStyle } from 'styled-components';

// Global styles applied to the entire application
export const GlobalStyles = createGlobalStyle`
  /* CSS Reset and Base Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: ${props => props.theme.fonts.primary};
    color: ${props => props.theme.colors.textPrimary};
    background-color: ${props => props.theme.colors.bgLight};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.fontWeights.semibold};
    line-height: 1.2;
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  h1 {
    font-size: ${props => props.theme.fontSizes.xxxl};
  }
  
  h2 {
    font-size: ${props => props.theme.fontSizes.xxl};
  }
  
  h3 {
    font-size: ${props => props.theme.fontSizes.xl};
  }
  
  h4 {
    font-size: ${props => props.theme.fontSizes.lg};
  }
  
  p {
    margin-bottom: ${props => props.theme.spacing.md};
  }
  
  /* Links */
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.fast};
    
    &:hover {
      color: ${props => props.theme.colors.primaryLight};
    }
  }
  
  /* Lists */
  ul, ol {
    list-style: none;
  }
  
  /* Images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  /* Buttons */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
  }
  
  /* Inputs */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    outline: none;
  }
  
  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.lightGray};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: ${props => props.theme.borderRadius.md};
    
    &:hover {
      background: ${props => props.theme.colors.primaryDark};
    }
  }
  
  /* Utility Classes */
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  .mt-1 {
    margin-top: ${props => props.theme.spacing.md};
  }
  
  .mb-1 {
    margin-bottom: ${props => props.theme.spacing.md};
  }
`;
