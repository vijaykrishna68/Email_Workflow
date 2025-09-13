import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
// import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

function hydrateUserFromQueryParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (!userParam) return;

    const user = JSON.parse(decodeURIComponent(userParam));
    // Put it in the Zustand store (use the setter directly)
    // NOTE: if you can't import hook here (because this file is not inside component),
    // you can use useAuthStore.getState().updateUser(user);
    // below line assumes you imported useAuthStore.
    useAuthStore.getState().updateUser(user);

    // Remove query param cleanly without reloading
    const newUrl = window.location.origin + '/dashboard';
    window.history.replaceState({}, '', newUrl);
  } catch (err) {
    console.error('Failed to hydrate user from URL:', err);
  }
}

// Run immediately before app renders
hydrateUserFromQueryParam();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
