// content-target.js

// 1. Create and inject the sidebar UI
const sidebar = document.createElement('div');
sidebar.id = 'gemini-assistant-sidebar';
sidebar.innerHTML = `
  <div class="gemini-header">
    <h3>Ask Gemini</h3>
    <button id="gemini-close-btn">&times;</button>
  </div>
  <div class="gemini-body">
    <label for="gemini-prompt">Selected Text:</label>
    <textarea id="gemini-prompt" placeholder="Highlight some text on the page..."></textarea>
    <button id="gemini-ask-btn">Ask Gemini</button>
    
    <div id="gemini-response-container" style="display: none;">
      <h4>Response:</h4>
      <div id="gemini-response-content"></div>
      <div id="gemini-loading" style="display: none;">Waiting for Gemini...</div>
    </div>
  </div>
`;
document.body.appendChild(sidebar);

// UI Elements
const promptTextarea = document.getElementById('gemini-prompt');
const askBtn = document.getElementById('gemini-ask-btn');
const closeBtn = document.getElementById('gemini-close-btn');
const responseContainer = document.getElementById('gemini-response-container');
const responseContent = document.getElementById('gemini-response-content');
const loadingIndicator = document.getElementById('gemini-loading');

// 2. Handle Text Selection
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    promptTextarea.value = "请解释一下这段代码/文本的意思：\n\n" + selectedText;
    // Optionally auto-open the sidebar when text is selected
    sidebar.classList.add('gemini-sidebar-open');
  }
});

// Toggle Sidebar Open/Close
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('gemini-sidebar-open');
});

// 3. Send Message to Background
askBtn.addEventListener('click', () => {
  const text = promptTextarea.value.trim();
  if (!text) {
    alert('Please enter or select some text first.');
    return;
  }

  // Update UI state
  askBtn.disabled = true;
  responseContainer.style.display = 'block';
  responseContent.innerHTML = '';
  loadingIndicator.style.display = 'block';

  // Send to background
  console.log("GitHub Content Script: Sending request to background");
  chrome.runtime.sendMessage({ action: 'ask_gemini', text: text }, (response) => {
    console.log("GitHub Content Script: Received immediate response from background", response);
    if (response && !response.success) {
      loadingIndicator.style.display = 'none';
      responseContent.innerHTML = `<span style="color: red;">Error: ${response.message}</span>`;
      askBtn.disabled = false;
    }
  });
});

// 4. Receive Response from Gemini (via Background)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("GitHub Content Script: Received message", request);
  if (request.action === 'show_response') {
    loadingIndicator.style.display = 'none';
    askBtn.disabled = false;
    
    // Convert basic markdown/newlines to HTML for simple display
    const formattedText = request.text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
      
    responseContent.innerHTML = formattedText;
    sendResponse({ success: true });
  }
});
