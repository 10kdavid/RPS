import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useWallet } from '../contexts/WalletContext';

// Types
interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
  isMine?: boolean;
  avatar?: string;
}

interface Props {
  onClose: () => void;
}

// Styled Components
interface ChatContainerProps {
  isOpen: boolean;
}

const ChatContainer = styled.div<ChatContainerProps>`
  position: fixed;
  right: ${props => props.isOpen ? '0' : '-360px'};
  top: 0;
  height: 100vh;
  width: 360px;
  background-color: #0e1c30;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease-in-out;
  box-shadow: ${props => props.isOpen ? '-5px 0 15px rgba(0, 0, 0, 0.2)' : 'none'};
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #0c1827;
`;

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: white;
  
  .icon {
    font-size: 1.2rem;
  }
`;

const OnlineCounter = styled.div`
  background-color: rgba(0, 236, 65, 0.2);
  color: var(--button-primary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: var(--button-primary);
    border-radius: 50%;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1.2rem;
  
  &:hover {
    color: white;
  }
`;

// Define a proper interface for the button props
interface ToggleButtonProps {
  isOpen: boolean;
}

// Create a button element that accepts the isOpen prop
const ChatToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<ToggleButtonProps>`
  position: fixed;
  right: ${props => props.isOpen ? '360px' : '0'};
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--button-primary);
  color: white;
  border: none;
  width: 40px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 10px 0 0 10px;
  transition: right 0.3s ease-in-out;
  z-index: 999;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: var(--button-hover);
  }
`;

const ChatTabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

interface TabProps {
  active: boolean;
}

const ChatTab = styled.div<TabProps>`
  flex: 1;
  padding: 12px;
  text-align: center;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? 'var(--button-primary)' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

interface MessageProps {
  isMine?: boolean;
  isSystem?: boolean;
}

const MessageWrapper = styled.div<MessageProps>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isMine ? 'flex-end' : 'flex-start'};
  max-width: 100%;
