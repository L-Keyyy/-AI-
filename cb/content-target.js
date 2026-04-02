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
    --hover-color: #f7f7f5;
    --border-color: #EAEAEA;
    --text-main: #24292e;
    --text-muted: #8b8e91;
    --text-faint: #b0b0b0;
    --title-color: #000000;
    --border-radius: 12px;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --card-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    --blue-badge: #e1f0ff;
    --blue-text: #0066cc;
    --message-user-bg: #f7f7f5;
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
    --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    --blue-badge: #20354c;
    --blue-text: #8fc8ff;
    --message-user-bg: #273240;
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
  .avatar-large { width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; margin-bottom: -4px; }
  .avatar-large svg { width: 64px; height: 64px; }
  .welcome-title { font-size: 20px; font-weight: 600; margin: 0; color: var(--title-color); }
  .welcome-title span { font-weight: 400; color: var(--text-main); }
  .welcome-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
  
  .feature-list { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
  .feature-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 14px; border: 1px solid transparent; transition: background-color 0.2s, border-color 0.2s; }
  .feature-item:hover { background-color: var(--hover-color); }
  .feature-item.active { background-color: var(--hover-color); border-color: var(--border-color); }
  .feature-icon { color: var(--text-main); display: flex; }
  .feature-icon svg { width: 18px; height: 18px; stroke-width: 1.5; }
  .badge-new { font-size: 10px; background-color: var(--blue-badge); color: var(--blue-text); padding: 2px 6px; border-radius: 10px; margin-left: auto; }

  /* Messages */
  .message-wrapper { display: flex; flex-direction: column; gap: 8px; }
  .message { font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; color: var(--text-main); }
  .message-user { background: var(--message-user-bg); padding: 12px 16px; border-radius: 12px; align-self: flex-end; max-width: 90%; }
  .message-note {
    background: transparent;
    border: 1px dashed var(--border-color);
    border-radius: 12px;
    padding: 12px 16px;
    align-self: stretch;
    max-width: 100%;
  }
  .message-ai { padding: 4px 0; align-self: flex-start; max-width: 100%; display: flex; gap: 12px; }
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
  .message-ai-content h4,
  .message-ai-content hr { margin: 0 0 12px; }
  .message-ai-content h1,
  .message-ai-content h2,
  .message-ai-content h3,
  .message-ai-content h4 { line-height: 1.4; font-weight: 700; }
  .message-ai-content h1 { font-size: 22px; }
  .message-ai-content h2 { font-size: 19px; }
  .message-ai-content h3 { font-size: 17px; }
  .message-ai-content h4 { font-size: 15px; }
  .message-ai-content ul,
  .message-ai-content ol { padding-left: 22px; }
  .message-ai-content li + li { margin-top: 4px; }
  .message-ai-content a { color: var(--blue-text); text-decoration: none; }
  .message-ai-content a:hover { text-decoration: underline; }
  .message-ai-content strong { font-weight: 700; }
  .message-ai-content em { font-style: italic; }
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
  .message-ai-content hr {
    border: none;
    border-top: 1px solid var(--border-color);
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
    min-width: 120px;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    box-shadow: var(--shadow);
    padding: 6px;
    display: none;
    flex-direction: column;
    gap: 4px;
  }
  .model-menu.open { display: flex; }
  .model-option {
    border: none;
    background: transparent;
    color: var(--text-main);
    border-radius: 8px;
    padding: 8px 10px;
    text-align: left;
    cursor: pointer;
    font: inherit;
  }
  .model-option:hover,
  .model-option.active { background: var(--hover-color); }

  .send-btn { background: var(--hover-color); color: var(--text-main); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; padding: 0; transition: background 0.2s; }
  .send-btn:hover { background: #e0e0e0; }
  .send-btn.active { background: var(--text-main); color: var(--bg-color); }
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
      <div class="header-title" id="new-chat-btn">新建AI对话 ${ICONS.chevronDown}</div>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle-btn" title="切换主题">${ICONS.moon}</button>
        <button class="icon-btn" id="header-menu-btn" title="设置">${ICONS.panel}</button>
        <button class="icon-btn" id="close-btn" title="折叠">${ICONS.collapse}</button>
      </div>
    </div>

    <div class="chat-area" id="chat-area">
      <div class="welcome-state" id="welcome-state">
        <div class="avatar-large">${ICONS.avatar}</div>
        <h2 class="welcome-title">你更优的 <span>AI 笔记助手</span></h2>
        <p class="welcome-subtitle">可以总结页面、记录笔记，或者直接把问题发给选中的模型。</p>
        <div class="feature-list" id="feature-list">
          <div class="feature-item" id="feature-summarize"><span class="feature-icon">${ICONS.list}</span>总结整页</div>
          <div class="feature-item" id="feature-dark-mode"><span class="feature-icon">${ICONS.moon}</span>切换暗色模式</div>
          <div class="feature-item" id="feature-note-mode"><span class="feature-icon">${ICONS.note}</span>笔记输入模式</div>
          <div class="feature-item" id="feature-ai-mode"><span class="feature-icon">${ICONS.sparkles}</span>AI输出模式<span class="badge-new">默认</span></div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="settings-panel" id="settings-panel">
        <div class="settings-header">
          <span>系统提示词 (System Prompt)</span>
          <button class="icon-btn" id="close-settings" style="width: 24px; height: 24px;">✕</button>
        </div>
        <textarea id="system-prompt-input" placeholder="例如：你是一个专业的前端开发工程师，请用中文简短回答。"></textarea>
        <button class="save-btn" id="save-settings-btn">保存配置</button>
      </div>

      <div class="input-container">
        <div class="composer-top-row">
          <button class="desktop-btn" id="mode-toggle-btn" type="button">${ICONS.document} AI输出模式</button>
          <button class="desktop-btn" id="quick-summarize-btn" type="button">${ICONS.list} 总结整页</button>
        </div>
        
        <div class="input-main">
          <textarea id="chat-input" placeholder="使用 AI 处理当前页面任务..." rows="1"></textarea>
        </div>
        
        <div class="bottom-row">
          <div class="left-controls">
            <button class="icon-btn" title="添加附件">${ICONS.plus}</button>
            <button class="icon-btn" id="open-settings-btn" title="设置">${ICONS.settings}</button>
          </div>
          <div class="right-controls">
            <div class="model-picker">
              <button class="model-select" id="model-select-btn" type="button">豆包 ${ICONS.chevronDown}</button>
              <div class="model-menu" id="model-menu">
                <button class="model-option active" id="model-option-doubao" data-model="doubao" type="button">豆包</button>
                <button class="model-option" id="model-option-gemini" data-model="gemini" type="button">Gemini</button>
              </div>
            </div>
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
const headerMenuBtn = shadow.getElementById('header-menu-btn');
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
const modelSelectBtn = shadow.getElementById('model-select-btn');
const modelMenu = shadow.getElementById('model-menu');
const modelOptionButtons = Array.from(shadow.querySelectorAll('.model-option'));
const summarizeFeature = shadow.getElementById('feature-summarize');
const darkModeFeature = shadow.getElementById('feature-dark-mode');
const noteModeFeature = shadow.getElementById('feature-note-mode');
const aiModeFeature = shadow.getElementById('feature-ai-mode');

// === State Management ===
let sidebarWidth = 350;
let systemPrompt = '';
let isAIGenerating = false;
let pendingRequestId = null;
let pendingProvider = 'doubao';
let currentInputMode = 'ai';
let currentTheme = 'light';
let currentProvider = 'doubao';
let savedNotes = [];
const handledResponseIds = new Set();
const EXTENSION_RELOAD_MESSAGE = '扩展已更新，请刷新当前页面以及 Gemini/豆包页面后重试。';
let extensionContextInvalidated = false;

const RESPONSE_STORAGE_PREFIX = 'gemini_response_';
const NOTES_STORAGE_KEY = 'savedNotes';
const INPUT_MODE_STORAGE_KEY = 'inputMode';
const THEME_MODE_STORAGE_KEY = 'themeMode';
const PROVIDER_STORAGE_KEY = 'selectedProvider';

function createRequestId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function getResponseStorageKey(requestId) {
  return `${RESPONSE_STORAGE_PREFIX}${requestId}`;
}

function getProviderLabel(provider) {
  return provider === 'gemini' ? 'Gemini' : '豆包';
}

function isExtensionContextInvalidatedError(error) {
  const message = String((error && error.message) || error || '');
  return /Extension context invalidated|context invalidated|Receiving end does not exist|Could not establish connection/i.test(message);
}

function handleExtensionContextInvalidated(error) {
  if (extensionContextInvalidated) {
    return;
  }
  extensionContextInvalidated = true;
  console.warn('Sidebar extension context invalidated.', error);

  try {
    if (typeof removeLoading === 'function') {
      removeLoading();
    }
    if (typeof addMessage === 'function') {
      addMessage(`Error: ${EXTENSION_RELOAD_MESSAGE}`, 'ai');
    }
    if (typeof resetInputState === 'function') {
      resetInputState();
    }
  } catch (uiError) {
    console.warn('Failed to render extension reload warning.', uiError);
  }
}

function safeStorageSet(items, callback) {
  try {
    chrome.storage.local.set(items, () => {
      const error = chrome.runtime.lastError;
      if (error && isExtensionContextInvalidatedError(error)) {
        handleExtensionContextInvalidated(error);
      }
      if (typeof callback === 'function') {
        callback(error || null);
      }
    });
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      handleExtensionContextInvalidated(error);
      if (typeof callback === 'function') {
        callback(error);
      }
      return;
    }
    throw error;
  }
}

