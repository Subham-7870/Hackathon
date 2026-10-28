import React, { useState, useRef, useEffect } from 'react';
import { MaintenanceRequest } from '../types';
import { Bot, Sparkles, X, Send, Trash2, Zap, ChevronDown, PlusCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { chatWithGroq, parseMemoWithGroq, ChatMessage } from '../services/groq';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParsedRequest: (req: MaintenanceRequest) => void;
}

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  '🚂 What is the current diversion route for Down Main trains?',
  '⚡ Explain Block 2 TRD OHE status and impacted trains',
  '📋 Draft a Form T/409 caution order for the P-Way block',
  '🛤️ Which trains are running on the 3rd Line bypass right now?',
  '🔧 Suggest optimal block window for USFD testing at Khurja',
  '⚠️ What is the TSR speed restriction after P-Way tamping?',
];

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onAddParsedRequest,
}) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**नमस्ते! Welcome to SthitiShodhana AI Co-Pilot.**\n\nI am your real-time NCR Prayagraj Division dispatch assistant powered by **Llama 3.3-70B on Groq**.\n\n🛑 **Active Blocks**: DOWN MAIN (T/351 P-Way · Somna KM 105–126), UP MAIN (T/172 TRD OHE · Dadri–Dankaur), EDFC (USFD Grinding · Khurja)\n\nAsk me anything about train movements, block management, caution orders, or switch to **Parse Memo** tab to extract maintenance tickets using AI.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'memo'>('chat');
  const [memoInput, setMemoInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedEntities, setParsedEntities] = useState<Record<string, any> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const getHistory = (): ChatMessage[] =>
    messages
      .filter((m) => !m.isStreaming)
      .slice(-12) // Keep last 12 messages for context window
      .map((m) => ({ role: m.role, content: m.content }));

  const handleSend = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;

    const userMsg: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: UIMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let accumulated = '';
      await chatWithGroq(
        [...getHistory(), { role: 'user', content: userText }],
        (delta) => {
          accumulated += delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          );
        }
      );
      // Mark streaming done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `⚠️ **Groq API Error**: ${err.message}\n\nPlease check your connection and try again.`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseMemo = async () => {
    if (!memoInput.trim()) return;
    setIsParsing(true);
    setParsedEntities(null);
    try {
      const entities = await parseMemoWithGroq(memoInput);
      setParsedEntities(entities);
    } catch (err: any) {
      setParsedEntities({ error: err.message });
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddParsed = () => {
    if (!parsedEntities || parsedEntities.error) return;
    const req: MaintenanceRequest = {
      request_id: `GRQ-${Date.now().toString(36).toUpperCase()}`,
      department: parsedEntities.department || 'P-Way',
      nature_of_work: parsedEntities.nature_of_work || memoInput.slice(0, 60),
      location_sector: parsedEntities.location_sector || 'SEC-NDLS-CNB-01',
      duration_minutes: parsedEntities.duration_minutes || 60,
      priority: parsedEntities.priority || 'NORMAL',
      machine_allocated: parsedEntities.machine_allocated || 'Manual Gang',
      preferred_window: parsedEntities.preferred_window || '02:00–04:00 IST',
      status: 'PENDING',
    } as any;
    onAddParsedRequest(req);
    setParsedEntities(null);
    setMemoInput('');
    onClose();
  };

  // Render markdown-style bold text
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#0D1117] shadow-2xl border-l border-slate-800 flex flex-col">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-indigo-950/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              SthitiShodhana AI Co-Pilot
              <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
                Llama 3.3·70B
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">NCR Prayagraj Div · Groq Ultra-Fast Inference</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'chat'
              ? 'text-indigo-300 border-b-2 border-indigo-500 bg-indigo-950/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Zap className="w-4 h-4" /> Live Chat
        </button>
        <button
          onClick={() => setActiveTab('memo')}
          className={`flex-1 py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'memo'
              ? 'text-violet-300 border-b-2 border-violet-500 bg-violet-950/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Parse Memo
        </button>
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === 'chat' && (
        <>
          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-black ${
                    msg.role === 'user'
                      ? 'bg-sky-600 text-white'
                      : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? 'SH' : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-600/20 border border-sky-500/30 text-sky-100'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-200'
                  }`}
                >
                  {msg.content ? (
                    <span className="whitespace-pre-wrap">{renderContent(msg.content)}</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                  {msg.isStreaming && msg.content && (
                    <span className="inline-block w-1 h-4 bg-indigo-400 animate-pulse ml-0.5 align-bottom" />
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-slate-800/60 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-600/50 text-slate-300 hover:text-indigo-200 transition-all whitespace-nowrap disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-slate-800 shrink-0 bg-slate-900/40">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about train movements, blocks, caution orders… (Enter to send)"
                  className="w-full resize-none px-4 py-3 text-sm bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all overflow-hidden"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'welcome-reset',
                        role: 'assistant',
                        content: 'Chat cleared. How can I assist with dispatch operations?',
                        timestamp: new Date(),
                      },
                    ])
                  }
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
                  title="Clear chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 text-center font-mono">
              Shift+Enter for newline · Groq API · llama-3.3-70b-versatile
            </p>
          </div>
        </>
      )}

      {/* ── MEMO PARSE TAB ── */}
      {activeTab === 'memo' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-400">
              {t.enterRawMemoLabel}
            </label>
            <textarea
              rows={5}
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              placeholder={t.memoPlaceholder}
              className="w-full p-4 text-sm bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-100 placeholder-slate-500 font-sans transition-all"
            />
            <button
              onClick={handleParseMemo}
              disabled={isParsing || !memoInput.trim()}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-extrabold rounded-xl shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isParsing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Extracting with Groq AI…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.parseWithAiBtn} (Groq)
                </>
              )}
            </button>
          </div>

          {/* Sample memos */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.sampleMemosLabel}</span>
            {[
              'Urgent OHE insulator flashover near KM 1014.2 on Delhi-Kanpur. Need 60 mins tower wagon isolation immediately.',
              'P-Way track weld fracture near Somna KM 118. Require 90 mins with 09-3X Tamping Express machine under T/351.',
              'S&T signal point machine #12A erratic at Somna yard. Need 45 mins disconnection under Form T/351.',
            ].map((memo, i) => (
              <button
                key={i}
                onClick={() => setMemoInput(memo)}
                className="w-full text-left p-3 bg-slate-900/80 hover:bg-violet-950/30 border border-slate-800 hover:border-violet-700/50 rounded-xl text-sm text-slate-300 transition-colors"
              >
                "{memo.slice(0, 70)}…"
              </button>
            ))}
          </div>

          {/* Parsed output */}
          {parsedEntities && !parsedEntities.error && (
            <div className="p-5 bg-emerald-950/40 border border-emerald-700/60 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300">Groq AI Extraction Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-sm text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-emerald-900/50 font-sans">
                <div>Dept: <strong className="text-white">{parsedEntities.department}</strong></div>
                <div>Sector: <span className="font-mono text-sky-400">{parsedEntities.location_sector}</span></div>
                <div>Duration: <strong className="text-indigo-400">{parsedEntities.duration_minutes} mins</strong></div>
                <div>Priority: <strong className="text-rose-400">{parsedEntities.priority}</strong></div>
                <div className="col-span-2">Machine: <strong className="text-slate-100">{parsedEntities.machine_allocated}</strong></div>
                <div className="col-span-2">KM Range: <span className="font-mono text-slate-400">{parsedEntities.km_range}</span></div>
                <div className="col-span-2">Work: <span className="text-slate-300">{parsedEntities.nature_of_work}</span></div>
                <div className="col-span-2">Window: <span className="text-amber-400 font-mono">{parsedEntities.preferred_window}</span></div>
              </div>
              <button
                onClick={handleAddParsed}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                {t.pushToQueueBtn}
              </button>
            </div>
          )}

          {parsedEntities?.error && (
            <div className="p-4 bg-red-950/40 border border-red-700/60 rounded-2xl text-sm text-red-300">
              ⚠️ {parsedEntities.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
