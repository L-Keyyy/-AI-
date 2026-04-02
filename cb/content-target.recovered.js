// content-target.js

// === SVG Assets (Lucide Style) ===
const ICONS = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
  collapse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3a7 7 0 1 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>',
  avatar: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#fff" stroke="#EAEAEA" stroke-width="2"/><path d="M20 50 Q50 30 80 50" fill="none" stroke="#000" stroke-width="4"/><path d="M50 50 L45 70 L55 70" fill="none" stroke="#000" stroke-width="4"/><circle cx="40" cy="60" r="3" fill="#000"/><circle cx="60" cy="60" r="3" fill="#000"/><path d="M25 40 Q50 10 75 40 Z" fill="#ff4d4f" stroke="#000" stroke-width="2"/><rect x="40" y="25" width="20" height="8" fill="#ffd591" rx="4"/></svg>'
};

// === Shadow DOM Host Setup ===
// Remove any existing host if we are reloading
const existingHost = document.getElementById('gemini-notion-vibe-host');
if (existingHost) existingHost.remove();

const host = document.createElement('div');
host.id = 'gemini-notion-vibe-host';
// Set host to cover entire viewport but allow clicks to pass through to the underlying page
Object.assign(host.style, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  zIndex: '2147483647',
});
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: 'open' });

// === CSS Injection ===
const style = document.createElement('style');
style.textContent = `
  :host {
    --bg-color: #ffffff;
    --surface-color: #ffffff;
    --hover-color: #F7F7F5;
    --border-color: #EAEAEA;
    --text-main: #24292e;
    --text-muted: #8b8e91;
    --text-faint: #b0b0b0;
    --title-color: #000000;
    --border-radius: 12px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --card-shadow: 0 2px 6px rgba(0,0,0,0.02);
    --blue-badge: #e1f0ff;
    --blue-text: #0066cc;
    --message-user-bg: #F7F7F5;
    --send-hover-color: #e0e0e0;
    --save-btn-bg: #24292e;
    --save-btn-hover-bg: #000000;
  }
  :host([data-theme="dark"]) {
    --bg-color: #11151a;
    --surface-color: #171d24;
    --hover-color: #232b35;
    --border-color: #313c49;
    --text-main: #edf2f7;
    --text-muted: #97a3b2;
    --text-faint: #7f8b99;
    --title-color: #ffffff;
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    --card-shadow: 0 8px 24px rgba(0,0,0,0.25);
    --blue-badge: #20354c;
    --blue-text: #8fc8ff;
    --message-user-bg: #273240;
    --send-hover-color: #2b3643;
    --save-btn-bg: #edf2f7;
    --save-btn-hover-bg: #cfd8e3;
  }
  * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  
  /* Floating Ball */
  .floating-ball {
    position: absolute;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--surface-color);
    box-shadow: var(--shadow);
    cursor: grab;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid var(--border-color);
  }
  .floating-ball:active { cursor: grabbing; transform: scale(0.95); }
  .floating-ball svg { width: 36px; height: 36px; }

  /* Sidebar Container */
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background: var(--bg-color);
    border-left: 1px solid var(--border-color);
    box-shadow: -4px 0 24px rgba(0,0,0,0.05);
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    color: var(--text-main);
  }
  .sidebar.open { transform: translateX(0); }

  /* Resize Handle */
  .resize-handle {
    position: absolute;
    left: -3px;
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    z-index: 10;
  }

  /* Header */
  .header {
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }
  .header-title { font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 4px; cursor: pointer; }
  .header-title svg { width: 14px; height: 14px; color: var(--text-muted); }
  .header-actions { display: flex; gap: 4px; }
  .icon-btn { 
    width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; 
    cursor: pointer; color: var(--text-muted); background: transparent; border: none; padding: 0;
  }
  .icon-btn:hover { background-color: var(--hover-color); color: var(--text-main); }
  .icon-btn svg { width: 16px; height: 16px; stroke-width: 1.5; }

  /* Main Content */
  .chat-area { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
  
  /* Scrollbar hiding for webkit but still scrollable */
  .chat-area::-webkit-scrollbar { width: 6px; }
  .chat-area::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; }
  .chat-area:hover::-webkit-scrollbar-thumb { background: #e0e0e0; }

  .welcome-state { display: flex; flex-direction: column; gap: 16px; }
  .avatar-large { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: -4px;}
  .avatar-large svg { width: 64px; height: 64px; }
  .welcome-title { font-size: 20px; font-weight: 600; margin: 0; color: var(--title-color); }
  .welcome-title span { font-weight: 400; color: var(--text-main); }
  .welcome-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
  
  .feature-list { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .feature-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 14px; border: 1px solid transparent; transition: background-color 0.2s, border-color 0.2s, color 0.2s; }
  .feature-item:hover { background-color: var(--hover-color); }
  .feature-item.active { background-color: var(--hover-color); border-color: var(--border-color); }
  .feature-icon { color: var(--text-main); display: flex; }
  .feature-icon svg { width: 18px; height: 18px; stroke-width: 1.5; }
  .badge-new { font-size: 10px; background-color: var(--blue-badge); color: var(--blue-text); padding: 2px 6px; border-radius: 10px; margin-left: auto; }

  /* Messages */
  .message-wrapper { display: flex; flex-direction: column; gap: 8px; }
  .message { font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; color: var(--text-main); }
  .message-user { background: var(--message-user-bg); padding: 12px 16px; border-radius: 12px; align-self: flex-end; max-width: 90%; }
  .message-ai { padding: 4px 0; align-self: flex-start; max-width: 100%; display: flex; gap: 12px;}
  .message-ai-avatar { width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px; }
  .message-ai-avatar svg { width: 100%; height: 100%; }
  .message-ai-content { flex: 1; min-width: 0; white-space: normal; }
  .message-ai-content > *:first-child { margin-top: 0; }
  .message-ai-content > *:last-child { margin-bottom: 0; }
  .message-ai-content p,
  .message-ai-content ul,
  .message-ai-content ol,
  .message-ai-content pre,
  .message-ai-content blockquote,
  .message-ai-content h1,
  .message-ai-content h2,
  .message-ai-content h3,
  .message-ai-content h4 { margin: 0 0 12px; }
  .message-ai-content ul,
  .message-ai-content ol { padding-left: 20px; }
  .message-ai-content li + li { margin-top: 4px; }
  .message-ai-content a { color: var(--blue-text); text-decoration: none; }
  .message-ai-content a:hover { text-decoration: underline; }
  .message-ai-content code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    background: var(--hover-color);
    padding: 1px 4px;
    border-radius: 4px;
  }
  .message-ai-content pre {
    overflow-x: auto;
    background: var(--hover-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 12px;
    white-space: pre-wrap;
  }
  .message-ai-content pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 12px;
  }
  .message-ai-content blockquote {
    padding-left: 12px;
    border-left: 3px solid var(--border-color);
    color: var(--text-muted);
  }
  .loading-dots { display: flex; gap: 4px; align-items: center; height: 24px; }
  .loading-dots div { width: 6px; height: 6px; background: #ccc; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
  .loading-dots div:nth-child(1) { animation-delay: -0.32s; }
  .loading-dots div:nth-child(2) { animation-delay: -0.16s; }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

  /* Footer Input */
  .footer { padding: 16px; display: flex; flex-direction: column; gap: 12px; position: relative; }
  .input-container { border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 12px; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 8px; background: var(--surface-color); }
  .input-container:focus-within { border-color: #d0d0d0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  
  .composer-top-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .desktop-btn { align-self: flex-start; display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--border-color); background-color: var(--hover-color); font-size: 12px; color: var(--text-muted); cursor: pointer; appearance: none; font: inherit; }
  .desktop-btn svg { width: 14px; height: 14px; }
  
  .input-main { display: flex; gap: 8px; }
  
  textarea { flex: 1; border: none; outline: none; resize: none; min-height: 24px; max-height: 200px; font-size: 14px; padding: 4px 0; background: transparent; line-height: 1.5; color: var(--text-main); overflow-y: hidden; }
  textarea::placeholder { color: var(--text-faint); }
  
  .bottom-row { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .left-controls { display: flex; gap: 4px; }
  .right-controls { display: flex; align-items: center; gap: 8px; }
  
  .model-picker { position: relative; }
  .model-select { font-size: 12px; color: var(--text-main); display: flex; align-items: center; gap: 2px; cursor: pointer; padding: 4px 8px; border-radius: 4px; border: none; background: transparent; }
  .model-select:hover { background: var(--hover-color); }
  .model-select svg { width: 14px; height: 14px; color: var(--text-muted); }
  .model-menu {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    min-width: 108px;
    padding: 6px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--surface-color);
    box-shadow: var(--card-shadow);
    display: none;
    flex-direction: column;
    gap: 4px;
    z-index: 25;
  }
  .model-menu.open { display: flex; }
  .model-option {
    width: 100%;
    border: none;
    background: transparent;
    color: var(--text-main);
    text-align: left;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 12px;
    cursor: pointer;
  }
  .model-option:hover { background: var(--hover-color); }
  .model-option.active {
    background: var(--hover-color);
    color: var(--blue-text);
    font-weight: 600;
  }

  .send-btn { background: var(--hover-color); color: var(--text-main); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; padding: 0; transition: background 0.2s; }
  .send-btn:hover { background: var(--send-hover-color); }
  .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .send-btn svg { width: 14px; height: 14px; stroke-width: 2; }

  /* Settings Panel */
  .settings-panel {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    padding: 16px;
    display: none;
    flex-direction: column;
    gap: 12px;
    z-index: 20;
    margin-bottom: 12px;
  }
  .settings-panel.open { display: flex; }
  .settings-header { font-size: 14px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
  .settings-panel textarea { border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; min-height: 80px; font-size: 13px; font-family: inherit; resize: vertical; }
  .settings-panel textarea:focus { outline: none; border-color: #d0d0d0; }
  .save-btn { background: var(--save-btn-bg); color: var(--bg-color); border: none; border-radius: 6px; padding: 6px 12px; font-size: 13px; cursor: pointer; align-self: flex-end; font-weight: 500; }
  .save-btn:hover { background: var(--save-btn-hover-bg); }
  .header {
    position: relative;
  }
  .history-menu {
    position: absolute;
    top: 60px;
    left: 16px;
    right: 16px;
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--surface-color);
    box-shadow: var(--card-shadow);
    z-index: 30;
  }
  .history-menu.open {
    display: flex;
  }
  .history-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
  }
  .history-status {
    font-size: 12px;
    color: var(--text-muted);
  }
  .history-sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    border-radius: 8px;
    padding: 6px 10px;
    background: var(--hover-color);
    color: var(--text-main);
    cursor: pointer;
    font-size: 12px;
  }
  .history-sync-btn svg {
    width: 14px;
    height: 14px;
    stroke-width: 1.8;
  }
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 280px;
    overflow-y: auto;
  }
  .history-item {
    width: 100%;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 12px;
    background: var(--hover-color);
    color: var(--text-main);
    cursor: pointer;
    text-align: left;
  }
  .history-item:hover {
    border-color: var(--border-color);
  }
  .history-item.active {
    border-color: var(--blue-text);
  }
  .history-item-title {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }
  .history-item-meta {
    margin-top: 4px;
    font-size: 11px;
    color: var(--text-muted);
  }
`;
shadow.appendChild(style);