function safeStorageGet(keys, callback) {
  try {
    chrome.storage.local.get(keys, (result) => {
      const error = chrome.runtime.lastError;
      if (error && isExtensionContextInvalidatedError(error)) {
        handleExtensionContextInvalidated(error);
        callback({});
        return;
      }
      callback(result || {});
    });
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      handleExtensionContextInvalidated(error);
      callback({});
      return;
    }
    throw error;
  }
}

function safeStorageRemove(keys, callback) {
  try {
    chrome.storage.local.remove(keys, () => {
      const error = chrome.runtime.lastError;
      if (error && isExtensionContextInvalidatedError(error)) {
        handleExtensionContextInvalidated(error);
      }
      if (typeof callback === 'function') {
        callback(error || null);
      }
    });
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      handleExtensionContextInvalidated(error);
      if (typeof callback === 'function') {
        callback(error);
      }
      return;
    }
    throw error;
  }
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          if (isExtensionContextInvalidatedError(error)) {
            handleExtensionContextInvalidated(error);
            reject(new Error(EXTENSION_RELOAD_MESSAGE));
            return;
          }
          reject(new Error(error.message));
          return;
        }
        resolve(response);
      });
    } catch (error) {
      if (isExtensionContextInvalidatedError(error)) {
        handleExtensionContextInvalidated(error);
        reject(new Error(EXTENSION_RELOAD_MESSAGE));
        return;
      }
      reject(error);
    }
  });
}

