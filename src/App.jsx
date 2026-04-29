import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, CalendarDays, CheckCircle2, Award, ArrowRight, BookOpen, AlertCircle, Bot, User, Send, Sparkles, Newspaper, TrendingUp, Calendar, MapPin, Scale, ShieldAlert, Users, Radio, Lock, Search, FileSignature, Accessibility, Calculator, Mic, MicOff, UserCheck, Languages } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MapChart from './components/MapChart';
import VoterWizard from './components/VoterWizard';
import './index.css';

// Indian Election Timeline Data
const timelineEvents = [
  {
    id: 1,
    date: "Phase 1",
    title: "Announcement & Code of Conduct",
    description: "The Election Commission of India (ECI) announces the election schedule. The Model Code of Conduct immediately comes into effect to ensure fair play.",
    icon: CalendarDays
  },
  {
    id: 2,
    date: "Phase 2",
    title: "Official Notification",
    description: "The President (or Governor for state elections) formally issues the election notification, officially kicking off the statutory election process.",
    icon: Newspaper
  },
  {
    id: 3,
    date: "Phase 3",
    title: "Filing Nominations",
    description: "Candidates file their nomination papers, submitting detailed affidavits regarding their criminal background, assets, and educational qualifications.",
    icon: BookOpen
  },
  {
    id: 4,
    date: "Phase 4",
    title: "Scrutiny & Withdrawal",
    description: "The Election Commission scrutinizes the nomination papers for validity. Candidates are given a window to withdraw their nomination if they choose.",
    icon: AlertCircle
  },
  {
    id: 5,
    date: "Phase 5",
    title: "Campaigning",
    description: "Parties and candidates hold rallies, roadshows, and distribute manifestos. All public campaigning must end 48 hours before polling begins.",
    icon: TrendingUp
  },
  {
    id: 6,
    date: "Phase 6",
    title: "Polling Days",
    description: "Voters across the country cast their ballots using Electronic Voting Machines (EVMs). Due to the large population, voting happens in multiple phases.",
    icon: Vote
  },
  {
    id: 7,
    date: "Phase 7",
    title: "Counting Day",
    description: "Under tight security, EVMs are opened and votes are counted simultaneously across all constituencies. Results are declared on the same day.",
    icon: CheckCircle2
  },
  {
    id: 8,
    date: "Phase 8",
    title: "Government Formation",
    description: "The party or coalition that secures a majority (at least 272 out of 543 seats) in the Lok Sabha is invited by the President to form the government.",
    icon: Award
  }
];

const suggestedPrompts = [
  "How do EVMs prevent tampering?",
  "What is the Model Code of Conduct?",
  "Can you explain the NOTA option?",
  "How is the Prime Minister elected?"
];

const upcomingElections = [
  { state: "West Bengal", type: "Legislative Assembly", expected: "April-May 2026" },
  { state: "Tamil Nadu", type: "Legislative Assembly", expected: "April-May 2026" },
  { state: "Kerala", type: "Legislative Assembly", expected: "April-May 2026" },
  { state: "Assam", type: "Legislative Assembly", expected: "April-May 2026" },
];

