import React from 'react';
import { AppRouter } from './router';
import { StrictMode } from 'react'
import { ThemeProvider } from './hooks/ThemeContext'
import { SidebarProvider } from './hooks/SidebarContext'
import './index.css';

import './App.css';

function App() {
  return <StrictMode>
      <ThemeProvider>
        <SidebarProvider>
          <AppRouter />
        </SidebarProvider>
      </ThemeProvider>
    </StrictMode>;
}

export default App;