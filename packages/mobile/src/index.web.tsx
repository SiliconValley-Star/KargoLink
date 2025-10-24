import React from 'react';
import { createRoot } from 'react-dom/client';
import AppWebSimple from './App.web.simple';

// Web için DOM render
const container = document.getElementById('app-root');
if (container) {
  const root = createRoot(container);
  root.render(<AppWebSimple />);
} else {
  console.error('Root container not found');
}