const stateRulings = [
  // Major States (Already had these)
  { state: "Uttar Pradesh", party: "BJP", alliance: "NDA", chiefMinister: "Yogi Adityanath", color: "#FF9933" },
  { state: "Maharashtra", party: "Mahayuti (SS/BJP/NCP)", alliance: "NDA", chiefMinister: "Eknath Shinde", color: "#FF9933" },
  { state: "West Bengal", party: "AITC", alliance: "INDIA", chiefMinister: "Mamata Banerjee", color: "#138808" },
  { state: "Tamil Nadu", party: "DMK", alliance: "INDIA", chiefMinister: "M. K. Stalin", color: "#DD2D2D" },
  { state: "Karnataka", party: "INC", alliance: "INDIA", chiefMinister: "Siddaramaiah", color: "#00BFFF" },
  { state: "Gujarat", party: "BJP", alliance: "NDA", chiefMinister: "Bhupendrabhai Patel", color: "#FF9933" },
  { state: "Kerala", party: "CPI(M)", alliance: "LDF", chiefMinister: "Pinarayi Vijayan", color: "#DD2D2D" },
  { state: "Punjab", party: "AAP", alliance: "INDIA", chiefMinister: "Bhagwant Mann", color: "#00BFFF" },
  { state: "Bihar", party: "JDU/BJP", alliance: "NDA", chiefMinister: "Nitish Kumar", color: "#FF9933" },
  { state: "Madhya Pradesh", party: "BJP", alliance: "NDA", chiefMinister: "Mohan Yadav", color: "#FF9933" },
  { state: "Rajasthan", party: "BJP", alliance: "NDA", chiefMinister: "Bhajan Lal Sharma", color: "#FF9933" },
  { state: "Telangana", party: "INC", alliance: "INDIA", chiefMinister: "Revanth Reddy", color: "#00BFFF" },
  { state: "Andhra Pradesh", party: "TDP/JSP/BJP", alliance: "NDA", chiefMinister: "N. Chandrababu Naidu", color: "#FFD700" },
  { state: "Odisha", party: "BJP", alliance: "NDA", chiefMinister: "Mohan Charan Majhi", color: "#FF9933" },
  
  // Added Remaining States
  { state: "Assam", party: "BJP", alliance: "NDA", chiefMinister: "Himanta Biswa Sarma", color: "#FF9933" },
  { state: "Chhattisgarh", party: "BJP", alliance: "NDA", chiefMinister: "Vishnu Deo Sai", color: "#FF9933" },
  { state: "Haryana", party: "BJP", alliance: "NDA", chiefMinister: "Nayab Singh Saini", color: "#FF9933" },
  { state: "Himachal Pradesh", party: "INC", alliance: "INDIA", chiefMinister: "Sukhvinder Singh Sukhu", color: "#00BFFF" },
  { state: "Jharkhand", party: "JMM", alliance: "INDIA", chiefMinister: "Champai Soren", color: "#138808" },
  { state: "Uttarakhand", party: "BJP", alliance: "NDA", chiefMinister: "Pushkar Singh Dhami", color: "#FF9933" },
  { state: "Goa", party: "BJP", alliance: "NDA", chiefMinister: "Pramod Sawant", color: "#FF9933" },
  { state: "Arunachal Pradesh", party: "BJP", alliance: "NDA", chiefMinister: "Pema Khandu", color: "#FF9933" },
  { state: "Manipur", party: "BJP", alliance: "NDA", chiefMinister: "N. Biren Singh", color: "#FF9933" },
  { state: "Meghalaya", party: "NPP", alliance: "NDA", chiefMinister: "Conrad Sangma", color: "#FF9933" },
  { state: "Mizoram", party: "ZPM", alliance: "ZPM", chiefMinister: "Lalduhoma", color: "#800080" },
  { state: "Nagaland", party: "NDPP/BJP", alliance: "NDA", chiefMinister: "Neiphiu Rio", color: "#FF9933" },
  { state: "Sikkim", party: "SKM", alliance: "NDA", chiefMinister: "Prem Singh Tamang", color: "#FF9933" },
  { state: "Tripura", party: "BJP", alliance: "NDA", chiefMinister: "Manik Saha", color: "#FF9933" },
  
  // Union Territories with Legislatures
  { state: "Delhi (UT)", party: "AAP", alliance: "INDIA", chiefMinister: "Arvind Kejriwal", color: "#00BFFF" },
  { state: "Puducherry (UT)", party: "AINRC/BJP", alliance: "NDA", chiefMinister: "N. Rangaswamy", color: "#FF9933" }
];

