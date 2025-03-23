import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'styled-components';
import Layout from '../components/Layout';
import WalletProvider from '../contexts/WalletContext';
import '../styles/globals.css';

const theme = {
  colors: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#6b7280',
    textPrimary: '#f3f4f6',
    textSecondary: '#9ca3af',
    background: '#111827',
    cardBackground: '#1f2937',
    border: '#374151',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  fontSizes: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem',
    xxlarge: '2rem',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <WalletProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default MyApp; 