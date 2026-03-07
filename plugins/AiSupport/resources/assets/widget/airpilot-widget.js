var AirPilotBundle=(()=>{var Xe=Object.defineProperty;var hr=Object.getOwnPropertyDescriptor;var mr=Object.getOwnPropertyNames;var gr=Object.prototype.hasOwnProperty;var fr=(n,e,t)=>e in n?Xe(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var br=(n,e)=>{for(var t in e)Xe(n,t,{get:e[t],enumerable:!0})},_r=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of mr(e))!gr.call(n,r)&&r!==t&&Xe(n,r,{get:()=>e[r],enumerable:!(i=hr(e,r))||i.enumerable});return n};var xr=n=>_r(Xe({},"__esModule",{value:!0}),n);var w=(n,e,t)=>fr(n,typeof e!="symbol"?e+"":e,t);var is={};br(is,{default:()=>ts});var qi=`/* AirPilot Chat Widget \u2014 Base Styles
 * All classes prefixed with .airpilot- to avoid conflicts with host page.
 */

/* \u2500\u2500\u2500 CSS Custom Properties (Light Theme Default) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-root {
  --airpilot-primary: #4f46e5;
  --airpilot-primary-hover: #4338ca;
  --airpilot-primary-light: #eef2ff;
  --airpilot-bg: #ffffff;
  --airpilot-bg-secondary: #f9fafb;
  --airpilot-bg-tertiary: #f3f4f6;
  --airpilot-text: #111827;
  --airpilot-text-secondary: #6b7280;
  --airpilot-text-tertiary: #9ca3af;
  --airpilot-border: #e5e7eb;
  --airpilot-border-light: #f3f4f6;
  --airpilot-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  --airpilot-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --airpilot-bubble-bg: var(--airpilot-primary);
  --airpilot-bubble-text: #ffffff;
  --airpilot-user-msg-bg: var(--airpilot-primary);
  --airpilot-user-msg-text: #ffffff;
  --airpilot-ai-msg-bg: #f3f4f6;
  --airpilot-ai-msg-text: #111827;
  --airpilot-system-msg-bg: #fef3c7;
  --airpilot-system-msg-text: #92400e;
  --airpilot-input-bg: #ffffff;
  --airpilot-input-border: #d1d5db;
  --airpilot-input-focus: var(--airpilot-primary);
  --airpilot-badge-bg: #ef4444;
  --airpilot-badge-text: #ffffff;
  --airpilot-success: #10b981;
  --airpilot-warning: #f59e0b;
  --airpilot-error: #ef4444;
  --airpilot-star: #fbbf24;
  --airpilot-star-empty: #d1d5db;
  --airpilot-radius: 12px;
  --airpilot-radius-sm: 8px;
  --airpilot-radius-full: 9999px;
  --airpilot-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Noto Sans CJK SC', 'Noto Sans CJK JP', 'Noto Sans CJK KR', sans-serif;
  --airpilot-font-mono: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  --airpilot-z-bubble: 99998;
  --airpilot-z-panel: 99999;
  --airpilot-z-overlay: 100000;
  --airpilot-panel-width: 400px;
  --airpilot-panel-height: 600px;
  --airpilot-transition: 0.2s ease;

  font-family: var(--airpilot-font);
  font-size: 14px;
  line-height: 1.5;
  color: var(--airpilot-text);
  box-sizing: border-box;
}

.airpilot-root *,
.airpilot-root *::before,
.airpilot-root *::after {
  box-sizing: border-box;
}

/* \u2500\u2500\u2500 Floating Bubble \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-bubble {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: var(--airpilot-radius-full);
  background: var(--airpilot-bubble-bg);
  color: var(--airpilot-bubble-text);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--airpilot-z-bubble);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  transition: transform var(--airpilot-transition), box-shadow var(--airpilot-transition);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.airpilot-bubble:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5);
}

.airpilot-bubble:active {
  transform: scale(0.95);
}

.airpilot-bubble-icon {
  width: 28px;
  height: 28px;
  fill: currentColor;
}

.airpilot-bubble-close {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

/* Unread badge */
.airpilot-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 22px;
  height: 22px;
  border-radius: var(--airpilot-radius-full);
  background: var(--airpilot-badge-bg);
  color: var(--airpilot-badge-text);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  line-height: 1;
  pointer-events: none;
}

.airpilot-badge[data-count="0"] {
  display: none;
}

/* \u2500\u2500\u2500 Chat Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-panel {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: var(--airpilot-panel-width);
  height: var(--airpilot-panel-height);
  max-height: calc(100vh - 120px);
  background: var(--airpilot-bg);
  border-radius: var(--airpilot-radius);
  box-shadow: var(--airpilot-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: var(--airpilot-z-panel);
  border: 1px solid var(--airpilot-border);
}

.airpilot-panel--hidden {
  display: none;
}

/* \u2500\u2500\u2500 Panel Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--airpilot-primary);
  color: #ffffff;
  flex-shrink: 0;
  gap: 8px;
}

.airpilot-header-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.airpilot-header-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.airpilot-header-status {
  font-size: 12px;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 6px;
}

.airpilot-status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--airpilot-radius-full);
  flex-shrink: 0;
}

.airpilot-status-dot--connected {
  background: #34d399;
}

.airpilot-status-dot--connecting {
  background: var(--airpilot-warning);
  animation: airpilot-pulse 1.5s ease-in-out infinite;
}

.airpilot-status-dot--disconnected {
  background: var(--airpilot-error);
}

.airpilot-header-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.airpilot-header-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--airpilot-radius-sm);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--airpilot-transition);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.airpilot-header-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.airpilot-header-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* \u2500\u2500\u2500 Message List \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--airpilot-bg-secondary);
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.airpilot-messages::-webkit-scrollbar {
  width: 6px;
}

.airpilot-messages::-webkit-scrollbar-track {
  background: transparent;
}

.airpilot-messages::-webkit-scrollbar-thumb {
  background: var(--airpilot-border);
  border-radius: 3px;
}

.airpilot-messages::-webkit-scrollbar-thumb:hover {
  background: var(--airpilot-text-tertiary);
}

/* Date separator */
.airpilot-date-sep {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.airpilot-date-sep::before,
.airpilot-date-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--airpilot-border);
}

.airpilot-date-sep span {
  font-size: 11px;
  color: var(--airpilot-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* \u2500\u2500\u2500 Message Item \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-msg {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.airpilot-msg--user {
  align-self: flex-end;
}

.airpilot-msg--ai,
.airpilot-msg--admin {
  align-self: flex-start;
}

.airpilot-msg--system {
  align-self: center;
  max-width: 90%;
}

.airpilot-msg-bubble {
  padding: 10px 14px;
  border-radius: var(--airpilot-radius);
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: relative;
}

.airpilot-msg--user .airpilot-msg-bubble {
  background: var(--airpilot-user-msg-bg);
  color: var(--airpilot-user-msg-text);
  border-bottom-right-radius: 4px;
}

.airpilot-msg--ai .airpilot-msg-bubble,
.airpilot-msg--admin .airpilot-msg-bubble {
  background: var(--airpilot-ai-msg-bg);
  color: var(--airpilot-ai-msg-text);
  border-bottom-left-radius: 4px;
}

.airpilot-msg--system .airpilot-msg-bubble {
  background: var(--airpilot-system-msg-bg);
  color: var(--airpilot-system-msg-text);
  font-size: 13px;
  text-align: center;
  border-radius: var(--airpilot-radius-full);
  padding: 6px 16px;
}

.airpilot-msg-sender {
  font-size: 12px;
  color: var(--airpilot-text-secondary);
  margin-bottom: 4px;
  font-weight: 500;
}

.airpilot-msg-time {
  font-size: 11px;
  color: var(--airpilot-text-tertiary);
  margin-top: 4px;
  text-align: right;
}

.airpilot-msg--user .airpilot-msg-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Markdown content */
.airpilot-msg-content p {
  margin: 0 0 8px 0;
}

.airpilot-msg-content p:last-child {
  margin-bottom: 0;
}

.airpilot-msg-content a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.airpilot-msg--ai .airpilot-msg-content a {
  color: var(--airpilot-primary);
}

.airpilot-msg-content code {
  font-family: var(--airpilot-font-mono);
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 5px;
  border-radius: 4px;
}

.airpilot-msg--user .airpilot-msg-content code {
  background: rgba(255, 255, 255, 0.2);
}

.airpilot-msg-content pre {
  margin: 8px 0;
  padding: 12px;
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: var(--airpilot-radius-sm);
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.4;
}

.airpilot-msg-content pre code {
  background: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}

.airpilot-msg-content ul,
.airpilot-msg-content ol {
  margin: 4px 0;
  padding-left: 20px;
}

.airpilot-msg-content li {
  margin: 2px 0;
}

.airpilot-msg-content blockquote {
  margin: 8px 0;
  padding: 4px 12px;
  border-left: 3px solid var(--airpilot-border);
  color: var(--airpilot-text-secondary);
}

.airpilot-msg-content img {
  max-width: 100%;
  border-radius: var(--airpilot-radius-sm);
  margin: 4px 0;
}

.airpilot-msg-content table {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 13px;
}

.airpilot-msg-content th,
.airpilot-msg-content td {
  border: 1px solid var(--airpilot-border);
  padding: 6px 10px;
  text-align: left;
}

.airpilot-msg-content th {
  background: var(--airpilot-bg-tertiary);
  font-weight: 600;
}

/* Message actions (copy, feedback) */
.airpilot-msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity var(--airpilot-transition);
}

.airpilot-msg:hover .airpilot-msg-actions {
  opacity: 1;
}

.airpilot-msg-action-btn {
  border: none;
  background: var(--airpilot-bg-tertiary);
  color: var(--airpilot-text-secondary);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background var(--airpilot-transition), color var(--airpilot-transition);
  outline: none;
}

.airpilot-msg-action-btn:hover {
  background: var(--airpilot-border);
  color: var(--airpilot-text);
}

.airpilot-msg-action-btn--active {
  background: var(--airpilot-primary-light);
  color: var(--airpilot-primary);
}

.airpilot-msg-action-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* Typing indicator */
.airpilot-typing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: var(--airpilot-text-secondary);
  font-size: 13px;
}

.airpilot-typing-dots {
  display: flex;
  gap: 3px;
}

.airpilot-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--airpilot-radius-full);
  background: var(--airpilot-text-tertiary);
  animation: airpilot-bounce 1.4s ease-in-out infinite;
}

.airpilot-typing-dot:nth-child(2) {
  animation-delay: 0.16s;
}

.airpilot-typing-dot:nth-child(3) {
  animation-delay: 0.32s;
}

/* Image attachment in messages */
.airpilot-msg-image {
  max-width: 240px;
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  transition: opacity var(--airpilot-transition);
}

.airpilot-msg-image:hover {
  opacity: 0.9;
}

.airpilot-msg-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--airpilot-bg-tertiary);
  border-radius: var(--airpilot-radius-sm);
  font-size: 13px;
  margin: 4px 0;
}

.airpilot-msg-file-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: var(--airpilot-text-secondary);
}

.airpilot-msg-file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* \u2500\u2500\u2500 Input Area \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-input-area {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--airpilot-border);
  background: var(--airpilot-bg);
  flex-shrink: 0;
}

.airpilot-input-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px 0;
}

.airpilot-toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--airpilot-text-secondary);
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--airpilot-transition), color var(--airpilot-transition);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.airpilot-toolbar-btn:hover {
  background: var(--airpilot-bg-tertiary);
  color: var(--airpilot-text);
}

.airpilot-toolbar-btn--active {
  background: var(--airpilot-primary-light);
  color: var(--airpilot-primary);
}

.airpilot-toolbar-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.airpilot-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px 12px;
}

.airpilot-textarea {
  flex: 1;
  border: 1px solid var(--airpilot-input-border);
  border-radius: var(--airpilot-radius-sm);
  padding: 8px 12px;
  font-family: var(--airpilot-font);
  font-size: 14px;
  line-height: 1.4;
  color: var(--airpilot-text);
  background: var(--airpilot-input-bg);
  resize: none;
  outline: none;
  min-height: 38px;
  max-height: 120px;
  overflow-y: auto;
  transition: border-color var(--airpilot-transition);
}

.airpilot-textarea::placeholder {
  color: var(--airpilot-text-tertiary);
}

.airpilot-textarea:focus {
  border-color: var(--airpilot-input-focus);
}

.airpilot-send-btn {
  width: 38px;
  height: 38px;
  border: none;
  background: var(--airpilot-primary);
  color: #ffffff;
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--airpilot-transition), transform var(--airpilot-transition);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.airpilot-send-btn:hover {
  background: var(--airpilot-primary-hover);
}

.airpilot-send-btn:active {
  transform: scale(0.92);
}

.airpilot-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.airpilot-send-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* File upload preview */
.airpilot-upload-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 0 12px;
  background: var(--airpilot-bg-tertiary);
  border-radius: var(--airpilot-radius-sm);
}

.airpilot-upload-preview img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.airpilot-upload-preview-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.airpilot-upload-preview-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--airpilot-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--airpilot-radius-full);
  outline: none;
}

.airpilot-upload-preview-remove:hover {
  background: var(--airpilot-border);
}

.airpilot-upload-progress {
  height: 3px;
  background: var(--airpilot-border);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.airpilot-upload-progress-bar {
  height: 100%;
  background: var(--airpilot-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Drop zone overlay */
.airpilot-dropzone {
  position: absolute;
  inset: 0;
  background: rgba(79, 70, 229, 0.08);
  border: 2px dashed var(--airpilot-primary);
  border-radius: var(--airpilot-radius);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.airpilot-dropzone--active {
  display: flex;
}

.airpilot-dropzone-text {
  font-size: 15px;
  color: var(--airpilot-primary);
  font-weight: 500;
}

/* \u2500\u2500\u2500 Emoji Picker \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  height: 260px;
  background: var(--airpilot-bg);
  border-top: 1px solid var(--airpilot-border);
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.airpilot-emoji-picker--hidden {
  display: none;
}

.airpilot-emoji-tabs {
  display: flex;
  border-bottom: 1px solid var(--airpilot-border);
  overflow-x: auto;
  flex-shrink: 0;
}

.airpilot-emoji-tab {
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: var(--airpilot-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color var(--airpilot-transition), border-color var(--airpilot-transition);
  outline: none;
}

.airpilot-emoji-tab--active {
  color: var(--airpilot-primary);
  border-bottom-color: var(--airpilot-primary);
}

.airpilot-emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
}

.airpilot-emoji-btn {
  width: 100%;
  aspect-ratio: 1;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  border-radius: var(--airpilot-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--airpilot-transition);
  outline: none;
}

.airpilot-emoji-btn:hover {
  background: var(--airpilot-bg-tertiary);
}

/* \u2500\u2500\u2500 Escalation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-escalation-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--airpilot-system-msg-bg);
  border-top: 1px solid var(--airpilot-border);
  flex-shrink: 0;
}

.airpilot-escalation-bar--hidden {
  display: none;
}

.airpilot-escalation-text {
  flex: 1;
  font-size: 13px;
  color: var(--airpilot-system-msg-text);
}

.airpilot-escalation-timer {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.airpilot-escalation-cancel {
  border: none;
  background: transparent;
  color: var(--airpilot-text-secondary);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  outline: none;
}

.airpilot-escalation-btn {
  border: none;
  background: var(--airpilot-warning);
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--airpilot-transition);
  outline: none;
}

.airpilot-escalation-btn:hover {
  background: #d97706;
}

.airpilot-escalation-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.airpilot-escalation-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* \u2500\u2500\u2500 Satisfaction Survey \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-survey {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  background: var(--airpilot-bg);
  border-top: 1px solid var(--airpilot-border);
  flex-shrink: 0;
}

.airpilot-survey--hidden {
  display: none;
}

.airpilot-survey-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--airpilot-text);
}

.airpilot-survey-stars {
  display: flex;
  gap: 8px;
}

.airpilot-survey-star {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: transform var(--airpilot-transition);
}

.airpilot-survey-star:hover {
  transform: scale(1.2);
}

.airpilot-survey-star svg {
  width: 100%;
  height: 100%;
  fill: var(--airpilot-star-empty);
  transition: fill var(--airpilot-transition);
}

.airpilot-survey-star--active svg,
.airpilot-survey-star--hover svg {
  fill: var(--airpilot-star);
}

.airpilot-survey-label {
  font-size: 13px;
  color: var(--airpilot-text-secondary);
  min-height: 20px;
}

.airpilot-survey-actions {
  display: flex;
  gap: 8px;
}

.airpilot-survey-submit {
  border: none;
  background: var(--airpilot-primary);
  color: #ffffff;
  font-size: 13px;
  padding: 8px 20px;
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  transition: background var(--airpilot-transition);
  outline: none;
}

.airpilot-survey-submit:hover {
  background: var(--airpilot-primary-hover);
}

.airpilot-survey-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.airpilot-survey-skip {
  border: none;
  background: transparent;
  color: var(--airpilot-text-secondary);
  font-size: 13px;
  padding: 8px 12px;
  cursor: pointer;
  text-decoration: underline;
  outline: none;
}

.airpilot-survey-thanks {
  font-size: 14px;
  color: var(--airpilot-success);
  font-weight: 500;
}

/* \u2500\u2500\u2500 Guest Form \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-guest-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px 24px;
  flex: 1;
  justify-content: center;
}

.airpilot-guest-title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: var(--airpilot-text);
}

.airpilot-guest-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.airpilot-guest-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--airpilot-text-secondary);
}

.airpilot-guest-input {
  border: 1px solid var(--airpilot-input-border);
  border-radius: var(--airpilot-radius-sm);
  padding: 10px 12px;
  font-family: var(--airpilot-font);
  font-size: 14px;
  color: var(--airpilot-text);
  background: var(--airpilot-input-bg);
  outline: none;
  transition: border-color var(--airpilot-transition);
}

.airpilot-guest-input::placeholder {
  color: var(--airpilot-text-tertiary);
}

.airpilot-guest-input:focus {
  border-color: var(--airpilot-input-focus);
}

.airpilot-guest-input--error {
  border-color: var(--airpilot-error);
}

.airpilot-guest-error {
  font-size: 12px;
  color: var(--airpilot-error);
}

.airpilot-guest-submit {
  border: none;
  background: var(--airpilot-primary);
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  padding: 12px;
  border-radius: var(--airpilot-radius-sm);
  cursor: pointer;
  transition: background var(--airpilot-transition);
  outline: none;
  margin-top: 8px;
}

.airpilot-guest-submit:hover {
  background: var(--airpilot-primary-hover);
}

/* \u2500\u2500\u2500 Empty State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 24px;
  text-align: center;
}

.airpilot-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.airpilot-empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--airpilot-text);
  margin-bottom: 8px;
}

.airpilot-empty-text {
  font-size: 14px;
  color: var(--airpilot-text-secondary);
}

/* \u2500\u2500\u2500 Loading Spinner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--airpilot-border);
  border-top-color: var(--airpilot-primary);
  border-radius: var(--airpilot-radius-full);
  animation: airpilot-spin 0.8s linear infinite;
}

/* \u2500\u2500\u2500 Notification Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-toast {
  position: fixed;
  bottom: 100px;
  right: 24px;
  background: var(--airpilot-text);
  color: var(--airpilot-bg);
  padding: 10px 16px;
  border-radius: var(--airpilot-radius-sm);
  font-size: 13px;
  z-index: var(--airpilot-z-overlay);
  box-shadow: var(--airpilot-shadow);
  pointer-events: none;
}

.airpilot-toast--hidden {
  display: none;
}

/* \u2500\u2500\u2500 Position Variants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-root--bottom-left .airpilot-bubble {
  right: auto;
  left: 24px;
}

.airpilot-root--bottom-left .airpilot-panel {
  right: auto;
  left: 24px;
}

.airpilot-root--bottom-left .airpilot-toast {
  right: auto;
  left: 24px;
}

/* \u2500\u2500\u2500 Keyframes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@keyframes airpilot-spin {
  to { transform: rotate(360deg); }
}

@keyframes airpilot-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
}

@keyframes airpilot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;var Gi=`/* AirPilot Chat Widget \u2014 Dark Theme Override */

.airpilot-root--dark {
  --airpilot-bg: #1a1a2e;
  --airpilot-bg-secondary: #16162a;
  --airpilot-bg-tertiary: #1f1f3a;
  --airpilot-text: #e2e8f0;
  --airpilot-text-secondary: #94a3b8;
  --airpilot-text-tertiary: #64748b;
  --airpilot-border: #2d2d4a;
  --airpilot-border-light: #1f1f3a;
  --airpilot-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2);
  --airpilot-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --airpilot-ai-msg-bg: #1f1f3a;
  --airpilot-ai-msg-text: #e2e8f0;
  --airpilot-system-msg-bg: #3b2e1a;
  --airpilot-system-msg-text: #fbbf24;
  --airpilot-input-bg: #1a1a2e;
  --airpilot-input-border: #2d2d4a;
  --airpilot-primary-light: #2a2650;
  --airpilot-star-empty: #3b3b5c;
}

