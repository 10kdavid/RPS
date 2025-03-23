import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';

// Styled Components
const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
  min-height: 100vh;
  background-color: #101d2f;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: white;
  text-align: center;
  font-weight: 700;
`;

const Subtitle = styled.h2`
  font-size: 1.8rem;
  margin: 2.5rem 0 1rem;
  color: white;
  font-weight: 600;
`;

const Section = styled.section`
  margin: 3rem 0;
`;

const HelpGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const HelpCard = styled.div`
  background-color: #0e1c30;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: rgba(0, 236, 65, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--button-primary);
  font-size: 1.2rem;
`;

const CardDescription = styled.p`
  font-size: 0.95rem;
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const StyledLink = styled.a`
  color: var(--button-primary);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 3rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--button-primary);
    box-shadow: 0 0 0 2px rgba(0, 236, 65, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.div<TabProps>`
  padding: 0.75rem 1.5rem;
  white-space: nowrap;
  cursor: pointer;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.active ? 'var(--button-primary)' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const StepsContainer = styled.div`
  margin: 2rem 0;
`;

const Step = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const StepNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--button-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: white;
`;

const StepDescription = styled.p`
  font-size: 0.95rem;
  color: #e0e0e0;
  line-height: 1.6;
`;

const ImagePlaceholder = styled.div`
  background-color: #0e1c30;
  border-radius: 8px;
  width: 100%;
  height: 200px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const FAQContainer = styled.div`
  margin: 2rem 0;
`;

const FAQItem = styled.div`
  margin-bottom: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
`;

const FAQQuestion = styled.div`
  padding: 1rem;
  font-weight: 600;
  cursor: pointer;
  background-color: #0e1c30;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const FAQAnswer = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '1rem' : '0 1rem'};
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  line-height: 1.6;
  opacity: ${props => props.isOpen ? '1' : '0'};
  color: #e0e0e0;
`;

// Help category data
const helpCategories = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of Rock Paper Solana and how to set up your account.',
    icon: '🚀',
    link: '#getting-started'
  },
  {
    title: 'Wallet Management',
    description: 'Guide to connecting, depositing, and withdrawing using your Solana wallet.',
    icon: '💰',
    link: '#wallet'
  },
  {
    title: 'Rock Paper Scissors Game',
    description: 'Learn the rules and strategies for our Rock Paper Scissors game.',
    icon: '✂️',
    link: '#rock-paper-scissors'
  },
  {
    title: 'Blackjack Game',
    description: 'Rules, gameplay guide, and tips for playing Blackjack on our platform.',
    icon: '🃏',
    link: '#blackjack'
  },
  {
    title: 'Troubleshooting',
    description: 'Solutions to common issues you might encounter while using the platform.',
    icon: '🔧',
    link: '#troubleshooting'
  },
  {
    title: 'Security Guide',
    description: 'Best practices for keeping your account and funds secure.',
    icon: '🔒',
    link: '#security'
  }
];

