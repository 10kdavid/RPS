import React, { useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useWallet } from '../contexts/WalletContext';
import Link from 'next/link';
import AppSidebar from '../components/Sidebar';

interface SidebarProps {
  collapsed: boolean;
}

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #101d2f;
  color: white;
  position: relative;
`;

const Sidebar = styled.div<SidebarProps>`
  width: ${props => props.collapsed ? '60px' : '200px'};
  background-color: #0e1c30;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 10;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: width 0.3s ease-in-out;
`;

const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  margin-bottom: 20px;
`;

const RPSLogo = styled.div`
  background: linear-gradient(120deg, #00ecaa, #00a3ff);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: #0e1c30;
  box-shadow: 0 2px 10px rgba(0, 236, 170, 0.3);
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 70px;
  right: -15px;
  width: 30px;
  height: 30px;
  background-color: #0e1c30;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  z-index: 11;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
`;

const SidebarHeader = styled.div<SidebarProps>`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  padding: 8px 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${props => props.collapsed ? 0 : 1};
  transition: opacity 0.2s ease-in-out;
  height: ${props => props.collapsed ? '0' : 'auto'};
`;

interface SidebarLinkProps {
  collapsed: boolean;
  active?: boolean;
}

const SidebarLink = styled.a<SidebarLinkProps>`
  display: flex;
  align-items: center;
  padding: ${props => props.collapsed ? '12px 0' : '12px 20px'};
  justify-content: ${props => props.collapsed ? 'center' : 'flex-start'};
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: ${props => props.active ? '3px solid var(--button-primary)' : 'none'};
  padding-left: ${props => props.active && !props.collapsed ? '17px' : (props.collapsed ? '0' : '20px')};
  
  &:hover {
    background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
    color: white;
  }
  
  span {
    margin-left: ${props => props.collapsed ? '0' : '10px'};
    opacity: ${props => props.collapsed ? 0 : 1};
    transition: opacity 0.2s ease-in-out;
    display: ${props => props.collapsed ? 'none' : 'inline'};
  }
  
  .icon {
    font-size: 1.2rem;
    min-width: ${props => props.collapsed ? '100%' : '24px'};
    text-align: center;
  }
`;

const MainContent = styled.div<SidebarProps>`
  flex: 1;
  margin-left: ${props => props.collapsed ? '60px' : '200px'};
  padding: 0;
  display: flex;
  flex-direction: column;
  width: ${props => props.collapsed ? 'calc(100% - 60px)' : 'calc(100% - 200px)'};
  transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
`;

const SettingsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
`;

const SettingsHeader = styled.div`
  margin-bottom: 30px;
`;

const SettingsTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
`;

const SettingsDescription = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
`;

const SettingsContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsNav = styled.div`
  background-color: #0e1c30;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
`;

const SettingsNavItem = styled.div<{ active?: boolean }>`
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingsPanel = styled.div`
  background-color: #0e1c30;
  border-radius: 8px;
  padding: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 1rem;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    border-color: var(--button-primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 236, 170, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='white' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  
  &:focus {
    border-color: var(--button-primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 236, 170, 0.15);
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 10px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.9);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HelpText = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  margin-top: 6px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
`;

const PrimaryButton = styled.button`
  padding: 10px 20px;
  background-color: var(--button-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--button-hover);
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  background-color: transparent;
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const SaveButton = styled(PrimaryButton)`
  background-color: var(--button-primary);
