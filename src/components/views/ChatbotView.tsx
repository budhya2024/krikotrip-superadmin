import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  CheckCircle2,
  Settings,
  Users,
  Clock,
  RotateCcw,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'bot',
    text: 'Hello! 👋 I am KrikoTrip AI Assistant. How can I assist your travel plans today? Ask me about our Kashmir, Andaman, Kerala, or Sundarban tour packages!',
    timestamp: 'Just now',
  },
];

export const ChatbotView: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'simulator' | 'settings' | 'logs'>('simulator');
  const [isBotActive, setIsBotActive] = useState(true);

  // Bot Config State
  const [botName, setBotName] = useState('KrikoTrip AI Travel Assistant');
  const [welcomeMessage, setWelcomeMessage] = useState(
    'Hello! 👋 I am KrikoTrip AI Assistant. How can I assist your travel plans today? Ask me about our Kashmir, Andaman, Kerala, or Sundarban tour packages!'
  );
  const [botTone, setBotTone] = useState<'Enthusiastic' | 'Professional' | 'Luxury Specialist'>('Enthusiastic');
  const [autoLeadCapture, setAutoLeadCapture] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Chat Simulator State
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    'What are your best Kerala houseboat tours?',
    'Show me 5-day Kashmir winter packages with Gondola.',
    'What is your cancellation and refund policy?',
    'Can I customize Andaman scuba diving with my family?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = '';
      const lower = text.toLowerCase();
      if (lower.includes('kerala') || lower.includes('houseboat')) {
        botReply =
          '🌿 For Kerala, we recommend our "4 Days 3 Nights Alleppey Backwater & Houseboat Serenade" starting at ₹18,500/couple. It includes private AC houseboat stay, authentic Kerala cuisine, and sunset canoe cruises!';
      } else if (lower.includes('kashmir') || lower.includes('gondola') || lower.includes('winter')) {
        botReply =
          '❄️ Our "5 Days 4 Nights Kashmir Winter Wonderland" package covers Dal Lake Shikara stay, Gulmarg Phase 1 & 2 Gondola passes, and private heated 4x4 transfers. Would you like me to connect you with our Kashmir specialist?';
      } else if (lower.includes('cancel') || lower.includes('refund') || lower.includes('policy')) {
        botReply =
          '📋 KrikoTrip provides 100% full refund on cancellations made at least 15 days before your travel date. For cancellations between 7-14 days, a 50% refund applies.';
      } else if (lower.includes('andaman') || lower.includes('scuba')) {
        botReply =
          '🤿 Andaman packages include certified PADI instructor diving at Elephant Beach, Havelock Island, plus Makruzz luxury catamaran transfers. We customize itineraries for all family sizes!';
      } else {
        botReply = `Thank you for your question about "${text}". Our verified destination partners and team are ready to curate your dream itinerary. You can also explore all live tours under our Manage Tours directory!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 800);
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner / Header */}
      <div
        className={`p-4 sm:p-5 rounded-[4px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[4px] bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                AI Travel Chatbot
              </h2>

            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated customer assistance, lead generation, and package inquiry answering.
            </p>
          </div>
        </div>

        {/* Status Toggle Switch */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            role="switch"
            aria-checked={isBotActive}
            onClick={() => setIsBotActive(!isBotActive)}
            className="inline-flex items-center gap-2 cursor-pointer"
          >
            <span
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isBotActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${isBotActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
              />
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isBotActive ? 'Bot Online' : 'Bot Offline'}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total Conversations</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">1,482</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% this month
          </span>
        </div>

        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Leads Captured</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">394</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Phone & WhatsApp collected</span>
        </div>

        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">94.2%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Answered without human help</span>
        </div>

        <div
          className={`p-4 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Avg Response Speed</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">0.8s</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Ultra fast AI streaming</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'simulator'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Live Test Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'settings'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <Settings className="w-4 h-4" />
          <span>Bot Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[4px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'logs'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Captured Inquiries (12)</span>
        </button>
      </div>

      {/* TAB 1: LIVE TEST SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chat Window */}
          <div
            className={`lg:col-span-2 rounded-[4px] border flex flex-col h-[560px] ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
          >
            {/* Chat Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    {botName}
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-medium">Online & Listening</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[4px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-[4px] text-xs sm:text-sm leading-relaxed ${m.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-br-none'
                      : theme === 'dark'
                        ? 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                      }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  <span>KrikoTrip AI is typing response...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a travel query to test AI response (e.g. Kerala packages, refund)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className={`flex-1 p-2.5 text-xs sm:text-sm rounded-[4px] border outline-none ${theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                  }`}
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="px-4 py-2.5 rounded-[4px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Quick Test Queries */}
          <div
            className={`p-4 rounded-[4px] border space-y-3.5 flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
          >
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Quick Test Prompts
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Click any prompt to simulate traveler questions and see how the AI responds:
              </p>

              <div className="space-y-2">
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className={`w-full text-left p-2.5 rounded-[4px] border text-xs font-medium transition-colors cursor-pointer flex items-center justify-between group ${theme === 'dark'
                      ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-600 text-slate-200'
                      : 'border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 text-slate-800'
                      }`}
                  >
                    <span>{q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`p-3 rounded-[4px] border text-xs space-y-1.5 ${theme === 'dark' ? 'bg-slate-800/40 border-slate-800 text-slate-300' : 'bg-blue-50/50 border-blue-100 text-slate-700'
                }`}
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400 block">
                💡 Knowledge Base Connected:
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The chatbot dynamically answers using your active Tour Packages, Published FAQs, and Destination Territories.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOT CONFIGURATION */}
      {activeTab === 'settings' && (
        <div
          className={`max-w-2xl p-5 rounded-[4px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1">
            Chatbot Identity & Personality Settings
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Configure how the AI agent introduces itself and interacts with website visitors.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Chatbot Display Name
              </label>
              <input
                type="text"
                required
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className={`w-full p-2.5 text-sm rounded-[4px] border outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Default Welcome Greeting Message
              </label>
              <textarea
                rows={3}
                required
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className={`w-full p-2.5 text-sm rounded-[4px] border outline-none leading-relaxed ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  AI Personality / Tone
                </label>
                <select
                  value={botTone}
                  onChange={(e) => setBotTone(e.target.value as any)}
                  className={`w-full p-2.5 text-sm rounded-[4px] border outline-none font-semibold ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                >
                  <option value="Enthusiastic">Enthusiastic & Welcoming</option>
                  <option value="Professional">Professional & Precise</option>
                  <option value="Luxury Specialist">Luxury Travel Concierge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Lead Capture Strategy
                </label>
                <div className="p-2.5 rounded-[4px] border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold">Auto-ask WhatsApp/Email</span>
                  <input
                    type="checkbox"
                    checked={autoLeadCapture}
                    onChange={(e) => setAutoLeadCapture(e.target.checked)}
                    className="rounded-[2px] text-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
                </span>
              ) : (
                <span className="text-xs text-slate-400">Settings sync automatically to live site</span>
              )}

              <button
                type="submit"
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[4px] cursor-pointer shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CAPTURED LEADS / INQUIRIES */}
      {activeTab === 'logs' && (
        <div
          className={`rounded-[4px] border overflow-hidden shadow-xs ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Visitor Chat Sessions & Leads
            </h4>
            <span className="text-xs text-slate-500">12 records logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead
                className={`text-xs font-semibold uppercase tracking-wider border-b ${theme === 'dark'
                  ? 'bg-slate-800/80 text-slate-300 border-slate-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
              >
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Traveler / Lead</th>
                  <th className="py-3 px-3.5 font-semibold">Destination of Interest</th>
                  <th className="py-3 px-3.5 font-semibold">Primary Question</th>
                  <th className="py-3 px-3.5 font-semibold text-center">Status</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[
                  {
                    name: 'Rohan Deshmukh',
                    contact: '+91 98231 44521',
                    dest: 'Kashmir',
                    q: 'Looking for 5-day snow tour with Gulmarg Gondola Phase 2 for 4 adults',
                    status: 'Lead Captured',
                    time: '12m ago',
                  },
                  {
                    name: 'Pooja Verma',
                    contact: 'pooja.v@gmail.com',
                    dest: 'Kerala',
                    q: 'Can we book 2-night luxury Alleppey houseboat with child cot?',
                    status: 'Lead Captured',
                    time: '45m ago',
                  },
                  {
                    name: 'Guest Traveler #4182',
                    contact: 'Not provided',
                    dest: 'Andaman',
                    q: 'Is scuba diving open in Havelock in December?',
                    status: 'Resolved by AI',
                    time: '2h ago',
                  },
                  {
                    name: 'Amitabh Sen',
                    contact: '+91 94330 91822',
                    dest: 'Sundarban',
                    q: 'Wanted to know launch timing from Godkhali port for 3D/2N Tiger Reserve tour',
                    status: 'Lead Captured',
                    time: '4h ago',
                  },
                ].map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-semibold">
                      <p className="text-slate-900 dark:text-white">{log.name}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{log.contact}</p>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-blue-600 dark:text-blue-400">
                      {log.dest}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.q}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-[4px] font-semibold text-[10px] ${log.status === 'Lead Captured'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right text-slate-400 font-medium">
                      {log.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
