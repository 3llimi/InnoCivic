/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';
  
import App from './App'
  
export default () => <App/>


  
let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element #root not found');
  
export const mount = (Component: React.ComponentType, element = document.getElementById('app')) => {
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

export const unmount = () => {
  if (root) {
    root.unmount()
    root = null
  }
}

mount(App)