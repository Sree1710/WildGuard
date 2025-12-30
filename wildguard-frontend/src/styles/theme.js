// Forest-inspired color theme for WildGuard
export const theme = {
  // Primary colors - Forest greens
  colors: {
    primary: '#2d5016',        // Deep forest green
    primaryLight: '#4a7c2c',   // Lighter forest green
    primaryDark: '#1a3009',    // Darker forest green
    
    secondary: '#8b6914',      // Earthy brown
    secondaryLight: '#b8941e', // Light brown
    
    // Status colors
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3',
    
    // Neutral colors
    white: '#ffffff',
    lightGray: '#f5f5f5',
    gray: '#9e9e9e',
    darkGray: '#424242',
    black: '#212121',
    
    // Alert severity colors
    critical: '#d32f2f',
    high: '#f57c00',
    medium: '#ffa726',
    low: '#ffd54f',
    
    // Background colors
    bgLight: '#f9faf8',
    bgDark: '#e8ede5',
    
    // Text colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textLight: '#ffffff',
  },
  
  // Typography
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Courier New", monospace',
  },
  
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    xxl: '1.5rem',    // 24px
    xxxl: '2rem',     // 32px
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },
  
  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
};
