import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
  Loader2,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const StorefrontChatbot: React.FC = () => {
  const { locale, storeSettings, currency, formatPrice } = useStore();
  const isAr = locale === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: isAr
        ? `مرحباً بك في متجر الليث للاتصالات! 📱\nأنا مساعدك الذكي، يمكنك سؤالي عن مواصفات الأجهزة، الأسعار بالليرة والدولار، كفالة الصيانة، أو طرق الشحن والتوصيل في سوريا. كيف يمكنني خدمتك اليوم؟`
        : `Welcome to Al-Laith for Telecommunications! 📱\nI am your AI assistant. Feel free to ask about device specs, prices in USD or SYP, warranty, or delivery across Syria. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = isAr
    ? [
        'ما هي أحدث هواتف آيفون المتوفرة؟',
        'كيف يمكنني حجز موعد صيانة لجهازي؟',
        'ما هو سعر صرف الدولار المعتمد اليوم؟',
        'هل يوجد توصيل للمحافظات الأخرى؟'
      ]
    : [
        'What iPhone models are currently in stock?',
        'How can I book a device repair appointment?',
        'What is today\'s USD exchange rate?',
        'Do you offer shipping to other cities?'
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content
          })),
          activeCurrency: currency,
          exchangeRate: storeSettings.usd_exchange_rate
        })
      });

      const data = await response.json();
      const reply = data.reply || (isAr ? 'نحن بخدمتك دائماً في متجر الليث.' : 'Always at your service at Al-Laith.');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: isAr
          ? 'عذراً، حدث خطأ مؤقت في الاتصال. يمكنك التواصل المباشر مع فريقنا عبر واتساب على الرقم: ' + storeSettings.store_whatsapp
          : 'Sorry, a temporary connection error occurred. Please contact us on WhatsApp: ' + storeSettings.store_whatsapp,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: isAr
          ? 'تم بدء محادثة جديدة. كيف يمكنني مساعدتك في متجر الليث اليوم؟'
          : 'New conversation started. How can I help you at Al-Laith today?',
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SY' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <aside aria-label={isAr ? 'المساعد الذكي لمتجر الليث' : 'Al-Laith AI Assistant'} className="fixed bottom-20 sm:bottom-6 end-4 sm:end-6 z-40">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-stone-900 text-white shadow-xl hover:bg-emerald-600 transition-all duration-300 hover:scale-105 border border-stone-700/60 cursor-pointer"
          aria-label={isAr ? 'مساعد الليث الذكي' : 'Al-Laith AI Chatbot'}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <span className="text-xs font-black tracking-tight hidden sm:inline">
            {isAr ? 'مساعد الليث الذكي' : 'Al-Laith AI'}
          </span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          className="w-[92vw] sm:w-[380px] h-[520px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-stone-950 to-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  <span>{isAr ? 'مساعد متجر الليث الذكي' : 'Al-Laith AI Assistant'}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-mono border border-emerald-500/30">
                    Gemini
                  </span>
                </h2>
                <p className="text-[10px] text-stone-400">
                  {isAr ? 'متصل الآن للإجابة على استفساراتك' : 'Online to answer your questions'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title={isAr ? 'بدء محادثة جديدة' : 'Reset chat'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                aria-label="Close"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-white border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 text-stone-600 text-[10px] font-bold whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/50">
            {messages.map((m) => {
              const isBot = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 items-start ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-1">
                      ل
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isBot
                        ? 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-xs shadow-xs'
                        : 'bg-emerald-600 text-white rounded-tr-xs shadow-xs font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                    <span
                      className={`text-[9px] mt-1.5 block font-mono ${
                        isBot ? 'text-stone-400' : 'text-emerald-100'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-lg bg-stone-800 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-stone-500 bg-white p-2.5 rounded-2xl border border-stone-200/80 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span className="text-[11px] font-medium">
                  {isAr ? 'جاري تجهيز الإجابة من الليث...' : 'Al-Laith AI is typing...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Direct Link Strip */}
          <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-900 font-bold">
              {isAr ? 'تفضّل بالتحدث مع موظف مبيعات؟' : 'Prefer human support?'}
            </span>
            <a
              href={`https://wa.me/${storeSettings.store_whatsapp}?text=${encodeURIComponent(
                isAr ? 'مرحبا، لدي استفسار بخصوص المنتجات في متجر الليث' : 'Hello, I have an inquiry about Al-Laith store products'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-black flex items-center gap-1 underline"
            >
              <span>{isAr ? 'واتساب مباشر' : 'WhatsApp'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isAr ? 'اكتب سؤالك هنا عن الأجهزة أو الصيانة...' : 'Ask about devices, specs, repair...'}
              className="flex-1 px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs cursor-pointer flex-shrink-0"
              aria-label="Send"
            >
              <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};
