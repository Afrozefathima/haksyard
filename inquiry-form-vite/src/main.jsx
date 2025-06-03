import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('google-sheet-inquiry-form');
if (root) {
  ReactDOM.createRoot(root).render(<App />)
}
