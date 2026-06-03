import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster
      position="bottom-right"
      richColors
      expand={false}
      duration={3500}
      toastOptions={{
        style: {
          background: '#1e293b',
          border: '1px solid #334155',
          color: '#f1f5f9',
          fontFamily: 'Inter, sans-serif',
        },
      }}
    />
    <App />
  </React.StrictMode>,
)