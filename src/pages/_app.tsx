import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import Layout from '../components/Layout';
import WalletProvider from '../contexts/WalletContext';
import CrossmintWalletProvider from '../contexts/CrossmintWalletContext';
import '../styles/globals.css';
import WalletContextProvider from '../components/WalletContext';

// Define theme for styled-components
const theme = {
  colors: {
    primary: 'var(--button-primary)',
    primaryHover: 'var(--button-hover)',
    secondary: 'var(--text-secondary)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    background: 'var(--primary-bg)',
    cardBackground: 'var(--card-bg)',
    border: 'var(--border-color)',
    success: 'var(--button-success)',
    error: 'var(--button-danger)',
    warning: 'var(--accent-yellow)',
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

// Global styles to ensure consistent rendering
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background: var(--primary-bg);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
  }
`;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle />
      <WalletContextProvider>
        <ThemeProvider theme={theme}>
          <CrossmintWalletProvider>
            <WalletProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </WalletProvider>
          </CrossmintWalletProvider>
        </ThemeProvider>
      </WalletContextProvider>
    </>
  );
}

export default MyApp; 