// FAQ data
const faqs = [
  {
    category: 'general',
    question: 'What is Rock Paper Solana?',
    answer: 'Rock Paper Solana is a blockchain-based gaming platform built on the Solana network that offers classic games like Rock Paper Scissors and Blackjack with provably fair gameplay mechanics and transparent transactions.'
  },
  {
    category: 'general',
    question: 'Do I need cryptocurrency to play?',
    answer: 'Yes, to play games with real wagers, you\'ll need to have SOL (Solana\'s native cryptocurrency) in your wallet. We support various Solana wallets like Phantom and Solflare. However, you can also play in practice mode without real cryptocurrency.'
  },
  {
    category: 'wallet',
    question: 'How do I connect my wallet?',
    answer: 'To connect your wallet, click on the "Connect Wallet" button in the top right corner of the website. You\'ll be prompted to select your preferred wallet provider. Follow the instructions to authorize the connection. Once connected, you\'ll be able to see your wallet balance and participate in games.'
  },
  {
    category: 'wallet',
    question: 'How do I deposit funds?',
    answer: 'After connecting your wallet, navigate to the "Wallet" page and click on "Deposit". You\'ll see your deposit address. Use your Solana wallet to send SOL to this address. Deposits are typically confirmed within 15-30 seconds.'
  },
  {
    category: 'wallet',
    question: 'How do withdrawals work?',
    answer: 'To withdraw funds, go to the "Wallet" page and select "Withdraw". Enter the amount you wish to withdraw and your destination Solana address. Confirm the transaction, and your funds will be sent to your wallet. Withdrawals are processed on the Solana blockchain and typically complete within 1-2 minutes.'
  },
  {
    category: 'games',
    question: 'How does the Rock Paper Scissors game work?',
    answer: 'In our Rock Paper Scissors game, you place a wager and choose rock, paper, or scissors. The game uses a provably fair system to determine the computer\'s choice. Rock beats scissors, scissors beat paper, and paper beats rock. Winners receive 1.97x their wager (after platform fees).'
  },
  {
    category: 'games',
    question: 'How does Blackjack work on your platform?',
    answer: 'Our Blackjack game follows standard rules: beat the dealer\'s hand without going over 21. The game uses a provably fair system for card shuffling and dealing. You can place wagers, hit, stand, double down, or split pairs according to traditional Blackjack rules.'
  },
  {
    category: 'troubleshooting',
    question: 'What should I do if a game freezes?',
    answer: 'If a game freezes, first try refreshing your browser. If the issue persists, check your internet connection. All game states are stored on the blockchain, so you won\'t lose your place or wagers. If you continue to experience problems, please contact our support team through the Contact page.'
  },
  {
    category: 'troubleshooting',
    question: 'Why is my transaction taking a long time?',
    answer: 'While Solana transactions are typically very fast, network congestion can occasionally cause delays. If your transaction is taking longer than expected, please wait a few minutes. You can check the status of your transaction on a Solana blockchain explorer using the transaction ID. If the issue persists for more than 10 minutes, please contact support.'
  },
  {
    category: 'security',
    question: 'How do I know the games are fair?',
    answer: 'All our games use provably fair algorithms that can be independently verified. Each game session generates a unique seed that is hashed and stored on the blockchain. After the game concludes, you can verify that the outcome was not manipulated by checking the original seed against the hashed value.'
  }
];

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Filter FAQs based on category or search query
  const filteredFaqs = faqs.filter(faq => 
    (activeTab === 'all' || faq.category === activeTab) &&
    (searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  return (
    <>
      <Head>
        <title>Help & Guides | Rock Paper Solana</title>
        <meta name="description" content="Get help with Rock Paper Solana, including game guides, wallet setup, and troubleshooting." />
      </Head>
      <PageContainer>
        <Title>Help Center</Title>
        
        <SearchContainer>
          <SearchInput 
            type="text" 
            placeholder="Search for help topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        
        <HelpGrid>
          {helpCategories.map((category, index) => (
            <HelpCard key={index}>
              <CardTitle>
                <CardIcon>{category.icon}</CardIcon>
                {category.title}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
              <Link href={category.link} passHref>
                <StyledLink>Learn more &rarr;</StyledLink>
              </Link>
            </HelpCard>
          ))}
        </HelpGrid>
        
        <Section id="getting-started">
          <Subtitle>Getting Started</Subtitle>
          <StepsContainer>
            <Step>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>Create an Account</StepTitle>
                <StepDescription>
                  Visit Rock Paper Solana and click on "Connect Wallet" in the top right corner. Choose your preferred Solana wallet provider (Phantom, Solflare, etc.) and follow the prompts to connect your wallet.
                </StepDescription>
                <ImagePlaceholder>Screenshot of wallet connection dialog</ImagePlaceholder>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>Deposit Funds</StepTitle>
                <StepDescription>
                  Once your wallet is connected, navigate to the Wallet page and click "Deposit". You'll receive a deposit address where you can send SOL from your Solana wallet. Deposits are typically confirmed within seconds.
                </StepDescription>
                <ImagePlaceholder>Screenshot of deposit screen</ImagePlaceholder>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>Select a Game</StepTitle>
                <StepDescription>
                  Go to the Games page and choose from our selection of games. Each game has its own rules and wagering options. Click on a game to start playing.
                </StepDescription>
                <ImagePlaceholder>Screenshot of games selection</ImagePlaceholder>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>4</StepNumber>
              <StepContent>
                <StepTitle>Play and Win</StepTitle>
                <StepDescription>
                  Place your wagers and enjoy the games! All outcomes are provably fair and recorded on the Solana blockchain. Your winnings will be automatically credited to your account balance.
                </StepDescription>
                <ImagePlaceholder>Screenshot of gameplay</ImagePlaceholder>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>5</StepNumber>
              <StepContent>
                <StepTitle>Withdraw Winnings</StepTitle>
                <StepDescription>
                  Ready to cash out? Go to the Wallet page and click "Withdraw". Enter the amount you want to withdraw and your Solana wallet address. Your funds will be sent directly to your wallet.
                </StepDescription>
                <ImagePlaceholder>Screenshot of withdrawal screen</ImagePlaceholder>
              </StepContent>
            </Step>
          </StepsContainer>
        </Section>
        
        <Section id="wallet">
          <Subtitle>Wallet Management</Subtitle>
          <StepsContainer>
            <Step>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>Connect Your Wallet</StepTitle>
                <StepDescription>
                  Click the "Connect Wallet" button in the navigation bar. You'll be prompted to select and authorize your wallet provider. We support Phantom, Solflare, Sollet, and other popular Solana wallets.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>Deposit SOL</StepTitle>
                <StepDescription>
                  Navigate to the Wallet page and select the "Deposit" tab. You'll see your unique deposit address. Send SOL from your wallet to this address. The minimum deposit is 0.01 SOL.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>Withdraw Funds</StepTitle>
                <StepDescription>
                  On the Wallet page, select the "Withdraw" tab. Enter the amount you wish to withdraw and your destination Solana wallet address. Confirm the transaction to complete your withdrawal.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>4</StepNumber>
              <StepContent>
                <StepTitle>View Transaction History</StepTitle>
                <StepDescription>
                  Your transaction history is available on the Wallet page under the "Transactions" tab. You can view all deposits, withdrawals, and game transactions with timestamps and status information.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>5</StepNumber>
              <StepContent>
                <StepTitle>Wallet Security</StepTitle>
                <StepDescription>
                  Always ensure you're using the official Rock Paper Solana website. Never share your wallet's private keys or seed phrase with anyone. Enable two-factor authentication for your wallet if available.
                </StepDescription>
              </StepContent>
            </Step>
          </StepsContainer>
        </Section>
        
        <Section id="rock-paper-scissors">
          <Subtitle>Rock Paper Scissors Guide</Subtitle>
          <StepsContainer>
            <Step>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>Game Rules</StepTitle>
                <StepDescription>
                  Rock Paper Scissors is a simple game of chance. Rock beats Scissors, Scissors beats Paper, and Paper beats Rock. If both players choose the same option, it's a tie.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>Place Your Wager</StepTitle>
                <StepDescription>
                  Enter the amount you want to wager. The minimum bet is 0.01 SOL, and the maximum is 10 SOL. Your potential payout is displayed before you confirm your wager.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>Make Your Choice</StepTitle>
                <StepDescription>
                  Click on Rock, Paper, or Scissors to make your selection. The game uses a provably fair algorithm to determine the opponent's choice.
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>4</StepNumber>
              <StepContent>
                <StepTitle>View Results</StepTitle>
                <StepDescription>
                  After you make your selection, the opponent's choice is revealed and the result is displayed. Winning games pay 1.97x your wager (after platform fees).
                </StepDescription>
              </StepContent>
            </Step>
            
            <Step>
              <StepNumber>5</StepNumber>
              <StepContent>
                <StepTitle>Verify Fairness</StepTitle>
                <StepDescription>
                  Each game generates a unique seed that is hashed and stored on the Solana blockchain. After the game, you can verify that your result was fair by checking the seed against the hash.
                </StepDescription>
              </StepContent>
            </Step>
          </StepsContainer>
        </Section>
        
        <Section id="faqs">
          <Subtitle>Frequently Asked Questions</Subtitle>
          
          <TabsContainer>
            <Tab 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              All
            </Tab>
            <Tab 
              active={activeTab === 'general'} 
              onClick={() => setActiveTab('general')}
            >
              General
            </Tab>
            <Tab 
              active={activeTab === 'wallet'} 
              onClick={() => setActiveTab('wallet')}
            >
              Wallet
            </Tab>
            <Tab 
              active={activeTab === 'games'} 
              onClick={() => setActiveTab('games')}
            >
              Games
            </Tab>
            <Tab 
              active={activeTab === 'troubleshooting'} 
              onClick={() => setActiveTab('troubleshooting')}
            >
              Troubleshooting
            </Tab>
            <Tab 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')}
            >
              Security
            </Tab>
          </TabsContainer>
          
          <FAQContainer>
            {filteredFaqs.length === 0 ? (
              <p>No FAQs match your search criteria. Please try a different search term or category.</p>
            ) : (
              filteredFaqs.map((faq, index) => (
                <FAQItem key={index}>
                  <FAQQuestion onClick={() => toggleFaq(index)}>
                    {faq.question}
                    <span>{activeFaq === index ? '−' : '+'}</span>
                  </FAQQuestion>
                  <FAQAnswer isOpen={activeFaq === index}>
                    {faq.answer}
                  </FAQAnswer>
                </FAQItem>
              ))
            )}
          </FAQContainer>
        </Section>
        
        <Section>
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <p>Still have questions? We're here to help!</p>
            <Link href="/contact" passHref>
              <StyledLink style={{ fontWeight: '600', fontSize: '1.1rem', display: 'inline-block', margin: '1rem 0' }}>
                Contact Support
              </StyledLink>
            </Link>
          </div>
        </Section>
      </PageContainer>
    </>
  );
};

export default HelpPage; 