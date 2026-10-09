import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am the Sudharak AI Assistant. How can I help you improve your city today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [language, setLanguage] = useState('en-IN');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language; 
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const speakText = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language.split('-')[0];
    const targetVoice = voices.find(v => v.lang.includes(language) || v.lang.includes(langPrefix) || v.lang.includes('IN'));
    if (targetVoice) utterance.voice = targetVoice;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const formattedHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const pageContext = window.location.pathname.includes('/issues/') 
        ? `User is currently viewing Issue ID: ${window.location.pathname.split('/').pop()}` 
        : `User is on page: ${window.location.pathname}`;

      const response = await api.post('/chat', {
        message: userMessage,
        history: formattedHistory,
        language: language,
        context: pageContext
      });

      if (response.success && response.data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
        speakText(response.data.reply);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, an error occurred while processing your request.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Expanding Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '16px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #166534, #14532d)', padding: '16px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontWeight: 800 }}>Sudharak Assistant</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '4px', fontSize: '0.8rem', outline: 'none' }}
              >
                <option value="en-IN" style={{ color: '#000' }}>English</option>
                <option value="hi-IN" style={{ color: '#000' }}>Hindi</option>
                <option value="mr-IN" style={{ color: '#000' }}>Marathi</option>
              </select>
              <button 
                onClick={() => setTtsEnabled(!ttsEnabled)} 
                title={ttsEnabled ? "Disable Voice" : "Enable Voice"}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
              >
                {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} opacity={0.6} />}
              </button>
            </div>
          </div>

          {/* Messages Window */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  backgroundColor: msg.role === 'user' ? '#166534' : '#ffffff',
                  color: msg.role === 'user' ? '#fff' : '#0f172a',
                  border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', backgroundColor: '#fff', borderRadius: '16px 16px 16px 0', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                  <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></div>
                  <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', backgroundColor: '#f8fafc' }}
                placeholder="Ask about civic issues..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={toggleListening}
                  style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    width: '42px', height: '42px', borderRadius: '50%',
                    backgroundColor: isListening ? '#fef2f2' : '#f1f5f9',
                    color: isListening ? '#dc2626' : '#64748b',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  title="Speak"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
              <button
                type="submit"
                style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  width: '42px', height: '42px', borderRadius: '50%',
                  backgroundColor: '#166534', color: '#fff',
                  border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                  opacity: !input.trim() ? 0.6 : 1
                }}
                disabled={!input.trim()}
              >
                <Send size={18} style={{ transform: 'translateX(-1px)' }} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Toggle Button */}
      <button
        onClick={toggleChat}
        style={{
          width: '64px', height: '64px',
          backgroundColor: '#166534', color: '#fff',
          border: 'none', borderRadius: '50%',
          boxShadow: '0 10px 25px rgba(22, 101, 52, 0.4)',
          cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default Chatbot;
