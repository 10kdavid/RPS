import React, { useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useWallet } from '../contexts/WalletContext';
import Link from 'next/link';
import AppSidebar from '../components/Sidebar';
import { useRouter } from 'next/router';

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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const SettingsTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
`;

const SettingsSection = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: var(--text-primary);
`;

const FormInput = styled.input`
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--button-primary);
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #374151;
    transition: 0.4s;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: var(--button-primary);
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const SaveButton = styled(Button)`
  background-color: var(--button-primary);
  color: white;
  
  &:hover {
    background-color: var(--button-hover);
  }
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Settings = () => {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  
  // Form state
  const [username, setUsername] = useState('Player');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  // Add a state for sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // Add a toggleSidebar function
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save these settings to a database
    alert('Settings saved!');
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
            <SettingsTitle>Settings</SettingsTitle>
            
            {!connected ? (
              <SettingsSection>
                <SectionTitle>Account Settings</SectionTitle>
                <p>Please connect your wallet to access settings.</p>
              </SettingsSection>
            ) : (
              <>
                <SettingsSection>
                  <SectionTitle>Account Settings</SectionTitle>
                  <SettingsForm onSubmit={handleSubmit}>
                    <FormGroup>
                      <FormLabel>Username</FormLabel>
                      <FormInput 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Your display name"
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormInput 
                        type="text" 
                        value={publicKey || ''} 
                        disabled 
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <FormLabel>Email Address</FormLabel>
                      <FormInput 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="your@email.com"
                      />
                    </FormGroup>
                    
                    <ButtonGroup>
                      <SaveButton type="submit">Save Changes</SaveButton>
                      <CancelButton type="button" onClick={() => router.back()}>Cancel</CancelButton>
                    </ButtonGroup>
                  </SettingsForm>
                </SettingsSection>
                
                <SettingsSection>
                  <SectionTitle>Notifications</SectionTitle>
                  <FormGroup>
                    <FormLabel>Email Notifications</FormLabel>
                    <ToggleSwitch>
                      <input 
                        type="checkbox" 
                        checked={emailNotifications} 
                        onChange={() => setEmailNotifications(!emailNotifications)} 
                      />
                      <span></span>
                    </ToggleSwitch>
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Game Invites</FormLabel>
                    <ToggleSwitch>
                      <input 
                        type="checkbox" 
                        checked={true} 
                        onChange={() => {}} 
                      />
                      <span></span>
                    </ToggleSwitch>
                  </FormGroup>
                </SettingsSection>
                
                <SettingsSection>
                  <SectionTitle>Game Preferences</SectionTitle>
                  <FormGroup>
                    <FormLabel>Sound Effects</FormLabel>
                    <ToggleSwitch>
                      <input 
                        type="checkbox" 
                        checked={soundEffects} 
                        onChange={() => setSoundEffects(!soundEffects)} 
                      />
                      <span></span>
                    </ToggleSwitch>
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Animations</FormLabel>
                    <ToggleSwitch>
                      <input 
                        type="checkbox" 
                        checked={animations} 
                        onChange={() => setAnimations(!animations)} 
                      />
                      <span></span>
                    </ToggleSwitch>
                  </FormGroup>
                </SettingsSection>
                
                <SettingsSection>
                  <SectionTitle>Display Settings</SectionTitle>
                  <FormGroup>
                    <FormLabel>Dark Mode</FormLabel>
                    <ToggleSwitch>
                      <input 
                        type="checkbox" 
                        checked={darkMode} 
                        onChange={() => setDarkMode(!darkMode)} 
                      />
                      <span></span>
                    </ToggleSwitch>
                  </FormGroup>
                </SettingsSection>
              </>
            )}
          </SettingsContainer>
        </MainContent>
      </PageContainer>
    </>
  );
};

export default Settings; 