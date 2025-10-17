import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import LeafyGreenProvider from '@leafygreen-ui/leafygreen-provider'
import { GlobalStyles } from './GlobalStyles'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStyles />
    <LeafyGreenProvider darkMode={true}>
        <App />
    </LeafyGreenProvider>
  </StrictMode>,
)
