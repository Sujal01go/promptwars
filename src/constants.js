/**
 * @fileoverview Static data constants for the India Elections Assistant.
 * Centralising data here keeps App.jsx lean and makes updates easy.
 */

// ---------------------------------------------------------------------------
// Election Timeline
// ---------------------------------------------------------------------------

/** @type {Array<{id:number, date:string, title:string, description:string, icon:React.ComponentType}>} */
export const TIMELINE_EVENTS = [
  {
    id: 1, date: 'Phase 1', title: 'Announcement & Code of Conduct',
    description: 'The Election Commission of India (ECI) announces the election schedule. The Model Code of Conduct immediately comes into effect to ensure fair play.',
   
  },
  {
    id: 2, date: 'Phase 2', title: 'Official Notification',
    description: 'The President (or Governor for state elections) formally issues the election notification, officially kicking off the statutory election process.',
   
  },
  {
    id: 3, date: 'Phase 3', title: 'Filing Nominations',
    description: 'Candidates file their nomination papers, submitting detailed affidavits regarding their criminal background, assets, and educational qualifications.',
   
  },
  {
    id: 4, date: 'Phase 4', title: 'Scrutiny & Withdrawal',
    description: 'The Election Commission scrutinizes the nomination papers for validity. Candidates are given a window to withdraw their nomination if they choose.',
   
  },
  {
    id: 5, date: 'Phase 5', title: 'Campaigning',
    description: 'Parties and candidates hold rallies, roadshows, and distribute manifestos. All public campaigning must end 48 hours before polling begins.',
   
  },
  {
    id: 6, date: 'Phase 6', title: 'Polling Days',
    description: 'Voters cast their ballots using Electronic Voting Machines (EVMs). Due to the large population, voting happens in multiple phases.',
   
  },
  {
    id: 7, date: 'Phase 7', title: 'Counting Day',
    description: 'Under tight security, EVMs are opened and votes are counted simultaneously across all constituencies. Results are declared on the same day.',
   
  },
  {
    id: 8, date: 'Phase 8', title: 'Government Formation',
    description: 'The party or coalition that secures a majority (at least 272 out of 543 seats) in the Lok Sabha is invited by the President to form the government.',
   
  },
];

// ---------------------------------------------------------------------------
// AI Suggested Prompts
// ---------------------------------------------------------------------------

/** @type {string[]} */
export const SUGGESTED_PROMPTS = [
  'How do EVMs prevent tampering?',
  'What is the Model Code of Conduct?',
  'Can you explain the NOTA option?',
  'How is the Prime Minister elected?',
];

// ---------------------------------------------------------------------------
// Upcoming Elections
// ---------------------------------------------------------------------------

/** @type {Array<{state:string, type:string, expected:string}>} */
export const UPCOMING_ELECTIONS = [
  { state: 'West Bengal',  type: 'Legislative Assembly', expected: 'April-May 2026' },
  { state: 'Tamil Nadu',   type: 'Legislative Assembly', expected: 'April-May 2026' },
  { state: 'Kerala',       type: 'Legislative Assembly', expected: 'April-May 2026' },
  { state: 'Assam',        type: 'Legislative Assembly', expected: 'April-May 2026' },
];

// ---------------------------------------------------------------------------
// State Rulings
// ---------------------------------------------------------------------------

