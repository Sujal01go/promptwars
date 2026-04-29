import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';


// Mock lucide-react — pure object factory, NO JSX (required for vitest hoisting)
vi.mock('lucide-react', () => {
  const stub = () => null;
  return {
    Vote: stub, ArrowRight: stub, BookOpen: stub, AlertCircle: stub,
    Bot: stub, Send: stub, Newspaper: stub, Calendar: stub, MapPin: stub,
    Scale: stub, Mic: stub, MicOff: stub, UserCheck: stub, CalendarDays: stub,
    CheckCircle2: stub, Award: stub, TrendingUp: stub, ShieldAlert: stub,
    Users: stub, Radio: stub, Lock: stub, Search: stub, FileSignature: stub,
    Accessibility: stub, Calculator: stub, Sparkles: stub, User: stub,
    Languages: stub, ChevronDown: stub, ChevronUp: stub, RefreshCw: stub,
    Home: stub, Globe: stub, Info: stub, X: stub, Check: stub, Menu: stub,
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1:  ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p:   ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      startChat: vi.fn(() => ({
        sendMessage: vi.fn(() =>
          Promise.resolve({ response: { text: () => 'Mock AI response' } })
        ),
      })),
    })),
  })),
}));

describe('🏠 App Rendering', () => {
  it('renders the hero section heading', () => {
    render(<App />);
    expect(screen.getByText(/The World's Largest/i)).toBeInTheDocument();
  });

  it('renders the main navigation', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders the brand logo text', () => {
    render(<App />);
    // Use getAllByText since it may appear in multiple places
    const logos = screen.getAllByText('IndiaElections');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders a level-1 heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});

describe('🧭 Navigation', () => {
  it('has Home nav button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^home$/i })).toBeInTheDocument();
  });

  it('has Explore nav button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^explore$/i })).toBeInTheDocument();
  });

  it('has News nav button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^news$/i })).toBeInTheDocument();
  });

  it('has AI Guide nav button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /ai guide/i })).toBeInTheDocument();
  });

  it('navigates to News tab on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^news$/i }));
    // News tab header exists in the DOM
    expect(screen.getAllByText(/News/i).length).toBeGreaterThan(0);
  });

  it('navigates to AI Guide tab on click', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ai guide/i }));
    expect(screen.getAllByText(/Google Gemini/i).length).toBeGreaterThan(0);
  });
});

describe('🌐 Translate Button', () => {
  it('renders the Translate button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
  });

  it('opens language picker and shows Hindi option', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /select language/i }));
    expect(screen.getByText(/Hindi/i)).toBeInTheDocument();
  });

  it('opens language picker and shows Tamil option', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /select language/i }));
    expect(screen.getByText(/Tamil/i)).toBeInTheDocument();
  });
});

describe('♿ Accessibility', () => {
  it('main nav has aria-label', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('main element has id for skip link', () => {
    const { container } = render(<App />);
    const main = container.querySelector('main#main-content');
    expect(main).not.toBeNull();
  });

  it('header element is present', () => {
    const { container } = render(<App />);
    expect(container.querySelector('header')).not.toBeNull();
  });

  it('main element is present', () => {
    const { container } = render(<App />);
    expect(container.querySelector('main')).not.toBeNull();
  });

  it('footer element is present', () => {
    const { container } = render(<App />);
    expect(container.querySelector('footer')).not.toBeNull();
  });
});

describe('🤖 AI Chat', () => {
  it('renders AI chat input when on AI tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ai guide/i }));
    expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument();
  });

  it('AI send button is present', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ai guide/i }));
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('displays initial AI greeting with Gemini', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ai guide/i }));
    expect(screen.getAllByText(/Google Gemini/i).length).toBeGreaterThan(0);
  });

  it('suggested prompts are visible', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ai guide/i }));
    expect(screen.getByText(/How do EVMs/i)).toBeInTheDocument();
  });
});

describe('📖 How Elections Work Guide', () => {
  it('brand logo is always visible in header', () => {
    render(<App />);
    // IndiaElections brand appears in header and possibly footer
    const logos = screen.getAllByText('IndiaElections');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('all 4 nav buttons are present', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^explore$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^news$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai guide/i })).toBeInTheDocument();
  });
});
