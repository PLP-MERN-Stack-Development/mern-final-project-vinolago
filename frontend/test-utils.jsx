import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function with providers
// Note: ClerkProvider removed to avoid authentication issues in tests
// Components that need Clerk should be tested with mocked Clerk hooks
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render as default render
export { renderWithProviders as render };