`;

const CancelButton = styled(SecondaryButton)``;

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const { connected } = useWallet();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <SectionTitle>Profile Settings</SectionTitle>
            <FormGroup>
              <FormLabel>Display Name</FormLabel>
              <Input type="text" placeholder="Enter your display name" defaultValue="Player123" />
            </FormGroup>
            <FormGroup>
              <FormLabel>Email Address</FormLabel>
              <Input type="email" placeholder="Enter your email address" />
              <HelpText>We'll use this for account recovery and notifications</HelpText>
            </FormGroup>
            <FormGroup>
              <FormLabel>Bio</FormLabel>
              <Input as="textarea" rows={4} placeholder="Tell us about yourself" />
            </FormGroup>
            <ButtonGroup>
              <CancelButton>Cancel</CancelButton>
              <SaveButton>Save Changes</SaveButton>
            </ButtonGroup>
          </>
        );
      case 'account':
        return (
          <>
            <SectionTitle>Account Settings</SectionTitle>
            <FormGroup>
              <FormLabel>Change Password</FormLabel>
              <Input type="password" placeholder="Current password" style={{ marginBottom: '8px' }} />
              <Input type="password" placeholder="New password" style={{ marginBottom: '8px' }} />
              <Input type="password" placeholder="Confirm new password" />
            </FormGroup>
            <FormGroup>
              <FormLabel>Two-Factor Authentication</FormLabel>
              <CheckboxLabel>
                <Checkbox />
                Enable 2FA for added account security
              </CheckboxLabel>
              <HelpText>We recommend enabling 2FA to protect your account and assets</HelpText>
            </FormGroup>
            <ButtonGroup>
              <CancelButton>Cancel</CancelButton>
              <SaveButton>Save Changes</SaveButton>
            </ButtonGroup>
          </>
        );
      case 'notifications':
        return (
          <>
            <SectionTitle>Notification Settings</SectionTitle>
            <FormGroup>
              <FormLabel>Email Notifications</FormLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Game invites and challenges
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Wins and game results
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox />
                Marketing and promotions
              </CheckboxLabel>
            </FormGroup>
            <FormGroup>
              <FormLabel>In-App Notifications</FormLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Game invites
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Friend requests
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Game results
              </CheckboxLabel>
            </FormGroup>
            <ButtonGroup>
              <CancelButton>Cancel</CancelButton>
              <SaveButton>Save Changes</SaveButton>
            </ButtonGroup>
          </>
        );
      case 'wallet':
        return (
          <>
            <SectionTitle>Wallet Settings</SectionTitle>
            <FormGroup>
              <FormLabel>Connected Wallet</FormLabel>
              {connected ? (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ marginBottom: '4px' }}>Phantom Wallet</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
                      0x1234...7890
                    </div>
                  </div>
                  <SecondaryButton style={{ padding: '6px 12px' }}>Disconnect</SecondaryButton>
                </div>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '6px',
                  textAlign: 'center' 
                }}>
                  <div style={{ marginBottom: '12px' }}>No wallet connected</div>
                  <PrimaryButton style={{ background: '#00c853' }}>
                    Connect Wallet
                  </PrimaryButton>
                </div>
              )}
            </FormGroup>
            <FormGroup>
              <FormLabel>Transaction Notifications</FormLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Notify on successful transactions
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Notify on transaction failures
              </CheckboxLabel>
            </FormGroup>
          </>
        );
      case 'appearance':
        return (
          <>
            <SectionTitle>Appearance Settings</SectionTitle>
            <FormGroup>
              <FormLabel>Theme</FormLabel>
              <Select defaultValue="dark">
                <option value="dark">Dark (Default)</option>
                <option value="light">Light</option>
                <option value="system">System Preference</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <FormLabel>Animation Effects</FormLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Enable animations for smoother transitions
              </CheckboxLabel>
            </FormGroup>
            <FormGroup>
              <FormLabel>Game Table Background</FormLabel>
              <Select defaultValue="default">
                <option value="default">Classic Green</option>
                <option value="blue">Ocean Blue</option>
                <option value="purple">Royal Purple</option>
                <option value="red">Casino Red</option>
              </Select>
            </FormGroup>
            <ButtonGroup>
              <CancelButton>Cancel</CancelButton>
              <SaveButton>Save Changes</SaveButton>
            </ButtonGroup>
          </>
        );
      case 'privacy':
        return (
          <>
            <SectionTitle>Privacy Settings</SectionTitle>
            <FormGroup>
              <FormLabel>Profile Visibility</FormLabel>
              <Select defaultValue="friends">
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </Select>
              <HelpText>Controls who can see your profile and game history</HelpText>
            </FormGroup>
            <FormGroup>
              <FormLabel>Game Invites</FormLabel>
              <Select defaultValue="friends">
                <option value="anyone">Anyone</option>
                <option value="friends">Friends Only</option>
                <option value="none">No One</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <FormLabel>Data Usage</FormLabel>
              <CheckboxLabel>
                <Checkbox defaultChecked />
                Allow anonymous usage data collection to improve the platform
              </CheckboxLabel>
              <HelpText>We never share your personal data with third parties</HelpText>
            </FormGroup>
            <ButtonGroup>
              <CancelButton>Cancel</CancelButton>
              <SaveButton>Save Changes</SaveButton>
            </ButtonGroup>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      <Head>
        <title>Settings | Rock Paper Solana</title>
        <meta name="description" content="Manage your account settings on Rock Paper Solana." />
      </Head>
      
      <PageContainer>
        <AppSidebar 
          collapsed={sidebarCollapsed}
          currentPage="settings"
          toggleSidebar={toggleSidebar}
        />
        
        <MainContent collapsed={sidebarCollapsed}>
          <SettingsContainer>
            <SettingsHeader>
              <SettingsTitle>Account Settings</SettingsTitle>
              <SettingsDescription>Customize your experience on Rock Paper Solana</SettingsDescription>
            </SettingsHeader>
            
            <SettingsContent>
              <SettingsNav>
                <SettingsNavItem 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')}
                >
                  <span className="icon">👤</span> Profile
                </SettingsNavItem>
                <SettingsNavItem 
                  active={activeTab === 'account'} 
                  onClick={() => setActiveTab('account')}
                >
                  <span className="icon">🔐</span> Account Security
                </SettingsNavItem>
                <SettingsNavItem 
                  active={activeTab === 'notifications'} 
                  onClick={() => setActiveTab('notifications')}
                >
                  <span className="icon">🔔</span> Notifications
                </SettingsNavItem>
                <SettingsNavItem 
                  active={activeTab === 'wallet'} 
                  onClick={() => setActiveTab('wallet')}
                >
                  <span className="icon">💰</span> Wallet
                </SettingsNavItem>
                <SettingsNavItem 
                  active={activeTab === 'appearance'} 
                  onClick={() => setActiveTab('appearance')}
                >
                  <span className="icon">🎨</span> Appearance
                </SettingsNavItem>
                <SettingsNavItem 
                  active={activeTab === 'privacy'} 
                  onClick={() => setActiveTab('privacy')}
                >
                  <span className="icon">🔒</span> Privacy
                </SettingsNavItem>
              </SettingsNav>
              
              <SettingsPanel>
                {renderSettingsContent()}
              </SettingsPanel>
            </SettingsContent>
          </SettingsContainer>
        </MainContent>
      </PageContainer>
    </>
  );
};

export default Settings; 