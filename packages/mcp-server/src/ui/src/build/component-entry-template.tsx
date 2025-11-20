import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { __COMPONENT_NAME__ as Component } from './components/__COMPONENT_NAME__/__COMPONENT_NAME__';

// Initialize component
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Wait for render data from parent via postMessage
let mounted = false;

window.addEventListener('message', (event) => {
  if (event.data.type === 'ui-lifecycle-iframe-render-data' && !mounted) {
    // Component will use useRenderData hook to get the data
    root.render(
      <StrictMode>
        <Component />
      </StrictMode>
    );
    mounted = true;
  }
});

// Notify parent we're ready to receive data
window.parent.postMessage({ type: 'ui-lifecycle-iframe-ready' }, '*');

// Utility for components to send messages
(window as any).mcpUI = {
  sendTool: (toolName: string, params: any) => {
    window.parent.postMessage({
      type: 'tool',
      payload: { toolName, params },
    }, '*');
  },
  sendIntent: (intent: string, params: any) => {
    window.parent.postMessage({
      type: 'intent',
      payload: { intent, params },
    }, '*');
  },
  notify: (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    window.parent.postMessage({
      type: 'notify',
      payload: { message, level },
    }, '*');
  },
};


