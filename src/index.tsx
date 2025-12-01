/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';

import App from './App'

let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

const rootElement = document.getElementById("root");

const mount = (Component: React.ComponentType, element = document.getElementById('app')) => {
  const mountEl = element || rootElement;
  if (!mountEl) throw new Error('Root element not found');
  root = ReactDOM.createRoot(mountEl)
  root.render(<Component/>)

  // @ts-ignore
  if(module.hot) {
    // @ts-ignore
    module.hot.accept('./App', ()=> {
      const NextApp = require('./App').default;
      if (root) root.render(<NextApp />);
    })
  }
}

const unmount = () => {
  if (root) {
    root.unmount()
    root = null
  }
}

// Export for Bro.js - it looks for these specific properties
export { mount, unmount };
export default App;

// Make it available globally for Bro.js
if (typeof window !== 'undefined') {
  (window as any).innocivic = {
    mount: (component: any, element: HTMLElement, options?: any) => {
      // Bro.js calls mount(component.default, element, {push: ...})
      const Component = component?.default || component || App;
      return mount(Component, element);
    },
    unmount: unmount,
    component: App,
    default: App
  };
}

// Auto-mount for development
if (typeof window !== 'undefined') {
  mount(App)
}