`;

const MessageBubble = styled.div<MessageProps>`
  background-color: ${props => {
    if (props.isSystem) return 'rgba(59, 130, 246, 0.2)';
    return props.isMine ? 'var(--button-primary)' : 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => props.isMine ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  padding: 10px 15px;
  border-radius: 18px;
  border-bottom-right-radius: ${props => props.isMine ? '4px' : '18px'};
  border-bottom-left-radius: ${props => !props.isMine ? '4px' : '18px'};
  max-width: 85%;
  word-wrap: break-word;
  font-size: 0.9rem;
`;

const MessageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const SenderName = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
`;

const Timestamp = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
`;

const MessageAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
`;

const InputArea = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const EmojiButton = styled.button`
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`;

const ChatInput = styled.input`
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 10px 15px;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: var(--button-primary);
    box-shadow: 0 0 0 2px rgba(0, 236, 65, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  background-color: var(--button-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--button-hover);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UsersContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-right: 10px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
`;

const UserStatus = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatusDot = styled.div<{isOnline: boolean}>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.isOnline ? 'var(--button-primary)' : 'var(--text-secondary)'};
`;

const SectionTitle = styled.div`
  padding: 8px 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 5px;
`;

const EmojiSelector = styled.div`
  position: absolute;
  bottom: 80px;
  left: 15px;
  background-color: #131f2c;
  border-radius: 8px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const EmojiOption = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Component implementation
const GlobalChat: React.FC<Props> = ({ onClose }) => {
  const { connected, publicKey, openWalletModal } = useWallet();
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [users, setUsers] = useState<any[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis
  const emojis = ['😊', '😂', '👍', '❤️', '🎮', '🏆', '🚀', '🔥', '💯', '👋', '🤑', '🎲', '🃏', '💰'];

  // Mock user data
  const mockUsers = [
    { id: '1', name: 'Alice', status: 'online', lastActive: Date.now() },
    { id: '2', name: 'Bob', status: 'online', lastActive: Date.now() },
    { id: '3', name: 'Charlie', status: 'online', lastActive: Date.now() },
    { id: '4', name: 'Dave', status: 'offline', lastActive: Date.now() - 1000 * 60 * 30 },
    { id: '5', name: 'Eve', status: 'online', lastActive: Date.now() },
    { id: '6', name: 'Frank', status: 'offline', lastActive: Date.now() - 1000 * 60 * 60 },
    { id: '7', name: 'Grace', status: 'online', lastActive: Date.now() },
    { id: '8', name: 'Heidi', status: 'online', lastActive: Date.now() },
    { id: '9', name: 'Ivan', status: 'offline', lastActive: Date.now() - 1000 * 60 * 60 * 24 },
    { id: '10', name: 'Judy', status: 'online', lastActive: Date.now() },
  ];

  // Sample messages for demo
  useEffect(() => {
    // Load initial messages
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'System',
        message: 'Welcome to Rock Paper Solana chat!',
        timestamp: Date.now() - 1000 * 60 * 60,
        isSystem: true
      },
      {
        id: '2',
        sender: 'Alice',
        message: 'Hey everyone! Just won 5 SOL on blackjack 🤑',
        timestamp: Date.now() - 1000 * 60 * 30,
        avatar: 'A'
      },
      {
        id: '3',
        sender: 'Bob',
        message: 'Nice! I\'m on a losing streak today 😭',
        timestamp: Date.now() - 1000 * 60 * 25,
        avatar: 'B'
      },
      {
        id: '4',
        sender: 'Charlie',
        message: 'Anyone want to play rock paper scissors? I\'m feeling lucky!',
        timestamp: Date.now() - 1000 * 60 * 10,
        avatar: 'C'
      },
      {
        id: '5',
        sender: 'You',
        message: 'I\'m in! Send me an invite',
        timestamp: Date.now() - 1000 * 60 * 5,
        isMine: true
      }
    ];
    
    setMessages(initialMessages);
    setOnlineUsers(mockUsers.filter(user => user.status === 'online').length);
    setUsers(mockUsers);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    if (!connected) {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'System',
        message: 'Please connect your wallet to send messages.',
        timestamp: Date.now(),
        isSystem: true
      };
      
      setMessages([...messages, systemMessage]);
      return;
    }
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: message.trim(),
      timestamp: Date.now(),
      isMine: true
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    setShowEmojis(false);
    
    // Simulate response for demo
    setTimeout(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * 5)];
      const replies = [
        'Cool!',
        'Interesting strategy...',
        'I\'ll try that next time',
        'Anyone up for a game?',
        'How much did you win?',
        'Good luck!'
      ];
      
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: randomUser.name,
        message: replies[Math.floor(Math.random() * replies.length)],
        timestamp: Date.now(),
        avatar: randomUser.name[0]
      };
      
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onClose();
    }
  };

  // Render the proper content based on active tab
  const renderTabContent = () => {
    if (activeTab === 'chat') {
      return (
        <>
          <MessagesContainer>
            {messages.map(msg => (
              <MessageWrapper key={msg.id} isMine={msg.isMine} isSystem={msg.isSystem}>
                {!msg.isSystem && !msg.isMine && (
                  <MessageInfo>
                    <MessageAvatar>{msg.avatar || msg.sender[0]}</MessageAvatar>
                    <SenderName>{msg.sender}</SenderName>
                    <Timestamp>{formatTime(msg.timestamp)}</Timestamp>
                  </MessageInfo>
                )}
                
                <MessageBubble isMine={msg.isMine} isSystem={msg.isSystem}>
                  {msg.message}
                </MessageBubble>
                
                {msg.isMine && (
                  <Timestamp style={{ marginTop: '4px' }}>{formatTime(msg.timestamp)}</Timestamp>
                )}
              </MessageWrapper>
            ))}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          
          <InputArea>
            {showEmojis && (
              <EmojiSelector>
                {emojis.map(emoji => (
                  <EmojiOption key={emoji} onClick={() => addEmoji(emoji)}>
                    {emoji}
                  </EmojiOption>
                ))}
              </EmojiSelector>
            )}
            
            <InputWrapper>
              <EmojiButton onClick={() => setShowEmojis(!showEmojis)}>
                😊
              </EmojiButton>
              
              <ChatInput
                type="text"
                placeholder={connected ? "Type your message..." : "Connect wallet to chat"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!connected}
              />
              
              <SendButton 
                onClick={handleSendMessage} 
                disabled={!connected || !message.trim()}
              >
                ➤
              </SendButton>
            </InputWrapper>
          </InputArea>
        </>
      );
    } else {
      return (
        <UsersContainer>
          <SectionTitle>Online Users ({users.filter(u => u.status === 'online').length})</SectionTitle>
          <UsersList>
            {users
              .filter(user => user.status === 'online')
              .map(user => (
                <UserItem key={user.id}>
                  <UserAvatar>{user.name[0]}</UserAvatar>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserStatus>
                      <StatusDot isOnline={true} />
                      Online
                    </UserStatus>
                  </UserInfo>
                </UserItem>
              ))}
          </UsersList>
          
          <SectionTitle style={{ marginTop: '20px' }}>Offline Users ({users.filter(u => u.status === 'offline').length})</SectionTitle>
          <UsersList>
            {users
              .filter(user => user.status === 'offline')
              .map(user => (
                <UserItem key={user.id}>
                  <UserAvatar>{user.name[0]}</UserAvatar>
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserStatus>
                      <StatusDot isOnline={false} />
                      Offline
                    </UserStatus>
                  </UserInfo>
                </UserItem>
              ))}
          </UsersList>
        </UsersContainer>
      );
    }
  };

  return (
    <>
      <ChatToggleButton onClick={toggleChat} isOpen={isOpen}>
        {isOpen ? '❯' : '❮'}
      </ChatToggleButton>
      
      <ChatContainer isOpen={isOpen}>
        <ChatHeader>
          <ChatTitle>
            <div className="icon">💬</div>
            Global Chat
            <OnlineCounter>
              <div className="dot"></div>
              {onlineUsers} online
            </OnlineCounter>
          </ChatTitle>
          <CloseButton onClick={onClose} aria-label="Close chat">
            &times;
          </CloseButton>
        </ChatHeader>
        
        <ChatTabs>
          <ChatTab 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </ChatTab>
          <ChatTab 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </ChatTab>
        </ChatTabs>
        
        {renderTabContent()}
      </ChatContainer>
    </>
  );
};

export default GlobalChat; 