// === HTML Structure Injection ===
const container = document.createElement('div');
container.innerHTML = `
  <div class="floating-ball" id="drag-ball" style="top: 100px; right: 20px;">
    ${ICONS.avatar}
  </div>

  <div class="sidebar" id="sidebar">
    <div class="resize-handle" id="resize-handle"></div>
    
    <div class="header">
      <div class="header-title" id="new-chat-btn">新建 AI 对话 ${ICONS.chevronDown}</div>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle-btn" title="切换主题">${ICONS.moon}</button>
        <button class="icon-btn" id="history-toggle-btn" title="选择对话">${ICONS.list}</button>
        <button class="icon-btn" id="close-btn" title="折叠">${ICONS.collapse}</button>
      </div>
    </div>

    <div class="history-menu" id="history-menu">
      <div class="history-menu-header">
        <span>Gemini 对话历史</span>
        <button class="history-sync-btn" id="sync-history-btn">${ICONS.refresh} 同步</button>
      </div>
      <div class="history-status" id="history-status">点击同步读取 Gemini 的历史会话�?/div>
      <div class="history-list" id="history-list"></div>
    </div>

    <div class="chat-area" id="chat-area">
      <div class="welcome-state" id="welcome-state">
        <div class="avatar-large">${ICONS.avatar}</div>
        <h2 class="welcome-title">你更优的 <span>AI笔记助手</span></h2>
        <p class="welcome-subtitle">我可以做这些事情，你也可以问我任何问题！</p>
        <div class="feature-list">
          <div class="feature-item" id="feature-summarize"><span class="feature-icon">${ICONS.list}</span>总结此页�?/div>
          <div class="feature-item" id="feature-dark-mode"><span class="feature-icon">${ICONS.moon}</span>更改至暗色模�?/div>
          <div class="feature-item" id="feature-note-mode"><span class="feature-icon">${ICONS.note}</span>笔记输入模式</div>
          <div class="feature-item" id="feature-ai-mode"><span class="feature-icon">${ICONS.sparkles}</span>AI输出模式</div>
        </div>
      </div>
      <!-- Messages will be appended here -->
    </div>

    <div class="footer">
      <div class="settings-panel" id="settings-panel">
        <div class="settings-header">
          <span>系统提示�?(System Prompt)</span>
          <button class="icon-btn" id="close-settings" style="width: 24px; height: 24px;">�?/button>
        </div>
        <textarea id="system-prompt-input" placeholder="例如：你是一个专业的前端开发工程师，请用中文简短回答�?></textarea>
        <button class="save-btn" id="save-settings-btn">保存配置</button>
      </div>

      <div class="input-container">
        <div class="composer-top-row">
          <button class="desktop-btn" id="mode-toggle-btn" type="button">${ICONS.document} AI输出模式</button>
          <button class="desktop-btn" id="quick-summarize-btn" type="button">${ICONS.list} 总结整页</button>
        </div>
        
        <div class="input-main">
          <textarea id="chat-input" placeholder="使用 AI 处理各种任务..." rows="1"></textarea>
        </div>
        
        <div class="bottom-row">
          <div class="left-controls">
            <button class="icon-btn" title="添加附件">${ICONS.plus}</button>
            <button class="icon-btn" id="open-settings-btn" title="设置">${ICONS.settings}</button>
          </div>
          <div class="right-controls">
            <div class="model-picker">`n              <button class="model-select" id="model-select-btn" type="button">���� ${ICONS.chevronDown}</button>`n              <div class="model-menu" id="model-menu">`n                <button class="model-option" id="model-option-doubao" data-model="doubao" type="button">����</button>`n                <button class="model-option" id="model-option-gemini" data-model="gemini" type="button">Gemini</button>`n              </div>`n            </div>
            <button class="icon-btn" title="语音输入">${ICONS.mic}</button>
            <button class="send-btn" id="send-btn">${ICONS.send}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;
shadow.appendChild(container);

// === Element References ===
const ball = shadow.getElementById('drag-ball');
const sidebar = shadow.getElementById('sidebar');
const resizeHandle = shadow.getElementById('resize-handle');
const closeBtn = shadow.getElementById('close-btn');
const newChatBtn = shadow.getElementById('new-chat-btn');
const themeToggleBtn = shadow.getElementById('theme-toggle-btn');
const historyToggleBtn = shadow.getElementById('history-toggle-btn');
const historyMenu = shadow.getElementById('history-menu');
const syncHistoryBtn = shadow.getElementById('sync-history-btn');
const historyStatus = shadow.getElementById('history-status');
const historyList = shadow.getElementById('history-list');
const chatArea = shadow.getElementById('chat-area');
const welcomeState = shadow.getElementById('welcome-state');
const chatInput = shadow.getElementById('chat-input');
const sendBtn = shadow.getElementById('send-btn');
const settingsPanel = shadow.getElementById('settings-panel');
const openSettingsBtn = shadow.getElementById('open-settings-btn');
const closeSettingsBtn = shadow.getElementById('close-settings');
const saveSettingsBtn = shadow.getElementById('save-settings-btn');
const systemPromptInput = shadow.getElementById('system-prompt-input');
const modeToggleBtn = shadow.getElementById('mode-toggle-btn');
const quickSummarizeBtn = shadow.getElementById('quick-summarize-btn');
const summarizeFeature = shadow.getElementById('feature-summarize');
const darkModeFeature = shadow.getElementById('feature-dark-mode');
const noteModeFeature = shadow.getElementById('feature-note-mode');
const aiModeFeature = shadow.getElementById('feature-ai-mode');

// === State Management ===
let sidebarWidth = 350;
let systemPrompt = '';
let isAIGenerating = false;
let pendingRequestId = null;
const handledResponseIds = new Set();
const RESPONSE_STORAGE_PREFIX = 'gemini_response_';
const NOTES_STORAGE_KEY = 'savedNotes';
const INPUT_MODE_STORAGE_KEY = 'inputMode';
const THEME_MODE_STORAGE_KEY = 'themeMode';
let currentInputMode = 'ai';
let themeMode = 'light';
let savedNotes = [];
let historyItems = [];
let activeHistoryId = null;
let isHistoryMenuOpen = false;

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getResponseStorageKey(requestId) {
  return `${RESPONSE_STORAGE_PREFIX}${requestId}`;
}

function normalizeMessageText(text) {
  if (typeof text === 'string') return text;
  if (text === null || text === undefined) return '';
  return String(text);
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

async function requestGeminiAction(action, payload = {}) {
  const response = await sendRuntimeMessage({ action, ...payload });
  if (!response || response.success === false) {
    throw new Error((response && response.message) || 'Gemini 请求失败�?);
  }
  return response;
}

function consumeGeminiResponse(text, requestId) {
  if (requestId && pendingRequestId && requestId !== pendingRequestId) {
    console.warn("GitHub Content Script: Ignoring response for stale request", requestId);
    return false;
  }

  if (requestId && handledResponseIds.has(requestId)) {
    return true;
  }

  const finalText = normalizeMessageText(text) || 'Gemini 已返回结果，但扩展没有成功读取到可见文本�?;

  removeLoading();
  addMessage(finalText, 'ai');
  resetInputState();

  if (requestId) {
    handledResponseIds.add(requestId);
    chrome.storage.local.remove(getResponseStorageKey(requestId));
    setTimeout(() => handledResponseIds.delete(requestId), 30000);
  }

  pendingRequestId = null;
  return true;
}

function updateSendButtonState() {
  const hasText = chatInput.value.trim().length > 0;
  sendBtn.style.background = hasText ? 'var(--text-main)' : 'var(--hover-color)';
  sendBtn.style.color = hasText ? 'var(--bg-color)' : 'var(--text-main)';
}

function clearComposer() {
  chatInput.value = '';
  chatInput.style.height = 'auto';
  updateSendButtonState();
}

function updateModeUI() {
  const isNoteMode = currentInputMode === 'note';
  chatInput.placeholder = isNoteMode
    ? '输入内容后按回车，将保存为本地笔�?..'
    : '使用 AI 处理各种任务...';

  modeToggleBtn.innerHTML = `${ICONS.document} ${isNoteMode ? `笔记输入模式 · ${savedNotes.length}条` : 'AI输出模式'}`;
  modeToggleBtn.title = '点击切换输入模式';

  noteModeFeature.classList.toggle('active', isNoteMode);
  aiModeFeature.classList.toggle('active', !isNoteMode);
  darkModeFeature.classList.toggle('active', themeMode === 'dark');
}

function refreshUIState() {
  const isNoteMode = currentInputMode === 'note';
  chatInput.placeholder = isNoteMode
    ? '输入内容后按回车，将保存为本地笔�?..'
    : '使用 AI 处理当前页面任务...';

  modeToggleBtn.innerHTML = `${ICONS.document} ${isNoteMode ? `笔记输入模式 · ${savedNotes.length}条` : 'AI 输出模式'}`;
  modeToggleBtn.title = '点击切换输入模式';

  noteModeFeature.classList.toggle('active', isNoteMode);
  aiModeFeature.classList.toggle('active', !isNoteMode);
  darkModeFeature.classList.toggle('active', themeMode === 'dark');

  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = themeMode === 'dark' ? ICONS.sun : ICONS.moon;
    themeToggleBtn.title = themeMode === 'dark' ? '切换到亮色模�? : '切换到暗色模�?;
  }
}

function setInputMode(nextMode, persist = true) {
  currentInputMode = nextMode === 'note' ? 'note' : 'ai';
  refreshUIState();
  if (persist) {
    chrome.storage.local.set({ [INPUT_MODE_STORAGE_KEY]: currentInputMode });
  }
}

function setThemeMode(nextTheme, persist = true) {
  themeMode = nextTheme === 'dark' ? 'dark' : 'light';
  host.setAttribute('data-theme', themeMode);
  refreshUIState();
  updateSendButtonState();
  if (persist) {
    chrome.storage.local.set({ [THEME_MODE_STORAGE_KEY]: themeMode });
  }
}

function toggleThemeMode() {
  setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
}

function toggleInputMode() {
  setInputMode(currentInputMode === 'note' ? 'ai' : 'note');
}

function saveNoteEntry(text) {
  const note = {
    id: createRequestId(),
    text,
    pageTitle: document.title,
    pageUrl: location.href,
    createdAt: new Date().toISOString(),
  };

  savedNotes.unshift(note);
  savedNotes = savedNotes.slice(0, 200);
  chrome.storage.local.set({ [NOTES_STORAGE_KEY]: savedNotes });
  return note;
}

function handleNoteSave(text) {
  addMessage(text, 'user');
  clearComposer();
  saveNoteEntry(text);
  addMessage(`笔记已保存到本地，共 ${savedNotes.length} 条。`, 'ai');
  updateModeUI();
  chatInput.focus();
}

/* Legacy summary extraction removed. The summarize action now forwards only the current URL.
function getPageTextForSummary() {
  const pageText = normalizeMessageText(document.body ? document.body.innerText : '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return pageText.slice(0, MAX_SUMMARY_CHARS);
}

function buildPageSummaryPrompt() {
  const pageText = getPageTextForSummary();
  if (!pageText) return '';

  return [
    '请阅读并总结以下网页内容�?,
    '请输出：',
    '1. 页面核心主题',
    '2. 3-5 条关键信�?,
    '3. 可以继续追问的方�?,
    '',
    `页面标题�?{document.title}`,
    `页面链接�?{location.href}`,
    '',
    '网页正文�?,
    pageText,
  ].join('\n');
}

function handleLocalNoteSave(text) {
  addMessage(text, 'user');
  clearComposer();
  saveNoteEntry(text);
  addMessage(`笔记已保存到本地，共 ${savedNotes.length} 条。`, 'ai');
  refreshUIState();
  chatInput.focus();
}

function isElementVisibleForSummary(element) {
  if (!element) return false;
  const styles = window.getComputedStyle(element);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

const SUMMARY_NOISE_SELECTOR = [
  'script',
  'style',
  'noscript',
  'iframe',
  'canvas',
  'svg',
  'button',
  'input',
  'textarea',
  'select',
  'option',
  'label',
  'form',
  'nav',
  'header',
  'footer',
  'aside',
  'dialog',
  'menu',
  'details',
  'summary',
  '[role="button"]',
  '[role="navigation"]',
  '[role="menu"]',
  '[role="tab"]',
  '[role="banner"]',
  '[role="complementary"]',
  '[role="search"]',
  '[aria-hidden="true"]',
  '[hidden]'
].join(', ');

const SUMMARY_BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, figcaption, td, th';
const SUMMARY_NOISE_PATTERN = /(nav|menu|header|footer|aside|sidebar|toolbar|dialog|modal|popup|toast|tooltip|share|social|comment|breadcrumb|crumb|pagination|pager|cookie|consent|subscribe|signup|sign-up|login|register|advert|ads|sponsor|promo|recommend|related|rail|floating|sticky|drawer|overlay|mask|controls?|actions?|search|filter|tab|tabs|avatar|profile)/i;
const SUMMARY_SHORT_NOISE_PATTERN = /^(登录|注册|下一页|上一页|更多|菜单|搜索|分享|评论|点赞|收藏|关注|下载|打开|关闭|返回|展开|收起|提交|发送|复制|切换)$/;

function getSummaryElementMarker(element) {
  if (!element) return '';
  return normalizeMessageText([
    element.tagName,
    element.id,
    element.className,
    element.getAttribute && element.getAttribute('role'),
    element.getAttribute && element.getAttribute('aria-label'),
    element.getAttribute && element.getAttribute('data-testid'),
  ].filter(Boolean).join(' ')).toLowerCase();
}

function getSummaryElementText(element) {
  return normalizeMessageText(element ? (element.innerText || element.textContent || '') : '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSummaryLinkTextLength(element) {
  if (!element) return 0;
  return Array.from(element.querySelectorAll('a')).reduce((total, link) => {
    return total + getSummaryElementText(link).length;
  }, 0);
}

function isLikelyNoiseElement(element) {
  if (!element) return false;
  if (!isElementVisibleForSummary(element)) return true;
  if (element.matches && element.matches(SUMMARY_NOISE_SELECTOR)) return true;

  const marker = getSummaryElementMarker(element);
  if (SUMMARY_NOISE_PATTERN.test(marker)) return true;

  const text = getSummaryElementText(element);
  if (!text) return true;

  const linkRatio = getSummaryLinkTextLength(element) / Math.max(text.length, 1);
  const interactiveCount = element.querySelectorAll
    ? element.querySelectorAll('button, input, select, textarea, [role="button"], [contenteditable="true"]').length
    : 0;

  if (linkRatio > 0.55 && text.length < 1500) return true;
  if (interactiveCount >= 6 && text.length < 600) return true;

  return false;
}

function scoreSummaryRoot(element) {
  if (!element || !isElementVisibleForSummary(element)) return Number.NEGATIVE_INFINITY;
  if (element.matches && element.matches(SUMMARY_NOISE_SELECTOR)) return Number.NEGATIVE_INFINITY;

  const text = getSummaryElementText(element);
  if (text.length < 200) return Number.NEGATIVE_INFINITY;

  const marker = getSummaryElementMarker(element);
  let score = text.length;
  score += element.querySelectorAll('p').length * 90;
  score += element.querySelectorAll('h1, h2, h3').length * 140;
  score += Math.min(element.querySelectorAll('li').length, 20) * 24;
  score -= getSummaryLinkTextLength(element) * 1.4;
  score -= element.querySelectorAll('button, input, select, textarea, [role="button"]').length * 80;

  if (SUMMARY_NOISE_PATTERN.test(marker)) {
    score -= 800;
  }

  return score;
}

function findBestSummaryRoot() {
  const preferredRoots = [
    document.querySelector('article'),
    document.querySelector('[itemprop="articleBody"]'),
    document.querySelector('main article'),
    document.querySelector('main'),
    document.querySelector('[role="main"]'),
    document.querySelector('.article-content, .post-content, .entry-content, .content, #content, .main, #main'),
  ].filter(Boolean);

  let bestRoot = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  preferredRoots.forEach((element) => {
    const score = scoreSummaryRoot(element);
    if (score > bestScore) {
      bestRoot = element;
      bestScore = score;
    }
  });

  if (bestScore >= 600) {
    return bestRoot;
  }

  const candidates = Array.from(document.body.querySelectorAll('article, main, [role="main"], section, div')).slice(0, 400);
  candidates.forEach((element) => {
    const score = scoreSummaryRoot(element);
    if (score > bestScore) {
      bestRoot = element;
      bestScore = score;
    }
  });

  return bestRoot || document.body;
}

function formatSummaryBlock(element, text) {
  if (!text) return '';
  if (element.matches('h1')) return `# ${text}`;
  if (element.matches('h2')) return `## ${text}`;
  if (element.matches('h3')) return `### ${text}`;
  if (element.matches('li')) return `- ${text}`;
  return text;
}