const electionRules = [
  {
    category: "Campaigning Guidelines",
    rules: [
      {
        title: "Model Code of Conduct (MCC)",
        description: "A set of guidelines issued by the ECI regulating political parties and candidates prior to elections. It strictly forbids ministers from combining official visits with electioneering and prevents the announcement of new financial grants.",
        icon: Scale
      },
      {
        title: "48-Hour Campaign Silence",
        description: "Also known as the 'Silence Period', all public campaigning, including rallies, loudspeakers, and television broadcasts, must strictly end 48 hours before the end of the polling hour.",
        icon: AlertCircle
      },
      {
        title: "Prohibition of Corrupt Practices",
        description: "Bribing voters, appealing to vote on the grounds of religion or caste, and using government machinery for campaigns are legally classified as corrupt practices and can lead to disqualification.",
        icon: ShieldAlert
      },
      {
        title: "Regulation of Loudspeakers",
        description: "The use of loudspeakers is strictly prohibited between 10:00 PM and 6:00 AM to prevent public nuisance. Written permission is required for use during the day.",
        icon: Radio
      }
    ]
  },
  {
    category: "Candidate Regulations",
    rules: [
      {
        title: "Expenditure Limits",
        description: "The ECI imposes strict legal limits on how much a candidate can spend on their election campaign to ensure a level playing field (e.g., ₹95 Lakhs for larger Lok Sabha constituencies).",
        icon: TrendingUp
      },
      {
        title: "Disclosure of Criminal Antecedents",
        description: "Candidates must publicly declare any pending criminal cases against them through newspapers and television so voters can make an informed choice.",
        icon: BookOpen
      },
      {
        title: "Asset Declarations",
        description: "All candidates must file a detailed affidavit outlining their financial assets, liabilities, and educational qualifications when submitting their nomination papers.",
        icon: Award
      },
      {
        title: "Security Deposit",
        description: "Candidates must submit a security deposit (e.g., ₹25,000 for Lok Sabha). If a candidate fails to secure at least one-sixth of the total valid votes cast, the deposit is forfeited.",
        icon: Lock
      }
    ]
  },
  {
    category: "Polling Day Regulations",
    rules: [
      {
        title: "The 2 Kilometer Rule",
        description: "The Election Commission mandates that no voter should have to travel more than 2 kilometers to cast their vote.",
        icon: MapPin
      },
      {
        title: "100-Meter Exclusion Zone",
        description: "Canvassing or soliciting votes within a 100-meter radius of any polling station on the day of voting is strictly prohibited and is a punishable offense.",
        icon: AlertCircle
      },
      {
        title: "Voter Identity Verification",
        description: "Voters must present a valid ECI-issued Voter ID (EPIC) or an approved alternative photo identity document before they are allowed to cast their ballot.",
        icon: CheckCircle2
      },
      {
        title: "Ban on Ferrying Voters",
        description: "Candidates and political parties are legally barred from providing free transport to ferry voters to and from the polling stations.",
        icon: ShieldAlert
      }
    ]
  },
  {
    category: "Media & Advertising Regulations",
    rules: [
      {
        title: "Pre-Certification of Ads",
        description: "All political advertisements on television, cable networks, and radio must be pre-certified by the Media Certification and Monitoring Committee (MCMC).",
        icon: Radio
      },
      {
        title: "Ban on Exit Polls",
        description: "The ECI explicitly bans the publishing or broadcasting of exit polls while the voting process is ongoing across any phase of the election.",
        icon: Newspaper
      },
      {
        title: "Paid News Monitoring",
        description: "The ECI strictly monitors for 'Paid News'—news articles posing as objective journalism but paid for by political parties. Proven cases count towards candidate expenditure limits.",
        icon: Search
      }
    ]
  },
  {
    category: "Political Party Rules",
    rules: [
      {
        title: "Registration with ECI",
        description: "Any association wishing to operate as a political party must register with the Election Commission of India within 30 days of its formation.",
        icon: Users
      },
      {
        title: "Internal Democracy",
        description: "Recognized political parties are expected to hold regular internal elections to choose their leadership and maintain democratic functioning.",
        icon: Vote
      }
    ]
  },
  {
    category: "EVM & VVPAT Regulations",
    rules: [
      {
        title: "Randomization of EVMs",
        description: "EVMs undergo a two-stage randomization process using software to ensure that nobody knows which machine will go to which constituency or polling booth until the last moment.",
        icon: Calculator
      },
      {
        title: "Mock Polls",
        description: "Before actual voting starts on election day, a mock poll of at least 50 votes must be conducted in the presence of candidates' polling agents to verify the EVM's accuracy.",
        icon: CheckCircle2
      },
      {
        title: "VVPAT Slip Visibility",
        description: "The Voter Verifiable Paper Audit Trail (VVPAT) glass window must remain illuminated for exactly 7 seconds, allowing the voter to verify their vote before the slip drops into the sealed box.",
        icon: Search
      }
    ]
  },
  {
    category: "Voting Rights & Accessibility",
    rules: [
      {
        title: "Home Voting Facility",
        description: "Voters aged 85 and above, as well as Persons with Disabilities (PwDs) with a minimum 40% benchmark disability, have the right to vote from home via postal ballots.",
        icon: Accessibility
      },
      {
        title: "Service Voters",
        description: "Members of the Armed Forces and government employees posted outside their home states or abroad are permitted to vote via Electronically Transmitted Postal Ballot System (ETPBS).",
        icon: Send
      },
      {
        title: "Undertrial Prisoners Voting",
        description: "Generally, individuals confined in a prison, under a sentence of imprisonment, or lawful transportation cannot vote. However, those under preventive detention are permitted to cast postal ballots.",
        icon: ShieldAlert
      }
    ]
  },
  {
    category: "Counting & Post-Election Rules",
    rules: [
      {
        title: "Mandatory VVPAT Matching",
        description: "The ECI mandates the mandatory verification of VVPAT paper slips against EVM counts in 5 randomly selected polling stations per Assembly Constituency/Segment.",
        icon: FileSignature
      },
      {
        title: "Election Petitions",
        description: "If a candidate or voter suspects electoral malpractice, they must file an Election Petition in the respective State High Court within 45 days from the date of declaration of results.",
        icon: Scale
      }
    ]
  }
];

