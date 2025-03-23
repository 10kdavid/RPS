import React, { useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useWallet } from '../../contexts/WalletContext';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: var(--text-primary);
`;

const SettingsCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
`;

const SettingsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const FormDescription = styled.p`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 4px;
`;

const ThemeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

interface ThemeOptionProps {
  isSelected: boolean;
}

const ThemeOption = styled.div<ThemeOptionProps>`
  padding: 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: ${props => props.isSelected ? 'var(--button-primary)' : 'var(--primary-bg)'};
  color: ${props => props.isSelected ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--button-hover)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const ThemeIcon = styled.div`
  font-size: 1.5rem;
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: var(--button-primary);
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--primary-bg);
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const SaveButton = styled.button`
  padding: 12px;
  background-color: var(--button-primary);
  color: white;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 20px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--button-hover);
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

const SettingInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

interface NotificationSettings {
  gameResults: boolean;
  newGames: boolean;
  transactions: boolean;
  promotions: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  withdrawalConfirmation: boolean;
}

const SettingsPage = () => {
  const { connected, openWalletModal } = useWallet();
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    gameResults: true,
    newGames: true,
    transactions: true,
    promotions: false
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginNotifications: true,
    withdrawalConfirmation: true
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  
  const handleThemeChange = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };
  
  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };
  
  const handleSecurityChange = (key: keyof SecuritySettings) => {
    setSecurity({
      ...security,
      [key]: !security[key]
    });
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate saving settings
    setTimeout(() => {
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  return (
    <>
      <Head>
        <title>Settings | Rock Paper Solana</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Head>
      
      <PageContainer>
        <PageTitle>Settings</PageTitle>
        
        {connected ? (
          <SettingsForm onSubmit={handleSaveSettings}>
            <SettingsCard>
              <SettingsHeader>
                <SettingsTitle>Appearance</SettingsTitle>
              </SettingsHeader>
              
              <FormGroup>
                <FormLabel>Theme</FormLabel>
                <FormDescription>Choose the theme for the application</FormDescription>
                <ThemeSelector>
                  <ThemeOption 
                    isSelected={theme === Theme.DARK}
                    onClick={() => handleThemeChange(Theme.DARK)}
                  >
                    <ThemeIcon>🌙</ThemeIcon>
                    <div>Dark</div>
                  </ThemeOption>
                  <ThemeOption 
                    isSelected={theme === Theme.LIGHT}
                    onClick={() => handleThemeChange(Theme.LIGHT)}
                  >
                    <ThemeIcon>☀️</ThemeIcon>
                    <div>Light</div>
                  </ThemeOption>
                </ThemeSelector>
              </FormGroup>
            </SettingsCard>
            
            <SettingsCard>
              <SettingsHeader>
                <SettingsTitle>Notifications</SettingsTitle>
              </SettingsHeader>
              
              <FormGroup>
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>Game Results</FormLabel>
                    <FormDescription>Get notified about your game results</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={notifications.gameResults}
                      onChange={() => handleNotificationChange('gameResults')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
                
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>New Games</FormLabel>
                    <FormDescription>Get notified when new games are added</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={notifications.newGames}
                      onChange={() => handleNotificationChange('newGames')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
                
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>Transactions</FormLabel>
                    <FormDescription>Get notified about deposits and withdrawals</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={notifications.transactions}
                      onChange={() => handleNotificationChange('transactions')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
                
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>Promotions</FormLabel>
                    <FormDescription>Get notified about promotions and special offers</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={notifications.promotions}
                      onChange={() => handleNotificationChange('promotions')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
              </FormGroup>
            </SettingsCard>
            
            <SettingsCard>
              <SettingsHeader>
                <SettingsTitle>Security</SettingsTitle>
              </SettingsHeader>
              
              <FormGroup>
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>Two-Factor Authentication</FormLabel>
                    <FormDescription>Add an extra layer of security to your account</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={security.twoFactorAuth}
                      onChange={() => handleSecurityChange('twoFactorAuth')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
                
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>Login Notifications</FormLabel>
                    <FormDescription>Get notified when your account is accessed</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={security.loginNotifications}
                      onChange={() => handleSecurityChange('loginNotifications')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
                
                <SettingRow>
                  <SettingInfo>
                    <FormLabel>Withdrawal Confirmation</FormLabel>
                    <FormDescription>Require confirmation for withdrawals</FormDescription>
                  </SettingInfo>
                  <Toggle>
                    <ToggleInput 
                      type="checkbox" 
                      checked={security.withdrawalConfirmation}
                      onChange={() => handleSecurityChange('withdrawalConfirmation')}
                    />
                    <ToggleSlider />
                  </Toggle>
                </SettingRow>
              </FormGroup>
            </SettingsCard>
            
            {saveSuccess && (
              <div style={{ color: 'var(--accent-green)', marginBottom: '10px' }}>
                Settings saved successfully!
              </div>
            )}
            
            <SaveButton type="submit">Save Settings</SaveButton>
          </SettingsForm>
        ) : (
          <SettingsCard>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ marginBottom: '20px' }}>Please connect your wallet to manage settings</p>
              <SaveButton onClick={openWalletModal}>Connect Wallet</SaveButton>
            </div>
          </SettingsCard>
        )}
      </PageContainer>
    </>
  );
};

export default SettingsPage; 