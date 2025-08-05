import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
  test('renders without crashing', () => {
    render(<NavigationBar />);
    expect(document.body).toBeInTheDocument();
  });
});
