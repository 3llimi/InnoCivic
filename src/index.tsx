/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';

import App from './App'

let root: ReturnType<typeof ReactDOM.createRoot> | null = null;
let historyPush: any = null;

const rootElement = document.getElementById("root");

// Bro.js calls mount like: mount(component.default, element, {push: historyPush})
const mount = (Component: React.ComponentType, element: HTMLElement, options?: {push?: any}) => {
  const mountEl = element || rootElement;
  if (!mountEl) throw new Error('Root element not found');

  // Store the history push function if provided
  if (options?.push) {
    historyPush = options.push;
  }

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

// Bro.js expects this exact structure
const moduleExports = {
  component: App,
  mount: mount,
  unmount: unmount,
  default: App
};

// Export as default - this is what Bro.js will import
export default moduleExports;

// Make it available globally for Bro.js SystemJS
if (typeof window !== 'undefined') {
  (window as any).innocivic = moduleExports;
}

// Auto-mount for development (only if not in Bro.js environment)
if (typeof window !== 'undefined' && !(window as any).fireapp) {
  mount(App, rootElement!)
}