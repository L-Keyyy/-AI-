// content-gemini.js

// Function to find the Gemini input area
function getInputElement() {
  // Gemini's DOM changes occasionally. These are common selectors.
  return document.querySelector('rich-textarea div[contenteditable="true"]') || 
         document.querySelector('.ql-editor') ||
         document.querySelector('div[data-placeholder="Enter a prompt here"]') ||
         document.querySelector('div[aria-label="Enter a prompt here"]') ||
         document.querySelector('div.textarea') ||
         document.querySelector('textarea');
}

// Function to find the Send button
function getSendButton() {
  // Try finding by data-test-id first, which is often more stable
  const testIdBtn = document.querySelector('[data-test-id="send-button"]');
  if (testIdBtn) return testIdBtn;

  // Selectors for the Send button (supporting multiple languages)
  const buttons = Array.from(document.querySelectorAll('button'));
  for (let btn of buttons) {
    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
    const matTooltip = (btn.getAttribute('mattooltip') || '').toLowerCase();
    const title = (btn.getAttribute('title') || '').toLowerCase();
    
    if (ariaLabel.includes('send message') || 
        ariaLabel.includes('发送消息') || 
        ariaLabel.includes('发送') ||
        matTooltip.includes('send message') ||
        title.includes('send message')) {
      // Check if it's not disabled
      if (!btn.disabled && !btn.hasAttribute('disabled')) {
        return btn;
      }
    }
  }
  // Fallback to a common class or type
  return document.querySelector('button.send-button') || document.querySelector('button[type="submit"]'); 
}

// Extract the last response from Gemini
function extractLatestResponse() {
  // Find all response blocks. Gemini uses various tags over time.
  const responseContainers = document.querySelectorAll('model-response, [data-test-id="model-response"], .message-content, .model-response-text, response-container');
  if (responseContainers.length > 0) {
    const lastResponse = responseContainers[responseContainers.length - 1];
    return lastResponse.innerText || lastResponse.textContent;
  }
  
  // Fallback: get all text from the main chat container
  const chatContainer = document.querySelector('chat-app') || document.body;
  if (chatContainer) {
    // Try to find the latest paragraph or text node if possible
    const paragraphs = chatContainer.querySelectorAll('p');
    if (paragraphs.length > 0) {
        let text = "";
        // Just grab the last few paragraphs as a guess
        for(let i = Math.max(0, paragraphs.length - 3); i < paragraphs.length; i++) {
            text += paragraphs[i].innerText + "\n";
        }
        return text || chatContainer.innerText || "Could not extract specific response, but chat container exists.";
    }
    return chatContainer.innerText || "Could not extract specific response, but chat container exists.";
  }
  
  return "Could not extract response from DOM.";
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'send_prompt') {
    console.log("Gemini Content Script: Received send_prompt request", request);
    const inputEl = getInputElement();
    
    if (!inputEl) {
      console.error("Gemini Content Script: Gemini input box not found.");
      // Send error back immediately
      chrome.runtime.sendMessage({
        action: 'gemini_response',
        text: "Error: Could not find the input box on the Gemini page. The DOM might have changed.",
        sourceTabId: request.sourceTabId
      });
      return;
    }

    console.log("Gemini Content Script: Found input element", inputEl);

    // 1. Inject the text
    inputEl.focus();
    
    // Using execCommand is the most reliable way to trigger React/Angular internal states for contenteditable
    if (inputEl.isContentEditable) {
      console.log("Gemini Content Script: Injecting text via execCommand");
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, request.text);
    } else {
      console.log("Gemini Content Script: Injecting text via value setter");
      // If it's a standard textarea
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeInputValueSetter.call(inputEl, request.text);
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 2. Click the send button
    setTimeout(() => {
      const sendBtn = getSendButton();
      if (sendBtn) {
        console.log("Gemini Content Script: Found send button, clicking it", sendBtn);
        sendBtn.click();
        
        // 3. Wait for the response to be generated using MutationObserver
        console.log("Gemini Content Script: Starting response observation");
        observeResponse(request.sourceTabId);
      } else {
        console.error("Gemini Content Script: Gemini send button not found.");
        chrome.runtime.sendMessage({
          action: 'gemini_response',
          text: "Error: Could not find the Send button on the Gemini page.",
          sourceTabId: request.sourceTabId
        });
      }
    }, 1000); // increased delay to allow React state to update before clicking send
  }
});

// Observe the DOM to detect when Gemini finishes generating the response
function observeResponse(sourceTabId) {
  const chatContainer = document.querySelector('chat-app') || document.body;
  let typingTimer;
  let hasStartedGenerating = false;
  
  console.log("Gemini Content Script: Observing container", chatContainer);
  
  // The observer callback checks for changes. 
  // If no new mutations happen for 2 seconds, we assume generation is complete.
  const observer = new MutationObserver((mutations) => {
    hasStartedGenerating = true;
    // Reset the timer on every DOM change in the chat container
    clearTimeout(typingTimer);
    
    typingTimer = setTimeout(() => {
      console.log("Gemini Content Script: 2.5s since last mutation. Assuming generation finished.");
      observer.disconnect();
      
      const responseText = extractLatestResponse();
      console.log("Gemini Content Script: Extracted response:", responseText ? responseText.substring(0, 50) + "..." : "empty");
      
      // Send the response back to the Background script
      chrome.runtime.sendMessage({
        action: 'gemini_response',
        text: responseText,
        sourceTabId: sourceTabId
      });
      
    }, 2500); 
  });

  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // Safety fallback: if no mutations are detected at all, or it hangs forever
  setTimeout(() => {
      if (!hasStartedGenerating) {
          console.warn("Gemini Content Script: No mutations detected after 10s. Trying to extract anyway.");
          clearTimeout(typingTimer);
          observer.disconnect();
          const responseText = extractLatestResponse();
          chrome.runtime.sendMessage({
            action: 'gemini_response',
            text: responseText || "Error: Timeout waiting for response. Gemini might not have processed the request.",
            sourceTabId: sourceTabId
          });
      }
  }, 10000);
}
