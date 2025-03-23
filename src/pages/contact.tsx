import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';

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
  margin-bottom: 2rem;
  color: white;
  text-align: center;
  font-weight: 700;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #e0e0e0;
`;

const ContactSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #0e1c30;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const InfoItem = styled.div`
  margin-bottom: .5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: var(--button-primary);
  }
`;

const ContactForm = styled.form`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 500;
  color: #e0e0e0;
`;

const Input = styled.input`
  padding: 0.75rem;
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
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--button-primary);
    box-shadow: 0 0 0 2px rgba(0, 236, 65, 0.2);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--button-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  width: max-content;
  align-self: flex-end;
  
  &:hover {
    background-color: var(--button-hover);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Notification = styled.div<{ success?: boolean }>`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => props.success ? 'rgba(0, 236, 65, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
  color: ${props => props.success ? 'var(--button-primary)' : '#ff5555'};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const FAQSection = styled.div`
  margin-top: 3rem;
  max-width: 800px;
  margin: 3rem auto 0;
`;

const FAQ = styled.div`
  margin-bottom: 1.5rem;
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

// FAQ Data
const faqs = [
  {
    question: 'How do I connect my Solana wallet?',
    answer: 'You can connect your Solana wallet by clicking on the "Connect Wallet" button in the top right corner of any page. We support Phantom, Solflare, and other popular Solana wallets. Simply select your preferred wallet provider and follow the instructions to connect.',
  },
  {
    question: 'Is there a minimum deposit amount?',
    answer: 'Yes, the minimum deposit amount is 0.01 SOL. This ensures that transaction fees can be covered and provides a baseline for gameplay.',
  },
  {
    question: 'How long do withdrawals take?',
    answer: 'Withdrawals are processed on the Solana blockchain and typically complete within 1-2 minutes. During times of high network congestion, this may take slightly longer.',
  },
  {
    question: 'What fees are associated with playing games?',
    answer: 'We charge a small fee of 1.5% on all game winnings to maintain the platform. Standard Solana network transaction fees also apply for deposits and withdrawals.',
  },
  {
    question: 'How do I report a bug or issue?',
    answer: 'If you encounter any issues, please fill out the contact form on this page with detailed information about the problem you\'re experiencing. Our team will investigate and respond as soon as possible.',
  },
];

const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!name || !email || !message) {
      setNotification({
        message: 'Please fill out all required fields',
        success: false
      });
      return;
    }
    
    // In a real app, this would send data to an API
    // For demo purposes, just simulate a successful submission
    setNotification({
      message: 'Thank you for your message! We will get back to you soon.',
      success: true
    });
    
    // Reset form
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

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
        <title>Contact Us | Rock Paper Solana</title>
        <meta name="description" content="Get in touch with the Rock Paper Solana team for support, feedback, or partnership inquiries." />
      </Head>
      <PageContainer>
        <Title>Contact Us</Title>
        
        <ContactSection>
          <ContactInfo>
            <SubTitle>Get In Touch</SubTitle>
            <InfoItem>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              support@rockpapersolana.com
            </InfoItem>
            <InfoItem>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              +1 (888) RPS-GAME
            </InfoItem>
            <InfoItem>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              San Francisco, CA
            </InfoItem>
            
            <div style={{ marginTop: '1.5rem' }}>
              <p>Our team is available Monday through Friday, 9am to 5pm Pacific Time.</p>
              <p style={{ marginTop: '0.5rem' }}>For urgent matters, please contact us via email.</p>
            </div>
          </ContactInfo>
          
          <ContactForm onSubmit={handleSubmit}>
            {notification && (
              <Notification success={notification.success}>
                {notification.message}
              </Notification>
            )}
            
            <FormGroup>
              <Label htmlFor="name">Name *</Label>
              <Input 
                type="text" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Email *</Label>
              <Input 
                type="email" 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                type="text" 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="message">Message *</Label>
              <TextArea 
                id="message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </FormGroup>
            
            <SubmitButton type="submit">Send Message</SubmitButton>
          </ContactForm>
        </ContactSection>
        
        <FAQSection>
          <SubTitle style={{ textAlign: 'center', marginBottom: '2rem' }}>Frequently Asked Questions</SubTitle>
          
          {faqs.map((faq, index) => (
            <FAQ key={index}>
              <FAQQuestion onClick={() => toggleFaq(index)}>
                {faq.question}
                <span>{activeFaq === index ? '−' : '+'}</span>
              </FAQQuestion>
              <FAQAnswer isOpen={activeFaq === index}>
                {faq.answer}
              </FAQAnswer>
            </FAQ>
          ))}
        </FAQSection>
      </PageContainer>
    </>
  );
};

export default ContactPage; 