/* Dark mode code blocks */
.airpilot-root--dark .airpilot-msg-content pre {
  background: #0d0d1a;
}

.airpilot-root--dark .airpilot-msg-content code {
  background: rgba(255, 255, 255, 0.08);
}

.airpilot-root--dark .airpilot-msg--user .airpilot-msg-content code {
  background: rgba(255, 255, 255, 0.15);
}

/* Dark mode scrollbar */
.airpilot-root--dark .airpilot-messages::-webkit-scrollbar-thumb {
  background: #2d2d4a;
}

.airpilot-root--dark .airpilot-messages::-webkit-scrollbar-thumb:hover {
  background: #3b3b5c;
}
`;var Wi=`/* AirPilot Chat Widget \u2014 Animations */

/* \u2500\u2500\u2500 Panel Open/Close \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-panel--opening {
  animation: airpilot-panel-open 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.airpilot-panel--closing {
  animation: airpilot-panel-close 0.2s ease-in forwards;
}

@keyframes airpilot-panel-open {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes airpilot-panel-close {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
}

/* \u2500\u2500\u2500 Message Slide-In \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-msg--entering {
  animation: airpilot-msg-in 0.3s ease-out forwards;
}

.airpilot-msg--user.airpilot-msg--entering {
  animation-name: airpilot-msg-in-right;
}

@keyframes airpilot-msg-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes airpilot-msg-in-right {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* \u2500\u2500\u2500 Bubble Pulse (new messages) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-bubble--pulse {
  animation: airpilot-bubble-pulse 2s ease-in-out 3;
}

@keyframes airpilot-bubble-pulse {
  0% { box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); }
  50% { box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4), 0 0 0 12px rgba(79, 70, 229, 0.15); }
  100% { box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4); }
}

/* \u2500\u2500\u2500 Emoji Picker Slide \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-emoji-picker--opening {
  animation: airpilot-slide-up 0.2s ease-out forwards;
}

@keyframes airpilot-slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* \u2500\u2500\u2500 Survey Stars \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-survey-star--pop {
  animation: airpilot-star-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes airpilot-star-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* \u2500\u2500\u2500 Toast \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-toast--entering {
  animation: airpilot-toast-in 0.3s ease-out forwards;
}

.airpilot-toast--leaving {
  animation: airpilot-toast-out 0.2s ease-in forwards;
}

@keyframes airpilot-toast-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes airpilot-toast-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
}

/* \u2500\u2500\u2500 Fade In/Out utility \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.airpilot-fade-in {
  animation: airpilot-fade-in 0.2s ease-out;
}

@keyframes airpilot-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* \u2500\u2500\u2500 Reduced Motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@media (prefers-reduced-motion: reduce) {
  .airpilot-panel--opening,
  .airpilot-panel--closing,
  .airpilot-msg--entering,
  .airpilot-bubble--pulse,
  .airpilot-emoji-picker--opening,
  .airpilot-survey-star--pop,
  .airpilot-toast--entering,
  .airpilot-toast--leaving,
  .airpilot-typing-dot,
  .airpilot-fade-in {
    animation: none !important;
  }
}

/* \u2500\u2500\u2500 Mobile Full-Screen \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@media (max-width: 480px) {
  .airpilot-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100% !important;
    height: 100% !important;
    max-height: 100vh !important;
    border-radius: 0;
    border: none;
  }

  .airpilot-panel--opening {
    animation-name: airpilot-panel-open-mobile;
  }

  @keyframes airpilot-panel-open-mobile {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .airpilot-bubble {
    bottom: 16px;
    right: 16px;
    width: 56px;
    height: 56px;
  }
}

/* \u2500\u2500\u2500 Tablet \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@media (min-width: 481px) and (max-width: 768px) {
  .airpilot-panel {
    width: min(400px, calc(100vw - 48px));
    height: min(600px, calc(100vh - 120px));
  }
}
`;var Ke={"widget.title":"AI \u5BA2\u670D","widget.subtitle":"\u6709\u4EC0\u4E48\u53EF\u4EE5\u5E2E\u52A9\u60A8\u7684\uFF1F","widget.inputPlaceholder":"\u8F93\u5165\u6D88\u606F...","widget.send":"\u53D1\u9001","widget.close":"\u5173\u95ED","widget.minimize":"\u6700\u5C0F\u5316","widget.typing":"\u6B63\u5728\u8F93\u5165...","widget.connecting":"\u8FDE\u63A5\u4E2D...","widget.connected":"\u5DF2\u8FDE\u63A5","widget.disconnected":"\u5DF2\u65AD\u5F00","widget.retry":"\u91CD\u8BD5","widget.newMessage":"\u65B0\u6D88\u606F","widget.unread":"{count} \u6761\u672A\u8BFB\u6D88\u606F","guest.title":"\u5F00\u59CB\u5BF9\u8BDD","guest.name":"\u60A8\u7684\u59D3\u540D","guest.email":"\u90AE\u7BB1\u5730\u5740","guest.start":"\u5F00\u59CB\u804A\u5929","guest.nameRequired":"\u8BF7\u8F93\u5165\u59D3\u540D","guest.emailRequired":"\u8BF7\u8F93\u5165\u90AE\u7BB1","guest.emailInvalid":"\u8BF7\u8F93\u5165\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740","message.copied":"\u5DF2\u590D\u5236","message.copy":"\u590D\u5236","message.helpful":"\u6709\u5E2E\u52A9","message.notHelpful":"\u6CA1\u5E2E\u52A9","message.feedbackThanks":"\u611F\u8C22\u60A8\u7684\u53CD\u9988\uFF01","message.today":"\u4ECA\u5929","message.yesterday":"\u6628\u5929","escalation.request":"\u8F6C\u4EBA\u5DE5\u5BA2\u670D","escalation.requesting":"\u6B63\u5728\u8BF7\u6C42...","escalation.waiting":"\u7B49\u5F85\u4EBA\u5DE5\u5BA2\u670D","escalation.countdown":"\u9884\u8BA1\u7B49\u5F85 {time}","escalation.connected":"\u4EBA\u5DE5\u5BA2\u670D\u5DF2\u8FDE\u63A5","escalation.adminTyping":"\u5BA2\u670D\u6B63\u5728\u8F93\u5165...","escalation.ended":"\u4EBA\u5DE5\u5BA2\u670D\u5DF2\u7ED3\u675F","escalation.cancel":"\u53D6\u6D88\u7B49\u5F85","attachment.upload":"\u4E0A\u4F20\u6587\u4EF6","attachment.dragDrop":"\u62D6\u62FD\u6587\u4EF6\u5230\u6B64\u5904","attachment.tooLarge":"\u6587\u4EF6\u8FC7\u5927\uFF08\u6700\u5927 {max}MB\uFF09","attachment.invalidType":"\u4E0D\u652F\u6301\u7684\u6587\u4EF6\u7C7B\u578B","attachment.uploading":"\u4E0A\u4F20\u4E2D...","survey.title":"\u8BF7\u4E3A\u672C\u6B21\u670D\u52A1\u8BC4\u5206","survey.submit":"\u63D0\u4EA4\u8BC4\u4EF7","survey.thanks":"\u611F\u8C22\u60A8\u7684\u8BC4\u4EF7\uFF01","survey.skip":"\u8DF3\u8FC7","survey.stars":{"1":"\u5F88\u5DEE","2":"\u8F83\u5DEE","3":"\u4E00\u822C","4":"\u6EE1\u610F","5":"\u975E\u5E38\u6EE1\u610F"},"emoji.search":"\u641C\u7D22\u8868\u60C5...","emoji.recent":"\u6700\u8FD1\u4F7F\u7528","emoji.smileys":"\u8868\u60C5","emoji.animals":"\u52A8\u7269","emoji.food":"\u98DF\u7269","emoji.activities":"\u6D3B\u52A8","emoji.travel":"\u65C5\u884C","emoji.objects":"\u7269\u54C1","emoji.symbols":"\u7B26\u53F7","error.network":"\u7F51\u7EDC\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5","error.sendFailed":"\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5","error.loadHistory":"\u52A0\u8F7D\u5386\u53F2\u8BB0\u5F55\u5931\u8D25","error.uploadFailed":"\u4E0A\u4F20\u5931\u8D25"};var te={"widget.title":"AI Support","widget.subtitle":"How can we help you?","widget.inputPlaceholder":"Type a message...","widget.send":"Send","widget.close":"Close","widget.minimize":"Minimize","widget.typing":"Typing...","widget.connecting":"Connecting...","widget.connected":"Connected","widget.disconnected":"Disconnected","widget.retry":"Retry","widget.newMessage":"New message","widget.unread":"{count} unread message(s)","guest.title":"Start a Conversation","guest.name":"Your name","guest.email":"Email address","guest.start":"Start Chat","guest.nameRequired":"Please enter your name","guest.emailRequired":"Please enter your email","guest.emailInvalid":"Please enter a valid email address","message.copied":"Copied","message.copy":"Copy","message.helpful":"Helpful","message.notHelpful":"Not helpful","message.feedbackThanks":"Thanks for your feedback!","message.today":"Today","message.yesterday":"Yesterday","escalation.request":"Talk to a human","escalation.requesting":"Requesting...","escalation.waiting":"Waiting for support agent","escalation.countdown":"Estimated wait: {time}","escalation.connected":"Support agent connected","escalation.adminTyping":"Agent is typing...","escalation.ended":"Human support ended","escalation.cancel":"Cancel wait","attachment.upload":"Upload file","attachment.dragDrop":"Drop file here","attachment.tooLarge":"File too large (max {max}MB)","attachment.invalidType":"Unsupported file type","attachment.uploading":"Uploading...","survey.title":"Rate this conversation","survey.submit":"Submit","survey.thanks":"Thank you for your feedback!","survey.skip":"Skip","survey.stars":{"1":"Terrible","2":"Poor","3":"Average","4":"Good","5":"Excellent"},"emoji.search":"Search emoji...","emoji.recent":"Recent","emoji.smileys":"Smileys","emoji.animals":"Animals","emoji.food":"Food","emoji.activities":"Activities","emoji.travel":"Travel","emoji.objects":"Objects","emoji.symbols":"Symbols","error.network":"Network error. Please try again.","error.sendFailed":"Failed to send. Please retry.","error.loadHistory":"Failed to load history","error.uploadFailed":"Upload failed"};var Ot={"widget.title":"AI\u30B5\u30DD\u30FC\u30C8","widget.subtitle":"\u3054\u8CEA\u554F\u304C\u3054\u3056\u3044\u307E\u3057\u305F\u3089\u304A\u6C17\u8EFD\u306B\u3069\u3046\u305E","widget.inputPlaceholder":"\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B...","widget.send":"\u9001\u4FE1","widget.close":"\u9589\u3058\u308B","widget.minimize":"\u6700\u5C0F\u5316","widget.typing":"\u5165\u529B\u4E2D...","widget.connecting":"\u63A5\u7D9A\u4E2D...","widget.connected":"\u63A5\u7D9A\u6E08\u307F","widget.disconnected":"\u5207\u65AD","widget.retry":"\u518D\u8A66\u884C","widget.newMessage":"\u65B0\u3057\u3044\u30E1\u30C3\u30BB\u30FC\u30B8","widget.unread":"{count} \u4EF6\u306E\u672A\u8AAD\u30E1\u30C3\u30BB\u30FC\u30B8","guest.title":"\u30C1\u30E3\u30C3\u30C8\u3092\u958B\u59CB","guest.name":"\u304A\u540D\u524D","guest.email":"\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9","guest.start":"\u30C1\u30E3\u30C3\u30C8\u958B\u59CB","guest.nameRequired":"\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044","guest.emailRequired":"\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044","guest.emailInvalid":"\u6709\u52B9\u306A\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044","message.copied":"\u30B3\u30D4\u30FC\u6E08\u307F","message.copy":"\u30B3\u30D4\u30FC","message.helpful":"\u5F79\u306B\u7ACB\u3063\u305F","message.notHelpful":"\u5F79\u306B\u7ACB\u305F\u306A\u304B\u3063\u305F","message.feedbackThanks":"\u30D5\u30A3\u30FC\u30C9\u30D0\u30C3\u30AF\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01","message.today":"\u4ECA\u65E5","message.yesterday":"\u6628\u65E5","escalation.request":"\u62C5\u5F53\u8005\u306B\u3064\u306A\u3050","escalation.requesting":"\u30EA\u30AF\u30A8\u30B9\u30C8\u4E2D...","escalation.waiting":"\u62C5\u5F53\u8005\u3092\u5F85\u3063\u3066\u3044\u307E\u3059","escalation.countdown":"\u63A8\u5B9A\u5F85\u3061\u6642\u9593: {time}","escalation.connected":"\u62C5\u5F53\u8005\u304C\u63A5\u7D9A\u3057\u307E\u3057\u305F","escalation.adminTyping":"\u62C5\u5F53\u8005\u304C\u5165\u529B\u4E2D...","escalation.ended":"\u30B5\u30DD\u30FC\u30C8\u304C\u7D42\u4E86\u3057\u307E\u3057\u305F","escalation.cancel":"\u30AD\u30E3\u30F3\u30BB\u30EB","attachment.upload":"\u30D5\u30A1\u30A4\u30EB\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9","attachment.dragDrop":"\u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30ED\u30C3\u30D7","attachment.tooLarge":"\u30D5\u30A1\u30A4\u30EB\u304C\u5927\u304D\u3059\u304E\u307E\u3059\uFF08\u6700\u5927{max}MB\uFF09","attachment.invalidType":"\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u306A\u3044\u30D5\u30A1\u30A4\u30EB\u5F62\u5F0F","attachment.uploading":"\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4E2D...","survey.title":"\u3053\u306E\u4F1A\u8A71\u3092\u8A55\u4FA1\u3057\u3066\u304F\u3060\u3055\u3044","survey.submit":"\u9001\u4FE1","survey.thanks":"\u3054\u8A55\u4FA1\u3042\u308A\u304C\u3068\u3046\u3054\u3056\u3044\u307E\u3059\uFF01","survey.skip":"\u30B9\u30AD\u30C3\u30D7","survey.stars":{"1":"\u3068\u3066\u3082\u60AA\u3044","2":"\u60AA\u3044","3":"\u666E\u901A","4":"\u826F\u3044","5":"\u3068\u3066\u3082\u826F\u3044"},"emoji.search":"\u7D75\u6587\u5B57\u3092\u691C\u7D22...","emoji.recent":"\u6700\u8FD1","emoji.smileys":"\u30B9\u30DE\u30A4\u30EA\u30FC","emoji.animals":"\u52D5\u7269","emoji.food":"\u98DF\u3079\u7269","emoji.activities":"\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3","emoji.travel":"\u65C5\u884C","emoji.objects":"\u7269","emoji.symbols":"\u8A18\u53F7","error.network":"\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u30A8\u30E9\u30FC\u3002\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002","error.sendFailed":"\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002","error.loadHistory":"\u5C65\u6B74\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F","error.uploadFailed":"\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F"};var Pt={"widget.title":"AI \uC9C0\uC6D0","widget.subtitle":"\uBB34\uC5C7\uC744 \uB3C4\uC640\uB4DC\uB9B4\uAE4C\uC694?","widget.inputPlaceholder":"\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694...","widget.send":"\uC804\uC1A1","widget.close":"\uB2EB\uAE30","widget.minimize":"\uCD5C\uC18C\uD654","widget.typing":"\uC785\uB825 \uC911...","widget.connecting":"\uC5F0\uACB0 \uC911...","widget.connected":"\uC5F0\uACB0\uB428","widget.disconnected":"\uC5F0\uACB0 \uB04A\uAE40","widget.retry":"\uC7AC\uC2DC\uB3C4","widget.newMessage":"\uC0C8 \uBA54\uC2DC\uC9C0","widget.unread":"{count}\uAC1C\uC758 \uC77D\uC9C0 \uC54A\uC740 \uBA54\uC2DC\uC9C0","guest.title":"\uB300\uD654 \uC2DC\uC791","guest.name":"\uC774\uB984","guest.email":"\uC774\uBA54\uC77C \uC8FC\uC18C","guest.start":"\uCC44\uD305 \uC2DC\uC791","guest.nameRequired":"\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694","guest.emailRequired":"\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694","guest.emailInvalid":"\uC720\uD6A8\uD55C \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694","message.copied":"\uBCF5\uC0AC\uB428","message.copy":"\uBCF5\uC0AC","message.helpful":"\uB3C4\uC6C0\uC774 \uB428","message.notHelpful":"\uB3C4\uC6C0\uC774 \uC548 \uB428","message.feedbackThanks":"\uD53C\uB4DC\uBC31 \uAC10\uC0AC\uD569\uB2C8\uB2E4!","message.today":"\uC624\uB298","message.yesterday":"\uC5B4\uC81C","escalation.request":"\uC0C1\uB2F4\uC6D0 \uC5F0\uACB0","escalation.requesting":"\uC694\uCCAD \uC911...","escalation.waiting":"\uC0C1\uB2F4\uC6D0\uC744 \uAE30\uB2E4\uB9AC\uB294 \uC911","escalation.countdown":"\uC608\uC0C1 \uB300\uAE30 \uC2DC\uAC04: {time}","escalation.connected":"\uC0C1\uB2F4\uC6D0\uC774 \uC5F0\uACB0\uB418\uC5C8\uC2B5\uB2C8\uB2E4","escalation.adminTyping":"\uC0C1\uB2F4\uC6D0\uC774 \uC785\uB825 \uC911...","escalation.ended":"\uC0C1\uB2F4\uC774 \uC885\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4","escalation.cancel":"\uB300\uAE30 \uCDE8\uC18C","attachment.upload":"\uD30C\uC77C \uC5C5\uB85C\uB4DC","attachment.dragDrop":"\uD30C\uC77C\uC744 \uC5EC\uAE30\uC5D0 \uB193\uC73C\uC138\uC694","attachment.tooLarge":"\uD30C\uC77C\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4 (\uCD5C\uB300 {max}MB)","attachment.invalidType":"\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD30C\uC77C \uD615\uC2DD","attachment.uploading":"\uC5C5\uB85C\uB4DC \uC911...","survey.title":"\uB300\uD654\uB97C \uD3C9\uAC00\uD574\uC8FC\uC138\uC694","survey.submit":"\uC81C\uCD9C","survey.thanks":"\uD3C9\uAC00\uD574\uC8FC\uC154\uC11C \uAC10\uC0AC\uD569\uB2C8\uB2E4!","survey.skip":"\uAC74\uB108\uB6F0\uAE30","survey.stars":{"1":"\uB9E4\uC6B0 \uB098\uC068","2":"\uB098\uC068","3":"\uBCF4\uD1B5","4":"\uC88B\uC74C","5":"\uB9E4\uC6B0 \uC88B\uC74C"},"emoji.search":"\uC774\uBAA8\uC9C0 \uAC80\uC0C9...","emoji.recent":"\uCD5C\uADFC","emoji.smileys":"\uC2A4\uB9C8\uC77C\uB9AC","emoji.animals":"\uB3D9\uBB3C","emoji.food":"\uC74C\uC2DD","emoji.activities":"\uD65C\uB3D9","emoji.travel":"\uC5EC\uD589","emoji.objects":"\uC0AC\uBB3C","emoji.symbols":"\uAE30\uD638","error.network":"\uB124\uD2B8\uC6CC\uD06C \uC624\uB958. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.","error.sendFailed":"\uC804\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.","error.loadHistory":"\uAE30\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4","error.uploadFailed":"\uC5C5\uB85C\uB4DC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4"};var Bt={"widget.title":"\u0418\u0418 \u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430","widget.subtitle":"\u0427\u0435\u043C \u043C\u043E\u0436\u0435\u043C \u043F\u043E\u043C\u043E\u0447\u044C?","widget.inputPlaceholder":"\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435...","widget.send":"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C","widget.close":"\u0417\u0430\u043A\u0440\u044B\u0442\u044C","widget.minimize":"\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C","widget.typing":"\u041F\u0435\u0447\u0430\u0442\u0430\u0435\u0442...","widget.connecting":"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435...","widget.connected":"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043E","widget.disconnected":"\u041E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u043E","widget.retry":"\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C","widget.newMessage":"\u041D\u043E\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435","widget.unread":"\u041D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0445: {count}","guest.title":"\u041D\u0430\u0447\u0430\u0442\u044C \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440","guest.name":"\u0412\u0430\u0448\u0435 \u0438\u043C\u044F","guest.email":"\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0430\u044F \u043F\u043E\u0447\u0442\u0430","guest.start":"\u041D\u0430\u0447\u0430\u0442\u044C \u0447\u0430\u0442","guest.nameRequired":"\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F","guest.emailRequired":"\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 email","guest.emailInvalid":"\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 email","message.copied":"\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E","message.copy":"\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C","message.helpful":"\u041F\u043E\u043B\u0435\u0437\u043D\u043E","message.notHelpful":"\u0411\u0435\u0441\u043F\u043E\u043B\u0435\u0437\u043D\u043E","message.feedbackThanks":"\u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u043E\u0442\u0437\u044B\u0432!","message.today":"\u0421\u0435\u0433\u043E\u0434\u043D\u044F","message.yesterday":"\u0412\u0447\u0435\u0440\u0430","escalation.request":"\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u043E\u043C","escalation.requesting":"\u0417\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u043C...","escalation.waiting":"\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430","escalation.countdown":"\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435: {time}","escalation.connected":"\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D","escalation.adminTyping":"\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440 \u043F\u0435\u0447\u0430\u0442\u0430\u0435\u0442...","escalation.ended":"\u0427\u0430\u0442 \u0441 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u043E\u043C \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D","escalation.cancel":"\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435","attachment.upload":"\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B","attachment.dragDrop":"\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B \u0441\u044E\u0434\u0430","attachment.tooLarge":"\u0424\u0430\u0439\u043B \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0439 (\u043C\u0430\u043A\u0441. {max}\u041C\u0411)","attachment.invalidType":"\u041D\u0435\u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u044B\u0439 \u0442\u0438\u043F \u0444\u0430\u0439\u043B\u0430","attachment.uploading":"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...","survey.title":"\u041E\u0446\u0435\u043D\u0438\u0442\u0435 \u044D\u0442\u043E\u0442 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440","survey.submit":"\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C","survey.thanks":"\u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u043E\u0446\u0435\u043D\u043A\u0443!","survey.skip":"\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C","survey.stars":{"1":"\u0423\u0436\u0430\u0441\u043D\u043E","2":"\u041F\u043B\u043E\u0445\u043E","3":"\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E","4":"\u0425\u043E\u0440\u043E\u0448\u043E","5":"\u041E\u0442\u043B\u0438\u0447\u043D\u043E"},"emoji.search":"\u041F\u043E\u0438\u0441\u043A \u044D\u043C\u043E\u0434\u0437\u0438...","emoji.recent":"\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0435","emoji.smileys":"\u0421\u043C\u0430\u0439\u043B\u044B","emoji.animals":"\u0416\u0438\u0432\u043E\u0442\u043D\u044B\u0435","emoji.food":"\u0415\u0434\u0430","emoji.activities":"\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438","emoji.travel":"\u041F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u044F","emoji.objects":"\u041F\u0440\u0435\u0434\u043C\u0435\u0442\u044B","emoji.symbols":"\u0421\u0438\u043C\u0432\u043E\u043B\u044B","error.network":"\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0442\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.","error.sendFailed":"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.","error.loadHistory":"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E","error.uploadFailed":"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B"};var le={"zh-CN":Ke,zh:Ke,"zh-TW":Ke,en:te,"en-US":te,"en-GB":te,ja:Ot,"ja-JP":Ot,ko:Pt,"ko-KR":Pt,ru:Bt,"ru-RU":Bt},Je="en",Qe=Je,Ae=te;function Vi(n){if(n&&le[n])Qe=n,Ae=le[n];else if(n){let e=n.split("-")[0];le[e]?(Qe=e,Ae=le[e]):(Qe=Je,Ae=te)}else Qe=Je,Ae=te}function m(n,e){let t=Yi(Ae,n);return t==null&&(t=Yi(te,n)),t==null?n:typeof t!="string"?String(t):e?t.replace(/\{(\w+)\}/g,(i,r)=>e[r]!=null?String(e[r]):`{${r}}`):t}function Zi(){var t;let n=document.documentElement.getAttribute("lang")||((t=document.querySelector('meta[name="locale"]'))==null?void 0:t.getAttribute("content"));if(n&&le[n])return n;let e=navigator.language||navigator.userLanguage;if(e&&le[e])return e;if(e){let i=e.split("-")[0];if(le[i])return i}return Je}function Yi(n,e){if(!n||!e)return;if(Object.prototype.hasOwnProperty.call(n,e))return n[e];let t=e.split("."),i=n;for(let r of t){if(i==null||typeof i!="object"||!Object.prototype.hasOwnProperty.call(i,r)){i=void 0;break}i=i[r]}if(i!==void 0)return i;for(let r=t.length-1;r>0;r-=1){let a=t.slice(0,r).join(".");if(!Object.prototype.hasOwnProperty.call(n,a))continue;let l=n[a],o=!0;for(let u of t.slice(r)){if(l==null||typeof l!="object"||!Object.prototype.hasOwnProperty.call(l,u)){o=!1;break}l=l[u]}if(o&&l!==void 0)return l}}var Xi="/api/v1/user/ai-support",Ce=null,ve=null,Ht=null;function et(n){n.apiBaseUrl&&(Xi=n.apiBaseUrl.replace(/\/$/,"")),n.authToken&&(Ce=n.authToken),n.guestSession&&(ve=n.guestSession);let e=document.querySelector('meta[name="csrf-token"]');e&&(Ht=e.getAttribute("content"))}function $t(n){ve=n}function Cr(n){let e={};return n||(e["Content-Type"]="application/json"),e.Accept="application/json",Ce&&(e.Authorization=`Bearer ${Ce}`),Ht&&(e["X-CSRF-TOKEN"]=Ht),!Ce&&ve&&(e["X-Guest-Session"]=JSON.stringify(ve)),e}async function ce(n,e,t){let i=`${Xi}${e}`,r={method:n,headers:Cr(t==null?void 0:t.formData),credentials:"same-origin"};t!=null&&t.body&&!(t!=null&&t.formData)?r.body=JSON.stringify(t.body):t!=null&&t.formData&&(r.body=t.formData),t!=null&&t.signal&&(r.signal=t.signal);let a=await fetch(i,r);if(!a.ok){let l;try{l=await a.json()}catch(u){l=null}let o=new Error((l==null?void 0:l.error)||(l==null?void 0:l.message)||`HTTP ${a.status}`);throw o.status=a.status,o.body=l,o}return a.json()}function Ki(n,e,t){return ce("POST","/chat",{body:{message:n,conversation_id:e||void 0,...ve&&!Ce?{guest:ve}:{}},signal:t==null?void 0:t.signal})}function Qi(n,e){let t=n?`?conversation_id=${encodeURIComponent(n)}`:"";return ce("GET",`/history${t}`,{signal:e==null?void 0:e.signal})}async function Ji(n,e,t){if(t&&t(0),!e){let a=new Error("conversation_id required");throw a.status=422,a}let i=await ce("POST","/attachment",{body:{conversation_id:e,filename:n.name,content_type:n.type||"application/octet-stream",file_size:n.size}});if(t&&t(100),!i.allowed){let a=new Error(i.message||"Attachment rejected");throw a.status=422,a.body=i,a}let r=new Error("Attachment uploads are not available in this panel yet");throw r.status=501,r.body=i,r}function en(n,e,t){return ce("POST","/feedback",{body:{conversation_id:n,feedback:e,is_helpful:t}})}function tn(n){return ce("POST","/escalate",{body:{conversation_id:n}})}function nn(n,e,t){return ce("POST","/rating",{body:{conversation_id:n,rating:e,comment:t}})}function rn(n,e){let t=n?`?conversation_id=${encodeURIComponent(n)}`:"";return ce("GET",`/status${t}`,{signal:e==null?void 0:e.signal})}var an="airpilot_";function Ft(n,e){try{let t=localStorage.getItem(an+n);return t===null?e!==void 0?e:null:JSON.parse(t)}catch(t){return e!==void 0?e:null}}function jt(n,e){try{localStorage.setItem(an+n,JSON.stringify(e))}catch(t){}}function Ut(){return Ft("guest_session",null)}function sn(n){jt("guest_session",n)}function on(n){return Ft(`conv_${n||"guest"}`,null)}function ln(n,e){jt(`conv_${n||"guest"}`,e)}function cn(){return Ft("widget_open",!1)}function Le(n){jt("widget_open",n)}function pn(){return"gs_"+Date.now().toString(36)+"_"+Math.random().toString(36).substr(2,8)}var Lr='<svg viewBox="0 0 24 24" class="airpilot-bubble-icon"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',Ir='<svg viewBox="0 0 24 24" class="airpilot-bubble-close"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',tt=class{constructor(e){this._onToggle=e.onToggle,this._unreadCount=0,this._isOpen=!1,this._el=null,this._badgeEl=null}render(){return this._el=document.createElement("button"),this._el.className="airpilot-bubble",this._el.setAttribute("aria-label",m("widget.title")),this._el.setAttribute("type","button"),this._updateIcon(),this._badgeEl=document.createElement("span"),this._badgeEl.className="airpilot-badge",this._badgeEl.setAttribute("data-count","0"),this._badgeEl.textContent="0",this._el.appendChild(this._badgeEl),this._el.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),this._onToggle&&this._onToggle()}),this._el}setOpen(e){this._isOpen=e,this._updateIcon(),e&&this.setUnreadCount(0)}setUnreadCount(e){if(this._unreadCount=e,this._badgeEl){let t=e>99?"99+":String(e);this._badgeEl.textContent=t,this._badgeEl.setAttribute("data-count",String(e))}}pulse(){this._el&&(this._el.classList.remove("airpilot-bubble--pulse"),this._el.offsetWidth,this._el.classList.add("airpilot-bubble--pulse"))}getElement(){return this._el}_updateIcon(){if(!this._el)return;let e=this._badgeEl,t=this._el.querySelector(".airpilot-bubble-icon-wrap")||document.createElement("span");t.className="airpilot-bubble-icon-wrap",t.innerHTML=this._isOpen?Ir:Lr,this._el.contains(t)||this._el.insertBefore(t,this._el.firstChild),e&&!this._el.contains(e)&&this._el.appendChild(e),this._el.setAttribute("aria-label",this._isOpen?m("widget.close"):m("widget.title"))}};function Vt(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var ue=Vt();function fn(n){ue=n}var Ne={exec:()=>null};function v(n,e=""){let t=typeof n=="string"?n:n.source,i={replace:(r,a)=>{let l=typeof a=="string"?a:a.source;return l=l.replace(P.caret,"$1"),t=t.replace(r,l),i},getRegex:()=>new RegExp(t,e)};return i}var P={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:n=>new RegExp(`^( {0,3}${n})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}#`),htmlBeginRegex:n=>new RegExp(`^ {0,${Math.min(3,n-1)}}<(?:[a-z].*>|!--)`,"i")},Rr=/^(?:[ \t]*(?:\n|$))+/,Nr=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Dr=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,De=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Mr=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Zt=/(?:[*+-]|\d{1,9}[.)])/,bn=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,_n=v(bn).replace(/bull/g,Zt).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),zr=v(bn).replace(/bull/g,Zt).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Xt=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Or=/^[^\n]+/,Kt=/(?!\s*\])(?:\\.|[^\[\]\\])+/,Pr=v(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Kt).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Br=v(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,Zt).getRegex(),ot="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Qt=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Hr=v("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",Qt).replace("tag",ot).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),xn=v(Xt).replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ot).getRegex(),$r=v(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",xn).getRegex(),Jt={blockquote:$r,code:Nr,def:Pr,fences:Dr,heading:Mr,hr:De,html:Hr,lheading:_n,list:Br,newline:Rr,paragraph:xn,table:Ne,text:Or},un=v("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ot).getRegex(),Fr={...Jt,lheading:zr,table:un,paragraph:v(Xt).replace("hr",De).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",un).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",ot).getRegex()},jr={...Jt,html:v(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Qt).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Ne,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:v(Xt).replace("hr",De).replace("heading",` *#{1,6} *[^
]`).replace("lheading",_n).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Ur=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,qr=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,yn=/^( {2,}|\\)\n(?!\s*$)/,Gr=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,lt=/[\p{P}\p{S}]/u,ei=/[\s\p{P}\p{S}]/u,vn=/[^\s\p{P}\p{S}]/u,Wr=v(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ei).getRegex(),wn=/(?!~)[\p{P}\p{S}]/u,Yr=/(?!~)[\s\p{P}\p{S}]/u,Vr=/(?:[^\s\p{P}\p{S}]|~)/u,Zr=/\[[^[\]]*?\]\((?:\\.|[^\\\(\)]|\((?:\\.|[^\\\(\)])*\))*\)|`[^`]*?`|<[^<>]*?>/g,kn=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,Xr=v(kn,"u").replace(/punct/g,lt).getRegex(),Kr=v(kn,"u").replace(/punct/g,wn).getRegex(),En="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Qr=v(En,"gu").replace(/notPunctSpace/g,vn).replace(/punctSpace/g,ei).replace(/punct/g,lt).getRegex(),Jr=v(En,"gu").replace(/notPunctSpace/g,Vr).replace(/punctSpace/g,Yr).replace(/punct/g,wn).getRegex(),ea=v("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,vn).replace(/punctSpace/g,ei).replace(/punct/g,lt).getRegex(),ta=v(/\\(punct)/,"gu").replace(/punct/g,lt).getRegex(),ia=v(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),na=v(Qt).replace("(?:-->|$)","-->").getRegex(),ra=v("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",na).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),rt=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/,aa=v(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",rt).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Tn=v(/^!?\[(label)\]\[(ref)\]/).replace("label",rt).replace("ref",Kt).getRegex(),Sn=v(/^!?\[(ref)\](?:\[\])?/).replace("ref",Kt).getRegex(),sa=v("reflink|nolink(?!\\()","g").replace("reflink",Tn).replace("nolink",Sn).getRegex(),ti={_backpedal:Ne,anyPunctuation:ta,autolink:ia,blockSkip:Zr,br:yn,code:qr,del:Ne,emStrongLDelim:Xr,emStrongRDelimAst:Qr,emStrongRDelimUnd:ea,escape:Ur,link:aa,nolink:Sn,punctuation:Wr,reflink:Tn,reflinkSearch:sa,tag:ra,text:Gr,url:Ne},oa={...ti,link:v(/^!?\[(label)\]\((.*?)\)/).replace("label",rt).getRegex(),reflink:v(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",rt).getRegex()},Gt={...ti,emStrongRDelimAst:Jr,emStrongLDelim:Kr,url:v(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},la={...Gt,br:v(yn).replace("{2,}","*").getRegex(),text:v(Gt.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},it={normal:Jt,gfm:Fr,pedantic:jr},Ie={normal:ti,gfm:Gt,breaks:la,pedantic:oa},ca={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},dn=n=>ca[n];function V(n,e){if(e){if(P.escapeTest.test(n))return n.replace(P.escapeReplace,dn)}else if(P.escapeTestNoEncode.test(n))return n.replace(P.escapeReplaceNoEncode,dn);return n}function hn(n){try{n=encodeURI(n).replace(P.percentDecode,"%")}catch(e){return null}return n}function mn(n,e){var a;let t=n.replace(P.findPipe,(l,o,u)=>{let c=!1,p=o;for(;--p>=0&&u[p]==="\\";)c=!c;return c?"|":" |"}),i=t.split(P.splitPipe),r=0;if(i[0].trim()||i.shift(),i.length>0&&!((a=i.at(-1))!=null&&a.trim())&&i.pop(),e)if(i.length>e)i.splice(e);else for(;i.length<e;)i.push("");for(;r<i.length;r++)i[r]=i[r].trim().replace(P.slashPipe,"|");return i}function Re(n,e,t){let i=n.length;if(i===0)return"";let r=0;for(;r<i;){let a=n.charAt(i-r-1);if(a===e&&!t)r++;else if(a!==e&&t)r++;else break}return n.slice(0,i-r)}function pa(n,e){if(n.indexOf(e[1])===-1)return-1;let t=0;for(let i=0;i<n.length;i++)if(n[i]==="\\")i++;else if(n[i]===e[0])t++;else if(n[i]===e[1]&&(t--,t<0))return i;return t>0?-2:-1}function gn(n,e,t,i,r){let a=e.href,l=e.title||null,o=n[1].replace(r.other.outputLinkReplace,"$1");i.state.inLink=!0;let u={type:n[0].charAt(0)==="!"?"image":"link",raw:t,href:a,title:l,text:o,tokens:i.inlineTokens(o)};return i.state.inLink=!1,u}function ua(n,e,t){let i=n.match(t.other.indentCodeCompensation);if(i===null)return e;let r=i[1];return e.split(`
`).map(a=>{let l=a.match(t.other.beginningSpace);if(l===null)return a;let[o]=l;return o.length>=r.length?a.slice(r.length):a}).join(`
`)}var at=class{constructor(n){w(this,"options");w(this,"rules");w(this,"lexer");this.options=n||ue}space(n){let e=this.rules.block.newline.exec(n);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(n){let e=this.rules.block.code.exec(n);if(e){let t=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:Re(t,`
`)}}}fences(n){let e=this.rules.block.fences.exec(n);if(e){let t=e[0],i=ua(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:i}}}heading(n){let e=this.rules.block.heading.exec(n);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let i=Re(t,"#");(this.options.pedantic||!i||this.rules.other.endingSpaceChar.test(i))&&(t=i.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(n){let e=this.rules.block.hr.exec(n);if(e)return{type:"hr",raw:Re(e[0],`
`)}}blockquote(n){let e=this.rules.block.blockquote.exec(n);if(e){let t=Re(e[0],`
`).split(`
`),i="",r="",a=[];for(;t.length>0;){let l=!1,o=[],u;for(u=0;u<t.length;u++)if(this.rules.other.blockquoteStart.test(t[u]))o.push(t[u]),l=!0;else if(!l)o.push(t[u]);else break;t=t.slice(u);let c=o.join(`
`),p=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");i=i?`${i}
${c}`:c,r=r?`${r}
${p}`:p;let x=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(p,a,!0),this.lexer.state.top=x,t.length===0)break;let h=a.at(-1);if((h==null?void 0:h.type)==="code")break;if((h==null?void 0:h.type)==="blockquote"){let k=h,b=k.raw+`
`+t.join(`
`),M=this.blockquote(b);a[a.length-1]=M,i=i.substring(0,i.length-k.raw.length)+M.raw,r=r.substring(0,r.length-k.text.length)+M.text;break}else if((h==null?void 0:h.type)==="list"){let k=h,b=k.raw+`
`+t.join(`
`),M=this.list(b);a[a.length-1]=M,i=i.substring(0,i.length-h.raw.length)+M.raw,r=r.substring(0,r.length-k.raw.length)+M.raw,t=b.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:i,tokens:a,text:r}}}list(n){let e=this.rules.block.list.exec(n);if(e){let t=e[1].trim(),i=t.length>1,r={type:"list",raw:"",ordered:i,start:i?+t.slice(0,-1):"",loose:!1,items:[]};t=i?`\\d{1,9}\\${t.slice(-1)}`:`\\${t}`,this.options.pedantic&&(t=i?t:"[*+-]");let a=this.rules.other.listItemRegex(t),l=!1;for(;n;){let u=!1,c="",p="";if(!(e=a.exec(n))||this.rules.block.hr.test(n))break;c=e[0],n=n.substring(c.length);let x=e[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,ke=>" ".repeat(3*ke.length)),h=n.split(`
`,1)[0],k=!x.trim(),b=0;if(this.options.pedantic?(b=2,p=x.trimStart()):k?b=e[1].length+1:(b=e[2].search(this.rules.other.nonSpaceChar),b=b>4?1:b,p=x.slice(b),b+=e[1].length),k&&this.rules.other.blankLine.test(h)&&(c+=h+`
`,n=n.substring(h.length+1),u=!0),!u){let ke=this.rules.other.nextBulletRegex(b),je=this.rules.other.hrRegex(b),ie=this.rules.other.fencesBeginRegex(b),L=this.rules.other.headingBeginRegex(b),ne=this.rules.other.htmlBeginRegex(b);for(;n;){let re=n.split(`
`,1)[0],ae;if(h=re,this.options.pedantic?(h=h.replace(this.rules.other.listReplaceNesting,"  "),ae=h):ae=h.replace(this.rules.other.tabCharGlobal,"    "),ie.test(h)||L.test(h)||ne.test(h)||ke.test(h)||je.test(h))break;if(ae.search(this.rules.other.nonSpaceChar)>=b||!h.trim())p+=`
`+ae.slice(b);else{if(k||x.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||ie.test(x)||L.test(x)||je.test(x))break;p+=`
`+h}!k&&!h.trim()&&(k=!0),c+=re+`
`,n=n.substring(re.length+1),x=ae.slice(b)}}r.loose||(l?r.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(l=!0));let M=null,Fe;this.options.gfm&&(M=this.rules.other.listIsTask.exec(p),M&&(Fe=M[0]!=="[ ] ",p=p.replace(this.rules.other.listReplaceTask,""))),r.items.push({type:"list_item",raw:c,task:!!M,checked:Fe,loose:!1,text:p,tokens:[]}),r.raw+=c}let o=r.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;r.raw=r.raw.trimEnd();for(let u=0;u<r.items.length;u++)if(this.lexer.state.top=!1,r.items[u].tokens=this.lexer.blockTokens(r.items[u].text,[]),!r.loose){let c=r.items[u].tokens.filter(x=>x.type==="space"),p=c.length>0&&c.some(x=>this.rules.other.anyLine.test(x.raw));r.loose=p}if(r.loose)for(let u=0;u<r.items.length;u++)r.items[u].loose=!0;return r}}html(n){let e=this.rules.block.html.exec(n);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(n){let e=this.rules.block.def.exec(n);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),i=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",r=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:i,title:r}}}table(n){var l;let e=this.rules.block.table.exec(n);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=mn(e[1]),i=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),r=(l=e[3])!=null&&l.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:e[0],header:[],align:[],rows:[]};if(t.length===i.length){for(let o of i)this.rules.other.tableAlignRight.test(o)?a.align.push("right"):this.rules.other.tableAlignCenter.test(o)?a.align.push("center"):this.rules.other.tableAlignLeft.test(o)?a.align.push("left"):a.align.push(null);for(let o=0;o<t.length;o++)a.header.push({text:t[o],tokens:this.lexer.inline(t[o]),header:!0,align:a.align[o]});for(let o of r)a.rows.push(mn(o,a.header.length).map((u,c)=>({text:u,tokens:this.lexer.inline(u),header:!1,align:a.align[c]})));return a}}lheading(n){let e=this.rules.block.lheading.exec(n);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(n){let e=this.rules.block.paragraph.exec(n);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(n){let e=this.rules.block.text.exec(n);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(n){let e=this.rules.inline.escape.exec(n);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(n){let e=this.rules.inline.tag.exec(n);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(n){let e=this.rules.inline.link.exec(n);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let a=Re(t.slice(0,-1),"\\");if((t.length-a.length)%2===0)return}else{let a=pa(e[2],"()");if(a===-2)return;if(a>-1){let o=(e[0].indexOf("!")===0?5:4)+e[1].length+a;e[2]=e[2].substring(0,a),e[0]=e[0].substring(0,o).trim(),e[3]=""}}let i=e[2],r="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(i);a&&(i=a[1],r=a[3])}else r=e[3]?e[3].slice(1,-1):"";return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?i=i.slice(1):i=i.slice(1,-1)),gn(e,{href:i&&i.replace(this.rules.inline.anyPunctuation,"$1"),title:r&&r.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(n,e){let t;if((t=this.rules.inline.reflink.exec(n))||(t=this.rules.inline.nolink.exec(n))){let i=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),r=e[i.toLowerCase()];if(!r){let a=t[0].charAt(0);return{type:"text",raw:a,text:a}}return gn(t,r,t[0],this.lexer,this.rules)}}emStrong(n,e,t=""){let i=this.rules.inline.emStrongLDelim.exec(n);if(!i||i[3]&&t.match(this.rules.other.unicodeAlphaNumeric))return;if(!(i[1]||i[2]||"")||!t||this.rules.inline.punctuation.exec(t)){let a=[...i[0]].length-1,l,o,u=a,c=0,p=i[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,e=e.slice(-1*n.length+a);(i=p.exec(e))!=null;){if(l=i[1]||i[2]||i[3]||i[4]||i[5]||i[6],!l)continue;if(o=[...l].length,i[3]||i[4]){u+=o;continue}else if((i[5]||i[6])&&a%3&&!((a+o)%3)){c+=o;continue}if(u-=o,u>0)continue;o=Math.min(o,o+u+c);let x=[...i[0]][0].length,h=n.slice(0,a+i.index+x+o);if(Math.min(a,o)%2){let b=h.slice(1,-1);return{type:"em",raw:h,text:b,tokens:this.lexer.inlineTokens(b)}}let k=h.slice(2,-2);return{type:"strong",raw:h,text:k,tokens:this.lexer.inlineTokens(k)}}}}codespan(n){let e=this.rules.inline.code.exec(n);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),i=this.rules.other.nonSpaceChar.test(t),r=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return i&&r&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(n){let e=this.rules.inline.br.exec(n);if(e)return{type:"br",raw:e[0]}}del(n){let e=this.rules.inline.del.exec(n);if(e)return{type:"del",raw:e[0],text:e[2],tokens:this.lexer.inlineTokens(e[2])}}autolink(n){let e=this.rules.inline.autolink.exec(n);if(e){let t,i;return e[2]==="@"?(t=e[1],i="mailto:"+t):(t=e[1],i=t),{type:"link",raw:e[0],text:t,href:i,tokens:[{type:"text",raw:t,text:t}]}}}url(n){var t,i;let e;if(e=this.rules.inline.url.exec(n)){let r,a;if(e[2]==="@")r=e[0],a="mailto:"+r;else{let l;do l=e[0],e[0]=(i=(t=this.rules.inline._backpedal.exec(e[0]))==null?void 0:t[0])!=null?i:"";while(l!==e[0]);r=e[0],e[1]==="www."?a="http://"+e[0]:a=e[0]}return{type:"link",raw:e[0],text:r,href:a,tokens:[{type:"text",raw:r,text:r}]}}}inlineText(n){let e=this.rules.inline.text.exec(n);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},J=class Wt{constructor(e){w(this,"tokens");w(this,"options");w(this,"state");w(this,"tokenizer");w(this,"inlineQueue");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||ue,this.options.tokenizer=this.options.tokenizer||new at,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:P,block:it.normal,inline:Ie.normal};this.options.pedantic?(t.block=it.pedantic,t.inline=Ie.pedantic):this.options.gfm&&(t.block=it.gfm,this.options.breaks?t.inline=Ie.breaks:t.inline=Ie.gfm),this.tokenizer.rules=t}static get rules(){return{block:it,inline:Ie}}static lex(e,t){return new Wt(t).lex(e)}static lexInline(e,t){return new Wt(t).inlineTokens(e)}lex(e){e=e.replace(P.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let i=this.inlineQueue[t];this.inlineTokens(i.src,i.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],i=!1){var r,a,l;for(this.options.pedantic&&(e=e.replace(P.tabCharGlobal,"    ").replace(P.spaceLine,""));e;){let o;if((a=(r=this.options.extensions)==null?void 0:r.block)!=null&&a.some(c=>(o=c.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if(o=this.tokenizer.space(e)){e=e.substring(o.raw.length);let c=t.at(-1);o.raw.length===1&&c!==void 0?c.raw+=`
`:t.push(o);continue}if(o=this.tokenizer.code(e)){e=e.substring(o.raw.length);let c=t.at(-1);(c==null?void 0:c.type)==="paragraph"||(c==null?void 0:c.type)==="text"?(c.raw+=`
`+o.raw,c.text+=`
`+o.text,this.inlineQueue.at(-1).src=c.text):t.push(o);continue}if(o=this.tokenizer.fences(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.heading(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.hr(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.blockquote(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.list(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.html(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.def(e)){e=e.substring(o.raw.length);let c=t.at(-1);(c==null?void 0:c.type)==="paragraph"||(c==null?void 0:c.type)==="text"?(c.raw+=`
`+o.raw,c.text+=`
`+o.raw,this.inlineQueue.at(-1).src=c.text):this.tokens.links[o.tag]||(this.tokens.links[o.tag]={href:o.href,title:o.title});continue}if(o=this.tokenizer.table(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.lheading(e)){e=e.substring(o.raw.length),t.push(o);continue}let u=e;if((l=this.options.extensions)!=null&&l.startBlock){let c=1/0,p=e.slice(1),x;this.options.extensions.startBlock.forEach(h=>{x=h.call({lexer:this},p),typeof x=="number"&&x>=0&&(c=Math.min(c,x))}),c<1/0&&c>=0&&(u=e.substring(0,c+1))}if(this.state.top&&(o=this.tokenizer.paragraph(u))){let c=t.at(-1);i&&(c==null?void 0:c.type)==="paragraph"?(c.raw+=`
`+o.raw,c.text+=`
`+o.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=c.text):t.push(o),i=u.length!==e.length,e=e.substring(o.raw.length);continue}if(o=this.tokenizer.text(e)){e=e.substring(o.raw.length);let c=t.at(-1);(c==null?void 0:c.type)==="text"?(c.raw+=`
`+o.raw,c.text+=`
`+o.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=c.text):t.push(o);continue}if(e){let c="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(c);break}else throw new Error(c)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){var o,u,c;let i=e,r=null;if(this.tokens.links){let p=Object.keys(this.tokens.links);if(p.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(i))!=null;)p.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(i=i.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(i))!=null;)i=i.slice(0,r.index)+"++"+i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(r=this.tokenizer.rules.inline.blockSkip.exec(i))!=null;)i=i.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let a=!1,l="";for(;e;){a||(l=""),a=!1;let p;if((u=(o=this.options.extensions)==null?void 0:o.inline)!=null&&u.some(h=>(p=h.call({lexer:this},e,t))?(e=e.substring(p.raw.length),t.push(p),!0):!1))continue;if(p=this.tokenizer.escape(e)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.tag(e)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.link(e)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(p.raw.length);let h=t.at(-1);p.type==="text"&&(h==null?void 0:h.type)==="text"?(h.raw+=p.raw,h.text+=p.text):t.push(p);continue}if(p=this.tokenizer.emStrong(e,i,l)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.codespan(e)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.br(e)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.del(e)){e=e.substring(p.raw.length),t.push(p);continue}if(p=this.tokenizer.autolink(e)){e=e.substring(p.raw.length),t.push(p);continue}if(!this.state.inLink&&(p=this.tokenizer.url(e))){e=e.substring(p.raw.length),t.push(p);continue}let x=e;if((c=this.options.extensions)!=null&&c.startInline){let h=1/0,k=e.slice(1),b;this.options.extensions.startInline.forEach(M=>{b=M.call({lexer:this},k),typeof b=="number"&&b>=0&&(h=Math.min(h,b))}),h<1/0&&h>=0&&(x=e.substring(0,h+1))}if(p=this.tokenizer.inlineText(x)){e=e.substring(p.raw.length),p.raw.slice(-1)!=="_"&&(l=p.raw.slice(-1)),a=!0;let h=t.at(-1);(h==null?void 0:h.type)==="text"?(h.raw+=p.raw,h.text+=p.text):t.push(p);continue}if(e){let h="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(h);break}else throw new Error(h)}}return t}},st=class{constructor(n){w(this,"options");w(this,"parser");this.options=n||ue}space(n){return""}code({text:n,lang:e,escaped:t}){var a;let i=(a=(e||"").match(P.notSpaceStart))==null?void 0:a[0],r=n.replace(P.endingNewline,"")+`
`;return i?'<pre><code class="language-'+V(i)+'">'+(t?r:V(r,!0))+`</code></pre>
`:"<pre><code>"+(t?r:V(r,!0))+`</code></pre>
`}blockquote({tokens:n}){return`<blockquote>
${this.parser.parse(n)}</blockquote>
`}html({text:n}){return n}heading({tokens:n,depth:e}){return`<h${e}>${this.parser.parseInline(n)}</h${e}>
`}hr(n){return`<hr>
`}list(n){let e=n.ordered,t=n.start,i="";for(let l=0;l<n.items.length;l++){let o=n.items[l];i+=this.listitem(o)}let r=e?"ol":"ul",a=e&&t!==1?' start="'+t+'"':"";return"<"+r+a+`>
`+i+"</"+r+`>
`}listitem(n){var t;let e="";if(n.task){let i=this.checkbox({checked:!!n.checked});n.loose?((t=n.tokens[0])==null?void 0:t.type)==="paragraph"?(n.tokens[0].text=i+" "+n.tokens[0].text,n.tokens[0].tokens&&n.tokens[0].tokens.length>0&&n.tokens[0].tokens[0].type==="text"&&(n.tokens[0].tokens[0].text=i+" "+V(n.tokens[0].tokens[0].text),n.tokens[0].tokens[0].escaped=!0)):n.tokens.unshift({type:"text",raw:i+" ",text:i+" ",escaped:!0}):e+=i+" "}return e+=this.parser.parse(n.tokens,!!n.loose),`<li>${e}</li>
`}checkbox({checked:n}){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:n}){return`<p>${this.parser.parseInline(n)}</p>
`}table(n){let e="",t="";for(let r=0;r<n.header.length;r++)t+=this.tablecell(n.header[r]);e+=this.tablerow({text:t});let i="";for(let r=0;r<n.rows.length;r++){let a=n.rows[r];t="";for(let l=0;l<a.length;l++)t+=this.tablecell(a[l]);i+=this.tablerow({text:t})}return i&&(i=`<tbody>${i}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+i+`</table>
`}tablerow({text:n}){return`<tr>
${n}</tr>
`}tablecell(n){let e=this.parser.parseInline(n.tokens),t=n.header?"th":"td";return(n.align?`<${t} align="${n.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:n}){return`<strong>${this.parser.parseInline(n)}</strong>`}em({tokens:n}){return`<em>${this.parser.parseInline(n)}</em>`}codespan({text:n}){return`<code>${V(n,!0)}</code>`}br(n){return"<br>"}del({tokens:n}){return`<del>${this.parser.parseInline(n)}</del>`}link({href:n,title:e,tokens:t}){let i=this.parser.parseInline(t),r=hn(n);if(r===null)return i;n=r;let a='<a href="'+n+'"';return e&&(a+=' title="'+V(e)+'"'),a+=">"+i+"</a>",a}image({href:n,title:e,text:t,tokens:i}){i&&(t=this.parser.parseInline(i,this.parser.textRenderer));let r=hn(n);if(r===null)return V(t);n=r;let a=`<img src="${n}" alt="${t}"`;return e&&(a+=` title="${V(e)}"`),a+=">",a}text(n){return"tokens"in n&&n.tokens?this.parser.parseInline(n.tokens):"escaped"in n&&n.escaped?n.text:V(n.text)}},ii=class{strong({text:n}){return n}em({text:n}){return n}codespan({text:n}){return n}del({text:n}){return n}html({text:n}){return n}text({text:n}){return n}link({text:n}){return""+n}image({text:n}){return""+n}br(){return""}},ee=class Yt{constructor(e){w(this,"options");w(this,"renderer");w(this,"textRenderer");this.options=e||ue,this.options.renderer=this.options.renderer||new st,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new ii}static parse(e,t){return new Yt(t).parse(e)}static parseInline(e,t){return new Yt(t).parseInline(e)}parse(e,t=!0){var r,a;let i="";for(let l=0;l<e.length;l++){let o=e[l];if((a=(r=this.options.extensions)==null?void 0:r.renderers)!=null&&a[o.type]){let c=o,p=this.options.extensions.renderers[c.type].call({parser:this},c);if(p!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(c.type)){i+=p||"";continue}}let u=o;switch(u.type){case"space":{i+=this.renderer.space(u);continue}case"hr":{i+=this.renderer.hr(u);continue}case"heading":{i+=this.renderer.heading(u);continue}case"code":{i+=this.renderer.code(u);continue}case"table":{i+=this.renderer.table(u);continue}case"blockquote":{i+=this.renderer.blockquote(u);continue}case"list":{i+=this.renderer.list(u);continue}case"html":{i+=this.renderer.html(u);continue}case"paragraph":{i+=this.renderer.paragraph(u);continue}case"text":{let c=u,p=this.renderer.text(c);for(;l+1<e.length&&e[l+1].type==="text";)c=e[++l],p+=`
`+this.renderer.text(c);t?i+=this.renderer.paragraph({type:"paragraph",raw:p,text:p,tokens:[{type:"text",raw:p,text:p,escaped:!0}]}):i+=p;continue}default:{let c='Token with "'+u.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return i}parseInline(e,t=this.renderer){var r,a;let i="";for(let l=0;l<e.length;l++){let o=e[l];if((a=(r=this.options.extensions)==null?void 0:r.renderers)!=null&&a[o.type]){let c=this.options.extensions.renderers[o.type].call({parser:this},o);if(c!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(o.type)){i+=c||"";continue}}let u=o;switch(u.type){case"escape":{i+=t.text(u);break}case"html":{i+=t.html(u);break}case"link":{i+=t.link(u);break}case"image":{i+=t.image(u);break}case"strong":{i+=t.strong(u);break}case"em":{i+=t.em(u);break}case"codespan":{i+=t.codespan(u);break}case"br":{i+=t.br(u);break}case"del":{i+=t.del(u);break}case"text":{i+=t.text(u);break}default:{let c='Token with "'+u.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return i}},qt,nt=(qt=class{constructor(n){w(this,"options");w(this,"block");this.options=n||ue}preprocess(n){return n}postprocess(n){return n}processAllTokens(n){return n}provideLexer(){return this.block?J.lex:J.lexInline}provideParser(){return this.block?ee.parse:ee.parseInline}},w(qt,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens"])),qt),da=class{constructor(...n){w(this,"defaults",Vt());w(this,"options",this.setOptions);w(this,"parse",this.parseMarkdown(!0));w(this,"parseInline",this.parseMarkdown(!1));w(this,"Parser",ee);w(this,"Renderer",st);w(this,"TextRenderer",ii);w(this,"Lexer",J);w(this,"Tokenizer",at);w(this,"Hooks",nt);this.use(...n)}walkTokens(n,e){var i,r;let t=[];for(let a of n)switch(t=t.concat(e.call(this,a)),a.type){case"table":{let l=a;for(let o of l.header)t=t.concat(this.walkTokens(o.tokens,e));for(let o of l.rows)for(let u of o)t=t.concat(this.walkTokens(u.tokens,e));break}case"list":{let l=a;t=t.concat(this.walkTokens(l.items,e));break}default:{let l=a;(r=(i=this.defaults.extensions)==null?void 0:i.childTokens)!=null&&r[l.type]?this.defaults.extensions.childTokens[l.type].forEach(o=>{let u=l[o].flat(1/0);t=t.concat(this.walkTokens(u,e))}):l.tokens&&(t=t.concat(this.walkTokens(l.tokens,e)))}}return t}use(...n){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return n.forEach(t=>{let i={...t};if(i.async=this.defaults.async||i.async||!1,t.extensions&&(t.extensions.forEach(r=>{if(!r.name)throw new Error("extension name required");if("renderer"in r){let a=e.renderers[r.name];a?e.renderers[r.name]=function(...l){let o=r.renderer.apply(this,l);return o===!1&&(o=a.apply(this,l)),o}:e.renderers[r.name]=r.renderer}if("tokenizer"in r){if(!r.level||r.level!=="block"&&r.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=e[r.level];a?a.unshift(r.tokenizer):e[r.level]=[r.tokenizer],r.start&&(r.level==="block"?e.startBlock?e.startBlock.push(r.start):e.startBlock=[r.start]:r.level==="inline"&&(e.startInline?e.startInline.push(r.start):e.startInline=[r.start]))}"childTokens"in r&&r.childTokens&&(e.childTokens[r.name]=r.childTokens)}),i.extensions=e),t.renderer){let r=this.defaults.renderer||new st(this.defaults);for(let a in t.renderer){if(!(a in r))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let l=a,o=t.renderer[l],u=r[l];r[l]=(...c)=>{let p=o.apply(r,c);return p===!1&&(p=u.apply(r,c)),p||""}}i.renderer=r}if(t.tokenizer){let r=this.defaults.tokenizer||new at(this.defaults);for(let a in t.tokenizer){if(!(a in r))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let l=a,o=t.tokenizer[l],u=r[l];r[l]=(...c)=>{let p=o.apply(r,c);return p===!1&&(p=u.apply(r,c)),p}}i.tokenizer=r}if(t.hooks){let r=this.defaults.hooks||new nt;for(let a in t.hooks){if(!(a in r))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let l=a,o=t.hooks[l],u=r[l];nt.passThroughHooks.has(a)?r[l]=c=>{if(this.defaults.async)return Promise.resolve(o.call(r,c)).then(x=>u.call(r,x));let p=o.call(r,c);return u.call(r,p)}:r[l]=(...c)=>{let p=o.apply(r,c);return p===!1&&(p=u.apply(r,c)),p}}i.hooks=r}if(t.walkTokens){let r=this.defaults.walkTokens,a=t.walkTokens;i.walkTokens=function(l){let o=[];return o.push(a.call(this,l)),r&&(o=o.concat(r.call(this,l))),o}}this.defaults={...this.defaults,...i}}),this}setOptions(n){return this.defaults={...this.defaults,...n},this}lexer(n,e){return J.lex(n,e!=null?e:this.defaults)}parser(n,e){return ee.parse(n,e!=null?e:this.defaults)}parseMarkdown(n){return(t,i)=>{let r={...i},a={...this.defaults,...r},l=this.onError(!!a.silent,!!a.async);if(this.defaults.async===!0&&r.async===!1)return l(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof t=="undefined"||t===null)return l(new Error("marked(): input parameter is undefined or null"));if(typeof t!="string")return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));a.hooks&&(a.hooks.options=a,a.hooks.block=n);let o=a.hooks?a.hooks.provideLexer():n?J.lex:J.lexInline,u=a.hooks?a.hooks.provideParser():n?ee.parse:ee.parseInline;if(a.async)return Promise.resolve(a.hooks?a.hooks.preprocess(t):t).then(c=>o(c,a)).then(c=>a.hooks?a.hooks.processAllTokens(c):c).then(c=>a.walkTokens?Promise.all(this.walkTokens(c,a.walkTokens)).then(()=>c):c).then(c=>u(c,a)).then(c=>a.hooks?a.hooks.postprocess(c):c).catch(l);try{a.hooks&&(t=a.hooks.preprocess(t));let c=o(t,a);a.hooks&&(c=a.hooks.processAllTokens(c)),a.walkTokens&&this.walkTokens(c,a.walkTokens);let p=u(c,a);return a.hooks&&(p=a.hooks.postprocess(p)),p}catch(c){return l(c)}}}onError(n,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,n){let i="<p>An error occurred:</p><pre>"+V(t.message+"",!0)+"</pre>";return e?Promise.resolve(i):i}if(e)return Promise.reject(t);throw t}}},pe=new da;function y(n,e){return pe.parse(n,e)}y.options=y.setOptions=function(n){return pe.setOptions(n),y.defaults=pe.defaults,fn(y.defaults),y};y.getDefaults=Vt;y.defaults=ue;y.use=function(...n){return pe.use(...n),y.defaults=pe.defaults,fn(y.defaults),y};y.walkTokens=function(n,e){return pe.walkTokens(n,e)};y.parseInline=pe.parseInline;y.Parser=ee;y.parser=ee.parse;y.Renderer=st;y.TextRenderer=ii;y.Lexer=J;y.lexer=J.lex;y.Tokenizer=at;y.Hooks=nt;y.parse=y;var ws=y.options,ks=y.setOptions,Es=y.use,Ts=y.walkTokens,Ss=y.parseInline;var As=ee.parse,Cs=J.lex;var{entries:zn,setPrototypeOf:An,isFrozen:ha,getPrototypeOf:ma,getOwnPropertyDescriptor:ga}=Object,{freeze:H,seal:q,create:ci}=Object,{apply:pi,construct:ui}=typeof Reflect!="undefined"&&Reflect;H||(H=function(e){return e});q||(q=function(e){return e});pi||(pi=function(e,t){for(var i=arguments.length,r=new Array(i>2?i-2:0),a=2;a<i;a++)r[a-2]=arguments[a];return e.apply(t,r)});ui||(ui=function(e){for(var t=arguments.length,i=new Array(t>1?t-1:0),r=1;r<t;r++)i[r-1]=arguments[r];return new e(...i)});var ct=$(Array.prototype.forEach),fa=$(Array.prototype.lastIndexOf),Cn=$(Array.prototype.pop),Me=$(Array.prototype.push),ba=$(Array.prototype.splice),ut=$(String.prototype.toLowerCase),ni=$(String.prototype.toString),ri=$(String.prototype.match),ze=$(String.prototype.replace),_a=$(String.prototype.indexOf),xa=$(String.prototype.trim),G=$(Object.prototype.hasOwnProperty),B=$(RegExp.prototype.test),Oe=ya(TypeError);function $(n){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var t=arguments.length,i=new Array(t>1?t-1:0),r=1;r<t;r++)i[r-1]=arguments[r];return pi(n,e,i)}}function ya(n){return function(){for(var e=arguments.length,t=new Array(e),i=0;i<e;i++)t[i]=arguments[i];return ui(n,t)}}function _(n,e){let t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:ut;An&&An(n,null);let i=e.length;for(;i--;){let r=e[i];if(typeof r=="string"){let a=t(r);a!==r&&(ha(e)||(e[i]=a),r=a)}n[r]=!0}return n}function va(n){for(let e=0;e<n.length;e++)G(n,e)||(n[e]=null);return n}function Z(n){let e=ci(null);for(let[t,i]of zn(n))G(n,t)&&(Array.isArray(i)?e[t]=va(i):i&&typeof i=="object"&&i.constructor===Object?e[t]=Z(i):e[t]=i);return e}function Pe(n,e){for(;n!==null;){let i=ga(n,e);if(i){if(i.get)return $(i.get);if(typeof i.value=="function")return $(i.value)}n=ma(n)}function t(){return null}return t}var Ln=H(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),ai=H(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),si=H(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),wa=H(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),oi=H(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),ka=H(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),In=H(["#text"]),Rn=H(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),li=H(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),Nn=H(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),pt=H(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Ea=q(/\{\{[\w\W]*|[\w\W]*\}\}/gm),Ta=q(/<%[\w\W]*|[\w\W]*%>/gm),Sa=q(/\$\{[\w\W]*/gm),Aa=q(/^data-[\-\w.\u00B7-\uFFFF]+$/),Ca=q(/^aria-[\-\w]+$/),On=q(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),La=q(/^(?:\w+script|data):/i),Ia=q(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Pn=q(/^html$/i),Ra=q(/^[a-z][.\w]*(-[.\w]+)+$/i),Dn=Object.freeze({__proto__:null,ARIA_ATTR:Ca,ATTR_WHITESPACE:Ia,CUSTOM_ELEMENT:Ra,DATA_ATTR:Aa,DOCTYPE_NAME:Pn,ERB_EXPR:Ta,IS_ALLOWED_URI:On,IS_SCRIPT_OR_DATA:La,MUSTACHE_EXPR:Ea,TMPLIT_EXPR:Sa}),Be={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Na=function(){return typeof window=="undefined"?null:window},Da=function(e,t){if(typeof e!="object"||typeof e.createPolicy!="function")return null;let i=null,r="data-tt-policy-suffix";t&&t.hasAttribute(r)&&(i=t.getAttribute(r));let a="dompurify"+(i?"#"+i:"");try{return e.createPolicy(a,{createHTML(l){return l},createScriptURL(l){return l}})}catch(l){return console.warn("TrustedTypes policy "+a+" could not be created."),null}},Mn=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function Bn(){let n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Na(),e=f=>Bn(f);if(e.version="3.3.1",e.removed=[],!n||!n.document||n.document.nodeType!==Be.document||!n.Element)return e.isSupported=!1,e;let{document:t}=n,i=t,r=i.currentScript,{DocumentFragment:a,HTMLTemplateElement:l,Node:o,Element:u,NodeFilter:c,NamedNodeMap:p=n.NamedNodeMap||n.MozNamedAttrMap,HTMLFormElement:x,DOMParser:h,trustedTypes:k}=n,b=u.prototype,M=Pe(b,"cloneNode"),Fe=Pe(b,"remove"),ke=Pe(b,"nextSibling"),je=Pe(b,"childNodes"),ie=Pe(b,"parentNode");if(typeof l=="function"){let f=t.createElement("template");f.content&&f.content.ownerDocument&&(t=f.content.ownerDocument)}let L,ne="",{implementation:re,createNodeIterator:ae,createDocumentFragment:Qn,getElementsByTagName:Jn}=t,{importNode:er}=i,O=Mn();e.isSupported=typeof zn=="function"&&typeof ie=="function"&&re&&re.createHTMLDocument!==void 0;let{MUSTACHE_EXPR:vt,ERB_EXPR:wt,TMPLIT_EXPR:kt,DATA_ATTR:tr,ARIA_ATTR:ir,IS_SCRIPT_OR_DATA:nr,ATTR_WHITESPACE:yi,CUSTOM_ELEMENT:rr}=Dn,{IS_ALLOWED_URI:vi}=Dn,I=null,wi=_({},[...Ln,...ai,...si,...oi,...In]),N=null,ki=_({},[...Rn,...li,...Nn,...pt]),T=Object.seal(ci(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Ee=null,Et=null,me=Object.seal(ci(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}})),Ei=!0,Tt=!0,Ti=!1,Si=!0,ge=!1,Ue=!0,se=!1,St=!1,At=!1,fe=!1,qe=!1,Ge=!1,Ai=!0,Ci=!1,ar="user-content-",Ct=!0,Te=!1,be={},W=null,Lt=_({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Li=null,Ii=_({},["audio","video","img","source","image","track"]),It=null,Ri=_({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),We="http://www.w3.org/1998/Math/MathML",Ye="http://www.w3.org/2000/svg",X="http://www.w3.org/1999/xhtml",_e=X,Rt=!1,Nt=null,sr=_({},[We,Ye,X],ni),Ve=_({},["mi","mo","mn","ms","mtext"]),Ze=_({},["annotation-xml"]),or=_({},["title","style","font","a","script"]),Se=null,lr=["application/xhtml+xml","text/html"],cr="text/html",A=null,xe=null,pr=t.createElement("form"),Ni=function(s){return s instanceof RegExp||s instanceof Function},Dt=function(){let s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(!(xe&&xe===s)){if((!s||typeof s!="object")&&(s={}),s=Z(s),Se=lr.indexOf(s.PARSER_MEDIA_TYPE)===-1?cr:s.PARSER_MEDIA_TYPE,A=Se==="application/xhtml+xml"?ni:ut,I=G(s,"ALLOWED_TAGS")?_({},s.ALLOWED_TAGS,A):wi,N=G(s,"ALLOWED_ATTR")?_({},s.ALLOWED_ATTR,A):ki,Nt=G(s,"ALLOWED_NAMESPACES")?_({},s.ALLOWED_NAMESPACES,ni):sr,It=G(s,"ADD_URI_SAFE_ATTR")?_(Z(Ri),s.ADD_URI_SAFE_ATTR,A):Ri,Li=G(s,"ADD_DATA_URI_TAGS")?_(Z(Ii),s.ADD_DATA_URI_TAGS,A):Ii,W=G(s,"FORBID_CONTENTS")?_({},s.FORBID_CONTENTS,A):Lt,Ee=G(s,"FORBID_TAGS")?_({},s.FORBID_TAGS,A):Z({}),Et=G(s,"FORBID_ATTR")?_({},s.FORBID_ATTR,A):Z({}),be=G(s,"USE_PROFILES")?s.USE_PROFILES:!1,Ei=s.ALLOW_ARIA_ATTR!==!1,Tt=s.ALLOW_DATA_ATTR!==!1,Ti=s.ALLOW_UNKNOWN_PROTOCOLS||!1,Si=s.ALLOW_SELF_CLOSE_IN_ATTR!==!1,ge=s.SAFE_FOR_TEMPLATES||!1,Ue=s.SAFE_FOR_XML!==!1,se=s.WHOLE_DOCUMENT||!1,fe=s.RETURN_DOM||!1,qe=s.RETURN_DOM_FRAGMENT||!1,Ge=s.RETURN_TRUSTED_TYPE||!1,At=s.FORCE_BODY||!1,Ai=s.SANITIZE_DOM!==!1,Ci=s.SANITIZE_NAMED_PROPS||!1,Ct=s.KEEP_CONTENT!==!1,Te=s.IN_PLACE||!1,vi=s.ALLOWED_URI_REGEXP||On,_e=s.NAMESPACE||X,Ve=s.MATHML_TEXT_INTEGRATION_POINTS||Ve,Ze=s.HTML_INTEGRATION_POINTS||Ze,T=s.CUSTOM_ELEMENT_HANDLING||{},s.CUSTOM_ELEMENT_HANDLING&&Ni(s.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(T.tagNameCheck=s.CUSTOM_ELEMENT_HANDLING.tagNameCheck),s.CUSTOM_ELEMENT_HANDLING&&Ni(s.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(T.attributeNameCheck=s.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),s.CUSTOM_ELEMENT_HANDLING&&typeof s.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements=="boolean"&&(T.allowCustomizedBuiltInElements=s.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),ge&&(Tt=!1),qe&&(fe=!0),be&&(I=_({},In),N=[],be.html===!0&&(_(I,Ln),_(N,Rn)),be.svg===!0&&(_(I,ai),_(N,li),_(N,pt)),be.svgFilters===!0&&(_(I,si),_(N,li),_(N,pt)),be.mathMl===!0&&(_(I,oi),_(N,Nn),_(N,pt))),s.ADD_TAGS&&(typeof s.ADD_TAGS=="function"?me.tagCheck=s.ADD_TAGS:(I===wi&&(I=Z(I)),_(I,s.ADD_TAGS,A))),s.ADD_ATTR&&(typeof s.ADD_ATTR=="function"?me.attributeCheck=s.ADD_ATTR:(N===ki&&(N=Z(N)),_(N,s.ADD_ATTR,A))),s.ADD_URI_SAFE_ATTR&&_(It,s.ADD_URI_SAFE_ATTR,A),s.FORBID_CONTENTS&&(W===Lt&&(W=Z(W)),_(W,s.FORBID_CONTENTS,A)),s.ADD_FORBID_CONTENTS&&(W===Lt&&(W=Z(W)),_(W,s.ADD_FORBID_CONTENTS,A)),Ct&&(I["#text"]=!0),se&&_(I,["html","head","body"]),I.table&&(_(I,["tbody"]),delete Ee.tbody),s.TRUSTED_TYPES_POLICY){if(typeof s.TRUSTED_TYPES_POLICY.createHTML!="function")throw Oe('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof s.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw Oe('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');L=s.TRUSTED_TYPES_POLICY,ne=L.createHTML("")}else L===void 0&&(L=Da(k,r)),L!==null&&typeof ne=="string"&&(ne=L.createHTML(""));H&&H(s),xe=s}},Di=_({},[...ai,...si,...wa]),Mi=_({},[...oi,...ka]),ur=function(s){let d=ie(s);(!d||!d.tagName)&&(d={namespaceURI:_e,tagName:"template"});let g=ut(s.tagName),E=ut(d.tagName);return Nt[s.namespaceURI]?s.namespaceURI===Ye?d.namespaceURI===X?g==="svg":d.namespaceURI===We?g==="svg"&&(E==="annotation-xml"||Ve[E]):!!Di[g]:s.namespaceURI===We?d.namespaceURI===X?g==="math":d.namespaceURI===Ye?g==="math"&&Ze[E]:!!Mi[g]:s.namespaceURI===X?d.namespaceURI===Ye&&!Ze[E]||d.namespaceURI===We&&!Ve[E]?!1:!Mi[g]&&(or[g]||!Di[g]):!!(Se==="application/xhtml+xml"&&Nt[s.namespaceURI]):!1},Y=function(s){Me(e.removed,{element:s});try{ie(s).removeChild(s)}catch(d){Fe(s)}},oe=function(s,d){try{Me(e.removed,{attribute:d.getAttributeNode(s),from:d})}catch(g){Me(e.removed,{attribute:null,from:d})}if(d.removeAttribute(s),s==="is")if(fe||qe)try{Y(d)}catch(g){}else try{d.setAttribute(s,"")}catch(g){}},zi=function(s){let d=null,g=null;if(At)s="<remove></remove>"+s;else{let S=ri(s,/^[\r\n\t ]+/);g=S&&S[0]}Se==="application/xhtml+xml"&&_e===X&&(s='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+s+"</body></html>");let E=L?L.createHTML(s):s;if(_e===X)try{d=new h().parseFromString(E,Se)}catch(S){}if(!d||!d.documentElement){d=re.createDocument(_e,"template",null);try{d.documentElement.innerHTML=Rt?ne:E}catch(S){}}let z=d.body||d.documentElement;return s&&g&&z.insertBefore(t.createTextNode(g),z.childNodes[0]||null),_e===X?Jn.call(d,se?"html":"body")[0]:se?d.documentElement:z},Oi=function(s){return ae.call(s.ownerDocument||s,s,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},Mt=function(s){return s instanceof x&&(typeof s.nodeName!="string"||typeof s.textContent!="string"||typeof s.removeChild!="function"||!(s.attributes instanceof p)||typeof s.removeAttribute!="function"||typeof s.setAttribute!="function"||typeof s.namespaceURI!="string"||typeof s.insertBefore!="function"||typeof s.hasChildNodes!="function")},Pi=function(s){return typeof o=="function"&&s instanceof o};function K(f,s,d){ct(f,g=>{g.call(e,s,d,xe)})}let Bi=function(s){let d=null;if(K(O.beforeSanitizeElements,s,null),Mt(s))return Y(s),!0;let g=A(s.nodeName);if(K(O.uponSanitizeElement,s,{tagName:g,allowedTags:I}),Ue&&s.hasChildNodes()&&!Pi(s.firstElementChild)&&B(/<[/\w!]/g,s.innerHTML)&&B(/<[/\w!]/g,s.textContent)||s.nodeType===Be.progressingInstruction||Ue&&s.nodeType===Be.comment&&B(/<[/\w]/g,s.data))return Y(s),!0;if(!(me.tagCheck instanceof Function&&me.tagCheck(g))&&(!I[g]||Ee[g])){if(!Ee[g]&&$i(g)&&(T.tagNameCheck instanceof RegExp&&B(T.tagNameCheck,g)||T.tagNameCheck instanceof Function&&T.tagNameCheck(g)))return!1;if(Ct&&!W[g]){let E=ie(s)||s.parentNode,z=je(s)||s.childNodes;if(z&&E){let S=z.length;for(let F=S-1;F>=0;--F){let Q=M(z[F],!0);Q.__removalCount=(s.__removalCount||0)+1,E.insertBefore(Q,ke(s))}}}return Y(s),!0}return s instanceof u&&!ur(s)||(g==="noscript"||g==="noembed"||g==="noframes")&&B(/<\/no(script|embed|frames)/i,s.innerHTML)?(Y(s),!0):(ge&&s.nodeType===Be.text&&(d=s.textContent,ct([vt,wt,kt],E=>{d=ze(d,E," ")}),s.textContent!==d&&(Me(e.removed,{element:s.cloneNode()}),s.textContent=d)),K(O.afterSanitizeElements,s,null),!1)},Hi=function(s,d,g){if(Ai&&(d==="id"||d==="name")&&(g in t||g in pr))return!1;if(!(Tt&&!Et[d]&&B(tr,d))){if(!(Ei&&B(ir,d))){if(!(me.attributeCheck instanceof Function&&me.attributeCheck(d,s))){if(!N[d]||Et[d]){if(!($i(s)&&(T.tagNameCheck instanceof RegExp&&B(T.tagNameCheck,s)||T.tagNameCheck instanceof Function&&T.tagNameCheck(s))&&(T.attributeNameCheck instanceof RegExp&&B(T.attributeNameCheck,d)||T.attributeNameCheck instanceof Function&&T.attributeNameCheck(d,s))||d==="is"&&T.allowCustomizedBuiltInElements&&(T.tagNameCheck instanceof RegExp&&B(T.tagNameCheck,g)||T.tagNameCheck instanceof Function&&T.tagNameCheck(g))))return!1}else if(!It[d]){if(!B(vi,ze(g,yi,""))){if(!((d==="src"||d==="xlink:href"||d==="href")&&s!=="script"&&_a(g,"data:")===0&&Li[s])){if(!(Ti&&!B(nr,ze(g,yi,"")))){if(g)return!1}}}}}}}return!0},$i=function(s){return s!=="annotation-xml"&&ri(s,rr)},Fi=function(s){K(O.beforeSanitizeAttributes,s,null);let{attributes:d}=s;if(!d||Mt(s))return;let g={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:N,forceKeepAttr:void 0},E=d.length;for(;E--;){let z=d[E],{name:S,namespaceURI:F,value:Q}=z,ye=A(S),zt=Q,D=S==="value"?zt:xa(zt);if(g.attrName=ye,g.attrValue=D,g.keepAttr=!0,g.forceKeepAttr=void 0,K(O.uponSanitizeAttribute,s,g),D=g.attrValue,Ci&&(ye==="id"||ye==="name")&&(oe(S,s),D=ar+D),Ue&&B(/((--!?|])>)|<\/(style|title|textarea)/i,D)){oe(S,s);continue}if(ye==="attributename"&&ri(D,"href")){oe(S,s);continue}if(g.forceKeepAttr)continue;if(!g.keepAttr){oe(S,s);continue}if(!Si&&B(/\/>/i,D)){oe(S,s);continue}ge&&ct([vt,wt,kt],Ui=>{D=ze(D,Ui," ")});let ji=A(s.nodeName);if(!Hi(ji,ye,D)){oe(S,s);continue}if(L&&typeof k=="object"&&typeof k.getAttributeType=="function"&&!F)switch(k.getAttributeType(ji,ye)){case"TrustedHTML":{D=L.createHTML(D);break}case"TrustedScriptURL":{D=L.createScriptURL(D);break}}if(D!==zt)try{F?s.setAttributeNS(F,S,D):s.setAttribute(S,D),Mt(s)?Y(s):Cn(e.removed)}catch(Ui){oe(S,s)}}K(O.afterSanitizeAttributes,s,null)},dr=function f(s){let d=null,g=Oi(s);for(K(O.beforeSanitizeShadowDOM,s,null);d=g.nextNode();)K(O.uponSanitizeShadowNode,d,null),Bi(d),Fi(d),d.content instanceof a&&f(d.content);K(O.afterSanitizeShadowDOM,s,null)};return e.sanitize=function(f){let s=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},d=null,g=null,E=null,z=null;if(Rt=!f,Rt&&(f="<!-->"),typeof f!="string"&&!Pi(f))if(typeof f.toString=="function"){if(f=f.toString(),typeof f!="string")throw Oe("dirty is not a string, aborting")}else throw Oe("toString is not a function");if(!e.isSupported)return f;if(St||Dt(s),e.removed=[],typeof f=="string"&&(Te=!1),Te){if(f.nodeName){let Q=A(f.nodeName);if(!I[Q]||Ee[Q])throw Oe("root node is forbidden and cannot be sanitized in-place")}}else if(f instanceof o)d=zi("<!---->"),g=d.ownerDocument.importNode(f,!0),g.nodeType===Be.element&&g.nodeName==="BODY"||g.nodeName==="HTML"?d=g:d.appendChild(g);else{if(!fe&&!ge&&!se&&f.indexOf("<")===-1)return L&&Ge?L.createHTML(f):f;if(d=zi(f),!d)return fe?null:Ge?ne:""}d&&At&&Y(d.firstChild);let S=Oi(Te?f:d);for(;E=S.nextNode();)Bi(E),Fi(E),E.content instanceof a&&dr(E.content);if(Te)return f;if(fe){if(qe)for(z=Qn.call(d.ownerDocument);d.firstChild;)z.appendChild(d.firstChild);else z=d;return(N.shadowroot||N.shadowrootmode)&&(z=er.call(i,z,!0)),z}let F=se?d.outerHTML:d.innerHTML;return se&&I["!doctype"]&&d.ownerDocument&&d.ownerDocument.doctype&&d.ownerDocument.doctype.name&&B(Pn,d.ownerDocument.doctype.name)&&(F="<!DOCTYPE "+d.ownerDocument.doctype.name+`>
`+F),ge&&ct([vt,wt,kt],Q=>{F=ze(F,Q," ")}),L&&Ge?L.createHTML(F):F},e.setConfig=function(){let f=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Dt(f),St=!0},e.clearConfig=function(){xe=null,St=!1},e.isValidAttribute=function(f,s,d){xe||Dt({});let g=A(f),E=A(s);return Hi(g,E,d)},e.addHook=function(f,s){typeof s=="function"&&Me(O[f],s)},e.removeHook=function(f,s){if(s!==void 0){let d=fa(O[f],s);return d===-1?void 0:ba(O[f],d,1)[0]}return Cn(O[f])},e.removeHooks=function(f){O[f]=[]},e.removeAllHooks=function(){O=Mn()},e}var Hn=Bn();var Ma={ALLOWED_TAGS:["p","br","strong","b","em","i","u","s","del","a","code","pre","blockquote","ul","ol","li","h1","h2","h3","h4","h5","h6","table","thead","tbody","tr","th","td","img","hr","span","div","sup","sub"],ALLOWED_ATTR:["href","target","rel","src","alt","title","class","id","width","height","colspan","rowspan","align"],ALLOW_DATA_ATTR:!1,ADD_ATTR:["target"],FORBID_TAGS:["script","style","iframe","object","embed","form","input"],FORBID_ATTR:["onerror","onload","onclick","onmouseover","onfocus","onblur"]};function dt(n){return!n||typeof n!="string"?"":Hn.sanitize(n,Ma)}function $n(n,e){if(!n)return;n.innerHTML=dt(e);let t=n.querySelectorAll("a[href]");for(let i=0;i<t.length;i++)t[i].setAttribute("target","_blank"),t[i].setAttribute("rel","noopener noreferrer")}function Fn(n,e){return!n||!n.type?!1:e.some(t=>t.endsWith("/*")?n.type.startsWith(t.slice(0,-1)):n.type===t)}function jn(n,e){return n?n.size<=e*1024*1024:!1}y.setOptions({gfm:!0,breaks:!0,pedantic:!1,async:!1});var di=new y.Renderer;di.link=function({href:n,title:e,tokens:t}){let i=this.parser.parseInline(t),r=e?` title="${e}"`:"";return`<a href="${n}" target="_blank" rel="noopener noreferrer"${r}>${i}</a>`};di.code=function({text:n,lang:e}){let t=e?` class="language-${e}"`:"",i=n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return`<pre><code${t}>${i}</code></pre>`};y.use({renderer:di});function Un(n){if(!n||typeof n!="string")return"";try{let e=y.parse(n);return dt(e)}catch(e){return console.warn("[AirPilot] Markdown parse error:",e),dt(n.replace(/</g,"&lt;").replace(/>/g,"&gt;"))}}var za='<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',Oa='<svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',Pa='<svg viewBox="0 0 24 24"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>',He=class{constructor(e,t){this._msg=e,this._options=t||{},this._el=null,this._feedbackState=e.feedback||null}render(){let e=this._msg.role||"ai";if(this._el=document.createElement("div"),this._el.className=`airpilot-msg airpilot-msg--${e}`,this._el.setAttribute("data-msg-id",this._msg.id||""),this._options.animate&&this._el.classList.add("airpilot-msg--entering"),e==="system"){let r=document.createElement("div");return r.className="airpilot-msg-bubble",r.textContent=this._msg.content||"",this._el.appendChild(r),this._el}if(e==="ai"||e==="admin"){let r=document.createElement("div");r.className="airpilot-msg-sender",r.textContent=this._msg.senderName||(e==="admin"?m("escalation.connected"):this._options.aiNickname||"AI"),this._el.appendChild(r)}let t=document.createElement("div");t.className="airpilot-msg-bubble";let i=document.createElement("div");if(i.className="airpilot-msg-content",e==="user"?i.textContent=this._msg.content||"":$n(i,Un(this._msg.content||"")),t.appendChild(i),this._msg.attachments&&this._msg.attachments.length>0)for(let r of this._msg.attachments)t.appendChild(this._renderAttachment(r));if(this._el.appendChild(t),this._msg.timestamp){let r=document.createElement("div");r.className="airpilot-msg-time",r.textContent=this._formatTime(this._msg.timestamp),this._el.appendChild(r)}return(e==="ai"||e==="admin")&&this._el.appendChild(this._renderActions()),this._el}getElement(){return this._el}_renderAttachment(e){if(e.type&&e.type.startsWith("image/")&&e.url){let l=document.createElement("img");return l.className="airpilot-msg-image",l.src=e.url,l.alt=e.filename||"Image",l.loading="lazy",l}let i=document.createElement("div");i.className="airpilot-msg-file";let r=document.createElement("span");r.innerHTML='<svg class="airpilot-msg-file-icon" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>',i.appendChild(r);let a=document.createElement("span");return a.className="airpilot-msg-file-name",a.textContent=e.filename||"File",i.appendChild(a),e.url&&(i.style.cursor="pointer",i.addEventListener("click",()=>{window.open(e.url,"_blank","noopener,noreferrer")})),i}_renderActions(){let e=document.createElement("div");e.className="airpilot-msg-actions";let t=document.createElement("button");t.className="airpilot-msg-action-btn",t.setAttribute("type","button"),t.innerHTML=`${za} <span>${m("message.copy")}</span>`,t.addEventListener("click",()=>this._copyContent(t)),e.appendChild(t);let i=document.createElement("button");i.className="airpilot-msg-action-btn"+(this._feedbackState==="helpful"?" airpilot-msg-action-btn--active":""),i.setAttribute("type","button"),i.innerHTML=`${Oa} <span>${m("message.helpful")}</span>`,i.addEventListener("click",()=>this._sendFeedback(!0,i,r)),e.appendChild(i);let r=document.createElement("button");return r.className="airpilot-msg-action-btn"+(this._feedbackState==="not_helpful"?" airpilot-msg-action-btn--active":""),r.setAttribute("type","button"),r.innerHTML=`${Pa} <span>${m("message.notHelpful")}</span>`,r.addEventListener("click",()=>this._sendFeedback(!1,i,r)),e.appendChild(r),e}async _copyContent(e){try{await navigator.clipboard.writeText(this._msg.content||"");let t=e.querySelector("span");if(t){let i=t.textContent;t.textContent=m("message.copied"),setTimeout(()=>{t.textContent=i},1500)}}catch(t){let i=document.createElement("textarea");i.value=this._msg.content||"",i.style.position="fixed",i.style.opacity="0",document.body.appendChild(i),i.select();try{document.execCommand("copy")}catch(r){}document.body.removeChild(i)}}async _sendFeedback(e,t,i){if(!(!this._msg.conversationId&&!this._msg.conversation_id))try{await en(this._msg.conversationId||this._msg.conversation_id,e?"Helpful":"Not helpful",e),this._feedbackState=e?"helpful":"not_helpful",t.classList.toggle("airpilot-msg-action-btn--active",e),i.classList.toggle("airpilot-msg-action-btn--active",!e)}catch(r){}}_formatTime(e){try{let t=new Date(e);return isNaN(t.getTime())?"":t.toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}catch(t){return""}}};var hi=null,mi=null;function gi(){return window.innerWidth<=480}function qn(){return/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1}function Gn(n,e){if(!n)return()=>{};let t=window.visualViewport;if(!t)return mi=()=>{let r=window.innerHeight<500;e&&e(r,0)},window.addEventListener("resize",mi),()=>window.removeEventListener("resize",mi);let i=t.height;return hi=()=>{let r=t.height,a=i-r;if(a>100){let l=a;n.style.height=`${r}px`,n.style.bottom="0",e&&e(!0,l)}else r>=i-50&&(n.style.height="",n.style.bottom="",e&&e(!1,0));i=r},t.addEventListener("resize",hi),()=>{t.removeEventListener("resize",hi),n.style.height="",n.style.bottom=""}}function fi(n){if(n)document.body.style.overflow="hidden",qn()&&(document.body.style.position="fixed",document.body.style.width="100%",document.body.style.top=`-${window.scrollY}px`);else if(document.body.style.overflow="",qn()){let e=Math.abs(parseInt(document.body.style.top||"0",10));document.body.style.position="",document.body.style.width="",document.body.style.top="",window.scrollTo(0,e)}}function $e(n,e){n&&(e?n.scrollTo({top:n.scrollHeight,behavior:"smooth"}):n.scrollTop=n.scrollHeight)}function Wn(n,e){if(!n)return!0;let t=e!=null?e:80;return n.scrollHeight-n.scrollTop-n.clientHeight<t}var ht=class{constructor(e){this._options=e||{},this._el=null,this._messages=[],this._typingEl=null,this._isTyping=!1,this._shouldAutoScroll=!0,this._emptyEl=null}render(){return this._el=document.createElement("div"),this._el.className="airpilot-messages",this._el.setAttribute("role","log"),this._el.setAttribute("aria-live","polite"),this._el.addEventListener("scroll",()=>{this._shouldAutoScroll=Wn(this._el,80)}),this._showEmptyState(),this._el}setMessages(e){if(!this._el)return;if(this._messages=e||[],this._el.innerHTML="",this._messages.length===0){this._showEmptyState();return}let t=null;for(let i of this._messages){let r=this._getDateString(i.timestamp);r&&r!==t&&(this._el.appendChild(this._createDateSeparator(r)),t=r);let a=new He(i,{aiNickname:this._options.aiNickname,animate:!1});this._el.appendChild(a.render())}this._isTyping&&this._el.appendChild(this._getTypingIndicator()),$e(this._el,!1)}addMessage(e){if(!this._el)return;this._emptyEl&&this._el.contains(this._emptyEl)&&(this._el.removeChild(this._emptyEl),this._emptyEl=null),this._messages.push(e);let t=this._messages.length>1?this._messages[this._messages.length-2]:null,i=t?this._getDateString(t.timestamp):null,r=this._getDateString(e.timestamp);r&&r!==i&&this._el.appendChild(this._createDateSeparator(r)),this._typingEl&&this._el.contains(this._typingEl)&&this._el.removeChild(this._typingEl);let a=new He(e,{aiNickname:this._options.aiNickname,animate:!0});this._el.appendChild(a.render()),this._isTyping&&this._el.appendChild(this._getTypingIndicator()),this._shouldAutoScroll&&$e(this._el,!0)}setTyping(e,t){this._isTyping=e;let i=this._getTypingIndicator();if(e){let r=i.querySelector(".airpilot-typing-text");r&&(r.textContent=t||m("widget.typing")),this._el.contains(i)||this._el.appendChild(i),this._shouldAutoScroll&&$e(this._el,!0)}else this._el.contains(i)&&this._el.removeChild(i)}scrollToBottom(e){$e(this._el,e!==!1)}getElement(){return this._el}_showEmptyState(){if(this._emptyEl)return;this._emptyEl=document.createElement("div"),this._emptyEl.className="airpilot-empty",this._emptyEl.innerHTML="";let e=document.createElement("div");e.className="airpilot-empty-icon",e.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>',this._emptyEl.appendChild(e);let t=document.createElement("div");t.className="airpilot-empty-title",t.textContent=m("widget.title"),this._emptyEl.appendChild(t);let i=document.createElement("div");i.className="airpilot-empty-text",i.textContent=m("widget.subtitle"),this._emptyEl.appendChild(i),this._el.appendChild(this._emptyEl)}_getTypingIndicator(){if(!this._typingEl){this._typingEl=document.createElement("div"),this._typingEl.className="airpilot-typing";let e=document.createElement("div");e.className="airpilot-typing-dots";for(let i=0;i<3;i++){let r=document.createElement("span");r.className="airpilot-typing-dot",e.appendChild(r)}this._typingEl.appendChild(e);let t=document.createElement("span");t.className="airpilot-typing-text",t.textContent=m("widget.typing"),this._typingEl.appendChild(t)}return this._typingEl}_createDateSeparator(e){let t=document.createElement("div");t.className="airpilot-date-sep";let i=document.createElement("span");return i.textContent=e,t.appendChild(i),t}_getDateString(e){if(!e)return null;try{let t=new Date(e);if(isNaN(t.getTime()))return null;let i=new Date,r=new Date(i.getFullYear(),i.getMonth(),i.getDate()),a=new Date(r.getTime()-864e5),l=new Date(t.getFullYear(),t.getMonth(),t.getDate());return l.getTime()===r.getTime()?m("message.today"):l.getTime()===a.getTime()?m("message.yesterday"):t.toLocaleDateString(void 0,{month:"short",day:"numeric"})}catch(t){return null}}};var bi={smileys:["\u{1F600}","\u{1F603}","\u{1F604}","\u{1F601}","\u{1F606}","\u{1F605}","\u{1F923}","\u{1F602}","\u{1F642}","\u{1F60A}","\u{1F607}","\u{1F970}","\u{1F60D}","\u{1F929}","\u{1F618}","\u{1F617}","\u{1F61A}","\u{1F619}","\u{1F972}","\u{1F60B}","\u{1F61B}","\u{1F61C}","\u{1F92A}","\u{1F61D}","\u{1F911}","\u{1F917}","\u{1F92D}","\u{1FAE2}","\u{1F92B}","\u{1F914}","\u{1FAE1}","\u{1F910}","\u{1F928}","\u{1F610}","\u{1F611}","\u{1F636}","\u{1FAE5}","\u{1F60F}","\u{1F612}","\u{1F644}","\u{1F62C}","\u{1F925}","\u{1F60C}","\u{1F614}","\u{1F62A}","\u{1F924}","\u{1F634}","\u{1F637}","\u{1F912}","\u{1F915}","\u{1F922}","\u{1F92E}","\u{1F975}","\u{1F976}","\u{1F974}","\u{1F635}","\u{1F92F}","\u{1F920}","\u{1F973}","\u{1F978}","\u{1F60E}","\u{1F913}","\u{1F9D0}","\u{1F615}","\u{1FAE4}","\u{1F61F}","\u{1F641}","\u{1F62E}","\u{1F62F}","\u{1F632}","\u{1F633}","\u{1F97A}","\u{1F979}","\u{1F626}","\u{1F627}","\u{1F628}","\u{1F630}","\u{1F625}","\u{1F622}","\u{1F62D}","\u{1F631}","\u{1F616}","\u{1F623}","\u{1F61E}","\u{1F613}","\u{1F629}","\u{1F62B}","\u{1F971}","\u{1F624}","\u{1F621}","\u{1F620}","\u{1F92C}","\u{1F608}","\u{1F47F}","\u{1F480}","\u2620\uFE0F","\u{1F4A9}","\u{1F921}","\u{1F479}","\u{1F47A}","\u{1F47B}","\u{1F47D}","\u{1F47E}","\u{1F916}"],animals:["\u{1F436}","\u{1F431}","\u{1F42D}","\u{1F439}","\u{1F430}","\u{1F98A}","\u{1F43B}","\u{1F43C}","\u{1F43B}\u200D\u2744\uFE0F","\u{1F428}","\u{1F42F}","\u{1F981}","\u{1F42E}","\u{1F437}","\u{1F438}","\u{1F435}","\u{1F648}","\u{1F649}","\u{1F64A}","\u{1F412}","\u{1F414}","\u{1F427}","\u{1F426}","\u{1F424}","\u{1F423}","\u{1F425}","\u{1F986}","\u{1F985}","\u{1F989}","\u{1F987}","\u{1F43A}","\u{1F417}","\u{1F434}","\u{1F984}","\u{1F41D}","\u{1FAB1}","\u{1F41B}","\u{1F98B}","\u{1F40C}","\u{1F41E}","\u{1F41C}","\u{1FAB0}","\u{1FAB2}","\u{1FAB3}","\u{1F99F}","\u{1F997}","\u{1F577}\uFE0F","\u{1F982}","\u{1F422}","\u{1F40D}","\u{1F98E}","\u{1F996}","\u{1F995}","\u{1F419}","\u{1F991}","\u{1F990}","\u{1F99E}","\u{1F980}","\u{1F421}","\u{1F420}","\u{1F41F}","\u{1F42C}","\u{1F433}","\u{1F40B}","\u{1F988}","\u{1F40A}","\u{1F405}","\u{1F406}","\u{1F993}","\u{1F98D}","\u{1F9A7}","\u{1F418}"],food:["\u{1F34F}","\u{1F34E}","\u{1F350}","\u{1F34A}","\u{1F34B}","\u{1F34C}","\u{1F349}","\u{1F347}","\u{1F353}","\u{1FAD0}","\u{1F348}","\u{1F352}","\u{1F351}","\u{1F96D}","\u{1F34D}","\u{1F965}","\u{1F95D}","\u{1F345}","\u{1F346}","\u{1F951}","\u{1F966}","\u{1F96C}","\u{1F952}","\u{1F336}\uFE0F","\u{1FAD1}","\u{1F33D}","\u{1F955}","\u{1FAD2}","\u{1F9C4}","\u{1F9C5}","\u{1F954}","\u{1F360}","\u{1F950}","\u{1F96F}","\u{1F35E}","\u{1F956}","\u{1F968}","\u{1F9C0}","\u{1F95A}","\u{1F373}","\u{1F9C8}","\u{1F95E}","\u{1F9C7}","\u{1F953}","\u{1F969}","\u{1F357}","\u{1F356}","\u{1F32D}","\u{1F354}","\u{1F35F}","\u{1F355}","\u{1FAD3}","\u{1F96A}","\u{1F959}","\u{1F9C6}","\u{1F32E}","\u{1F32F}","\u{1FAD4}","\u{1F957}","\u{1F958}","\u{1FAD5}","\u{1F96B}","\u{1F35D}","\u{1F35C}","\u{1F372}","\u{1F35B}","\u{1F363}","\u{1F371}","\u{1F95F}","\u{1F9AA}","\u{1F364}","\u{1F359}","\u{1F35A}","\u{1F358}","\u{1F365}","\u{1F96E}","\u{1F362}","\u{1F361}","\u{1F367}","\u{1F368}","\u{1F366}","\u{1F967}","\u{1F9C1}","\u{1F370}","\u{1F382}","\u{1F36E}","\u{1F36D}","\u{1F36C}","\u{1F36B}","\u{1F37F}","\u{1F369}","\u{1F36A}","\u{1F330}","\u{1F95C}","\u{1F36F}","\u{1F95B}","\u{1F37C}","\u{1FAD6}","\u2615","\u{1F375}","\u{1F9C3}","\u{1F964}","\u{1F9CB}","\u{1F376}","\u{1F37A}","\u{1F37B}","\u{1F942}","\u{1F377}","\u{1F943}","\u{1F378}","\u{1F379}","\u{1F9C9}","\u{1F37E}","\u{1F9CA}"],activities:["\u26BD","\u{1F3C0}","\u{1F3C8}","\u26BE","\u{1F94E}","\u{1F3BE}","\u{1F3D0}","\u{1F3C9}","\u{1F94F}","\u{1F3B1}","\u{1FA80}","\u{1F3D3}","\u{1F3F8}","\u{1F3D2}","\u{1F3D1}","\u{1F94D}","\u{1F3CF}","\u{1FA83}","\u{1F945}","\u26F3","\u{1FA81}","\u{1F3F9}","\u{1F3A3}","\u{1F93F}","\u{1F94A}","\u{1F94B}","\u{1F3BD}","\u{1F6F9}","\u{1F6FC}","\u{1F6F7}","\u26F8\uFE0F","\u{1F94C}","\u{1F3BF}","\u26F7\uFE0F","\u{1F3C2}","\u{1FA82}","\u{1F3CB}\uFE0F","\u{1F93C}","\u{1F938}","\u{1F93A}","\u26F9\uFE0F","\u{1F93E}","\u{1F3CC}\uFE0F","\u{1F3C7}","\u{1F9D8}","\u{1F3C4}","\u{1F3CA}","\u{1F93D}","\u{1F6A3}","\u{1F9D7}","\u{1F6B5}","\u{1F6B4}","\u{1F3AA}","\u{1F397}\uFE0F","\u{1F39F}\uFE0F","\u{1F3AB}","\u{1F396}\uFE0F","\u{1F3C6}","\u{1F3C5}","\u{1F947}","\u{1F948}","\u{1F949}","\u{1F3AF}","\u{1F3AE}","\u{1F579}\uFE0F","\u{1F3B0}","\u{1F3B2}","\u{1F9E9}","\u{1F3AD}","\u{1F3A8}","\u{1F3AC}","\u{1F3A4}","\u{1F3A7}","\u{1F3BC}","\u{1F3B9}","\u{1F941}","\u{1FA98}","\u{1F3B7}","\u{1F3BA}","\u{1FA97}","\u{1F3B8}","\u{1FA95}","\u{1F3BB}"],travel:["\u{1F697}","\u{1F695}","\u{1F699}","\u{1F68C}","\u{1F68E}","\u{1F3CE}\uFE0F","\u{1F693}","\u{1F691}","\u{1F692}","\u{1F690}","\u{1F6FB}","\u{1F69A}","\u{1F69B}","\u{1F69C}","\u{1F9AF}","\u{1F9BD}","\u{1F9BC}","\u{1F6F4}","\u{1F6B2}","\u{1F6F5}","\u{1F3CD}\uFE0F","\u{1F6FA}","\u{1F6A8}","\u{1F694}","\u{1F68D}","\u{1F698}","\u{1F696}","\u{1F6DE}","\u{1F6A1}","\u{1F6A0}","\u{1F69F}","\u{1F683}","\u{1F68B}","\u{1F69E}","\u{1F69D}","\u{1F684}","\u{1F685}","\u{1F688}","\u{1F682}","\u{1F686}","\u{1F687}","\u{1F68A}","\u{1F689}","\u2708\uFE0F","\u{1F6EB}","\u{1F6EC}","\u{1F6E9}\uFE0F","\u{1F4BA}","\u{1F6F0}\uFE0F","\u{1F680}","\u{1F6F8}","\u{1F681}","\u{1F6F6}","\u26F5","\u{1F6A4}","\u{1F6E5}\uFE0F","\u{1F6F3}\uFE0F","\u26F4\uFE0F","\u{1F6A2}","\u2693","\u{1FA9D}","\u26FD","\u{1F6A7}","\u{1F6A6}","\u{1F6A5}","\u{1F5FA}\uFE0F","\u{1F5FF}","\u{1F5FD}","\u{1F5FC}","\u{1F3F0}","\u{1F3EF}","\u{1F3DF}\uFE0F","\u{1F3A1}","\u{1F3A2}","\u{1F3A0}","\u26F2","\u26F1\uFE0F","\u{1F3D6}\uFE0F","\u{1F3DD}\uFE0F","\u{1F3DC}\uFE0F","\u{1F30B}","\u26F0\uFE0F","\u{1F3D4}\uFE0F","\u{1F5FB}","\u{1F3D5}\uFE0F","\u{1F6D6}","\u{1F3E0}","\u{1F3E1}","\u{1F3D8}\uFE0F","\u{1F3DA}\uFE0F","\u{1F3D7}\uFE0F","\u{1F3E2}","\u{1F3ED}","\u{1F3E3}","\u{1F3E4}","\u{1F3E5}","\u{1F3E6}","\u{1F3E8}","\u{1F3EA}","\u{1F3EB}","\u{1F3EC}"],objects:["\u231A","\u{1F4F1}","\u{1F4F2}","\u{1F4BB}","\u2328\uFE0F","\u{1F5A5}\uFE0F","\u{1F5A8}\uFE0F","\u{1F5B1}\uFE0F","\u{1F5B2}\uFE0F","\u{1F579}\uFE0F","\u{1F5DC}\uFE0F","\u{1F4BD}","\u{1F4BE}","\u{1F4BF}","\u{1F4C0}","\u{1F4FC}","\u{1F4F7}","\u{1F4F8}","\u{1F4F9}","\u{1F3A5}","\u{1F4FD}\uFE0F","\u{1F39E}\uFE0F","\u{1F4DE}","\u260E\uFE0F","\u{1F4DF}","\u{1F4E0}","\u{1F4FA}","\u{1F4FB}","\u{1F399}\uFE0F","\u{1F39A}\uFE0F","\u{1F39B}\uFE0F","\u{1F9ED}","\u23F1\uFE0F","\u23F2\uFE0F","\u23F0","\u{1F570}\uFE0F","\u231B","\u{1F4E1}","\u{1F50B}","\u{1FAAB}","\u{1F50C}","\u{1F4A1}","\u{1F526}","\u{1F56F}\uFE0F","\u{1FA94}","\u{1F9EF}","\u{1F6E2}\uFE0F","\u{1F4B8}","\u{1F4B5}","\u{1F4B4}","\u{1F4B6}","\u{1F4B7}","\u{1FA99}","\u{1F4B0}","\u{1F4B3}","\u{1F48E}","\u2696\uFE0F","\u{1FA9C}","\u{1F9F0}","\u{1FA9B}","\u{1F527}","\u{1F528}","\u2692\uFE0F","\u{1F6E0}\uFE0F","\u26CF\uFE0F","\u{1FA9A}","\u{1F529}","\u2699\uFE0F","\u{1FAA4}","\u{1F9F1}","\u26D3\uFE0F","\u{1F9F2}","\u{1F52B}","\u{1F4A3}","\u{1F9E8}","\u{1FA93}","\u{1F52A}","\u{1F5E1}\uFE0F","\u2694\uFE0F","\u{1F6E1}\uFE0F","\u{1F6AC}","\u26B0\uFE0F","\u{1FAA6}","\u26B1\uFE0F","\u{1F3FA}","\u{1F52E}","\u{1F4FF}","\u{1F9FF}","\u{1FAAC}","\u{1F488}","\u2697\uFE0F","\u{1F52D}","\u{1F52C}","\u{1F573}\uFE0F","\u{1FA79}","\u{1FA7A}","\u{1FA7B}","\u{1FA7C}","\u{1F48A}","\u{1F489}","\u{1FA78}","\u{1F9EC}","\u{1F9A0}","\u{1F9EB}","\u{1F9EA}"],symbols:["\u2764\uFE0F","\u{1F9E1}","\u{1F49B}","\u{1F49A}","\u{1F499}","\u{1F49C}","\u{1F5A4}","\u{1F90D}","\u{1F90E}","\u{1F494}","\u2764\uFE0F\u200D\u{1F525}","\u2764\uFE0F\u200D\u{1FA79}","\u2763\uFE0F","\u{1F495}","\u{1F49E}","\u{1F493}","\u{1F497}","\u{1F496}","\u{1F498}","\u{1F49D}","\u{1F49F}","\u262E\uFE0F","\u271D\uFE0F","\u262A\uFE0F","\u{1F549}\uFE0F","\u2638\uFE0F","\u2721\uFE0F","\u{1F52F}","\u{1F54E}","\u262F\uFE0F","\u2626\uFE0F","\u{1F6D0}","\u26CE","\u2648","\u2649","\u264A","\u264B","\u264C","\u264D","\u264E","\u264F","\u2650","\u2651","\u2652","\u2653","\u{1F194}","\u269B\uFE0F","\u{1F251}","\u2622\uFE0F","\u2623\uFE0F","\u{1F4F4}","\u{1F4F3}","\u{1F236}","\u{1F21A}","\u{1F238}","\u{1F23A}","\u{1F237}\uFE0F","\u2734\uFE0F","\u{1F19A}","\u{1F4AE}","\u{1F250}","\u3299\uFE0F","\u3297\uFE0F","\u{1F234}","\u{1F235}","\u{1F239}","\u{1F232}","\u{1F170}\uFE0F","\u{1F171}\uFE0F","\u{1F18E}","\u{1F191}","\u{1F17E}\uFE0F","\u{1F198}","\u274C","\u2B55","\u{1F6D1}","\u26D4","\u{1F4DB}","\u{1F6AB}","\u{1F4AF}","\u{1F4A2}","\u2668\uFE0F","\u{1F6B7}","\u{1F6AF}","\u{1F6B3}","\u{1F6B1}","\u{1F51E}","\u{1F4F5}","\u{1F6AD}","\u2757","\u2755","\u2753","\u2754","\u203C\uFE0F","\u2049\uFE0F","\u{1F505}","\u{1F506}","\u303D\uFE0F","\u26A0\uFE0F","\u{1F6B8}","\u{1F531}","\u269C\uFE0F","\u{1F530}","\u267B\uFE0F","\u2705","\u{1F22F}","\u{1F4B9}","\u2747\uFE0F","\u2733\uFE0F","\u274E","\u{1F310}","\u{1F4A0}","\u24C2\uFE0F","\u{1F300}","\u{1F4A4}","\u{1F3E7}","\u{1F6BE}","\u267F","\u{1F17F}\uFE0F","\u{1F6D7}","\u{1F233}","\u{1F202}\uFE0F","\u{1F6C2}","\u{1F6C3}","\u{1F6C4}","\u{1F6C5}"]},mt=class{constructor(e){this._onSelect=e.onSelect,this._onClose=e.onClose,this._el=null,this._gridEl=null,this._activeCategory="smileys",this._visible=!1}render(){this._el=document.createElement("div"),this._el.className="airpilot-emoji-picker airpilot-emoji-picker--hidden";let e=document.createElement("div");e.className="airpilot-emoji-tabs";let t=Object.keys(bi);for(let i of t){let r=document.createElement("button");r.className="airpilot-emoji-tab"+(i===this._activeCategory?" airpilot-emoji-tab--active":""),r.setAttribute("type","button"),r.textContent=m(`emoji.${i}`),r.addEventListener("click",()=>this._switchCategory(i,e)),e.appendChild(r)}return this._el.appendChild(e),this._gridEl=document.createElement("div"),this._gridEl.className="airpilot-emoji-grid",this._renderCategory(this._activeCategory),this._el.appendChild(this._gridEl),this._el}toggle(e){this._visible=e!=null?e:!this._visible,this._el&&(this._el.classList.toggle("airpilot-emoji-picker--hidden",!this._visible),this._visible&&this._el.classList.add("airpilot-emoji-picker--opening"))}isVisible(){return this._visible}getElement(){return this._el}_switchCategory(e,t){this._activeCategory=e,this._renderCategory(e);let i=t.querySelectorAll(".airpilot-emoji-tab"),r=Object.keys(bi);i.forEach((a,l)=>{a.classList.toggle("airpilot-emoji-tab--active",r[l]===e)})}_renderCategory(e){if(!this._gridEl)return;this._gridEl.innerHTML="";let t=bi[e]||[];for(let i of t){let r=document.createElement("button");r.className="airpilot-emoji-btn",r.setAttribute("type","button"),r.textContent=i,r.addEventListener("click",()=>{this._onSelect&&this._onSelect(i)}),this._gridEl.appendChild(r)}}};var Ba='<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',Ha='<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',$a='<svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>',Fa=["image/*","application/pdf","text/plain","application/zip"],Yn=10,gt=class{constructor(e){this._onSend=e.onSend,this._onAttach=e.onAttach,this._enableAttachments=e.enableAttachments!==!1,this._enableEmoji=e.enableEmoji!==!1,this._escalationButton=e.escalationButton,this._el=null,this._textarea=null,this._sendBtn=null,this._fileInput=null,this._emojiPicker=null,this._uploadPreviewEl=null,this._pendingFile=null,this._disabled=!1}render(){this._el=document.createElement("div"),this._el.className="airpilot-input-area",this._el.style.position="relative",this._enableEmoji&&(this._emojiPicker=new mt({onSelect:i=>this._insertEmoji(i),onClose:()=>this._emojiPicker.toggle(!1)}),this._el.appendChild(this._emojiPicker.render())),this._uploadPreviewEl=document.createElement("div"),this._uploadPreviewEl.style.display="none",this._el.appendChild(this._uploadPreviewEl);let e=document.createElement("div");if(e.className="airpilot-input-toolbar",this._enableEmoji){let i=document.createElement("button");i.className="airpilot-toolbar-btn",i.setAttribute("type","button"),i.setAttribute("title","Emoji"),i.innerHTML=Ha,i.addEventListener("click",()=>{this._emojiPicker.toggle(),i.classList.toggle("airpilot-toolbar-btn--active",this._emojiPicker.isVisible())}),e.appendChild(i)}if(this._enableAttachments){let i=document.createElement("button");i.className="airpilot-toolbar-btn",i.setAttribute("type","button"),i.setAttribute("title",m("attachment.upload")),i.innerHTML=$a,i.addEventListener("click",()=>this._openFilePicker()),e.appendChild(i),this._fileInput=document.createElement("input"),this._fileInput.type="file",this._fileInput.style.display="none",this._fileInput.accept="image/*,.pdf,.txt,.zip",this._fileInput.addEventListener("change",r=>this._handleFileSelect(r)),this._el.appendChild(this._fileInput)}this._escalationButton&&e.appendChild(this._escalationButton),this._el.appendChild(e);let t=document.createElement("div");return t.className="airpilot-input-row",this._textarea=document.createElement("textarea"),this._textarea.className="airpilot-textarea",this._textarea.setAttribute("placeholder",m("widget.inputPlaceholder")),this._textarea.setAttribute("rows","1"),this._textarea.addEventListener("input",()=>this._autoResize()),this._textarea.addEventListener("keydown",i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),this._handleSend())}),t.appendChild(this._textarea),this._sendBtn=document.createElement("button"),this._sendBtn.className="airpilot-send-btn",this._sendBtn.setAttribute("type","button"),this._sendBtn.setAttribute("aria-label",m("widget.send")),this._sendBtn.innerHTML=Ba,this._sendBtn.addEventListener("click",()=>this._handleSend()),t.appendChild(this._sendBtn),this._el.appendChild(t),this._el}setDisabled(e){this._disabled=e,this._textarea&&(this._textarea.disabled=e),this._sendBtn&&(this._sendBtn.disabled=e)}focus(){this._textarea&&this._textarea.focus()}clear(){this._textarea&&(this._textarea.value="",this._autoResize()),this._clearFilePreview()}setupDragDrop(e){if(!e||!this._enableAttachments)return;let t=0,i=document.createElement("div");i.className="airpilot-dropzone";let r=document.createElement("span");r.className="airpilot-dropzone-text",r.textContent=m("attachment.dragDrop"),i.appendChild(r),e.appendChild(i),e.addEventListener("dragenter",a=>{a.preventDefault(),t++,i.classList.add("airpilot-dropzone--active")}),e.addEventListener("dragleave",a=>{a.preventDefault(),t--,t<=0&&(t=0,i.classList.remove("airpilot-dropzone--active"))}),e.addEventListener("dragover",a=>{a.preventDefault()}),e.addEventListener("drop",a=>{var o;a.preventDefault(),t=0,i.classList.remove("airpilot-dropzone--active");let l=(o=a.dataTransfer)==null?void 0:o.files;l&&l.length>0&&this._processFile(l[0])})}getElement(){return this._el}_handleSend(){var t;if(this._disabled)return;let e=(((t=this._textarea)==null?void 0:t.value)||"").trim();this._pendingFile&&(this._onAttach&&this._onAttach(this._pendingFile),this._pendingFile=null,this._clearFilePreview()),e&&(this._onSend&&this._onSend(e),this._emojiPicker&&this._emojiPicker.isVisible()&&this._emojiPicker.toggle(!1))}_autoResize(){this._textarea&&(this._textarea.style.height="auto",this._textarea.style.height=Math.min(this._textarea.scrollHeight,120)+"px")}_insertEmoji(e){if(!this._textarea)return;let t=this._textarea.selectionStart,i=this._textarea.selectionEnd,r=this._textarea.value;this._textarea.value=r.substring(0,t)+e+r.substring(i),this._textarea.selectionStart=this._textarea.selectionEnd=t+e.length,this._textarea.focus(),this._autoResize()}_openFilePicker(){this._fileInput&&this._fileInput.click()}_handleFileSelect(e){var i,r;let t=(r=(i=e.target)==null?void 0:i.files)==null?void 0:r[0];t&&this._processFile(t),this._fileInput&&(this._fileInput.value="")}_processFile(e){if(!Fn(e,Fa)){this._showFileError(m("attachment.invalidType"));return}if(!jn(e,Yn)){this._showFileError(m("attachment.tooLarge",{max:Yn}));return}this._pendingFile=e,this._showFilePreview(e)}_showFilePreview(e){if(!this._uploadPreviewEl)return;if(this._uploadPreviewEl.innerHTML="",this._uploadPreviewEl.style.display="",this._uploadPreviewEl.className="airpilot-upload-preview",e.type.startsWith("image/")){let r=document.createElement("img");r.src=URL.createObjectURL(e),r.addEventListener("load",()=>URL.revokeObjectURL(r.src)),this._uploadPreviewEl.appendChild(r)}let t=document.createElement("span");t.className="airpilot-upload-preview-name",t.textContent=e.name,this._uploadPreviewEl.appendChild(t);let i=document.createElement("button");i.className="airpilot-upload-preview-remove",i.setAttribute("type","button"),i.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',i.addEventListener("click",()=>this._clearFilePreview()),this._uploadPreviewEl.appendChild(i)}_clearFilePreview(){this._pendingFile=null,this._uploadPreviewEl&&(this._uploadPreviewEl.innerHTML="",this._uploadPreviewEl.style.display="none")}_showFileError(e){if(!this._uploadPreviewEl)return;this._uploadPreviewEl.innerHTML="",this._uploadPreviewEl.style.display="",this._uploadPreviewEl.className="airpilot-upload-preview";let t=document.createElement("span");t.style.color="var(--airpilot-error)",t.style.fontSize="13px",t.textContent=e,this._uploadPreviewEl.appendChild(t),setTimeout(()=>this._clearFilePreview(),3e3)}};var ja='<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',ft=class{constructor(e){this._onEscalate=e.onEscalate,this._onCancel=e.onCancel,this._enabled=e.enabled!==!1,this._el=null,this._state="idle",this._timer=null,this._remainingSeconds=0,this._timerDisplayEl=null,this._textEl=null,this._actionEl=null}render(){return this._el=document.createElement("div"),this._el.className="airpilot-escalation-bar airpilot-escalation-bar--hidden",this._textEl=document.createElement("span"),this._textEl.className="airpilot-escalation-text",this._el.appendChild(this._textEl),this._timerDisplayEl=document.createElement("span"),this._timerDisplayEl.className="airpilot-escalation-timer",this._el.appendChild(this._timerDisplayEl),this._actionEl=document.createElement("div"),this._el.appendChild(this._actionEl),this._el}renderButton(){let e=document.createElement("button");return e.className="airpilot-toolbar-btn",e.setAttribute("type","button"),e.setAttribute("title",m("escalation.request")),e.innerHTML=ja,e.addEventListener("click",()=>{this._state==="idle"&&this._onEscalate&&(this.setState("requesting"),this._onEscalate())}),this._requestBtn=e,e}setState(e,t){if(this._state=e,!!this._el)switch(clearInterval(this._timer),this._timer=null,e){case"idle":this._el.classList.add("airpilot-escalation-bar--hidden"),this._requestBtn&&(this._requestBtn.disabled=!1);break;case"requesting":this._el.classList.add("airpilot-escalation-bar--hidden"),this._requestBtn&&(this._requestBtn.disabled=!0);break;case"waiting":this._el.classList.remove("airpilot-escalation-bar--hidden"),this._textEl.textContent=m("escalation.waiting"),this._requestBtn&&(this._requestBtn.disabled=!0),this._remainingSeconds=t&&t.estimatedWaitSeconds||300,this._updateTimerDisplay(),this._timer=setInterval(()=>{this._remainingSeconds=Math.max(0,this._remainingSeconds-1),this._updateTimerDisplay()},1e3),this._actionEl.innerHTML="";let i=document.createElement("button");i.className="airpilot-escalation-cancel",i.textContent=m("escalation.cancel"),i.addEventListener("click",()=>{this._onCancel&&this._onCancel(),this.setState("idle")}),this._actionEl.appendChild(i);break;case"connected":this._el.classList.remove("airpilot-escalation-bar--hidden"),this._textEl.textContent=m("escalation.connected"),this._timerDisplayEl.textContent="",this._actionEl.innerHTML="",this._requestBtn&&(this._requestBtn.disabled=!0);break;case"ended":this._el.classList.remove("airpilot-escalation-bar--hidden"),this._textEl.textContent=m("escalation.ended"),this._timerDisplayEl.textContent="",this._actionEl.innerHTML="",this._requestBtn&&(this._requestBtn.disabled=!1),setTimeout(()=>{this._state==="ended"&&this.setState("idle")},5e3);break}}getState(){return this._state}getElement(){return this._el}isEnabled(){return this._enabled}destroy(){clearInterval(this._timer),this._timer=null}_updateTimerDisplay(){if(!this._timerDisplayEl)return;let e=Math.floor(this._remainingSeconds/60),t=this._remainingSeconds%60,i=`${e}:${String(t).padStart(2,"0")}`;this._timerDisplayEl.textContent=m("escalation.countdown",{time:i})}};var Ua='<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',Vn='<svg viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>',bt=class{constructor(e){this._onSubmit=e.onSubmit,this._onSkip=e.onSkip,this._el=null,this._rating=0,this._hoverRating=0,this._submitted=!1,this._starButtons=[]}render(){this._el=document.createElement("div"),this._el.className="airpilot-survey airpilot-survey--hidden";let e=document.createElement("div");e.className="airpilot-survey-title",e.textContent=m("survey.title"),this._el.appendChild(e);let t=document.createElement("div");t.className="airpilot-survey-stars";for(let a=1;a<=5;a++){let l=document.createElement("button");l.className="airpilot-survey-star",l.setAttribute("type","button"),l.setAttribute("aria-label",`${a} ${m(`survey.stars.${a}`)}`),l.innerHTML=Vn,l.addEventListener("mouseenter",()=>{this._hoverRating=a,this._updateStars()}),l.addEventListener("mouseleave",()=>{this._hoverRating=0,this._updateStars()}),l.addEventListener("click",()=>{this._rating=a,this._hoverRating=0,this._updateStars(),l.classList.add("airpilot-survey-star--pop")}),this._starButtons.push(l),t.appendChild(l)}this._el.appendChild(t),this._labelEl=document.createElement("div"),this._labelEl.className="airpilot-survey-label",this._el.appendChild(this._labelEl);let i=document.createElement("div");i.className="airpilot-survey-actions",this._submitBtn=document.createElement("button"),this._submitBtn.className="airpilot-survey-submit",this._submitBtn.setAttribute("type","button"),this._submitBtn.textContent=m("survey.submit"),this._submitBtn.disabled=!0,this._submitBtn.addEventListener("click",()=>this._submit()),i.appendChild(this._submitBtn);let r=document.createElement("button");return r.className="airpilot-survey-skip",r.setAttribute("type","button"),r.textContent=m("survey.skip"),r.addEventListener("click",()=>{this.hide(),this._onSkip&&this._onSkip()}),i.appendChild(r),this._el.appendChild(i),this._thanksEl=document.createElement("div"),this._thanksEl.className="airpilot-survey-thanks",this._thanksEl.style.display="none",this._thanksEl.textContent=m("survey.thanks"),this._el.appendChild(this._thanksEl),this._el}show(){this._submitted||this._el&&this._el.classList.remove("airpilot-survey--hidden")}hide(){this._el&&this._el.classList.add("airpilot-survey--hidden")}isVisible(){return this._el?!this._el.classList.contains("airpilot-survey--hidden"):!1}getElement(){return this._el}_updateStars(){let e=this._hoverRating||this._rating;for(let t=0;t<5;t++){let i=this._starButtons[t],r=t<e;i.innerHTML=r?Ua:Vn,i.classList.toggle("airpilot-survey-star--active",t<this._rating&&!this._hoverRating),i.classList.toggle("airpilot-survey-star--hover",this._hoverRating>0&&t<this._hoverRating)}e>0?this._labelEl.textContent=m(`survey.stars.${e}`):this._labelEl.textContent="",this._submitBtn&&(this._submitBtn.disabled=this._rating===0)}_submit(){if(this._rating===0||this._submitted)return;this._submitted=!0,this._onSubmit&&this._onSubmit(this._rating);let e=this._el.querySelector(".airpilot-survey-stars"),t=this._el.querySelector(".airpilot-survey-actions"),i=this._el.querySelector(".airpilot-survey-title");e&&(e.style.display="none"),t&&(t.style.display="none"),i&&(i.style.display="none"),this._labelEl&&(this._labelEl.style.display="none"),this._thanksEl&&(this._thanksEl.style.display=""),setTimeout(()=>this.hide(),3e3)}};var qa={active:1e3,idle:3e3,background:7e3,inactive:0},Ga=3e4,_t=class{constructor(){this._state="inactive",this._timer=null,this._conversationId=null,this._onUpdate=null,this._onError=null,this._abortController=null,this._activeTimeout=null,this._polling=!1,this._lastPollTime=0}init(e){this._conversationId=e.conversationId,this._onUpdate=e.onUpdate,this._onError=e.onError||(()=>{})}setConversationId(e){this._conversationId=e}setActive(){this._setState("active"),clearTimeout(this._activeTimeout),this._activeTimeout=setTimeout(()=>{this._state==="active"&&this._setState("idle")},Ga)}setIdle(){clearTimeout(this._activeTimeout),this._setState("idle")}setBackground(){clearTimeout(this._activeTimeout),this._setState("background")}stop(){clearTimeout(this._activeTimeout),this._setState("inactive")}getState(){return this._state}async pollNow(){await this._poll()}_setState(e){this._state!==e&&(this._state=e,this._restartTimer())}_restartTimer(){clearInterval(this._timer),this._timer=null,this._abortController&&(this._abortController.abort(),this._abortController=null);let e=qa[this._state];e>0&&this._conversationId&&(this._poll(),this._timer=setInterval(()=>this._poll(),e))}async _poll(){if(!this._polling&&this._conversationId){this._polling=!0,this._abortController=new AbortController;try{let e=await rn(this._conversationId,{signal:this._abortController.signal});this._lastPollTime=Date.now(),this._onUpdate&&this._onUpdate(e)}catch(e){e.name!=="AbortError"&&this._onError&&this._onError(e)}finally{this._polling=!1,this._abortController=null}}}destroy(){this.stop(),this._abortController&&this._abortController.abort()}};var Wa='<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',Ya='<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',xt=class{constructor(e){this._options=e,this._el=null,this._visible=!1,this._conversationId=null,this._connectionStatus="connected",this._sending=!1,this._serverMessageCount=0,this._historySyncing=!1,this._messageList=null,this._inputArea=null,this._escalation=null,this._survey=null,this._polling=new _t,this._cleanupKeyboard=null}render(){return this._el=document.createElement("div"),this._el.className="airpilot-panel airpilot-panel--hidden",this._el.setAttribute("role","dialog"),this._el.setAttribute("aria-label",this._options.widgetName||m("widget.title")),this._el.appendChild(this._renderHeader()),this._messageList=new ht({aiNickname:this._options.aiNickname||"AI"}),this._el.appendChild(this._messageList.render()),this._escalation=new ft({enabled:this._options.enableEscalation!==!1,onEscalate:()=>this._handleEscalate(),onCancel:()=>{}}),this._el.appendChild(this._escalation.render()),this._survey=new bt({onSubmit:e=>this._handleRating(e),onSkip:()=>{}}),this._el.appendChild(this._survey.render()),this._inputArea=new gt({onSend:e=>this._handleSend(e),onAttach:e=>this._handleAttach(e),enableAttachments:this._options.enableAttachments!==!1,enableEmoji:!0,escalationButton:this._escalation.isEnabled()?this._escalation.renderButton():null}),this._el.appendChild(this._inputArea.render()),this._inputArea.setupDragDrop(this._el),this._polling.init({conversationId:this._conversationId,onUpdate:e=>this._handlePollUpdate(e),onError:()=>this._setConnectionStatus("disconnected")}),this._el}show(){this._el&&(this._visible=!0,this._el.classList.remove("airpilot-panel--hidden"),this._el.classList.remove("airpilot-panel--closing"),this._el.classList.add("airpilot-panel--opening"),gi()&&(fi(!0),this._cleanupKeyboard=Gn(this._el,e=>{})),this._loadHistory(),this._polling.setIdle(),setTimeout(()=>this._inputArea.focus(),300))}hide(){this._el&&(this._visible=!1,this._el.classList.remove("airpilot-panel--opening"),this._el.classList.add("airpilot-panel--closing"),setTimeout(()=>{!this._visible&&this._el&&(this._el.classList.add("airpilot-panel--hidden"),this._el.classList.remove("airpilot-panel--closing"))},200),gi()&&fi(!1),this._cleanupKeyboard&&(this._cleanupKeyboard(),this._cleanupKeyboard=null),this._polling.stop())}minimize(){this.hide(),this._conversationId&&this._polling.setBackground()}isVisible(){return this._visible}setConversationId(e){this._conversationId=e,this._polling.setConversationId(e),this._options.userId&&ln(this._options.userId,e)}getElement(){return this._el}destroy(){this._polling.destroy(),this._escalation.destroy(),this._cleanupKeyboard&&this._cleanupKeyboard()}_renderHeader(){let e=document.createElement("div");e.className="airpilot-header";let t=document.createElement("div");t.className="airpilot-header-info";let i=document.createElement("div");i.className="airpilot-header-title",i.textContent=this._options.widgetName||m("widget.title"),t.appendChild(i),this._statusEl=document.createElement("div"),this._statusEl.className="airpilot-header-status",this._statusDot=document.createElement("span"),this._statusDot.className="airpilot-status-dot airpilot-status-dot--connected",this._statusEl.appendChild(this._statusDot),this._statusText=document.createElement("span"),this._statusText.textContent=m("widget.connected"),this._statusEl.appendChild(this._statusText),t.appendChild(this._statusEl),e.appendChild(t);let r=document.createElement("div");r.className="airpilot-header-actions";let a=document.createElement("button");a.className="airpilot-header-btn",a.setAttribute("type","button"),a.setAttribute("aria-label",m("widget.minimize")),a.innerHTML=Wa,a.addEventListener("click",()=>{this._options.onMinimize&&this._options.onMinimize()}),r.appendChild(a);let l=document.createElement("button");return l.className="airpilot-header-btn",l.setAttribute("type","button"),l.setAttribute("aria-label",m("widget.close")),l.innerHTML=Ya,l.addEventListener("click",()=>{this._options.onClose&&this._options.onClose()}),r.appendChild(l),e.appendChild(r),e}async _loadHistory(){if(!this._conversationId&&this._options.userId&&(this._conversationId=on(this._options.userId),this._conversationId&&this._polling.setConversationId(this._conversationId)),!!this._conversationId)try{this._setConnectionStatus("connecting"),await this._refreshHistory(),this._setConnectionStatus("connected")}catch(e){e.status===404?this._conversationId=null:this._setConnectionStatus("disconnected")}}async _handleSend(e){if(this._sending)return;this._sending=!0;let t={id:"local_"+Date.now(),role:"user",content:e,timestamp:new Date().toISOString()};this._messageList.addMessage(t),this._inputArea.clear(),this._inputArea.setDisabled(!0),this._messageList.setTyping(!0),this._polling.setActive();try{let i=await Ki(e,this._conversationId);(i.conversationId||i.conversation_id)&&this.setConversationId(i.conversationId||i.conversation_id),this._messageList.setTyping(!1),this._applyConversationStatus(i.status,i.status_label);try{await this._refreshHistory()}catch(r){if(typeof i.message=="string"&&i.message){let a={id:"ai_"+Date.now(),conversationId:this._conversationId,role:"ai",content:i.message,senderName:this._options.aiNickname,timestamp:new Date().toISOString()};this._messageList.addMessage(a),this._options.onNewMessage&&this._options.onNewMessage(a)}}this._setConnectionStatus("connected")}catch(i){this._messageList.setTyping(!1),this._messageList.addMessage({id:"err_"+Date.now(),role:"system",content:m("error.sendFailed"),timestamp:new Date().toISOString()}),(i.status>=500||!i.status)&&this._setConnectionStatus("disconnected")}finally{this._sending=!1,this._inputArea.setDisabled(!1),this._inputArea.focus()}}async _handleAttach(e){try{this._messageList.addMessage({id:"upload_"+Date.now(),role:"system",content:m("attachment.uploading"),timestamp:new Date().toISOString()});let t=await Ji(e,this._conversationId);this._messageList.addMessage({id:"att_"+Date.now(),role:"user",content:"",timestamp:new Date().toISOString(),attachments:[{url:t.url,filename:t.filename||e.name,type:e.type}]})}catch(t){this._messageList.addMessage({id:"err_"+Date.now(),role:"system",content:m("error.uploadFailed"),timestamp:new Date().toISOString()})}}async _handleEscalate(){if(this._conversationId)try{let e=await tn(this._conversationId);this._escalation.setState("waiting",{estimatedWaitSeconds:e.estimated_wait||300})}catch(e){this._escalation.setState("idle"),this._messageList.addMessage({id:"err_"+Date.now(),role:"system",content:m("error.network"),timestamp:new Date().toISOString()})}}async _handleRating(e){if(this._conversationId)try{await nn(this._conversationId,e)}catch(t){}}_handlePollUpdate(e){this._setConnectionStatus("connected"),this._messageList.setTyping(!1),this._applyConversationStatus(e.status,e.status_label),typeof e.message_count=="number"&&e.message_count>this._serverMessageCount&&this._refreshHistory()}_setConnectionStatus(e){if(this._connectionStatus=e,!(!this._statusDot||!this._statusText))switch(this._statusDot.className="airpilot-status-dot airpilot-status-dot--"+e,e){case"connected":this._statusText.textContent=m("widget.connected");break;case"connecting":this._statusText.textContent=m("widget.connecting");break;case"disconnected":this._statusText.textContent=m("widget.disconnected");break}}async _refreshHistory(){if(!(this._historySyncing||!this._conversationId)){this._historySyncing=!0;try{let e=await Qi(this._conversationId),t=e.conversationId||e.conversation_id||this._conversationId;t&&this.setConversationId(t);let i=Array.isArray(e.messages)?e.messages.map(r=>this._normalizeMessage(r,t)):[];this._messageList.setMessages(i),this._serverMessageCount=i.length}finally{this._historySyncing=!1}}}_normalizeMessage(e,t){let i=(e.role||"assistant").toString(),r=i==="assistant"?"ai":i,a=[];return Array.isArray(e.attachments)&&a.push(...e.attachments),e.attachment_url&&a.push({url:e.attachment_url,filename:e.attachment_summary||"Attachment",type:"attachment"}),{id:e.id,conversationId:t||this._conversationId,role:r,content:e.content||e.text||"",senderName:r==="admin"?m("escalation.connected"):this._options.aiNickname,timestamp:e.timestamp||e.created_at||new Date().toISOString(),attachments:a.length>0?a:void 0,feedback:e.feedback||null}}_applyConversationStatus(e,t){let i=t||{0:"active",1:"human_support",2:"resolved",3:"waiting_human"}[e]||"active";if(i==="waiting_human"){this._escalation.setState("waiting",{estimatedWaitSeconds:300});return}if(i==="human_support"){this._escalation.setState("connected");return}if(i==="resolved"){this._escalation.setState("ended"),this._survey.isVisible()||this._survey.show();return}this._escalation.setState("idle")}};var de=!1,R=null,U=null,j=null,he=null,we=!1,C={},_i=0;function Va(){let n=document.createElement("style");n.setAttribute("data-airpilot","true"),n.textContent=qi+`
`+Gi+`
`+Wi,document.head.appendChild(n)}function Za(n){return n==="dark"?"dark":n==="light"?"light":(document.documentElement.getAttribute("data-theme")||document.body.getAttribute("data-theme"))==="dark"||document.documentElement.classList.contains("dark")||document.body.classList.contains("dark")||window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function Xa(n){let e=document.createElement("div");e.className="airpilot-guest-form";let t=document.createElement("div");t.className="airpilot-guest-title",t.textContent=m("guest.title"),e.appendChild(t);let i=document.createElement("div");i.className="airpilot-guest-field";let r=document.createElement("label");r.className="airpilot-guest-label",r.textContent=m("guest.name"),i.appendChild(r);let a=document.createElement("input");a.className="airpilot-guest-input",a.type="text",a.placeholder=m("guest.name"),i.appendChild(a);let l=document.createElement("div");l.className="airpilot-guest-error",i.appendChild(l),e.appendChild(i);let o=document.createElement("div");o.className="airpilot-guest-field";let u=document.createElement("label");u.className="airpilot-guest-label",u.textContent=m("guest.email"),o.appendChild(u);let c=document.createElement("input");c.className="airpilot-guest-input",c.type="email",c.placeholder=m("guest.email"),o.appendChild(c);let p=document.createElement("div");p.className="airpilot-guest-error",o.appendChild(p),e.appendChild(o);let x=document.createElement("button");return x.className="airpilot-guest-submit",x.type="button",x.textContent=m("guest.start"),x.addEventListener("click",()=>{let h=!0;l.textContent="",p.textContent="",a.classList.remove("airpilot-guest-input--error"),c.classList.remove("airpilot-guest-input--error");let k=a.value.trim(),b=c.value.trim();k||(l.textContent=m("guest.nameRequired"),a.classList.add("airpilot-guest-input--error"),h=!1),b?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b)||(p.textContent=m("guest.emailInvalid"),c.classList.add("airpilot-guest-input--error"),h=!1):(p.textContent=m("guest.emailRequired"),c.classList.add("airpilot-guest-input--error"),h=!1),h&&n({name:k,email:b,sessionId:pn()})}),e.appendChild(x),e}function Ka(n){if(de){console.warn("[AirPilot] Widget already initialized");return}C=Object.assign({apiBaseUrl:"/api/v1/user/ai-support",authToken:null,userId:null,locale:null,theme:"auto",widgetName:"AI Support",aiNickname:"AI",position:"bottom-right",enableAttachments:!1,enableEscalation:!0},n||{});let e=C.locale||Zi();Vi(e),et({apiBaseUrl:C.apiBaseUrl,authToken:C.authToken}),Va(),R=document.createElement("div"),R.className="airpilot-root",Za(C.theme)==="dark"&&R.classList.add("airpilot-root--dark"),C.position==="bottom-left"&&R.classList.add("airpilot-root--bottom-left"),C.theme==="auto"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",a=>{R&&R.classList.toggle("airpilot-root--dark",a.matches)}),U=new tt({onToggle:()=>Zn()}),R.appendChild(U.render());let i=!!(C.authToken||C.userId),r=Ut();j=new xt({widgetName:C.widgetName,aiNickname:C.aiNickname,enableAttachments:C.enableAttachments,enableEscalation:C.enableEscalation,userId:C.userId||(r?r.sessionId:null),onClose:()=>yt(),onMinimize:()=>Qa(),onNewMessage:a=>es(a)}),R.appendChild(j.render()),!i&&r&&($t(r),et({apiBaseUrl:C.apiBaseUrl,guestSession:r})),document.body.appendChild(R),de=!0,cn()&&xi()}function Zn(){we?yt():xi()}function xi(){let n=!!(C.authToken||C.userId),e=Ut();if(!n&&!e){Ja();return}we=!0,_i=0,U.setOpen(!0),U.setUnreadCount(0),j.show(),Le(!0)}function yt(){we=!1,U&&U.setOpen(!1),j&&j.hide(),Le(!1),Xn()}function Qa(){we=!1,U&&U.setOpen(!1),j&&j.minimize(),Le(!1)}function Ja(){if(he)return;we=!0,U.setOpen(!0);let n=document.createElement("div");n.className="airpilot-panel airpilot-panel--opening",n.style.display="flex";let e=document.createElement("div");e.className="airpilot-header";let t=document.createElement("div");t.className="airpilot-header-info";let i=document.createElement("div");i.className="airpilot-header-title",i.textContent=C.widgetName||m("widget.title"),t.appendChild(i),e.appendChild(t);let r=document.createElement("div");r.className="airpilot-header-actions";let a=document.createElement("button");a.className="airpilot-header-btn",a.setAttribute("type","button"),a.setAttribute("aria-label",m("widget.close")),a.innerHTML='<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>',a.addEventListener("click",()=>yt()),r.appendChild(a),e.appendChild(r),n.appendChild(e);let l=Xa(o=>{sn(o),$t(o),et({apiBaseUrl:C.apiBaseUrl,guestSession:o}),Xn(),j.setConversationId(null),j.show(),Le(!0)});n.appendChild(l),he=n,R.appendChild(he)}function Xn(){he&&R&&R.contains(he)&&(R.removeChild(he),he=null)}function es(n){(!we||j&&!j.isVisible())&&(_i++,U&&(U.setUnreadCount(_i),U.pulse()))}var Kn={init:Ka,open(){de&&xi()},close(){de&&yt()},toggle(){de&&Zn()},destroy(){if(!de)return;j&&j.destroy(),R&&R.parentNode&&R.parentNode.removeChild(R);let n=document.querySelector("style[data-airpilot]");n&&n.parentNode&&n.parentNode.removeChild(n),de=!1,R=null,U=null,j=null}};window.AirPilot=Kn;var ts=Kn;return xr(is);})();
/*! Bundled license information:

dompurify/dist/purify.es.mjs:
  (*! @license DOMPurify 3.3.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.1/LICENSE *)
*/
