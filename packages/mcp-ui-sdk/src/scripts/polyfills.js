// Polyfills for Node.js globals in browser environment
import { Buffer as BufferPolyfill } from 'buffer';
import processPolyfill from 'process';

// Make Buffer and process available globally
window.Buffer = BufferPolyfill;
window.process = processPolyfill;
window.global = window;

