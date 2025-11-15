import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { GapProvider } from "./store/GapContext";
import { AppRouter } from "./router/index";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <GapProvider>
      <AppRouter />
    </GapProvider>
  </StrictMode>,
)