function shouldKeepSummaryBlock(element, text) {
  if (!element || !text) return false;
  if (shouldExcludeSummaryNode(element)) return false;
  if (SUMMARY_SHORT_NOISE_PATTERN.test(text)) return false;

  const isHeading = element.matches('h1, h2, h3, h4, h5, h6');
  const minLength = isHeading ? 4 : 12;
  if (text.length < minLength) return false;

  const linkRatio = getSummaryLinkTextLength(element) / Math.max(text.length, 1);
  if (linkRatio > 0.45) return false;

  const interactiveCount = element.querySelectorAll('button, input, select, textarea, [role="button"]').length;
  if (interactiveCount > 0 && text.length < 160) return false;

  return true;
}

function shouldExcludeSummaryNode(element) {
  let current = element;
  while (current && current !== document.body) {
    if (isLikelyNoiseElement(current)) return true;
    current = current.parentElement;
  }
  return false;
}

function extractReadablePageText() {
  const root = findBestSummaryRoot();
  const blocks = Array.from(root.querySelectorAll(SUMMARY_BLOCK_SELECTOR));
  const lines = [];
  const seen = new Set();
  let totalLength = 0;

  blocks.forEach((block) => {
    if (totalLength >= MAX_SUMMARY_CHARS) return;

    const text = getSummaryElementText(block);
    if (!shouldKeepSummaryBlock(block, text)) return;

    const formatted = formatSummaryBlock(block, text);
    if (!formatted || seen.has(formatted)) return;

    seen.add(formatted);
    lines.push(formatted);
    totalLength += formatted.length + 1;
  });

  if (!lines.length) {
    const fallbackWalker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const value = normalizeMessageText(node.textContent).replace(/\s+/g, ' ').trim();
          if (!value || value.length < 12) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.parentElement || shouldExcludeSummaryNode(node.parentElement)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode = fallbackWalker.nextNode();
    while (currentNode) {
      const value = normalizeMessageText(currentNode.textContent).replace(/\s+/g, ' ').trim();
      if (value && !seen.has(value)) {
        seen.add(value);
        lines.push(value);
        totalLength += value.length + 1;
        if (totalLength >= MAX_SUMMARY_CHARS) break;
      }
      currentNode = fallbackWalker.nextNode();
    }
  }

  return lines.join('\n');
}

