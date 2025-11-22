import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToMentor } from '../services/geminiService';
import { MessageCircle, X, Send, Bot, Loader2, ExternalLink } from 'lucide-react';
import { Content } from '@google/genai';

interface MentorChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface UIMessage {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string; uri: string }[];
}

const MentorChat: React.FC<MentorChatProps> = ({ isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const [uiMessages, setUiMessages] = useState<UIMessage[]>([
    { role: 'model', text: "Hello! I'm your Architect Mentor. Ready to discuss your path to AB-100? Ask me about exam strategy or agent design." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    // Update UI immediately
    setUiMessages(prev => [...prev, { role: 'user', text: userText }]);

    const newHistory: Content[] = uiMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const response = await sendMessageToMentor(userText, newHistory);
      setUiMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text,
        sources: response.sources
      }]);
    } catch (e) {
      setUiMessages(prev => [...prev, { role: 'model', text: "System error. Rerouting..." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Outer container: Fixed positioning, z-index handling, responsive placement
    <div className={`
      fixed z-50 pointer-events-none flex flex-col items-end
      inset-0 sm:inset-auto sm:bottom-6 sm:right-6 
    `}>
      
      {/* Chat Window */}
      {isOpen && (
        <div className={`
          pointer-events-auto bg-slate-900 border-slate-700 shadow-2xl 
          flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          
          /* Mobile: Full Screen */
          w-full h-full border-none rounded-none
          
          /* Desktop: Widget sized, rounded */
          sm:w-96 sm:h-[500px] sm:border sm:rounded-lg sm:mb-4
        `}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex justify-between items-center border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-5 h-5 text-blue-200" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="font-semibold text-slate-100">Architect Mentor</h3>
            </div>
            <button onClick={onToggle} className="text-slate-300 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
            {uiMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-lg p-3 text-sm leading-relaxed shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
                }`}>
                  <div>{msg.text}</div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Verified Sources</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => (
                          <a 
                            key={i}
                            href={source.uri} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800/80 border border-slate-600/50 hover:bg-slate-600 hover:border-blue-500/50 transition-all duration-200 text-xs text-blue-300 hover:text-blue-100 max-w-full group"
                            title={source.title}
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70 group-hover:opacity-100" />
                            <span className="truncate max-w-[180px]">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-lg p-3 rounded-bl-none border border-slate-600 flex items-center gap-2 shadow-sm">
                   <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                   <span className="text-xs text-slate-400">Searching knowledge base...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-900 border-t border-slate-700 flex-shrink-0 pb-safe">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about exams, AI news..."
                className="flex-1 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - Always visible on desktop, hidden when chat open on mobile to avoid clutter */}
      <button
        onClick={onToggle}
        className={`
          pointer-events-auto p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-white/10
          ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90 hidden sm:flex' : 'bg-blue-600 hover:bg-blue-500 flex'}
          mb-4 mr-4 sm:mb-0 sm:mr-0
        `}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
};

export default MentorChat;