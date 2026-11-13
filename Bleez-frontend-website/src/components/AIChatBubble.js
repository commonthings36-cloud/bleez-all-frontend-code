import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, LifeBuoy } from 'lucide-react';
import { matchFaq } from '../data/faqs';
import { SITE } from '../lib/site';

// Help assistant. The backend has no chat endpoint, so this is a guided help widget: it answers from
// the published FAQ and links to the right page. It does not generate answers and says so.

const SUGGESTIONS = [
  { label: 'Plan a trip', query: 'plan a trip' },
  { label: 'Search flights & hotels', query: 'search flights hotels' },
  { label: 'Plans & pricing', query: 'pricing' },
  { label: 'Emergency numbers', query: 'emergency' },
];

const WELCOME = {
  role: 'bot',
  text: `Hi, I'm the ${SITE.name} help assistant. Pick a topic below or type a question, and I'll point you to the right answer.`,
};

const AIChatBubble = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = (text, shownText) => {
    const q = text.trim();
    if (!q) return;
    const faq = matchFaq(q);
    const reply = faq
      ? { role: 'bot', text: faq.a, link: faq.link }
      : {
          role: 'bot',
          text: "I couldn't find an answer to that. The FAQ covers most questions, and you can reach the team from the contact page.",
          link: { to: '/contact', label: 'Contact us' },
          extra: { to: '/faq', label: 'Browse the FAQ' },
        };
    setMessages((m) => [...m, { role: 'user', text: shownText || q }, reply]);
    setInput('');
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[60]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {open && (
        <section
          role="dialog"
          aria-label={`${SITE.name} help assistant`}
          data-testid="chat-window"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(560px,calc(100vh-7rem))] flex flex-col rounded-3xl overflow-hidden bg-card text-card-foreground border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <header className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-brand-700 to-brand-500">
            <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"><LifeBuoy className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight">{SITE.name} Help</p>
              <p className="text-xs text-white/80">Quick answers from our FAQ · not a live AI chat</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close help" className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                  <p>{m.text}</p>
                  {(m.link || m.extra) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[m.link, m.extra].filter(Boolean).map((l) => (
                        <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold hover:bg-primary/20 transition-colors">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s.label} type="button" onClick={() => ask(s.query, s.label)} className="rounded-full border border-primary/30 bg-background px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex items-center gap-2 border-t border-border p-3 bg-card">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trips, booking, plans…"
              aria-label="Your question"
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send" className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close help' : 'Open help'}
        aria-expanded={open}
        data-testid="chat-toggle"
        className="ml-auto flex w-14 h-14 rounded-full items-center justify-center text-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default AIChatBubble;