function buildCleanPageSummaryPromptLegacy() {
  const pageText = extractReadablePageText().slice(0, MAX_SUMMARY_CHARS).trim();
  if (!pageText) return '';

  return [
    '请阅读并总结以下网页正文�?,
    '请输出：',
    '1. 页面核心主题',
    '2. 3 �?5 条关键信�?,
    '3. 可以继续追问的方�?,
    '',
    `页面标题�?{document.title}`,
    `页面链接�?{location.href}`,
    '',
    '网页正文�?,
    pageText
  ].join('\n');
}

function buildCleanPageSummaryPrompt() {
  const pageText = extractReadablePageText().slice(0, MAX_SUMMARY_CHARS).trim();
  if (!pageText) return '';

  return [
    '请只依据下面提取出的网页正文进行总结，忽略导航、按钮、评论区、广告、相关推荐和页面控件�?,
    '请输出：',
    '1. 页面核心主题',
    '2. 3 �?5 条关键信�?,
    '3. 如果这是教程或文档，补充可执行步骤；如果是文章或新闻，补充结�?,
    '',
    `页面标题�?{document.title}`,
    `页面链接�?{location.href}`,
    '',
    '网页正文（已预处理）�?,
    pageText
  ].join('\n');
}

*/
function sendToGemini(displayText, finalPayload) {
  if (isAIGenerating) return;

  const requestId = createRequestId();

  addMessage(displayText, 'user');
  clearComposer();
  addMessage('', 'loading');

  isAIGenerating = true;
  pendingRequestId = requestId;
  sendBtn.disabled = true;
  chatInput.disabled = true;

  console.log("GitHub Content Script: Sending request to background", { payload: finalPayload, requestId });

  chrome.runtime.sendMessage({ action: 'ask_gemini', text: finalPayload, requestId }, (response) => {
    const error = chrome.runtime.lastError;
    if (error) {
      removeLoading();
      addMessage(`Error: ${error.message}`, 'ai');
      pendingRequestId = null;
      resetInputState();
      return;
    }

    console.log("GitHub Content Script: Received immediate response from background", response);
    if (response && response.success === false) {
      pendingRequestId = null;
      removeLoading();
      addMessage(`错误: ${response.message}`, 'ai');
      resetInputState();
    }
  });
}

