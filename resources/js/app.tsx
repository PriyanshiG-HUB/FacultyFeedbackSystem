import React from 'react';
import ReactDOM from 'react-dom/client';
import { DevPageRenderer } from './dev/DevPageRenderer';
import '../css/app.css';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <DevPageRenderer />
  </React.StrictMode>
);