async function requestGeminiAction(action, payload = {}) {
  const response = await sendRuntimeMessage({ action, ...payload });
  if (!response || response.success === false) {
    throw new Error((response && response.message) || 'Gemini 请求失败。');
  }
  return response;
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function normalizeMessageText(text) {
  let value = String(text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const prefixes = [
    /^(gemini|doubao|assistant|ai)\s*(said|says|response)?\s*[:：]\s*/i,
    /^gemini说\s*[:：]?\s*/iu,
    /^豆包说\s*[:：]?\s*/u,
    /^双子座说\s*[:：]?\s*/u,
  ];

  let changed = true;
  while (changed && value) {
    changed = false;

    prefixes.forEach((pattern) => {
      if (pattern.test(value)) {
        value = value.replace(pattern, '').trim();
        changed = true;
      }
    });

    const lines = value.split('\n');
    if (lines.length > 1 && prefixes.some((pattern) => pattern.test(lines[0].trim()))) {
      lines.shift();
      value = lines.join('\n').trim();
      changed = true;
    }
  }

  const transientLinePatterns = [
    /^(?:正在)?搜索(?:中)?[.…]*$/u,
    /^(?:正在)?(?:思考|分析|整理|生成)(?:中)?[.…]*$/u,
    /^defining\s+my\s+identity$/i,
    /^立即回答$/u,
    /^quick\s*answer$/i,
    /defining\s+my\s+identity/i,
    /(?:^|[\s:：])立即回答(?:$|[\s:：])/u,
    /(?:^|[\s:：])正在搜索(?:中)?(?:$|[\s:：])/u,
  ];
  const filteredLines = value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !transientLinePatterns.some((pattern) => pattern.test(line)));
  value = filteredLines.join('\n').trim();

  return value;
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  );
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  return html;
}

