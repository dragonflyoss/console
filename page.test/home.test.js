import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/pages/home/index';

describe('Home', () => {
  it('renders a home', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /home page/,
    });

    expect(heading).toBeInTheDocument();
  });
});