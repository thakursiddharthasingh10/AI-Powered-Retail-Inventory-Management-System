import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, RefreshCw, Database, 
  HelpCircle, CheckCircle, ArrowRight, TrendingUp, AlertCircle,
  RotateCcw, ShieldCheck, ShoppingCart, DollarSign, Package
} from 'lucide-react';
import api from '../services/api';

const SUGGESTED_PROMPTS = [
  { text: "Which products have the lowest stock?", icon: AlertCircle },
  { text: "What are our top-selling products by quantity?", icon: TrendingUp },
  { text: "What is today's sales revenue?", icon: DollarSign },
  { text: "Which purchase orders are pending receipt?", icon: ShoppingCart },
  { text: "What is the inventory valuation by warehouse?", icon: Database },
  { text: "Which products should be reordered?", icon: Package },
];

export default function AiAssistant() {
  const initialGreeting = {
    sender: 'assistant',
    text: 'Hello! I am your AI Retail Copilot. I have live access to your inventory balances, sales transactions, purchase orders, and stock movements. Ask me any question below or select a suggested prompt.',
    metrics: null,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    intent: 'SYSTEM_READY'
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking, online, fallback
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Check AI health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/ai/health');
        if (res?.data?.status === 'UP' || res?.status === 'UP') {
          setConnectionStatus('online');
        } else {
          setConnectionStatus('fallback');
        }
      } catch (err) {
        setConnectionStatus('fallback');
      }
    };
    checkHealth();
  }, []);

  const handleSend = async (queryText) => {
    const query = (queryText || inputQuery).trim();
    if (!query || loading) return;

    setLastFailedQuery(null);
    const userMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      // Send both question and query to ensure compatibility with backend DTO
      const res = await api.post('/ai/chat', { question: query, query });

      // Safe extraction whether Axios returns res.data or direct response
      const data = res?.data?.data !== undefined 
        ? res.data.data 
        : (res?.data !== undefined ? res.data : res);

      const aiMessage = {
        sender: 'assistant',
        text: data?.answer || "I've analyzed your database.",
        metrics: data?.groundedMetrics || null,
        intent: data?.intentDetected || 'GENERAL_QUERY',
        externalLlm: data?.externalLlmUsed || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error', err);
      setLastFailedQuery(query);
      const errorMessage = {
        sender: 'assistant',
        text: 'Unable to query the retail database. Please ensure the backend service is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([initialGreeting]);
    setLastFailedQuery(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            AI Retail Intelligence Copilot
          </h1>
          <p className="text-sm text-slate-500">
            Natural language assistant grounded directly in live SQL sales records, inventory balances, and purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Status Badge */}
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border bg-white border-slate-200 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
              connectionStatus === 'fallback' ? 'bg-blue-500' : 'bg-slate-400'
            }`} />
            <span className="text-slate-700">
              {connectionStatus === 'online' ? 'Connected (AI Engine Ready)' :
               connectionStatus === 'fallback' ? 'Grounded DB Engine Active' : 'Checking status...'}
            </span>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleResetConversation}
            className="btn btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 border-slate-200 hover:bg-slate-50 text-slate-700"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-blue-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className={`space-y-2 max-w-[85%] ${msg.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none text-left shadow-xs'
                      : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-900 rounded-tl-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounded Live Database Evidence */}
                  {msg.metrics && Object.keys(msg.metrics).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/70 text-left">
                      <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                        <Database className="w-3.5 h-3.5 text-blue-600" />
                        Grounded Database Metrics:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(msg.metrics).map(([key, val]) => {
                          if (val === null || val === undefined) return null;
                          if (Array.isArray(val)) {
                            return (
                              <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200 sm:col-span-2">
                                <span className="text-slate-400 font-mono text-[10px] block uppercase">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                <ul className="mt-1 space-y-1 text-slate-700">
                                  {val.slice(0, 4).map((item, i) => (
                                    <li key={i} className="text-xs truncate">
                                      • {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          if (typeof val === 'object') {
                            return (
                              <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200 sm:col-span-2">
                                <span className="text-slate-400 font-mono text-[10px] block uppercase">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                  {Object.entries(val).map(([k, v]) => (
                                    <span key={k} className="bg-slate-50 px-2 py-0.5 rounded text-slate-700 border border-slate-100">
                                      {k}: <strong>{typeof v === 'number' ? v.toLocaleString() : String(v)}</strong>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 font-mono text-[10px] block uppercase">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-semibold text-slate-800 text-sm">
                                {typeof val === 'number' ? (val % 1 !== 0 ? `₹${val.toFixed(2)}` : val.toLocaleString()) : String(val)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Timestamp & Intent Badge */}
                  <div className={`mt-2 flex items-center gap-2 text-[10px] ${msg.sender === 'user' ? 'text-blue-100 justify-end' : 'text-slate-400'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.intent && (
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                        msg.sender === 'user' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {msg.intent}
                      </span>
                    )}
                  </div>
                </div>

                {/* Retry action for failed queries */}
                {msg.isError && lastFailedQuery && (
                  <div className="text-left">
                    <button
                      onClick={() => handleSend(lastFailedQuery)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 mt-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-sm text-slate-600">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Querying database records and analyzing metrics...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Section */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/70 overflow-x-auto whitespace-nowrap flex gap-2">
          {SUGGESTED_PROMPTS.map((prompt, i) => {
            const Icon = prompt.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(prompt.text)}
                disabled={loading}
                className="text-xs bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-blue-600" />
                <span>{prompt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask about lowest stock, top sellers, today's sales revenue, pending POs, warehouse valuation..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="input flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="btn btn-primary px-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
