import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Image from 'next/image';

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
  margin-bottom: 1rem;
  color: white;
  text-align: center;
  font-weight: 700;
`;

const Subtitle = styled.h2`
  font-size: 1.8rem;
  margin: 2.5rem 0 1.5rem;
  color: white;
  font-weight: 600;
`;

const AboutSection = styled.section`
  margin: 3rem 0;
`;

const HeroSection = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
`;

const SectionContent = styled.div`
  line-height: 1.8;
  color: #e0e0e0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const MissionBox = styled.div`
  background-color: #0e1c30;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 3rem auto;
  max-width: 800px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
`;

const MissionStatement = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 1rem;
  font-style: italic;
  color: #e0e0e0;
`;

const MissionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--button-primary);
`;

const HighlightText = styled.span`
  color: var(--button-primary);
  font-weight: 600;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const TeamMember = styled.div`
  text-align: center;
  background-color: #0e1c30;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const MemberImageContainer = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  overflow: hidden;
  background-color: #0a1525;
  position: relative;
`;

const MemberName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: white;
`;

const MemberTitle = styled.p`
  font-size: 0.9rem;
  color: var(--button-primary);
  margin-bottom: 1rem;
  font-weight: 500;
`;

const MemberBio = styled.p`
  font-size: 0.9rem;
  color: #e0e0e0;
  line-height: 1.6;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.2s;
  
  &:hover {
    color: var(--button-primary);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
`;

const StatBox = styled.div`
  background-color: #0e1c30;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--button-primary);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #e0e0e0;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const FeatureBox = styled.div`
  background-color: #0e1c30;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeatureIcon = styled.div`
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

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  color: #e0e0e0;
  line-height: 1.6;
`;

// Team members data
const teamMembers = [
  {
    name: 'Alex Johnson',
    title: 'Founder & CEO',
    bio: 'Former Solana core developer with a passion for blockchain gaming. Led development teams at major tech companies before founding Rock Paper Solana.',
    image: '/team/alex.png',
    placeholderText: 'AJ',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    name: 'Sophia Chen',
    title: 'Lead Game Developer',
    bio: 'Blockchain gaming expert with 8+ years of experience in game development. Previously worked at Epic Games and Ubisoft.',
    image: '/team/sophia.png',
    placeholderText: 'SC',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    name: 'Marcus Williams',
    title: 'CTO',
    bio: 'Experienced blockchain architect with a background in distributed systems. Contributed to multiple Solana projects and DeFi protocols.',
    image: '/team/marcus.png',
    placeholderText: 'MW',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    name: 'Eliza Rodriguez',
    title: 'Head of Design',
    bio: 'Award-winning UI/UX designer specializing in blockchain applications. Passionate about creating intuitive and engaging user experiences.',
    image: '/team/eliza.png',
    placeholderText: 'ER',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      dribbble: 'https://dribbble.com'
    }
  },
  {
    name: 'David Park',
    title: 'Lead Smart Contract Developer',
    bio: 'Solana smart contract specialist with a background in cryptography and secure systems design. Previously at Solana Labs.',
    image: '/team/david.png',
    placeholderText: 'DP',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    name: 'Nadia Ali',
    title: 'Community Manager',
    bio: 'Web3 enthusiast and community builder with experience managing large crypto communities. Previously led growth at a major NFT marketplace.',
    image: '/team/nadia.png',
    placeholderText: 'NA',
    socialLinks: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com'
    }
  }
];

// Stats data
const stats = [
  { value: '100K+', label: 'Active Users' },
  { value: '1M+', label: 'Games Played' },
  { value: '$2M+', label: 'SOL Wagered' },
  { value: '99.9%', label: 'Uptime' }
];

// Features data
const features = [
  {
    title: 'Provably Fair Games',
    description: 'All games use verifiable random generation with on-chain transactions ensuring complete transparency and fairness.',
    icon: '🎲'
  },
  {
    title: 'Instant Transactions',
    description: 'Leveraging Solana\'s lightning-fast blockchain for seamless deposits, gameplay, and withdrawals with minimal wait times.',
    icon: '⚡'
  },
  {
    title: 'Low Fees',
    description: 'Minimal platform fees and the efficiency of Solana blockchain means more of your money goes toward gameplay.',
    icon: '💰'
  },
  {
    title: 'Secure Wallet Integration',
    description: 'Connect your favorite Solana wallet with our secure integration for easy access to your funds without compromise.',
    icon: '🔒'
  },
  {
    title: 'Community-Focused',
    description: 'Built by gamers for gamers, with regular updates based on community feedback and governance.',
    icon: '👥'
  },
  {
    title: 'Multi-Device Support',
    description: 'Play seamlessly across desktop and mobile devices with a responsive design optimized for any screen size.',
    icon: '📱'
  }
];

const AboutPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>About Us | Rock Paper Solana</title>
        <meta name="description" content="Learn about the team behind Rock Paper Solana, our mission, and why we're building the future of blockchain gaming." />
      </Head>
      <PageContainer>
        <HeroSection>
          <Title>About Rock Paper Solana</Title>
          <SectionContent>
            Founded in 2023, Rock Paper Solana is pioneering the next generation of blockchain gaming by bringing traditional games to the Solana blockchain. Our platform combines the familiarity of classic games with the security, transparency, and efficiency of blockchain technology.
          </SectionContent>
        </HeroSection>
        
        <MissionBox>
          <MissionTitle>Our Mission</MissionTitle>
          <MissionStatement>
            "To create an accessible, fair, and fun gaming ecosystem that leverages blockchain technology to empower players with true ownership and verifiable gameplay, while building a thriving community of blockchain gamers."
          </MissionStatement>
        </MissionBox>
        
        <AboutSection>
          <Subtitle>Why Rock Paper Solana?</Subtitle>
          <SectionContent>
            We believe gaming should be <HighlightText>transparent</HighlightText>, <HighlightText>fair</HighlightText>, and <HighlightText>accessible</HighlightText> to everyone. By building on the Solana blockchain, we're able to offer lightning-fast transactions, minimal fees, and provably fair gameplay mechanics that are verifiable on-chain.
            <br /><br />
            Unlike traditional online gaming platforms, Rock Paper Solana gives players complete control over their funds with direct wallet integration. Every game outcome is verifiable, ensuring complete transparency and eliminating any suspicion of manipulation.
          </SectionContent>
          
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatBox key={index}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatBox>
            ))}
          </StatsGrid>
        </AboutSection>
        
        <AboutSection>
          <Subtitle>Our Features</Subtitle>
          <FeatureGrid>
            {features.map((feature, index) => (
              <FeatureBox key={index}>
                <FeatureTitle>
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  {feature.title}
                </FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureBox>
            ))}
          </FeatureGrid>
        </AboutSection>
        
        <AboutSection>
          <Subtitle>Meet Our Team</Subtitle>
          <SectionContent>
            Our diverse team brings together expertise in blockchain development, game design, and community building. We're united by our passion for creating innovative gaming experiences on the blockchain.
          </SectionContent>
          
          <TeamGrid>
            {teamMembers.map((member, index) => (
              <TeamMember key={index}>
                <MemberImageContainer>
                  {/* Fallback for missing images in this demo */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    color: 'white',
                    backgroundColor: '#172a43'
                  }}>
                    {member.placeholderText}
                  </div>
                </MemberImageContainer>
                <MemberName>{member.name}</MemberName>
                <MemberTitle>{member.title}</MemberTitle>
                <MemberBio>{member.bio}</MemberBio>
                <SocialLinks>
                  {member.socialLinks.twitter && (
                    <SocialLink href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </SocialLink>
                  )}
                  {member.socialLinks.linkedin && (
                    <SocialLink href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </SocialLink>
                  )}
                  {member.socialLinks.github && (
                    <SocialLink href={member.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                    </SocialLink>
                  )}
                  {member.socialLinks.dribbble && (
                    <SocialLink href={member.socialLinks.dribbble} target="_blank" rel="noopener noreferrer">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/>
                      </svg>
                    </SocialLink>
                  )}
                  {member.socialLinks.instagram && (
                    <SocialLink href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </SocialLink>
                  )}
                </SocialLinks>
              </TeamMember>
            ))}
          </TeamGrid>
        </AboutSection>
      </PageContainer>
    </>
  );
};

export default AboutPage; 