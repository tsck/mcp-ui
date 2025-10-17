import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LeafyGreenProvider from '@leafygreen-ui/leafygreen-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LeafyGreenProvider darkMode={true}>
        <App />
    </LeafyGreenProvider>
  </StrictMode>,
)