function handleSummarizePage() {
  if (isAIGenerating) return;

  const summaryPrompt = buildCleanPageSummaryPrompt();
  if (!summaryPrompt) {
    addMessage('未能提取当前页面文本�?, 'ai');
    return;
  }

  sendToGemini('请总结当前页面', summaryPrompt);
}

function handleSummarizeCurrentPage() {
  if (isAIGenerating) return;

  const summaryPrompt = buildCleanPageSummaryPrompt();
  if (!summaryPrompt) {
    addMessage('未能提取当前页面正文�?, 'ai');
    return;
  }

  sendToGemini('请总结当前页面', summaryPrompt);
}

function setHistoryMenuOpen(nextOpen) {
  isHistoryMenuOpen = nextOpen;
  historyMenu.classList.toggle('open', nextOpen);
}

function renderHistoryList() {
  historyList.innerHTML = '';

  if (!historyItems.length) {
    historyStatus.textContent = '没有读取到可用的 Gemini 历史会话�?;
    return;
  }

  historyStatus.textContent = `已同�?${historyItems.length} �?Gemini 历史会话。`;

  historyItems.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-item';
    if (item.id === activeHistoryId) {
      button.classList.add('active');
    }
    button.innerHTML = `
      <div class="history-item-title">${item.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <div class="history-item-meta">${(item.url || item.id).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    `;
    button.addEventListener('click', () => openGeminiHistory(item));
    historyList.appendChild(button);
  });
}

