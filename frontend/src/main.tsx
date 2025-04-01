import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme/theme'
import { AnalysisProvider } from './context/AnalysisContext'

// Basic theme configuration (moved to theme/theme.ts)
// const theme = createTheme({...});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AnalysisProvider>
          <CssBaseline /> {/* Provides CSS normalization & applies background */}
          <App />
        </AnalysisProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
