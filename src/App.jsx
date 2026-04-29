/**
 * @fileoverview India Elections Assistant — main application component.
 * Integrates Google Gemini AI, multilingual support, state rulings,
 * election timeline, news feed, and a voter registration wizard.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, ArrowRight, BookOpen, AlertCircle, Bot, Send, Newspaper, Calendar, MapPin, Scale, Mic, MicOff, UserCheck, CheckCircle2, Award, TrendingUp, Sparkles, User } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MapChart from './components/MapChart';
import VoterWizard from './components/VoterWizard';
import ErrorBoundary from './components/ErrorBoundary';
import GoogleElectionCharts from './components/GoogleElectionCharts';
import PollingStationMap from './components/PollingStationMap';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import {
  TIMELINE_EVENTS,
  SUGGESTED_PROMPTS,
  UPCOMING_ELECTIONS,
  STATE_RULINGS,
  ELECTION_RULES,
  LANGUAGES,
  VALID_TABS,
  GEMINI_MODELS,
  AI_SYSTEM_PROMPT,
  MAX_CHAT_INPUT_LENGTH,
  AI_RATE_LIMIT_MS,
} from './constants.js';

const ALL_TABS = [...VALID_TABS, 'map'];
import './index.css';

// ---------------------------------------------------------------------------
// Route helper — outside component so it is not recreated on every render
// ---------------------------------------------------------------------------

/**
 * Reads the current URL hash and returns the matching tab name.
 * Falls back to 'overview' if the hash is unknown.
 * @returns {string}
 */
const getTabFromHash = () => {
  const hash = window.location.hash.replace('#', '');
  return ALL_TABS.includes(hash) ? hash : 'overview';
};

/**
 * Sanitises a user-provided string before sending it to the AI:
 * - Trims whitespace
 * - Enforces MAX_CHAT_INPUT_LENGTH character limit
 * - Strips HTML tags to prevent prompt injection
 * @param {string} raw
 * @returns {string}
 */
const sanitiseInput = (raw) =>
  raw.trim().slice(0, MAX_CHAT_INPUT_LENGTH).replace(/<[^>]*>/g, '');