async function syncGeminiHistory() {
  historyStatus.textContent = '正在同步 Gemini 历史会话...';
  historyList.innerHTML = '';

  try {
    const response = await requestGeminiAction('gemini_get_history');
    historyItems = Array.isArray(response.items) ? response.items : [];
    renderHistoryList();
  } catch (error) {
    historyItems = [];
    historyList.innerHTML = '';
    historyStatus.textContent = `同步失败�?{error.message}`;
  }
}

async function openGeminiHistory(item) {
  try {
    await requestGeminiAction('gemini_open_chat', {
      chatId: item.id,
      title: item.title,
      url: item.url,
    });
    activeHistoryId = item.id;
    renderHistoryList();
    setHistoryMenuOpen(false);
    chatArea.querySelectorAll('.message-wrapper').forEach((node) => node.remove());
    welcomeState.style.display = '';
    addMessage(`已切换到 Gemini 对话�?{item.title}`, 'ai');
  } catch (error) {
    addMessage(`错误�?{error.message}`, 'ai');
  }
}

async function handleNewGeminiChat() {
  try {
    await requestGeminiAction('gemini_new_chat');
    activeHistoryId = null;
    setHistoryMenuOpen(false);
    chatArea.querySelectorAll('.message-wrapper').forEach((node) => node.remove());
    welcomeState.style.display = '';
    addMessage('已在 Gemini 中新建对话�?, 'ai');
  } catch (error) {
    addMessage(`错误�?{error.message}`, 'ai');
  }
}

function toggleHistoryMenu() {
  const nextOpen = !isHistoryMenuOpen;
  setHistoryMenuOpen(nextOpen);
  if (nextOpen) {
    syncGeminiHistory();
  }
}

// Load persisted state from storage
chrome.storage.local.get(['ballPos', 'sidebarWidth', 'systemPrompt', NOTES_STORAGE_KEY, INPUT_MODE_STORAGE_KEY, THEME_MODE_STORAGE_KEY], (res) => {
  if (res.ballPos) {
    ball.style.left = res.ballPos.left;
    ball.style.top = res.ballPos.top;
    ball.style.right = 'auto'; // Reset right if left is used
  }
  if (res.sidebarWidth) {
    sidebarWidth = res.sidebarWidth;
    sidebar.style.width = `${sidebarWidth}px`;
  }
  if (res.systemPrompt) {
    systemPrompt = res.systemPrompt;
    systemPromptInput.value = systemPrompt;
  }
  if (Array.isArray(res[NOTES_STORAGE_KEY])) {
    savedNotes = res[NOTES_STORAGE_KEY];
  }
  if (res[INPUT_MODE_STORAGE_KEY]) {
    currentInputMode = res[INPUT_MODE_STORAGE_KEY];
  }
  if (res[THEME_MODE_STORAGE_KEY]) {
    themeMode = res[THEME_MODE_STORAGE_KEY];
  }

  setThemeMode(themeMode, false);
  setInputMode(currentInputMode, false);
  updateSendButtonState();
});

// === Floating Ball Drag & Drop ===
let isDraggingBall = false;
let ballDragStartX = 0;
let ballDragStartY = 0;
let ballInitialLeft = 0;
let ballInitialTop = 0;
let dragMoved = false;

ball.addEventListener('mousedown', (e) => {
  isDraggingBall = true;
  dragMoved = false;
  ballDragStartX = e.clientX;
  ballDragStartY = e.clientY;
  
  const rect = ball.getBoundingClientRect();
  ballInitialLeft = rect.left;
  ballInitialTop = rect.top;
  
  // Enforce left/top positioning during drag
  ball.style.left = `${ballInitialLeft}px`;
  ball.style.top = `${ballInitialTop}px`;
  ball.style.right = 'auto';
  
  e.preventDefault(); // prevent selection
});

document.addEventListener('mousemove', (e) => {
  if (!isDraggingBall) return;
  const dx = e.clientX - ballDragStartX;
  const dy = e.clientY - ballDragStartY;
  
  // Threshold to differentiate click vs drag
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    dragMoved = true;
  }
  
  let newLeft = ballInitialLeft + dx;
  let newTop = ballInitialTop + dy;
  
  // Boundary constraints
  newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 48));
  newTop = Math.max(0, Math.min(newTop, window.innerHeight - 48));
  
  ball.style.left = `${newLeft}px`;
  ball.style.top = `${newTop}px`;
});

