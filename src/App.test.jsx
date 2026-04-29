import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the overview tab by default', () => {
    render(<App />);
    expect(screen.getByText(/The World's Largest/i)).toBeInTheDocument();
  });

  it('switches to timeline tab on click', () => {
    render(<App />);
    const timelineButton = screen.getByRole('button', { name: /view timeline/i });
    fireEvent.click(timelineButton);
    expect(screen.getByText(/The Election/i)).toBeInTheDocument();
  });
});