/** @type {Array<{state:string, party:string, alliance:string, chiefMinister:string, color:string}>} */
export const STATE_RULINGS = [
  { state: 'Uttar Pradesh',    party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Yogi Adityanath',        color: '#FF9933' },
  { state: 'Maharashtra',      party: 'Mahayuti (SS/BJP/NCP)', alliance: 'NDA', chiefMinister: 'Eknath Shinde',         color: '#FF9933' },
  { state: 'West Bengal',      party: 'AITC',              alliance: 'INDIA', chiefMinister: 'Mamata Banerjee',         color: '#138808' },
  { state: 'Tamil Nadu',       party: 'DMK',               alliance: 'INDIA', chiefMinister: 'M. K. Stalin',            color: '#DD2D2D' },
  { state: 'Karnataka',        party: 'INC',               alliance: 'INDIA', chiefMinister: 'Siddaramaiah',            color: '#00BFFF' },
  { state: 'Gujarat',          party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Bhupendrabhai Patel',     color: '#FF9933' },
  { state: 'Kerala',           party: 'CPI(M)',            alliance: 'LDF',   chiefMinister: 'Pinarayi Vijayan',        color: '#DD2D2D' },
  { state: 'Punjab',           party: 'AAP',               alliance: 'INDIA', chiefMinister: 'Bhagwant Mann',           color: '#00BFFF' },
  { state: 'Bihar',            party: 'JDU/BJP',           alliance: 'NDA',   chiefMinister: 'Nitish Kumar',            color: '#FF9933' },
  { state: 'Madhya Pradesh',   party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Mohan Yadav',             color: '#FF9933' },
  { state: 'Rajasthan',        party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Bhajan Lal Sharma',       color: '#FF9933' },
  { state: 'Telangana',        party: 'INC',               alliance: 'INDIA', chiefMinister: 'Revanth Reddy',           color: '#00BFFF' },
  { state: 'Andhra Pradesh',   party: 'TDP/JSP/BJP',       alliance: 'NDA',   chiefMinister: 'N. Chandrababu Naidu',    color: '#FFD700' },
  { state: 'Odisha',           party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Mohan Charan Majhi',      color: '#FF9933' },
  { state: 'Assam',            party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Himanta Biswa Sarma',     color: '#FF9933' },
  { state: 'Chhattisgarh',     party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Vishnu Deo Sai',          color: '#FF9933' },
  { state: 'Haryana',          party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Nayab Singh Saini',       color: '#FF9933' },
  { state: 'Himachal Pradesh', party: 'INC',               alliance: 'INDIA', chiefMinister: 'Sukhvinder Singh Sukhu',  color: '#00BFFF' },
  { state: 'Jharkhand',        party: 'JMM',               alliance: 'INDIA', chiefMinister: 'Champai Soren',           color: '#138808' },
  { state: 'Uttarakhand',      party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Pushkar Singh Dhami',     color: '#FF9933' },
  { state: 'Goa',              party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Pramod Sawant',           color: '#FF9933' },
  { state: 'Arunachal Pradesh',party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Pema Khandu',             color: '#FF9933' },
  { state: 'Manipur',          party: 'BJP',               alliance: 'NDA',   chiefMinister: 'N. Biren Singh',          color: '#FF9933' },
  { state: 'Meghalaya',        party: 'NPP',               alliance: 'NDA',   chiefMinister: 'Conrad Sangma',           color: '#FF9933' },
  { state: 'Mizoram',          party: 'ZPM',               alliance: 'ZPM',   chiefMinister: 'Lalduhoma',               color: '#800080' },
  { state: 'Nagaland',         party: 'NDPP/BJP',          alliance: 'NDA',   chiefMinister: 'Neiphiu Rio',             color: '#FF9933' },
  { state: 'Sikkim',           party: 'SKM',               alliance: 'NDA',   chiefMinister: 'Prem Singh Tamang',       color: '#FF9933' },
  { state: 'Tripura',          party: 'BJP',               alliance: 'NDA',   chiefMinister: 'Manik Saha',              color: '#FF9933' },
  { state: 'Delhi (UT)',        party: 'AAP',               alliance: 'INDIA', chiefMinister: 'Arvind Kejriwal',         color: '#00BFFF' },
  { state: 'Puducherry (UT)',   party: 'AINRC/BJP',         alliance: 'NDA',   chiefMinister: 'N. Rangaswamy',           color: '#FF9933' },
];

// ---------------------------------------------------------------------------
// Language Options
// ---------------------------------------------------------------------------

/** @type {Array<{code:string, label:string}>} */
export const LANGUAGES = [
  { code: 'en', label: 'ðŸ‡¬ðŸ‡§ English' },
  { code: 'hi', label: 'ðŸ‡®ðŸ‡³ Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)' },
  { code: 'bn', label: 'ðŸ‡®ðŸ‡³ Bengali (à¦¬à¦¾à¦‚à¦²à¦¾)' },
  { code: 'te', label: 'ðŸ‡®ðŸ‡³ Telugu (à°¤à±†à°²à±à°—à±)' },
  { code: 'mr', label: 'ðŸ‡®ðŸ‡³ Marathi (à¤®à¤°à¤¾à¤ à¥€)' },
  { code: 'ta', label: 'ðŸ‡®ðŸ‡³ Tamil (à®¤à®®à®¿à®´à¯)' },
  { code: 'gu', label: 'ðŸ‡®ðŸ‡³ Gujarati (àª—à«àªœàª°àª¾àª¤à«€)' },
  { code: 'kn', label: 'ðŸ‡®ðŸ‡³ Kannada (à²•à²¨à³à²¨à²¡)' },
  { code: 'ml', label: 'ðŸ‡®ðŸ‡³ Malayalam (à´®à´²à´¯à´¾à´³à´‚)' },
  { code: 'pa', label: 'ðŸ‡®ðŸ‡³ Punjabi (à¨ªà©°à¨œà¨¾à¨¬à©€)' },
  { code: 'ur', label: 'ðŸ‡®ðŸ‡³ Urdu (Ø§Ø±Ø¯Ùˆ)' },
];

// ---------------------------------------------------------------------------
// Valid navigation tabs
// ---------------------------------------------------------------------------

/** @type {string[]} */
export const VALID_TABS = ['overview', 'explore', 'news', 'ai', 'timeline', 'rules', 'voter', 'guide'];

// ---------------------------------------------------------------------------
// Gemini model priority list (newest first, fallback order)
// ---------------------------------------------------------------------------

/** @type {string[]} */
export const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
];

// ---------------------------------------------------------------------------
// AI System prompt
// ---------------------------------------------------------------------------

export const AI_SYSTEM_PROMPT =
  'You are an expert, helpful AI assistant explaining the Indian Election process. ' +
  'Provide concise, accurate, and neutral information about how elections work in India. ' +
  'Keep responses under 200 words unless asked for more detail.';

// ---------------------------------------------------------------------------
// Max characters allowed in AI chat input (security: prevent prompt injection)
// ---------------------------------------------------------------------------

export const MAX_CHAT_INPUT_LENGTH = 500;

// ---------------------------------------------------------------------------
// API rate limit: minimum milliseconds between AI requests
// ---------------------------------------------------------------------------

export const AI_RATE_LIMIT_MS = 2000;

// ---------------------------------------------------------------------------
// Election Rules
// ---------------------------------------------------------------------------

/** @type {Array<{category:string, rules:Array<{title:string, description:string, icon:React.ComponentType}>}>} */
export const ELECTION_RULES = [
  {
    category: 'Campaigning Guidelines',
    rules: [
      { title: 'Model Code of Conduct (MCC)', description: 'A set of guidelines issued by the ECI regulating political parties and candidates prior to elections. It forbids ministers from combining official visits with electioneering and prevents the announcement of new financial grants.' },
      { title: '48-Hour Campaign Silence',    description: 'Also known as the "Silence Period", all public campaigning â€” including rallies, loudspeakers, and television broadcasts â€” must strictly end 48 hours before polling begins.' },
      { title: 'Prohibition of Corrupt Practices', description: 'Bribing voters, appealing on grounds of religion or caste, and using government machinery for campaigns are legally classified as corrupt practices and can lead to disqualification.' },
      { title: 'Expenditure Limits',          description: 'Candidates for Lok Sabha may spend up to â‚¹95 lakh; for State Assembly elections up to â‚¹40 lakh. All expenses must be disclosed in an account submitted to the ECI within 30 days of election results.' },
    ],
  },
  {
    category: 'Voter Rights & Eligibility',
    rules: [
      { title: 'Universal Adult Franchise',   description: 'Every Indian citizen aged 18 or above on the qualifying date (January 1st of the election year) is eligible to vote, regardless of religion, caste, sex, literacy, or income.' },
      { title: 'Secret Ballot',               description: 'The entire voting process is anonymous. No one, including election officials, can demand to know how a voter has voted. This is a fundamental right protected by law.' },
      { title: 'NOTA (None Of The Above)',     description: 'Introduced in 2013 by a Supreme Court directive, the NOTA option (marked by a unique ballot symbol) allows voters to reject all candidates. If NOTA gets the most votes, a re-election is held.' },
      { title: 'Right to Know Candidates',    description: 'Voters have the right to know about the criminal antecedents, financial status, and educational qualifications of every candidate through mandatory affidavits published by the ECI.' },
    ],
  },
  {
    category: 'EVM & Technology Rules',
    rules: [
      { title: 'EVM Sealing & Custody Chain', description: 'After polling, EVMs are sealed in the presence of candidates/agents and stored in strong-rooms under 24Ã—7 security including CCTV surveillance, until counting day.' },
      { title: 'VVPAT Verification',          description: 'Every EVM is connected to a Voter Verifiable Paper Audit Trail (VVPAT) machine. A paper slip showing the candidate voted for is displayed for 7 seconds, then stored in a sealed compartment.' },
      { title: 'First-Past-the-Post System',  description: 'India uses a simple majority or "First-Past-the-Post" (FPTP) system. The candidate with the highest number of votes wins, regardless of whether they have an absolute majority.' },
    ],
  },
  {
    category: 'Counting & Post-Election Rules',
    rules: [
      { title: 'Mandatory VVPAT Matching',    description: 'The ECI mandates verification of VVPAT paper slips against EVM counts in 5 randomly selected polling stations per Assembly Constituency/Segment.' },
      { title: 'Election Petitions',          description: 'If a candidate or voter suspects electoral malpractice, they must file an Election Petition in the respective State High Court within 45 days from the date of declaration of results.' },
    ],
  },
];