document.addEventListener('mouseup', () => {
  if (isDraggingBall) {
    isDraggingBall = false;
    if (dragMoved) {
      chrome.storage.local.set({ ballPos: { left: ball.style.left, top: ball.style.top } });
    }
  }
});

// === Sidebar Toggle & Environment Squeeze ===
function toggleSidebar() {
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    document.body.style.marginRight = '0px';
  } else {
    sidebar.classList.add('open');
    // Ensure smooth transition for body margin
    document.body.style.transition = 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    document.body.style.marginRight = `${sidebarWidth}px`;
  }
}

ball.addEventListener('click', () => {
  if (!dragMoved) toggleSidebar();
});
closeBtn.addEventListener('click', toggleSidebar);

// === Sidebar Edge Resizing ===
let isResizing = false;

resizeHandle.addEventListener('mousedown', (e) => {
  isResizing = true;
  document.body.style.cursor = 'col-resize';
  
  // Transparent overlay to prevent iframes from stealing mouse events during resize
  const overlay = document.createElement('div');
  overlay.id = 'resize-overlay';
  Object.assign(overlay.style, { 
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
    zIndex: 999999, cursor: 'col-resize' 
  });
  document.body.appendChild(overlay);
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  
  // Width is measured from the right edge of the screen
  let newWidth = window.innerWidth - e.clientX;
  newWidth = Math.max(280, Math.min(newWidth, window.innerWidth * 0.8)); // bounds: [280px, 80vw]
  
  sidebarWidth = newWidth;
  sidebar.style.width = `${sidebarWidth}px`;
  
  if (sidebar.classList.contains('open')) {
    document.body.style.transition = 'none'; // Disable transition for real-time dragging
    document.body.style.marginRight = `${sidebarWidth}px`;
  }
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = 'default';
    
    const overlay = document.getElementById('resize-overlay');
    if (overlay) overlay.remove();
    
    chrome.storage.local.set({ sidebarWidth });
    
    if (sidebar.classList.contains('open')) {
      document.body.style.transition = 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  }
});

// === Settings Panel (System Prompt) ===
openSettingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('open'));
closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.remove('open'));

saveSettingsBtn.addEventListener('click', () => {
  systemPrompt = systemPromptInput.value.trim();
  chrome.storage.local.set({ systemPrompt }, () => {
    settingsPanel.classList.remove('open');
    const originalText = saveSettingsBtn.textContent;
    saveSettingsBtn.textContent = "已保�?�?;
    setTimeout(() => saveSettingsBtn.textContent = originalText, 2000);
  });
});

// === Textarea Auto-resize ===
chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = (this.scrollHeight) + 'px';
  updateSendButtonState();
});

function escapeHtml(text) {
  return normalizeMessageText(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkup(text) {
  let html = escapeHtml(text);
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  return html;
}

function renderAiMessage(text) {
  const normalized = normalizeMessageText(text).replace(/\r\n?/g, '\n');
  const codeBlocks = [];
  const prepared = normalized.replace(/```([\w-]*)\n?([\s\S]*?)```/g, (_, language, code) => {
    const index = codeBlocks.push({
      language: language || '',
      code: code.replace(/\n$/, ''),
    }) - 1;
    return `\n@@CODEBLOCK_${index}@@\n`;
  });

  const lines = prepared.split('\n');
  const htmlParts = [];
  let paragraphLines = [];
  let unorderedItems = [];
  let orderedItems = [];
  let quoteLines = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    htmlParts.push(`<p>${paragraphLines.map((line) => renderInlineMarkup(line)).join('<br>')}</p>`);
    paragraphLines = [];
  };

  const flushUnorderedList = () => {
    if (!unorderedItems.length) return;
    htmlParts.push(`<ul>${unorderedItems.map((item) => `<li>${renderInlineMarkup(item)}</li>`).join('')}</ul>`);
    unorderedItems = [];
  };

  const flushOrderedList = () => {
    if (!orderedItems.length) return;
    htmlParts.push(`<ol>${orderedItems.map((item) => `<li>${renderInlineMarkup(item)}</li>`).join('')}</ol>`);
    orderedItems = [];
  };

  const flushBlockquote = () => {
    if (!quoteLines.length) return;
    htmlParts.push(`<blockquote>${quoteLines.map((line) => renderInlineMarkup(line)).join('<br>')}</blockquote>`);
    quoteLines = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
    flushBlockquote();
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    const codeMatch = trimmed.match(/^@@CODEBLOCK_(\d+)@@$/);

    if (codeMatch) {
      flushAll();
      const block = codeBlocks[Number(codeMatch[1])];
      const languageClass = block.language ? ` class="language-${escapeHtml(block.language)}"` : '';
      htmlParts.push(`<pre><code${languageClass}>${escapeHtml(block.code)}</code></pre>`);
      return;
    }

    if (!trimmed) {
      flushAll();
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = Math.min(headingMatch[1].length, 4);
      htmlParts.push(`<h${level}>${renderInlineMarkup(headingMatch[2])}</h${level}>`);
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*+•]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushOrderedList();
      flushBlockquote();
      unorderedItems.push(unorderedMatch[1]);
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      flushUnorderedList();
      flushBlockquote();
      orderedItems.push(orderedMatch[1]);
      return;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      quoteLines.push(quoteMatch[1]);
      return;
    }

    paragraphLines.push(line);
  });

  flushAll();
  return htmlParts.join('') || `<p>${renderInlineMarkup(normalized).replace(/\n/g, '<br>')}</p>`;
}

function isNodeInsideExtension(node) {
  if (!node) return false;
  const root = node.getRootNode ? node.getRootNode() : null;
  return root === shadow || host.contains(node);
}

function extractSelectedText() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return '';

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentNode
    : range.commonAncestorContainer;

  if (isNodeInsideExtension(container)) return '';

  const fragment = range.cloneContents();
  const temp = document.createElement('div');
  Object.assign(temp.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    opacity: '0',
    pointerEvents: 'none',
    whiteSpace: 'pre-wrap',
    maxWidth: '960px',
  });
  temp.appendChild(fragment);
  document.body.appendChild(temp);

  const text = normalizeMessageText(temp.innerText || temp.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  temp.remove();
  return text;
}

function populateChatInputFromSelection(selectedText) {
  if (!selectedText || chatInput.disabled) return;

  const currentValue = chatInput.value.trim();
  const shouldReplaceCurrent = !currentValue ||
    currentValue === selectedText ||
    (currentValue.endsWith(selectedText) && currentValue.length <= selectedText.length + 32);

  chatInput.value = shouldReplaceCurrent
    ? selectedText
    : `${chatInput.value.trimEnd()}\n\n${selectedText}`;

  chatInput.dispatchEvent(new Event('input', { bubbles: true }));

  if (!sidebar.classList.contains('open')) {
    toggleSidebar();
  }

  chatInput.focus();
  chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
}

