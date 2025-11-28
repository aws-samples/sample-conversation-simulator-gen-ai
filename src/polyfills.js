// Polyfills for Node.js globals
window.global = window;
window.process = { env: {} };

// Buffer polyfill
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Process polyfill
import process from 'process';
window.process = process;

console.log('Polyfills loaded successfully');