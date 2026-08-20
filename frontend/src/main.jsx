import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Unregister stale service workers from previous dev projects if any
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