// === Highlight Text Capture ===
document.addEventListener('mouseup', () => {
  if (isDraggingBall || isResizing) return;
  const selectedText = window.getSelection().toString().trim();
  
  // If user selected text and sidebar is not open, prepopulate and open
  if (selectedText.length > 0 && !sidebar.classList.contains('open')) {
    chatInput.value = "请解释这段内容：\\n\\n" + selectedText;
    chatInput.dispatchEvent(new Event('input')); // trigger auto-resize
    toggleSidebar();
  }
});

document.addEventListener('mouseup', () => {
  if (isDraggingBall || isResizing) return;

  setTimeout(() => {
    const selectedText = extractSelectedText();
    if (!selectedText) return;
    populateChatInputFromSelection(selectedText);
  }, 0);
});

// === Messaging Logic ===
function addMessage(text, role) {
  if (welcomeState.style.display !== 'none') {
    welcomeState.style.display = 'none';
  }
  const safeText = normalizeMessageText(text);
  
  const msgWrapper = document.createElement('div');
  msgWrapper.className = 'message-wrapper';
  
  if (role === 'user') {
    msgWrapper.innerHTML = `<div class="message message-user">${escapeHtml(safeText).replace(/\n/g, '<br>')}</div>`;
  } else if (role === 'loading') {
    msgWrapper.innerHTML = `
      <div class="message message-ai" id="loading-bubble">
        <div class="message-ai-avatar">${ICONS.avatar}</div>
        <div class="message-ai-content">
          <div class="loading-dots"><div></div><div></div><div></div></div>
        </div>
      </div>
    `;
  } else {
    msgWrapper.innerHTML = `
      <div class="message message-ai">
        <div class="message-ai-avatar">${ICONS.avatar}</div>
        <div class="message-ai-content">${renderAiMessage(safeText)}</div>
      </div>
    `;
  }
  
  chatArea.appendChild(msgWrapper);
  
  // Smooth scroll to bottom
  setTimeout(() => {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
  }, 50);
  
  return msgWrapper;
}

function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;

  if (currentInputMode === 'note') {
    handleLocalNoteSave(text);
    return;
  }

  if (isAIGenerating) return;

  // 3. System Prompt Prepending Logic
  let finalPayload = text;
  if (systemPrompt) {
    finalPayload = `[系统设定: ${systemPrompt}]\n\n用户的提�? ${text}`;
  }

  return sendToGemini(text, finalPayload);
  console.log("GitHub Content Script: Sending request to background", { payload: finalPayload });
  
  // 4. Send to Background
  chrome.runtime.sendMessage({ action: 'ask_gemini', text: finalPayload, requestId }, (response) => {
    const error = chrome.runtime.lastError;
    if (error) {
      removeLoading();
      addMessage(`Error: ${error.message}`, 'ai');
      pendingRequestId = null;
      resetInputState();
      return;
    }

    console.log("GitHub Content Script: Received immediate response from background", response);
    // If there's an immediate error (e.g. Gemini tab not found), handle it
    if (response && response.success === false) {
      pendingRequestId = null;
      removeLoading();
      addMessage(`�?错误: ${response.message}`, 'ai');
      resetInputState();
    }
    // If successful, we wait for the 'show_response' message.
  });
}

function handleComposerSubmit() {
  const text = chatInput.value.trim();
  if (!text) return;

  if (currentInputMode === 'note') {
    handleLocalNoteSave(text);
    return;
  }

  if (isAIGenerating) return;

  let finalPayload = text;
  if (systemPrompt) {
    finalPayload = `[系统设定: ${systemPrompt}]\n\n用户的问�? ${text}`;
  }

  sendToGemini(text, finalPayload);
}

function removeLoading() {
  const loading = shadow.getElementById('loading-bubble');
  if (loading) loading.parentElement.remove();
}

function resetInputState() {
  isAIGenerating = false;
  sendBtn.disabled = false;
  chatInput.disabled = false;
  updateSendButtonState();
  chatInput.focus();
}

function buildCleanPageSummaryPrompt() {
  return location.href || '';
}

function handleSummarizePage() {
  handleSummarizeCurrentPage();
}

function handleSummarizeCurrentPage() {
  if (isAIGenerating) return;

  const summaryPrompt = buildCleanPageSummaryPrompt();
  if (!summaryPrompt) {
    addMessage('未能获取当前页面网址�?, 'ai');
    return;
  }

  sendToGemini('请总结当前页面', summaryPrompt);
}

modeToggleBtn.addEventListener('click', toggleInputMode);
quickSummarizeBtn.addEventListener('click', handleSummarizeCurrentPage);
newChatBtn.addEventListener('click', handleNewGeminiChat);
themeToggleBtn.addEventListener('click', toggleThemeMode);
historyToggleBtn.addEventListener('click', toggleHistoryMenu);
syncHistoryBtn.addEventListener('click', syncGeminiHistory);
summarizeFeature.addEventListener('click', handleSummarizeCurrentPage);
darkModeFeature.addEventListener('click', toggleThemeMode);
noteModeFeature.addEventListener('click', () => setInputMode('note'));
aiModeFeature.addEventListener('click', () => setInputMode('ai'));

sendBtn.addEventListener('click', handleComposerSubmit);

chatInput.addEventListener('keydown', (e) => {
  // Send on Enter (but allow Shift+Enter for new line)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleComposerSubmit();
  }
});

shadow.addEventListener('click', (event) => {
  if (!isHistoryMenuOpen) return;
  const path = event.composedPath();
  if (!path.includes(historyMenu) && !path.includes(historyToggleBtn)) {
    setHistoryMenuOpen(false);
  }
});

// 5. Receive Final Response from Background (routed from Gemini)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("GitHub Content Script: Received message", request);
  if (request.action === 'show_response') {
    const handled = consumeGeminiResponse(request.text, request.requestId);
    sendResponse({ success: handled });
    return true; // Keep message channel open for async
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !pendingRequestId) return;

  const responseKey = getResponseStorageKey(pendingRequestId);
  const change = changes[responseKey];
  if (!change || !change.newValue) return;

  console.log("GitHub Content Script: Received stored fallback response", change.newValue);
  consumeGeminiResponse(change.newValue.text, change.newValue.requestId);
});