export default function App() {
  const VALID_TABS = ['overview','explore','news','ai','timeline','rules','voter','guide'];

  // Read initial tab from URL hash, fallback to 'overview'
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return VALID_TABS.includes(hash) ? hash : 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Push to history when tab changes
  const navigate = (tab) => {
    if (tab === activeTab) return;
    window.history.pushState({ tab }, '', `#${tab}`);
    setActiveTab(tab);
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const tab = e.state?.tab || getTabFromHash();
      setActiveTab(VALID_TABS.includes(tab) ? tab : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    // Set initial history entry so back button works from the first page
    window.history.replaceState({ tab: getTabFromHash() }, '', window.location.hash || '#overview');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect active language from googtrans cookie
  const getActiveLang = () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    return match ? match[1] : 'en';
  };
  const [activeLang, setActiveLang] = useState(getActiveLang);

  const languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'hi', label: '🇮🇳 Hindi (हिन्दी)' },
    { code: 'bn', label: '🇮🇳 Bengali (বাংলা)' },
    { code: 'te', label: '🇮🇳 Telugu (తెలుగు)' },
    { code: 'mr', label: '🇮🇳 Marathi (मराठी)' },
    { code: 'ta', label: '🇮🇳 Tamil (தமிழ்)' },
    { code: 'gu', label: '🇮🇳 Gujarati (ગુજરાતી)' },
    { code: 'kn', label: '🇮🇳 Kannada (ಕನ್ನಡ)' },
    { code: 'ml', label: '🇮🇳 Malayalam (മലയാളം)' },
    { code: 'pa', label: '🇮🇳 Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'ur', label: '🇮🇳 Urdu (اردو)' },
  ];

  const changeLanguage = (code) => {
    if (code === 'en') {
      // Clear the translation cookie to restore English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    } else {
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname}`;
    }
    window.location.reload();
  };

  // Close lang picker when clicking outside
  useEffect(() => {
    if (!showLangPicker) return;
    const handler = (e) => {
      if (!e.target.closest('#lang-picker-root')) setShowLangPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangPicker]);
  
  // News State
  const [newsItems, setNewsItems] = useState([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: "Namaste! I am your real-time AI Election Guide powered by Google Gemini. Ask me anything about the Indian election process!" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
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

  const fetchAIResponse = useCallback(async (userMessage) => {
    try {
      // 1. Try Google Gemini API First
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        
        const history = chatMessages.slice(1).map(msg => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const systemHistory = [
          { role: "user", parts: [{ text: "You are an expert AI assistant explaining the Indian Election process. Provide concise, accurate, and neutral information." }]},
          { role: "model", parts: [{ text: "Understood. I will help explain Indian elections clearly." }]},
          ...history
        ];

        // Try all known current Gemini model names in order
        const geminiModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];
        for (const modelName of geminiModels) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({ history: systemHistory });
            const result = await chat.sendMessage(userMessage);
            return result.response.text();
          } catch (e) {
            // This model not available, try next one
            console.warn(`Gemini model ${modelName} failed, trying next...`);
          }
        }
        // All Gemini models failed — fall through to Groq below
        console.warn('All Gemini models failed, falling back to Groq.');
      } 
      
      // 2. Fallback to Groq API if Gemini key is missing
      const history = chatMessages.slice(1).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are an expert, helpful AI assistant explaining the Indian Election process. Provide concise, accurate, and neutral information about how elections work in India.' },
            ...history,
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from Groq API');
      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error(error);
      return `Error communicating with AI: ${error.message}. Please check your API keys or network connection.`;
    }
  }, [chatMessages]);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;
    
    const newMessages = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setInputText("");
    setIsTyping(true);

    const aiResponseContent = await fetchAIResponse(text);
    
    setChatMessages([...newMessages, { role: 'ai', content: aiResponseContent }]);
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
                <span>{languages.find(l => l.code === activeLang)?.label.split(' ').slice(0,2).join(' ') || 'Translate'}</span>
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
                  {languages.map(lang => (
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
              { id: 'ai', label: '✦ AI Guide', primary: true },
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

      <main>
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
                    <button className="btn btn-secondary" onClick={() => navigate('guide')} style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.15), rgba(19,136,8,0.15))', border: '1px solid rgba(255,153,51,0.4)' }}>
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
                {electionRules.map((section, sectionIdx) => (
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
                      {upcomingElections.map((election, idx) => (
                        <div key={idx} style={{ borderBottom: idx < upcomingElections.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: idx < upcomingElections.length - 1 ? '1.25rem' : '0' }}>
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
              <MapChart stateRulings={stateRulings} />
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
                  title: "🏦 Parliament of India",
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
                  title: "🏢 State Governments & Legislatures",
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
                  title: "📣 The Election Commission of India (ECI)",
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
                          <span style={{ color: section.color, fontSize: '1.2rem', flexShrink: 0, marginLeft: '1rem' }}>＋</span>
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
                {timelineEvents.map((event, index) => {
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
                    {suggestedPrompts.map((prompt, idx) => (
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
