// background.js

const RESPONSE_STORAGE_PREFIX = "gemini_response_";

const PROVIDERS = {
  doubao: {
    label: "Doubao",
    urls: ["*://www.doubao.com/*", "*://doubao.com/*"],
    script: "content-doubao.js",
    home: "https://www.doubao.com/",
  },
  gemini: {
    label: "Gemini",
    urls: ["*://gemini.google.com/*"],
    script: "content-gemini.js",
    home: "https://gemini.google.com/",
  },
};

function getResponseStorageKey(requestId) {
  return `${RESPONSE_STORAGE_PREFIX}${requestId}`;
}

function normalizeProvider(provider) {
  return provider === "gemini" ? "gemini" : "doubao";
}

function queryTabs(queryInfo) {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, resolve);
  });
}

function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });
}

function executeScript(tabId, files) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files,
      },
      () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      }
    );
  });
}

function setStorageItems(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve();
    });
  });
}

function downloadFile(options) {
  return new Promise((resolve, reject) => {
    if (!chrome.downloads || typeof chrome.downloads.download !== "function") {
      reject(new Error("Downloads API is unavailable."));
      return;
    }

    chrome.downloads.download(options, (downloadId) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(downloadId);
    });
  });
}

function sanitizeFileSegment(value) {
  const text = String(value || "")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "未命名笔记";
  return text.slice(0, 80);
}

function formatTimestampForFile(ts) {
  const date = new Date(Number(ts) || Date.now());
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}-${hh}${mm}${ss}`;
}

function ensureMarkdownFilename(filename, fallbackTitle, createdAt) {
  const fallback = `笔记/${formatTimestampForFile(createdAt)}-${sanitizeFileSegment(fallbackTitle)}.md`;
  const raw = String(filename || "").trim();
  if (!raw) return fallback;

  let normalized = raw
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => sanitizeFileSegment(part))
    .filter(Boolean)
    .join("/");

  if (!normalized) normalized = fallback;
  if (!normalized.toLowerCase().endsWith(".md")) {
    normalized += ".md";
  }
  return normalized;
}

async function getProviderTab(provider) {
  const config = PROVIDERS[provider];
  const tabs = await queryTabs({ url: config.urls });
  if (!tabs.length) {
    throw new Error(`No open ${config.label} tab found. Please open ${config.home}`);
  }
  return tabs[0];
}

async function ensureProviderReceiver(provider, tabId) {
  try {
    await sendTabMessage(tabId, { action: "ping" });
    return;
  } catch (error) {
    console.warn(`Background Script: ${provider} ping failed, reinjecting content script.`, error);
  }

  await executeScript(tabId, [PROVIDERS[provider].script]);
  await sendTabMessage(tabId, { action: "ping" });
}

async function sendProviderMessage(provider, message) {
  const tab = await getProviderTab(provider);
  await ensureProviderReceiver(provider, tab.id);
  return sendTabMessage(tab.id, message);
}

async function handleAskGemini(request, sender) {
  const sourceTabId = sender.tab && sender.tab.id;
  if (!sourceTabId) {
    return { success: false, message: "Could not determine source tab." };
  }

  const provider = normalizeProvider(request.provider);
  try {
    const response = await sendProviderMessage(provider, {
      action: "send_prompt",
      text: request.text,
      sourceTabId,
      requestId: request.requestId,
    });

    return response || { success: true, message: `Prompt forwarded to ${PROVIDERS[provider].label}.` };
  } catch (error) {
    console.error(`Background Script: Failed to forward prompt to ${provider}.`, error);
    return { success: false, message: error.message || `Failed to contact ${PROVIDERS[provider].label}.` };
  }
}

async function handleGeminiResponse(request) {
  const { sourceTabId, requestId } = request;
  const provider = normalizeProvider(request.provider);
  if (!sourceTabId) {
    return { success: false, message: "Source tab ID missing." };
  }
  if (!requestId) {
    return { success: false, message: "Request ID missing." };
  }

  const responseKey = getResponseStorageKey(requestId);
  await setStorageItems({
    [responseKey]: {
      requestId,
      sourceTabId,
      provider,
      text: request.text,
      receivedAt: Date.now(),
    },
  });

  try {
    await sendTabMessage(sourceTabId, {
      action: "show_response",
      requestId,
      provider,
      text: request.text,
    });
  } catch (error) {
    console.warn(
      "Background Script: Direct delivery failed, storage fallback remains available.",
      error
    );
  }

  return { success: true };
}

async function handleProviderControl(request) {
  const provider = request.provider ? normalizeProvider(request.provider) : "gemini";
  try {
    const response = await sendProviderMessage(provider, request);
    return response || { success: true };
  } catch (error) {
    console.error("Background Script: Provider control action failed.", provider, request.action, error);
    return { success: false, message: error.message || `${PROVIDERS[provider].label} control action failed.` };
  }
}

async function handleSaveNoteMarkdown(request) {
  const content = String(request.content || "").trim();
  if (!content) {
    return { success: false, message: "Note content is empty." };
  }

  const createdAt = Number(request.createdAt) || Date.now();
  const noteTitle = sanitizeFileSegment(request.title || "未命名笔记");
  const markdown = String(request.content || "");
  const filename = ensureMarkdownFilename(request.filename, noteTitle, createdAt);
  const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;

  try {
    const downloadId = await downloadFile({
      url: dataUrl,
      filename,
      saveAs: false,
      conflictAction: "uniquify",
    });
    return { success: true, filename, downloadId };
  } catch (error) {
    console.error("Background Script: Failed to export markdown note.", error);
    return { success: false, message: error.message || "Failed to export markdown note." };
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ask_gemini") {
    handleAskGemini(request, sender).then(sendResponse).catch((error) => {
      console.error("Background Script: ask_gemini unexpected failure.", error);
      sendResponse({ success: false, message: "Unexpected error while contacting provider." });
    });
    return true;
  }

  if (request.action === "gemini_response") {
    handleGeminiResponse(request).then(sendResponse).catch((error) => {
      console.error("Background Script: gemini_response unexpected failure.", error);
      sendResponse({ success: false, message: "Unexpected error while delivering AI response." });
    });
    return true;
  }

  if (
    request.action === "gemini_new_chat" ||
    request.action === "gemini_get_history" ||
    request.action === "gemini_open_chat"
  ) {
    handleProviderControl(request).then(sendResponse).catch((error) => {
      console.error("Background Script: Provider control unexpected failure.", error);
      sendResponse({ success: false, message: "Unexpected provider control error." });
    });
    return true;
  }

  if (request.action === "save_note_markdown") {
    handleSaveNoteMarkdown(request).then(sendResponse).catch((error) => {
      console.error("Background Script: save_note_markdown unexpected failure.", error);
      sendResponse({ success: false, message: "Unexpected markdown export error." });
    });
    return true;
  }

  return false;
});
