/**
 * Main Entry Point
 * 
 * Renders the React application.
 * Note: StrictMode removed to prevent AbortError with Supabase
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
);