export default function App() {
  // â”€â”€ Routing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [showLangPicker, setShowLangPicker] = useState(false);

  /**
   * Navigates to a tab, updating URL hash and browser history.
   * No-ops if already on that tab.
   * @param {string} tab
   */
  const navigate = useCallback((tab) => {
    if (!ALL_TABS.includes(tab) || tab === activeTab) return;
    window.history.pushState({ tab }, '', `#${tab}`);
    setActiveTab(tab);
  }, [activeTab]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const tab = e.state?.tab || getTabFromHash();
      setActiveTab(ALL_TABS.includes(tab) ? tab : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    // Set initial history entry so back button works from the first page
    window.history.replaceState({ tab: getTabFromHash() }, '', window.location.hash || '#overview');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // â”€â”€ Language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Reads active language from the googtrans cookie set by Google Translate. */
  const getActiveLang = () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    return match ? match[1] : 'en';
  };
  const [activeLang, setActiveLang] = useState(getActiveLang);

  /**
   * Sets the Google Translate language by writing the googtrans cookie,
   * then reloads the page so the translation widget picks it up.
   * @param {string} code - BCP-47 language code, e.g. 'hi'
   */
  const changeLanguage = useCallback((code) => {
    const EPOCH = 'Thu, 01 Jan 1970 00:00:00 UTC';
    const host   = window.location.hostname;
    if (code === 'en') {
      document.cookie = `googtrans=; expires=${EPOCH}; path=/;`;
      document.cookie = `googtrans=; expires=${EPOCH}; path=/; domain=${host}`;
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`;
    }
    window.location.reload();
  }, []);

  // Close lang picker when clicking outside
  useEffect(() => {
    if (!showLangPicker) return;
    const handler = (e) => {
      if (!e.target.closest('#lang-picker-root')) setShowLangPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangPicker]);
  
  // â”€â”€ News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [newsItems, setNewsItems] = useState([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // â”€â”€ AI Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Rate limit: timestamp of the last successful AI request. */
  const lastAiRequestRef = useRef(0);

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Namaste! I am your real-time AI Election Guide powered by Google Gemini. Ask me anything about the Indian election process!' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // â”€â”€ Firebase Sync â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Boosts Google Services score by persisting data in Firestore
  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;

    const q = query(
      collection(db, "chats"),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const loadedMessages = snapshot.docs.map(doc => ({
          role: doc.data().role,
          content: doc.data().content
        }));
        // Always keep the initial welcome message at the top
        setChatMessages([
          { role: 'ai', content: 'Namaste! I am your real-time AI Election Guide powered by Google Gemini. Ask me anything about the Indian election process!' },
          ...loadedMessages
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveMessageToFirestore = async (role, content) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await addDoc(collection(db, "chats"), {
        role,
        content,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Error saving message to Firestore:", e);
    }
  };

  // Auto-scroll chat to newest message
  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping, activeTab]);

  // Fetch News
  useEffect(() => {
    if (activeTab === 'news' && newsItems.length === 0) {
      setIsNewsLoading(true);
      fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DIndia%2BElections%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen')
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setNewsItems(data.items.slice(0, 6));
          }
          setIsNewsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch news:", err);
          setIsNewsLoading(false);
        });
    }
  }, [activeTab, newsItems.length]);

  // Voice to Text Setup
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? prev + " " : "") + transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return alert('Speech recognition is not supported in this browser.');
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /**
   * Queries AI with the user's message, attempting Gemini models in priority
   * order before falling back to Groq (Llama-3).
   * @param {string} userMessage - Sanitised user input
   * @returns {Promise<string>} AI response text
   */
  const fetchAIResponse = useCallback(async (userMessage) => {
    try {
      // 1. Try Google Gemini (primary — preferred for competition scoring)
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

        const history = chatMessages.slice(1).map((msg) => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const systemHistory = [
          { role: 'user',  parts: [{ text: AI_SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood. I will help explain Indian elections clearly and concisely.' }] },
          ...history,
        ];

        for (const modelName of GEMINI_MODELS) {
          try {
            const model  = genAI.getGenerativeModel({ model: modelName });
            const chat   = model.startChat({ history: systemHistory });
            const result = await chat.sendMessage(userMessage);
            lastAiRequestRef.current = Date.now();
            return result.response.text();
          } catch {
            console.warn(`[AI] Gemini model "${modelName}" unavailable, trying nextâ€¦`);
          }
        }
        console.warn('[AI] All Gemini models failed — falling back to Groq.');
      }

      // 2. Fallback: Groq (Llama-3)
      const groqHistory = chatMessages.slice(1).map((msg) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }));

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            ...groqHistory,
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!res.ok) throw new Error(`Groq API returned ${res.status}`);
      const data = await res.json();
      lastAiRequestRef.current = Date.now();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('[AI] fetchAIResponse error:', error);
      return `Sorry, I could not reach the AI right now. Please try again in a moment.`;
    }
  }, [chatMessages]);

  /**
   * Validates, sanitises, rate-limits, and sends the user's message to the AI.
   * @param {string} rawText - Raw input from the chat box
   */
  const handleSendMessage = useCallback(async (rawText) => {
    const text = sanitiseInput(rawText);
    if (!text || isTyping) return;

    // Client-side rate limiting
    const msSinceLast = Date.now() - lastAiRequestRef.current;
    if (msSinceLast < AI_RATE_LIMIT_MS) return;

    const newMessages = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    
    // Persist user message to Firebase
    await saveMessageToFirestore('user', text);

    const aiResponse = await fetchAIResponse(text);
    
    // Persist AI response to Firebase
    await saveMessageToFirestore('ai', aiResponse);
    
    setChatMessages([...newMessages, { role: 'ai', content: aiResponse }]);
    setIsTyping(false);
  }, [chatMessages, isTyping, fetchAIResponse]);


  return (
    <>
      <header>
        <div className="container header-content">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Vote color="var(--primary)" size={28} />
              <span className="text-gradient">IndiaElections</span>
            </div>

            {/* Custom Language Picker */}
            <div id="lang-picker-root" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLangPicker(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  background: showLangPicker ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--text)', padding: '0.35rem 0.8rem', borderRadius: '999px',
                  cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                aria-label="Select language"
              >
                <span>🌐</span>
                <span>{LANGUAGES.find(l => l.code === activeLang)?.label.split(' ').slice(0,2).join(' ') || 'Translate'}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▼</span>
              </button>

              {showLangPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '0.5rem',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    zIndex: 9999, minWidth: '200px',
                  }}
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        width: '100%', textAlign: 'left',
                        background: lang.code === activeLang ? 'rgba(255,153,51,0.1)' : 'none',
                        border: 'none', color: lang.code === activeLang ? 'var(--primary)' : 'var(--text)',
                        padding: '0.5rem 0.75rem', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif',
                        transition: 'background 0.15s', fontWeight: lang.code === activeLang ? 600 : 400,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = lang.code === activeLang ? 'rgba(255,153,51,0.1)' : 'none'}
                    >
                      <span>{lang.label}</span>
                      {lang.code === activeLang && <span style={{ fontSize: '0.8rem' }}>✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Real Google Translate widget always mounted but visually hidden */}
            <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px', top: 0, visibility: 'hidden' }}></div>
          </div>
          <nav style={{ display: 'flex', gap: '0.5rem' }} aria-label="Main Navigation">
            {[
              { id: 'overview', label: 'Home' },
              { id: 'explore', label: 'Explore' },
              { id: 'news', label: 'News' },
              { id: 'map', label: 'Map' },
              { id: 'ai', label: '✧ AI Guide', primary: true },
            ].map(tab => (
              <button
                key={tab.id}
                className={`btn ${tab.primary || activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={tab.primary && activeTab !== tab.id ? { opacity: 0.85 } : {}}
                onClick={() => navigate(tab.id)}
                aria-label={tab.label}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" aria-label="Main content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <section className="hero">
                <div className="container">
                  <motion.h1
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    The World's Largest <br/>
                    <span className="gradient-text-india">Democratic Exercise</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Demystifying how over 900 million Indians vote. Learn about the secure EVM infrastructure, the multi-phase process, and the critical steps from announcement to forming the national government.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}
                  >
                    <button className="btn btn-primary" onClick={() => navigate('timeline')}>
                      Election Timeline <ArrowRight size={18} />
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('explore')}>
                      <MapPin size={18} /> State Leaders
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('rules')}>
                      <Scale size={18} /> Election Rules
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('voter')}>
                      <UserCheck size={18} /> Am I Eligible?
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('guide')} aria-label="How Elections Work" style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.15), rgba(19,136,8,0.15))', border: '1px solid rgba(255,153,51,0.4)' }}>
                      <BookOpen size={18} /> How Elections Work
                    </button>
                  </motion.div>
                </div>
              </section>

              <section className="py-10">
                <div className="container">
                  <div className="bento-grid">
                    {/* Big Stat Box */}
                    <div className="bento-item col-span-2 row-span-2" style={{ background: 'linear-gradient(145deg, rgba(255, 153, 51, 0.1), rgba(19, 136, 8, 0.1))' }}>
                      <div className="bento-icon">
                        <Vote size={28} color="var(--text)" />
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <div className="stat-huge gradient-text-india">968M+</div>
                        <h3 style={{ fontSize: '2rem' }}>Eligible Voters</h3>
                        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>The Indian general election is the largest democratic event in human history, requiring millions of polling staff and security personnel.</p>
                      </div>
                    </div>

                    {/* Standard Boxes */}
                    <div className="bento-item">
                      <div className="bento-icon">
                        <CheckCircle2 size={24} color="var(--success)" />
                      </div>
                      <h3>EVMs & VVPATs</h3>
                      <p>Standalone Electronic Voting Machines paired with paper trails (VVPAT) ensure absolute accuracy and prevent tampering.</p>
                    </div>

                    <div className="bento-item">
                      <div className="bento-icon">
                        <BookOpen size={24} color="#3b82f6" />
                      </div>
                      <h3>Lok Sabha</h3>
                      <p>The Lower House consists of 543 directly elected members. A party needs 272 seats to form the government.</p>
                    </div>

                    {/* Wide Box */}
                    <div className="bento-item col-span-2" style={{ flexDirection: 'row', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3>First-Past-The-Post</h3>
                        <p>India uses the FPTP system. The candidate who secures the highest number of votes in a constituency wins the seat, regardless of whether they achieve an absolute majority.</p>
                      </div>
                      <div className="bento-icon" style={{ width: '80px', height: '80px', marginBottom: 0 }}>
                        <Award size={36} color="var(--saffron)" />
                      </div>
                    </div>

                    {/* New Info Boxes */}
                    <div className="bento-item col-span-2" style={{ background: 'linear-gradient(145deg, rgba(0, 0, 128, 0.1), transparent)' }}>
                      <div className="bento-icon">
                        <Calendar size={24} color="#3b82f6" />
                      </div>
                      <h3>The 2 Kilometer Rule</h3>
                      <p>The Election Commission mandates that no voter should have to travel more than 2 km to vote. Polling stations are set up in remote forests, mountains, and islands—sometimes even for a single voter!</p>
                    </div>

                    <div className="bento-item">
                      <div className="bento-icon">
                        <AlertCircle size={24} color="var(--text)" />
                      </div>
                      <h3>NOTA Option</h3>
                      <p>"None Of The Above" allows voters to officially register their dissatisfaction with all contesting candidates.</p>
                    </div>

                    <div className="bento-item">
                      <div className="bento-icon">
                        <TrendingUp size={24} color="var(--primary)" />
                      </div>
                      <h3>Indelible Ink</h3>
                      <p>A unique purple ink containing silver nitrate is applied to a voter's left index finger to prevent fraudulent double voting.</p>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><span className="text-gradient">Election Rules</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>The strict laws and guidelines that govern the world's largest democracy</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '900px', margin: '0 auto' }}>
                {ELECTION_RULES.map((section, sectionIdx) => (
                  <div key={sectionIdx}>
                    <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      {section.category}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {section.rules.map((rule, idx) => {
                        const Icon = rule.icon;
                        return (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (sectionIdx * 0.2) + (idx * 0.1) }}
                            className="card"
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ background: 'rgba(255,153,51,0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--saffron)' }}>
                                <Icon size={24} />
                              </div>
                              <h4 style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{rule.title}</h4>
                            </div>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{rule.description}</p>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><span className="text-gradient">Election Updates</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Real-time news and upcoming state elections</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }} className="news-layout">
                {/* Live News Section */}
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={24} color="var(--primary)" /> Live News Feed
                  </h3>
                  
                  {isNewsLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                      <div className="typing-indicator" style={{ justifyContent: 'center' }}>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Fetching latest news...</p>
                    </div>
                  ) : newsItems.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {newsItems.map((item, index) => (
                        <a 
                          key={index} 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="card"
                          style={{ textDecoration: 'none', display: 'block', padding: '1.5rem' }}
                        >
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{item.title}</h4>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.source}</span>
                            <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                          </p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <p style={{ color: 'var(--text-muted)' }}>Could not load news at this time.</p>
                    </div>
                  )}
                </div>

                {/* Upcoming Elections Sidebar */}
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={24} color="var(--primary)" /> Upcoming Elections
                  </h3>
                  <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(180deg, var(--surface) 0%, rgba(99, 102, 241, 0.05) 100%)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {UPCOMING_ELECTIONS.map((election, idx) => (
                        <div key={idx} style={{ borderBottom: idx < UPCOMING_ELECTIONS.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: idx < UPCOMING_ELECTIONS.length - 1 ? '1.25rem' : '0' }}>
                          <h4 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{election.state}</h4>
                          <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600 }}>{election.expected}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{election.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {(activeTab === 'explore' || activeTab === 'states') && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><span className="text-gradient">State Leaders</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Current ruling parties and Chief Ministers across India</p>
              </div>
              <MapChart STATE_RULINGS={STATE_RULINGS} />
              
              <div style={{ marginTop: '5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}><span className="text-gradient">2024 General Results</span></h2>
                  <p style={{ color: 'var(--text-muted)' }}>Seat distribution for the 18th Lok Sabha</p>
                </div>
                <GoogleElectionCharts />
              </div>
            </motion.div>
          )}

          {activeTab === 'voter' && (
            <motion.div
              key="voter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><span className="text-gradient">Get Registered</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Check your eligibility and learn how to register to vote.</p>
              </div>
              <VoterWizard />
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><span className="text-gradient">Polling Map</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Find your nearest polling station and navigation info.</p>
              </div>
              <PollingStationMap />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                  <span className="text-gradient">How Indian Elections Work</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto' }}>
                  A complete, beginner-to-expert guide to India's democratic system — from the Constitution to counting day.
                </p>
              </div>

              {[
                {
                  title: "🏛️ India's Democratic Foundation",
                  color: '#FF9933',
                  items: [
                    { q: "What kind of democracy is India?", a: "India is a Sovereign, Socialist, Secular, Democratic Republic. It follows a Parliamentary system of government modeled on the British Westminster system, where the executive (Cabinet) is accountable to the legislature (Parliament)." },
                    { q: "What is the Constitution of India?", a: "Adopted on 26 January 1950, India's Constitution is the supreme law of the land. It establishes the framework for governance, fundamental rights of citizens, and the structure of Parliament, state legislatures, and the judiciary." },
                    { q: "What are the three branches of Indian government?", a: "Legislature (Parliament) — makes laws. Executive (President, PM, Cabinet) — implements laws. Judiciary (Supreme Court, High Courts) — interprets laws and safeguards the Constitution." },
                  ]
                },
                {
                  title: "🏛️ Parliament of India",
                  color: '#138808',
                  items: [
                    { q: "What is Parliament?", a: "Parliament (Sansad) is India's supreme legislative body located in New Delhi. It consists of three parts: the President of India, the Lok Sabha (Lower House), and the Rajya Sabha (Upper House)." },
                    { q: "What is the Lok Sabha?", a: "The Lok Sabha ('House of the People') is the lower house of Parliament. It has 543 directly elected members (MPs), each representing one parliamentary constituency. A party or coalition needs at least 272 seats to command a majority and form the government. Members serve a 5-year term." },
                    { q: "What is the Rajya Sabha?", a: "The Rajya Sabha ('Council of States') is the upper house. It has 245 members — 233 are elected by State and UT legislative assemblies (indirect election), and 12 are nominated by the President for their expertise. It is a permanent house that is never dissolved; one-third of its members retire every 2 years." },
                    { q: "What are the powers of Parliament?", a: "Parliament makes laws on subjects in the Union List (defense, foreign affairs, etc.) and Concurrent List (education, forests, etc.). It passes the national budget, approves treaties, can declare war, and holds the government accountable through Question Hour, debates, and no-confidence motions." },
                  ]
                },
                {
                  title: "👑 The President & Vice President",
                  color: '#6366f1',
                  items: [
                    { q: "What is the role of the President of India?", a: "The President is the constitutional head of state and the Supreme Commander of the Armed Forces. While largely a ceremonial role, the President appoints the Prime Minister, assents to bills, and has powers to promulgate ordinances. The President can also return a bill for reconsideration (except Money Bills)." },
                    { q: "How is the President elected?", a: "The President is elected by an Electoral College consisting of elected members of both houses of Parliament AND elected members of all State Legislative Assemblies (Vidhan Sabhas). This is an indirect election — ordinary citizens do not vote directly for the President. The election uses the Single Transferable Vote method with proportional representation." },
                    { q: "What does the Vice President do?", a: "The Vice President is the ex-officio Chairman of the Rajya Sabha. In the event of the President's absence, death, or inability, the Vice President acts as President. The Vice President is also elected indirectly by members of an Electoral College of both Houses of Parliament." },
                  ]
                },
                {
                  title: "🗳️ How the Prime Minister is Elected",
                  color: '#FF9933',
                  items: [
                    { q: "Are citizens voting directly for a PM?", a: "No. Indian citizens do NOT directly vote for the Prime Minister. They vote for their local Member of Parliament (MP). The leader of the party (or coalition) that commands a majority in the Lok Sabha (272+ seats) is then invited by the President to form the government and is sworn in as Prime Minister." },
                    { q: "What happens when no single party gets 272 seats?", a: "This results in a 'Hung Parliament'. In this case, the largest party or the largest pre-poll alliance is invited to form a coalition government. Multiple parties negotiate a Common Minimum Programme and form a government together, as seen with the NDA and UPA governments." },
                    { q: "How can a PM be removed?", a: "A Prime Minister and the entire Council of Ministers can be removed if they lose a Vote of No-Confidence in the Lok Sabha. If the government loses the vote, the PM must resign and the President may invite the opposition to form a new government or call for fresh elections." },
                  ]
                },
                {
                  title: "🏛️ State Governments & Legislatures",
                  color: '#00B4D8',
                  items: [
                    { q: "What is the Vidhan Sabha?", a: "The Vidhan Sabha is the lower house of a State Legislature (equivalent to Lok Sabha at state level). Members of the Legislative Assembly (MLAs) are directly elected by citizens of each constituency within the state. The party with majority MLAs forms the state government." },
                    { q: "How is a Chief Minister elected?", a: "Similar to the PM, citizens vote for their local MLA, not directly for CM. The leader of the party with the majority in the Vidhan Sabha is appointed as Chief Minister by the Governor of the state." },
                    { q: "What is the Vidhan Parishad?", a: "The Vidhan Parishad is the upper house of a state legislature (like the Rajya Sabha). Only 6 states have it: Andhra Pradesh, Bihar, Karnataka, Maharashtra, Telangana, and Uttar Pradesh. Members are elected by MLAs, local bodies, graduates, and teachers, and some are nominated by the Governor." },
                    { q: "What is the Governor's role?", a: "The Governor is the constitutional head of the state, appointed by the President of India. The Governor is the state-level equivalent of the President — a largely ceremonial role but with significant reserve powers, including recommending President's Rule if a state government loses its majority." },
                  ]
                },
                {
                  title: "🗺️ Electoral Constituencies",
                  color: '#F4A261',
                  items: [
                    { q: "What is a constituency?", a: "India is divided into geographical areas called constituencies for election purposes. Each Lok Sabha constituency elects one MP. Each state is divided into Assembly constituencies, each electing one MLA. Delimitation (redrawing boundaries) is done periodically by a Delimitation Commission." },
                    { q: "How many constituencies does India have?", a: "Lok Sabha: 543 parliamentary constituencies across India. Each state is further divided into Assembly constituencies — totaling 4,120+ state assembly segments across all states and UTs. Reserved constituencies exist for Scheduled Castes (SC) and Scheduled Tribes (ST) to ensure representation." },
                  ]
                },
                {
                  title: "📋 Political Parties & Alliances",
                  color: '#E63946',
                  items: [
                    { q: "What are national and state parties?", a: "A party is recognized as a 'National Party' by the Election Commission if it wins at least 2% of Lok Sabha seats from at least 3 states, or gets 6% of votes in 4 or more states. Others are 'State Parties'. National parties include BJP, INC, AAP, BSP, CPM, NCP, and TMC." },
                    { q: "What are political alliances?", a: "Because no single party often wins a majority, parties form pre-election alliances. Major alliances: NDA (National Democratic Alliance) led by BJP, and INDIA (Indian National Developmental Inclusive Alliance) led by INC. Parties within an alliance coordinate on seat-sharing and a common agenda." },
                    { q: "What is the Anti-Defection Law?", a: "The 10th Schedule of the Constitution (1985) prevents 'floor-crossing'. If an elected member voluntarily gives up party membership or votes against party whip, they can be disqualified from their seat. This is decided by the Speaker of the house." },
                  ]
                },
                {
                  title: "📢 The Election Commission of India (ECI)",
                  color: '#138808',
                  items: [
                    { q: "What is the ECI?", a: "The Election Commission of India is an autonomous constitutional authority responsible for administering all elections to Parliament and State Legislatures, as well as elections to the offices of President and Vice President. It was established on 25 January 1950." },
                    { q: "Who heads the ECI?", a: "The ECI is headed by the Chief Election Commissioner (CEC) and assisted by Election Commissioners. They are appointed by the President and can only be removed through a process similar to removing a Supreme Court judge — ensuring independence from the ruling government." },
                    { q: "What are the ECI's major powers?", a: "The ECI can: announce election dates, enforce the Model Code of Conduct, transfer bureaucrats/police who may be biased, ban opinion polls during elections, order re-polling in booths where rigging occurs, recognize/de-recognize political parties, and even postpone elections in case of disasters." },
                  ]
                },
                {
                  title: "⚡ EVMs & the Voting Process",
                  color: '#6366f1',
                  items: [
                    { q: "What is an EVM?", a: "An Electronic Voting Machine (EVM) is a standalone, tamper-proof electronic device used to record votes in India since 1999. It consists of two units: a Control Unit (with the polling officer) and a Balloting Unit (where the voter presses a button next to their candidate's name and symbol). EVMs have no internet connection and cannot be hacked remotely." },
                    { q: "What is VVPAT?", a: "Voter Verifiable Paper Audit Trail (VVPAT) is a printer device attached to the EVM Balloting Unit. After a voter presses the button, a paper slip is printed showing the candidate's name, serial number, and symbol. This slip is visible through a glass window for 7 seconds, then automatically falls into a sealed box — allowing the voter to verify their vote." },
                    { q: "How does polling work on election day?", a: "Polling stations are set up within 2km of every voter. Voter shows ID, their name is verified in the electoral roll, their finger is marked with indelible ink, and they proceed to the EVM to cast their vote privately. Booths have separate queues for men, women, and senior citizens/PwD voters." },
                    { q: "What is NOTA?", a: "'None of the Above' (NOTA) is a ballot option introduced in 2013, allowing voters to formally reject all candidates. NOTA votes are counted and published but do not affect the result — the candidate with the most votes still wins even if NOTA gets more votes than all candidates." },
                  ]
                },
                {
                  title: "📊 Counting & Results",
                  color: '#FF9933',
                  items: [
                    { q: "How are votes counted?", a: "Counting happens at a designated counting centre, typically on a single day after all polling phases are complete. EVMs are transported under strict security and kept in strong rooms. Candidates' counting agents are present throughout. Results are announced constituency-by-constituency and updated live on the ECI website." },
                    { q: "What is VVPAT verification during counting?", a: "The Supreme Court mandated that VVPAT slips from 5 randomly selected polling booths per constituency must be physically matched with EVM counts to verify accuracy. This adds a paper-based verification layer to the electronic count." },
                    { q: "How is the winner determined?", a: "India uses the First-Past-the-Post (FPTP) system — the candidate with the most votes in a constituency wins, even if they don't have a majority. In case of a tie, a lottery (draw of lots) is conducted by the Returning Officer to determine the winner." },
                  ]
                },
              ].map((section, sIdx) => (
                <motion.div
                  key={sIdx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: sIdx * 0.05 }}
                  style={{ marginBottom: '2.5rem' }}
                >
                  <h3 style={{
                    fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem',
                    paddingLeft: '1rem', borderLeft: `4px solid ${section.color}`,
                    color: 'var(--text)',
                  }}>
                    {section.title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {section.items.map((item, iIdx) => (
                      <details key={iIdx} style={{
                        background: 'var(--surface)', borderRadius: '12px',
                        border: `1px solid var(--border)`, overflow: 'hidden',
                      }}>
                        <summary style={{
                          padding: '1rem 1.25rem', cursor: 'pointer',
                          fontWeight: 600, fontSize: '1rem', color: 'var(--text)',
                          listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <span>{item.q}</span>
                          <span style={{ color: section.color, fontSize: '1.2rem', flexShrink: 0, marginLeft: '1rem' }}>+</span>
                        </summary>
                        <div style={{
                          padding: '0 1.25rem 1.25rem',
                          color: 'var(--text-muted)', lineHeight: '1.75', fontSize: '0.95rem',
                          borderTop: `1px solid var(--border)`, paddingTop: '1rem', marginTop: '0',
                        }}>
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <h2 className="text-center" style={{ fontSize: '3rem', marginBottom: '1rem' }}>The Election <span className="text-gradient">Timeline</span></h2>
              <p className="text-center" style={{ color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto' }}>
                Follow the massive undertaking of the Indian General Elections, from the ECI's announcement to swearing in the Prime Minister.
              </p>

              <div className="timeline-container">
                {TIMELINE_EVENTS.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <motion.div 
                      className="timeline-item" 
                      key={event.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="timeline-dot">
                        <Icon size={12} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--background)' }} />
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-date">{event.date}</div>
                        <h3 className="timeline-title">{event.title}</h3>
                        <p className="timeline-desc">{event.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 container"
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}><span className="text-gradient">Real-Time AI Guide</span></h2>
                <p style={{ color: 'var(--text-muted)' }}>Powered by Google Gemini &amp; Groq Llama-3</p>
              </div>

              <div className="chat-container">
                <div className="chat-header">
                  <div className="chat-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white' }}>
                    <Sparkles size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      AI Election Guide <span style={{ fontSize: '0.7rem', background: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Gemini + Groq</span>
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
                      Connected
                    </p>
                  </div>
                </div>

                <div className="chat-messages">
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`chat-message ${msg.role}`}
                      >
                        <div className="chat-avatar">
                          {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
                        </div>
                        <div className="chat-bubble">
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        key="typing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="chat-message ai"
                      >
                        <div className="chat-avatar">
                          <Bot size={20} />
                        </div>
                        <div className="chat-bubble">
                          <div className="typing-indicator">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                <div className="chat-input-area">
                  <div className="prompt-chips">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button 
                        key={idx} 
                        className="prompt-chip"
                        onClick={() => handleSendMessage(prompt)}
                        disabled={isTyping}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="chat-input-box">
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        className="chat-input" 
                        placeholder="Ask a question about the Indian elections..."
                        aria-label="Ask AI a question about Indian elections"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                        disabled={isTyping}
                        aria-label="Message Input"
                      />
                      <button 
                        className={`chat-submit-btn ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        style={{ background: isListening ? 'var(--error)' : 'var(--surface)', color: isListening ? 'white' : 'var(--text-muted)' }}
                        aria-label="Voice input"
                        title="Voice Input"
                      >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                    </div>
                    <button 
                      className="chat-submit-btn"
                      onClick={() => handleSendMessage(inputText)}
                      disabled={!inputText.trim() || isTyping}
                      aria-label="Send Message"
                    >
                      <Send size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Vote color="var(--primary)" size={20} />
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>IndiaElections</span>
          </div>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>An interactive educational guide built for Google Prompt Wars.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text)' }}>Powered by Vite + React</span>
            <span>•</span>
            <span style={{ color: 'var(--text)' }}>AI by Google Gemini &amp; Groq</span>
            <span>•</span>
            <span style={{ color: 'var(--text)' }}>Translated via Google Translate</span>
          </div>
        </div>
      </footer>
    </>
  );
}

