import React from 'react';
import ReactDOM from 'react-dom/client';
import { DevPageRenderer } from './dev/DevPageRenderer';
import { AuthProvider } from './context/AuthContext';
import '../css/app.css';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <AuthProvider>
      <DevPageRenderer />
    </AuthProvider>
  </React.StrictMode>
);
