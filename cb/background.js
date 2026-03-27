// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background Script: Received message", request.action);
  
  if (request.action === 'ask_gemini') {
    const sourceTabId = sender.tab.id;
    console.log("Background Script: Requesting Gemini for tab", sourceTabId);
    
    // Find the Gemini tab
    chrome.tabs.query({ url: "*://gemini.google.com/*" }, (tabs) => {
      console.log("Background Script: Found Gemini tabs", tabs);
      if (tabs.length > 0) {
        // We'll use the first open Gemini tab
        const geminiTab = tabs[0];
        console.log("Background Script: Forwarding to Gemini tab", geminiTab.id);
        
        // Forward the prompt to the Gemini tab
        chrome.tabs.sendMessage(geminiTab.id, {
          action: 'send_prompt',
          text: request.text,
          sourceTabId: sourceTabId
        });
        
        // Let the GitHub script know we forwarded it
        sendResponse({ success: true, message: "Forwarded to Gemini." });
      } else {
        // No Gemini tab found
        console.log("Background Script: No Gemini tab found");
        sendResponse({ success: false, message: "No Gemini tab is currently open. Please open gemini.google.com in a new tab." });
      }
    });
    
    // Return true to indicate we wish to send a response asynchronously
    return true;
  }
  
  if (request.action === 'gemini_response') {
    console.log("Background Script: Received response from Gemini", request);
    // Forward the response back to the original GitHub tab
    const sourceTabId = request.sourceTabId;
    
    if (sourceTabId) {
      console.log("Background Script: Forwarding response back to tab", sourceTabId);
      chrome.tabs.sendMessage(sourceTabId, {
        action: 'show_response',
        text: request.text
      });
      sendResponse({ success: true });
    } else {
      console.error("Background Script: Source tab ID missing in response");
      sendResponse({ success: false, message: "Source tab ID missing." });
    }
    
    return true;
  }
});