function markdownToHtml(markdown) {
  const source = normalizeMessageText(markdown);
  if (!source) return '';

  const html = [];
  const lines = source.split('\n');
  let paragraphLines = [];
  let quoteLines = [];
  let listType = null;
  let inCodeBlock = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    html.push(`<p>${renderInlineMarkdown(paragraphLines.join('\n')).replace(/\n/g, '<br>')}</p>`);
    paragraphLines = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    html.push(
      `<blockquote><p>${renderInlineMarkdown(quoteLines.join('\n')).replace(/\n/g, '<br>')}</p></blockquote>`
    );
    quoteLines = [];
  };

  const flushList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  };

  const flushCodeBlock = () => {
    if (!inCodeBlock) return;
    html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
    inCodeBlock = false;
    codeLines = [];
  };

  lines.forEach((line) => {
    if (/^```/.test(line.trim())) {
      flushParagraph();
      flushQuote();
      flushList();
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        inCodeBlock = true;
        codeLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushQuote();
      flushList();
      return;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushQuote();
      flushList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    if (/^---+$/.test(line.trim())) {
      flushParagraph();
      flushQuote();
      flushList();
      html.push('<hr>');
      return;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      quoteLines.push(line.replace(/^>\s?/, ''));
      return;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType !== 'ul') {
        flushList();
        html.push('<ul>');
        listType = 'ul';
      }
      html.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`);
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType !== 'ol') {
        flushList();
        html.push('<ol>');
        listType = 'ol';
      }
      html.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`);
      return;
    }

    flushQuote();
    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushQuote();
  flushList();
  flushCodeBlock();
  return html.join('');
}

function autoResizeInput() {
  chatInput.style.height = 'auto';
  chatInput.style.height = `${chatInput.scrollHeight}px`;
}

function updateSendButtonState() {
  const hasText = Boolean(chatInput.value.trim());
  sendBtn.classList.toggle('active', hasText && !chatInput.disabled);
}

function scrollChatToBottom() {
  requestAnimationFrame(() => {
    chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
  });
}

function addMessage(text, role) {
  if (welcomeState.style.display !== 'none') {
    welcomeState.style.display = 'none';
  }

  const msgWrapper = document.createElement('div');
  msgWrapper.className = 'message-wrapper';

  if (role === 'user') {
    msgWrapper.innerHTML = `<div class="message message-user">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
  } else if (role === 'note') {
    msgWrapper.innerHTML = `<div class="message message-note">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
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
    const normalized = normalizeMessageText(text);
    const contentHtml = normalized.startsWith('Error:')
      ? `<p>${escapeHtml(normalized)}</p>`
      : markdownToHtml(normalized);

    msgWrapper.innerHTML = `
      <div class="message message-ai">
        <div class="message-ai-avatar">${ICONS.avatar}</div>
        <div class="message-ai-content">${contentHtml || `<p>${escapeHtml(normalized || 'AI 已返回结果，但扩展没有成功读取到可见文本。')}</p>`}</div>
      </div>
    `;
  }

  chatArea.appendChild(msgWrapper);
  scrollChatToBottom();
  return msgWrapper;
}

function removeLoading() {
  const loading = shadow.getElementById('loading-bubble');
  if (loading) {
    loading.parentElement.remove();
  }
}

function resetInputState() {
  isAIGenerating = false;
  sendBtn.disabled = false;
  chatInput.disabled = false;
  updateSendButtonState();
  chatInput.focus();
}

function clearComposer() {
  chatInput.value = '';
  autoResizeInput();
  updateSendButtonState();
}

function refreshUIState() {
  const isNoteMode = currentInputMode === 'note';
  chatInput.placeholder = isNoteMode ? '输入内容并保存为笔记...' : '使用 AI 处理当前页面任务...';
  modeToggleBtn.innerHTML = `${ICONS.document} ${isNoteMode ? `笔记模式 ${savedNotes.length}` : 'AI输出模式'}`;
  noteModeFeature.classList.toggle('active', isNoteMode);
  aiModeFeature.classList.toggle('active', !isNoteMode);
  darkModeFeature.classList.toggle('active', currentTheme === 'dark');
  themeToggleBtn.innerHTML = currentTheme === 'dark' ? ICONS.sun : ICONS.moon;
  themeToggleBtn.title = currentTheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式';
  modelSelectBtn.innerHTML = `${getProviderLabel(currentProvider)} ${ICONS.chevronDown}`;
  modelOptionButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.model === currentProvider);
  });
}

function setInputMode(nextMode, persist = true) {
  currentInputMode = nextMode === 'note' ? 'note' : 'ai';
  refreshUIState();
  if (persist) {
    safeStorageSet({ [INPUT_MODE_STORAGE_KEY]: currentInputMode });
  }
}

function setThemeMode(nextTheme, persist = true) {
  currentTheme = nextTheme === 'dark' ? 'dark' : 'light';
  host.setAttribute('data-theme', currentTheme);
  refreshUIState();
  updateSendButtonState();
  if (persist) {
    safeStorageSet({ [THEME_MODE_STORAGE_KEY]: currentTheme });
  }
}

function setProvider(nextProvider, persist = true) {
  currentProvider = nextProvider === 'gemini' ? 'gemini' : 'doubao';
  refreshUIState();
  toggleModelMenu(false);
  if (persist) {
    safeStorageSet({ [PROVIDER_STORAGE_KEY]: currentProvider });
  }
}

function toggleModelMenu(forceOpen) {
  const nextOpen = typeof forceOpen === 'boolean' ? forceOpen : !modelMenu.classList.contains('open');
  modelMenu.classList.toggle('open', nextOpen);
}

function toggleSettingsPanel(forceOpen) {
  const nextOpen =
    typeof forceOpen === 'boolean' ? forceOpen : !settingsPanel.classList.contains('open');
  settingsPanel.classList.toggle('open', nextOpen);
}

function setSidebarOpen(open) {
  sidebar.classList.toggle('open', open);
  document.body.style.transition = 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
  document.body.style.marginRight = open ? `${sidebarWidth}px` : '0px';
}

function toggleSidebar() {
  setSidebarOpen(!sidebar.classList.contains('open'));
}

function clearConversation(showWelcome = true) {
  removeLoading();
  chatArea.querySelectorAll('.message-wrapper').forEach((node) => node.remove());
  if (showWelcome) {
    welcomeState.style.display = '';
  }
  pendingRequestId = null;
  pendingProvider = currentProvider;
  isAIGenerating = false;
  sendBtn.disabled = false;
  chatInput.disabled = false;
  updateSendButtonState();
}

async function handleNewChat() {
  clearConversation(true);
  if (currentProvider !== 'gemini') {
    return;
  }

  try {
    await requestGeminiAction('gemini_new_chat');
    addMessage('已在 Gemini 中新建对话。', 'ai');
  } catch (error) {
    addMessage(`Error: ${error.message}`, 'ai');
  }
}

function buildPromptPayload(text) {
  if (!systemPrompt) {
    return text;
  }
  return `[系统设定: ${systemPrompt}]\n\n用户的提问: ${text}`;
}

function saveNote(text) {
  savedNotes.unshift({
    id: createRequestId(),
    text,
    title: document.title,
    url: location.href,
    createdAt: Date.now(),
  });
  safeStorageSet({ [NOTES_STORAGE_KEY]: savedNotes });
  addMessage(text, 'note');
  clearComposer();
  refreshUIState();
}

function beginPendingRequest(displayText, payloadText) {
  const requestId = createRequestId();
  pendingRequestId = requestId;
  pendingProvider = currentProvider;

  addMessage(displayText, 'user');
  clearComposer();
  removeLoading();
  addMessage('', 'loading');

  isAIGenerating = true;
  sendBtn.disabled = true;
  chatInput.disabled = true;
  updateSendButtonState();

  sendRuntimeMessage({
    action: 'ask_gemini',
    text: payloadText,
    requestId,
    provider: currentProvider,
  })
    .then((response) => {
      if (!response || response.success === false) {
        pendingRequestId = null;
        removeLoading();
        addMessage(`Error: ${(response && response.message) || '请求失败。'}`, 'ai');
        resetInputState();
      }
    })
    .catch((error) => {
      pendingRequestId = null;
      removeLoading();
      addMessage(`Error: ${error.message}`, 'ai');
      resetInputState();
    });
}

function handleComposerSubmit() {
  const text = chatInput.value.trim();
  if (!text || isAIGenerating) {
    return;
  }

  if (currentInputMode === 'note') {
    saveNote(text);
    return;
  }

  beginPendingRequest(text, buildPromptPayload(text));
}

function handleSummarizeCurrentPage() {
  if (isAIGenerating) {
    return;
  }

  const url = window.location.href.trim();
  if (!url) {
    return;
  }

  beginPendingRequest(url, url);
}

function consumeProviderResponse(payload) {
  if (!payload || !payload.requestId) {
    return false;
  }

  const requestId = payload.requestId;
  const provider = payload.provider === 'gemini' ? 'gemini' : 'doubao';
  if (handledResponseIds.has(requestId)) {
    return false;
  }
  if (!pendingRequestId || requestId !== pendingRequestId) {
    return false;
  }
  if (provider !== pendingProvider) {
    return false;
  }

  handledResponseIds.add(requestId);
  pendingRequestId = null;
  pendingProvider = currentProvider;

  removeLoading();
  addMessage(payload.text, 'ai');
  resetInputState();

  safeStorageRemove(getResponseStorageKey(requestId));
  return true;
}

function isSelectionInsideSidebar(selection) {
  if (!selection || !selection.rangeCount) {
    return false;
  }

  const nodes = [selection.anchorNode, selection.focusNode];
  return nodes.some((node) => {
    const element =
      node && node.nodeType === Node.ELEMENT_NODE ? node : node && node.parentElement;
    return element ? shadow.contains(element) : false;
  });
}

// Load persisted state from storage
safeStorageGet(
  ['ballPos', 'sidebarWidth', 'systemPrompt', NOTES_STORAGE_KEY, INPUT_MODE_STORAGE_KEY, THEME_MODE_STORAGE_KEY, PROVIDER_STORAGE_KEY],
  (res) => {
    if (res.ballPos) {
      ball.style.left = res.ballPos.left;
      ball.style.top = res.ballPos.top;
      ball.style.right = 'auto';
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
      currentInputMode = res[INPUT_MODE_STORAGE_KEY] === 'note' ? 'note' : 'ai';
    }
    if (res[THEME_MODE_STORAGE_KEY]) {
      currentTheme = res[THEME_MODE_STORAGE_KEY] === 'dark' ? 'dark' : 'light';
    }
    if (res[PROVIDER_STORAGE_KEY]) {
      currentProvider = res[PROVIDER_STORAGE_KEY] === 'gemini' ? 'gemini' : 'doubao';
    }

    setThemeMode(currentTheme, false);
    setProvider(currentProvider, false);
    setInputMode(currentInputMode, false);
    autoResizeInput();
    updateSendButtonState();
  }
);

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
      safeStorageSet({ ballPos: { left: ball.style.left, top: ball.style.top } });
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
    
    safeStorageSet({ sidebarWidth });
    
    if (sidebar.classList.contains('open')) {
      document.body.style.transition = 'margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  }
});

// === Settings Panel (System Prompt) ===
openSettingsBtn.addEventListener('click', () => toggleSettingsPanel());
headerMenuBtn.addEventListener('click', () => toggleSettingsPanel());
closeSettingsBtn.addEventListener('click', () => toggleSettingsPanel(false));

saveSettingsBtn.addEventListener('click', () => {
  systemPrompt = systemPromptInput.value.trim();
  safeStorageSet({ systemPrompt }, () => {
    toggleSettingsPanel(false);
    const originalText = saveSettingsBtn.textContent;
    saveSettingsBtn.textContent = "已保存 ✓";
    setTimeout(() => saveSettingsBtn.textContent = originalText, 2000);
  });
});

// === Textarea Auto-resize ===
chatInput.addEventListener('input', function() {
  autoResizeInput();
  updateSendButtonState();
});

// === Highlight Text Capture ===
document.addEventListener('mouseup', () => {
  if (isDraggingBall || isResizing) return;
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : '';
  if (!selectedText || isSelectionInsideSidebar(selection)) {
    return;
  }

  chatInput.value = selectedText;
  autoResizeInput();
  updateSendButtonState();

  if (!sidebar.classList.contains('open')) {
    setSidebarOpen(true);
  }
});

// === Messaging Logic ===
modeToggleBtn.addEventListener('click', () => {
  setInputMode(currentInputMode === 'note' ? 'ai' : 'note');
});
quickSummarizeBtn.addEventListener('click', handleSummarizeCurrentPage);
sendBtn.addEventListener('click', handleComposerSubmit);
themeToggleBtn.addEventListener('click', () => {
  setThemeMode(currentTheme === 'dark' ? 'light' : 'dark');
});
newChatBtn.addEventListener('click', handleNewChat);
modelSelectBtn.addEventListener('click', () => toggleModelMenu());
modelOptionButtons.forEach((button) => {
  button.addEventListener('click', () => setProvider(button.dataset.model));
});
summarizeFeature.addEventListener('click', handleSummarizeCurrentPage);
darkModeFeature.addEventListener('click', () => {
  setThemeMode(currentTheme === 'dark' ? 'light' : 'dark');
});
noteModeFeature.addEventListener('click', () => setInputMode('note'));
aiModeFeature.addEventListener('click', () => setInputMode('ai'));

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleComposerSubmit();
  }
});

window.addEventListener('click', (event) => {
  const path = event.composedPath ? event.composedPath() : [];
  const clickedModelMenu = path.includes(modelSelectBtn) || path.includes(modelMenu);
  if (!clickedModelMenu) {
    toggleModelMenu(false);
  }

  const clickedSettings =
    path.includes(settingsPanel) ||
    path.includes(openSettingsBtn) ||
    path.includes(headerMenuBtn) ||
    path.includes(saveSettingsBtn);
  if (!clickedSettings) {
    toggleSettingsPanel(false);
  }
});

try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'show_response') {
      const handled = consumeProviderResponse({
        text: request.text,
        requestId: request.requestId,
        provider: request.provider,
      });
      sendResponse({ success: handled });
      return true;
    }
    return false;
  });
} catch (error) {
  if (isExtensionContextInvalidatedError(error)) {
    handleExtensionContextInvalidated(error);
  } else {
    throw error;
  }
}

try {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !pendingRequestId) {
      return;
    }
    const responseKey = getResponseStorageKey(pendingRequestId);
    const change = changes[responseKey];
    if (!change || !change.newValue) {
      return;
    }
    consumeProviderResponse(change.newValue);
  });
} catch (error) {
  if (isExtensionContextInvalidatedError(error)) {
    handleExtensionContextInvalidated(error);
  } else {
    throw error;
  }
}
