// ====================================================
// VOTEGUIDE AI — Chat Widget Component
// ====================================================

import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import ProgressSteps from './ProgressSteps';
import CalendarButton from './CalendarButton';
import GoogleMap from './GoogleMap';

export default function ChatWidget({ onStepChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "👋 Welcome to VoteGuide AI! I'm your personal election assistant." },
    { type: 'bot', text: "I'll help you navigate the entire voting process in India." },
    { type: 'bot', text: "Let's start by getting to know you. How old are you?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State machine: 'ask_age' -> 'ask_location' -> 'ask_registered' -> 'done'
  const [chatState, setChatState] = useState('ask_age');
  const [userData, setUserData] = useState({ age: null, location: '', registered: null });
  const [quickReplies, setQuickReplies] = useState([]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, isOpen, isTyping]);

  const addBotMessage = (msgObj) => {
    setMessages((prev) => [...prev, { type: 'bot', ...msgObj }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { type: 'user', text }]);
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const processInput = async (text, value) => {
    if (!text && !value) return;
    
    addUserMessage(text || value);
    setInput('');
    setQuickReplies([]);
    setIsTyping(true);
    await delay(600);
    setIsTyping(false);

    if (chatState === 'ask_age') {
      const age = parseInt(text, 10);
      if (isNaN(age) || age < 1 || age > 150) {
        addBotMessage({ text: "Please enter a valid age (a number)." });
        return;
      }
      setUserData((prev) => ({ ...prev, age }));
      if (age < 18) {
        // Fetch from backend immediately
        await fetchAssistantDecision({ age, location: '', registered: null });
      } else {
        addBotMessage({ text: "Which state or union territory are you in?" });
        setChatState('ask_location');
      }
    } 
    else if (chatState === 'ask_location') {
      setUserData((prev) => ({ ...prev, location: text }));
      addBotMessage({ text: `Thanks! Let me tailor the experience for ${text}.` });
      await delay(400);
      addBotMessage({ text: "Are you currently registered to vote?" });
      setQuickReplies([
        { label: '✅ Yes, I am registered', value: 'yes' },
        { label: '❌ No, not yet', value: 'no' }
      ]);
      setChatState('ask_registered');
    }
    else if (chatState === 'ask_registered') {
      const registered = value === 'yes';
      const updatedUser = { ...userData, registered };
      setUserData(updatedUser);
      await fetchAssistantDecision(updatedUser);
    }
  };

  const fetchAssistantDecision = async (data) => {
    setIsTyping(true);
    try {
      const result = await api.postAssistant(data);
      setIsTyping(false);

      if (result.success) {
        const { message, registrationSteps, votingSteps, resources, recommendations, canPreRegister } = result.data;
        
        addBotMessage({ text: message });
        await delay(400);

        if (registrationSteps) {
          addBotMessage({ steps: registrationSteps });
          if (onStepChange) onStepChange(1);
        } else if (votingSteps) {
          addBotMessage({ steps: votingSteps });
          if (onStepChange) onStepChange(3);
        } else if (recommendations) {
          addBotMessage({ steps: recommendations });
        }

        await delay(400);

        if (resources && resources.length > 0) {
          addBotMessage({ links: resources });
        }

        // Action options
        if (result.decision === 'not_registered') {
          setQuickReplies([
            { label: '📍 Find Registration Office', action: 'maps_registration' },
            { label: '🔄 Start over', action: 'restart' }
          ]);
        } else if (result.decision === 'registered') {
          setQuickReplies([
            { label: '📍 Find Polling Booth', action: 'maps_polling' },
            { label: '📅 Set Election Reminder', action: 'calendar_election' },
            { label: '🔄 Start over', action: 'restart' }
          ]);
        } else {
          setQuickReplies([
            { label: '🔄 Start over', action: 'restart' }
          ]);
        }

        setChatState('done');
        
        // Save user progress
        api.saveUser(data).catch(console.error);
        
      } else {
        addBotMessage({ text: "Sorry, I encountered an error processing your information." });
      }
    } catch (err) {
      setIsTyping(false);
      addBotMessage({ text: "Sorry, the server is currently unreachable. Please try again later." });
    }
  };

  const handleAction = async (action) => {
    setQuickReplies([]);
    
    if (action === 'restart') {
      setMessages([
        { type: 'bot', text: "Let's start fresh! 🔄" },
        { type: 'bot', text: "How old are you?" }
      ]);
      setUserData({ age: null, location: '', registered: null });
      setChatState('ask_age');
      if (onStepChange) onStepChange(1);
      return;
    }

    if (action === 'maps_polling') {
      addUserMessage("Find my polling booth");
      setIsTyping(true);
      await delay(600);
      setIsTyping(false);
      addBotMessage({ mapQuery: `polling booth near me ${userData.location} India` });
      setQuickReplies([
        { label: '📅 Set Election Reminder', action: 'calendar_election' },
        { label: '🔄 Start over', action: 'restart' }
      ]);
    } else if (action === 'maps_registration') {
      addUserMessage("Find registration office");
      setIsTyping(true);
      await delay(600);
      setIsTyping(false);
      addBotMessage({ mapQuery: `voter registration office near me ${userData.location} India` });
      setQuickReplies([
        { label: '🔄 Start over', action: 'restart' }
      ]);
    } else if (action === 'calendar_election') {
      addUserMessage("Set election reminder");
      setIsTyping(true);
      await delay(600);
      setIsTyping(false);
      addBotMessage({
        calendar: {
          title: 'Election Day — Time to Vote! 🗳️',
          details: 'Remember to vote! Bring your Voter ID (EPIC) or approved photo ID to the polling booth.',
          startDate: '20261103T070000',
          endDate: '20261103T180000',
          label: 'Add to Google Calendar'
        }
      });
      setQuickReplies([
        { label: '📍 Find Polling Booth', action: 'maps_polling' },
        { label: '🔄 Start over', action: 'restart' }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processInput(input);
    }
  };

  const renderMessage = (msg, i) => {
    if (msg.type === 'user') {
      return (
        <div key={i} className="message user">
          <div className="message-bubble">{msg.text}</div>
          <div className="message-time">Now</div>
        </div>
      );
    }

    return (
      <div key={i} className="message bot">
        <div className="message-bubble">
          {msg.text && <p>{msg.text}</p>}
          {msg.steps && <ProgressSteps steps={msg.steps} />}
          {msg.links && (
            <div style={{ marginTop: '8px' }}>
              {msg.links.map((link, j) => (
                <a key={j} href={link.url} target="_blank" rel="noopener noreferrer" className="message-link" style={{ marginRight: '8px' }}>
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
          {msg.mapQuery && <GoogleMap query={msg.mapQuery} />}
          {msg.calendar && (
            <div style={{ marginTop: '8px' }}>
              <CalendarButton {...msg.calendar} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="chat-widget" className={isOpen ? 'chat-open' : 'chat-closed'} role="complementary" aria-label="Election Guide Chat Assistant">
      <button 
        id="chat-toggle" 
        className="chat-fab" 
        onClick={() => setIsOpen(!isOpen)} 
        aria-label={isOpen ? "Close chat" : "Open election guide chat"} 
        aria-expanded={isOpen}
      >
        <span className="fab-icon chat-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </span>
        <span className="fab-icon close-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </span>
        {!isOpen && <span className="fab-badge" id="chat-badge">1</span>}
      </button>

      <div id="chat-panel" className="chat-panel" role="dialog" aria-label="Chat with VoteGuide AI">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">🗳️</div>
            <div>
              <h3>VoteGuide AI</h3>
              <span className="chat-status"><span className="status-indicator" /> Online</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="btn-icon" onClick={() => handleAction('restart')} aria-label="Reset chat" title="Start over">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            </button>
            <button className="btn-icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        
        <div className="chat-messages" id="chat-messages" role="log" aria-live="polite">
          {messages.map((msg, i) => renderMessage(msg, i))}
          {isTyping && (
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input-area" id="chat-input-area">
          {quickReplies.length > 0 && (
            <div className="chat-quick-replies">
              {quickReplies.map((qr, i) => (
                <button 
                  key={i} 
                  className="quick-reply-btn" 
                  onClick={() => qr.action ? handleAction(qr.action) : processInput(qr.label, qr.value)}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}
          <div className="chat-input-row">
            <input 
              type="text" 
              id="chat-input" 
              placeholder={quickReplies.length > 0 ? "Choose an option..." : "Type your message..."}
              aria-label="Chat message input" 
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping || (quickReplies.length > 0 && quickReplies[0].action)}
            />
            <button 
              id="chat-send" 
              className="btn-send" 
              onClick={() => processInput(input)} 
              aria-label="Send message"
              disabled={isTyping || !input.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
