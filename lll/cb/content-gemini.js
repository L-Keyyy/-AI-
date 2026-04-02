// content-gemini.js

function normalizeText(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function normalizeResponseText(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const GEMINI_RESPONSE_WAIT_MS = 300000;
const GEMINI_RESPONSE_POLL_MS = 1000;
const GEMINI_UI_READY_STABLE_POLLS = 2;
const GEMINI_MIN_RESPONSE_DELAY_MS = 2000;
const GEMINI_COMPLETION_ACTION_KEYWORDS = [
  "good response",
  "bad response",
  "like",
  "dislike",
  "copy",
  "retry",
  "regenerate",
  "more",
  "share",
  "feedback",
];
const GEMINI_UI_NOISE_PATTERNS = [
  /^(gemini|assistant|ai)\s*(said|says|response)?[:：]?$/i,
  /^\s*gemini\s*\u8bf4[:：]?\s*$/iu,
  /^\s*\u53cc\u5b50\u5ea7\u8bf4[:：]?\s*$/u,
  /^\s*\u8c46\u5305\u8bf4[:：]?\s*$/u,
  /^\s*\.\.\.\s*$/,
  /^\s*\u2026\s*$/,
];

const GEMINI_TRANSIENT_STATUS_PATTERNS = [
  /^(?:\u6b63\u5728)?\u641c\u7d22(?:\u4e2d)?[.\u2026]*$/u,
  /^(?:\u6b63\u5728)?(?:\u601d\u8003|\u5206\u6790|\u6574\u7406|\u751f\u6210)(?:\u4e2d)?[.\u2026]*$/u,
  /^defining\s+my\s+identity$/i,
  /^\u7acb\u5373\u56de\u7b54$/u,
  /^quick\s*answer$/i,
];

function isExtensionContextInvalidatedError(error) {
  const message = String((error && error.message) || error || "");
  return /Extension context invalidated|context invalidated|Receiving end does not exist|Could not establish connection/i.test(message);
}

function safeRuntimeSendMessage(message) {
  try {
    chrome.runtime.sendMessage(message);
    return true;
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      console.warn("Gemini extension context invalidated.", error);
      return false;
    }
    throw error;
  }
}

function safeRuntimeGetURL(path) {
  try {
    return chrome.runtime.getURL(path);
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      console.warn("Gemini extension context invalidated.", error);
      return "";
    }
    throw error;
  }
}

function sendGeminiResponse(payload) {
  safeRuntimeSendMessage({
    action: "gemini_response",
    text: payload.text,
    sourceTabId: payload.sourceTabId,
    requestId: payload.requestId,
    provider: payload.provider || "gemini",
  });
}

function isElementDisabled(element) {
  if (!element) return true;
  if (element.disabled) return true;
  return element.getAttribute("aria-disabled") === "true";
}

function getInputElement() {
  const activeElement = document.activeElement;
  if (
    activeElement &&
    activeElement.matches &&
    activeElement.matches('textarea, div[contenteditable="true"], [role="textbox"]') &&
    isVisible(activeElement) &&
    !isElementDisabled(activeElement)
  ) {
    return activeElement;
  }

  const selectors = [
    'rich-textarea div[contenteditable="true"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    ".ql-editor",
    'textarea[aria-label*="prompt" i]',
    'textarea[placeholder*="message" i]',
    "textarea",
  ];

  for (const selector of selectors) {
    const elements = Array.from(document.querySelectorAll(selector)).filter(
      (element) => isVisible(element) && !isElementDisabled(element)
    );
    if (elements.length) {
      return elements[elements.length - 1];
    }
  }

  return null;
}

function findButtonByKeywords(keywords, scope = document) {
  const lowerKeywords = keywords.map((item) => item.toLowerCase());
  return Array.from(scope.querySelectorAll("button, a[role='button'], [role='button']")).find((element) => {
    if (!isVisible(element)) return false;
    const text = normalizeText(
      [
        element.getAttribute("aria-label"),
        element.getAttribute("title"),
        element.textContent,
      ]
        .filter(Boolean)
        .join(" ")
    ).toLowerCase();
    return lowerKeywords.some((keyword) => text.includes(keyword));
  });
}

function getSendButton() {
  return (
    findComposerControl(['[data-test-id="send-button"]']) ||
    findComposerControl(['button[aria-label*="发送"]']) ||
    findButtonByKeywords(["send message", "send", "发送", "提交"], getComposerRoot() || document) ||
    findComposerControl(['button[type="submit"]']) ||
    document.querySelector('button[type="submit"]')
  );
}

function getStopGeneratingButton() {
  return (
    findComposerControl(['[data-test-id="stop-button"]']) ||
    findComposerControl(['button[aria-label*="停止"]']) ||
    findButtonByKeywords(
      ["stop generating", "stop response", "stop", "停止生成", "停止", "停止回答"],
      getComposerRoot() || document
    )
  );
}

function getNewChatButton() {
  return (
    document.querySelector('[data-test-id="new-chat-button"]') ||
    findButtonByKeywords(["new chat", "new conversation", "新建", "新聊天", "新对话"])
  );
}

function isVisible(element) {
  if (!element) return false;
  const styleValue = window.getComputedStyle(element);
  if (styleValue.display === "none" || styleValue.visibility === "hidden" || styleValue.opacity === "0") {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getComposerRoot() {
  const input = getInputElement();
  if (!input) return null;

  let current = input.parentElement;
  for (let depth = 0; current && current !== document.body && depth < 10; depth += 1) {
    if (
      current.querySelector('button[aria-label*="发送"]') ||
      current.querySelector('button[aria-label*="停止"]') ||
      current.querySelector(".send-button")
    ) {
      return current;
    }
    current = current.parentElement;
  }

  return input.closest("form") || input.parentElement || null;
}

function findComposerControl(selectors) {
  const root = getComposerRoot();
  const scopes = root ? [root, document] : [document];

  for (const scope of scopes) {
    for (const selector of selectors) {
      const candidates = Array.from(scope.querySelectorAll(selector)).filter(isVisible);
      if (candidates.length) {
        return candidates[candidates.length - 1];
      }
    }
  }

  return null;
}

function getReliableSendButton() {
  return (
    findComposerControl(['[data-test-id="send-button"]']) ||
    findComposerControl(['[data-testid="send-button"]']) ||
    findComposerControl(['button[data-test-id*="send" i]']) ||
    findComposerControl(['button[data-testid*="send" i]']) ||
    findComposerControl(['button[aria-label*="send" i]']) ||
    findComposerControl(['button[title*="send" i]']) ||
    findComposerControl(['button[aria-label*="\u53d1\u9001"]']) ||
    findComposerControl(['button[title*="\u53d1\u9001"]']) ||
    findButtonByKeywords(["send message", "send", "\u53d1\u9001", "\u63d0\u4ea4"], getComposerRoot() || document) ||
    findComposerControl(['button[type="submit"]']) ||
    document.querySelector('button[aria-label*="\u53d1\u9001"]') ||
    document.querySelector('button[aria-label*="send" i]') ||
    document.querySelector('button[type="submit"]') ||
    getSendButton()
  );
}

function getReliableStopGeneratingButton() {
  return (
    findComposerControl(['[data-test-id="stop-button"]']) ||
    findComposerControl(['[data-testid="stop-button"]']) ||
    findComposerControl(['button[data-test-id*="stop" i]']) ||
    findComposerControl(['button[data-testid*="stop" i]']) ||
    findComposerControl(['button[aria-label*="stop" i]']) ||
    findComposerControl(['button[title*="stop" i]']) ||
    findComposerControl(['button[aria-label*="\u505c\u6b62"]']) ||
    findComposerControl(['button[title*="\u505c\u6b62"]']) ||
    findButtonByKeywords(
      ["stop generating", "stop response", "stop", "\u505c\u6b62\u751f\u6210", "\u505c\u6b62", "\u505c\u6b62\u56de\u7b54"],
      getComposerRoot() || document
    ) ||
    getStopGeneratingButton()
  );
}

function isGenerationInProgress() {
  const stopButton = getReliableStopGeneratingButton();
  return !!(stopButton && isVisible(stopButton) && !isElementDisabled(stopButton));
}

function isComposerReadyForNextMessage() {
  if (isGenerationInProgress()) return false;

  const composerRoot = getComposerRoot();
  if (!composerRoot) return false;

  const visibleControls = Array.from(composerRoot.querySelectorAll("button, [role='button']")).filter(isVisible);
  return visibleControls.length > 0;
}

function getResponseCandidateElements() {
  const selector = [
    "model-response",
    '[data-test-id="model-response"]',
    '[data-testid="model-response"]',
    ".model-response-text",
    ".response-content",
    ".message-content",
    '[data-test-id*="response" i]',
    '[data-testid*="response" i]',
    '[data-test-id*="assistant" i]',
    '[data-testid*="assistant" i]',
    '[class*="assistant-message"]',
    '[class*="response-message"]',
    '[class*="answer-content"]',
    "markdown",
    "message-content",
    'div[class*="markdown"]',
    'div[class*="model-response"]',
    'div[class*="response-container"]',
    'article[class*="response"]',
    'article[class*="assistant"]',
    'main article',
    '[role="main"] article',
  ].join(",");

  const elements = Array.from(document.querySelectorAll(selector)).filter(
    (element) => isVisible(element) && !element.matches("main, [role='main']")
  );
  return elements.filter((element) => normalizeResponseText(element.innerText || element.textContent));
}

function getElementSignature(element) {
  const parts = [];
  let current = element;

  while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body && parts.length < 7) {
    let part = current.tagName.toLowerCase();

    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }

    const classNames = Array.from(current.classList || []).slice(0, 2);
    if (classNames.length) {
      part += `.${classNames.join(".")}`;
    }

    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children).filter(
        (child) => child.tagName === current.tagName
      );
      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }

    parts.unshift(part);
    current = current.parentElement;
  }

  return parts.join(">");
}

function isLikelyUiNoiseText(text) {
  const normalized = normalizeResponseText(text);
  if (!normalized) return true;
  if (isTransientStatusText(normalized)) return true;
  if (GEMINI_UI_NOISE_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  if (normalized.length <= 8 && /(gemini|assistant|ai|\u53cc\u5b50\u5ea7|\u8c46\u5305)/iu.test(normalized)) {
    return true;
  }
  return false;
}

function extractMeaningfulTextFromElement(element) {
  if (!element || !isVisible(element)) return "";

  const clone = element.cloneNode(true);
  const cleanupSelector = [
    "button",
    "[role='button']",
    "nav",
    "header",
    "footer",
    "textarea",
    "input",
    "select",
    "option",
    "script",
    "style",
    "svg",
    "img",
  ].join(",");
  clone.querySelectorAll(cleanupSelector).forEach((node) => node.remove());

  const text = normalizeResponseText(clone.innerText || clone.textContent || "");
  if (!text || isLikelyUiNoiseText(text)) return "";
  return text;
}

function getResponseQualityScore(text) {
  if (!text || isLikelyUiNoiseText(text)) return -1;
  let score = text.length;
  const lineCount = text.split("\n").filter(Boolean).length;
  score += Math.min(30, lineCount * 5);
  if (/[。！？.!?]/u.test(text)) score += 8;
  if (/^[-*]\s/m.test(text) || /^\d+\.\s/m.test(text)) score += 6;
  return score;
}

function isTransientStatusText(text) {
  const normalized = normalizeResponseText(text);
  if (!normalized) return true;
  if (GEMINI_TRANSIENT_STATUS_PATTERNS.some((pattern) => pattern.test(normalized))) return true;

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length || lines.length > 3) return false;
  return lines.every((line) => GEMINI_TRANSIENT_STATUS_PATTERNS.some((pattern) => pattern.test(line)));
}

function chooseHigherQualityText(primary, fallback) {
  const primaryScore = getResponseQualityScore(primary);
  const fallbackScore = getResponseQualityScore(fallback);
  if (primaryScore > fallbackScore) return normalizeResponseText(primary);
  if (fallbackScore > primaryScore) return normalizeResponseText(fallback);
  return normalizeResponseText(primary || fallback || "");
}

function isDeliverableResponseText(text) {
  const normalized = normalizeResponseText(text);
  if (!normalized) return false;
  if (isTransientStatusText(normalized)) return false;
  return getResponseQualityScore(normalized) >= 0;
}

const NETWORK_PAGE_SOURCE = "__AI_SIDEBAR_PAGE_BRIDGE__gemini";
const NETWORK_CONTENT_SOURCE = "__AI_SIDEBAR_CONTENT_BRIDGE__gemini";
const NETWORK_BRIDGE_SCRIPT_ID = "ai-sidebar-network-bridge-gemini";
const NETWORK_IDLE_SETTLE_MS = 4000;
const GEMINI_STREAM_GENERATE_PATH_RE =
  /\/assistant\.lamda\.BardFrontendService\/StreamGenerate\b/i;
const NETWORK_AD_NOISE_PATTERNS = [
  /下载.*(豆包|gemini)/i,
  /(打开|安装|升级).*(app|应用|客户端)/i,
  /^广告[:：]?/i,
];

const GEMINI_REASONING_NOISE_PATTERNS = [
  /^(thinking|thought process|internal reasoning|chain of thought)\b/i,
  /^(?:\u6b63\u5728\u601d\u8003|\u601d\u8003\u4e2d|\u63a8\u7406\u4e2d)\b/u,
];

function stripLeadingGeminiReasoningText(text) {
  const normalized = normalizeResponseText(text);
  if (!normalized) return "";

  const lines = normalized.split("\n");
  if (!lines.length) return normalized;

  const firstLine = lines[0].trim();
  const startsWithReasoningMarker =
    GEMINI_REASONING_NOISE_PATTERNS.some((pattern) => pattern.test(firstLine)) ||
    /^```(?:thinking|reasoning|analysis)\b/i.test(firstLine);
  if (!startsWithReasoningMarker) {
    return normalized;
  }

  const blankLineIndex = lines.findIndex((line, index) => index > 0 && !line.trim());
  if (blankLineIndex >= 0 && blankLineIndex + 1 < lines.length) {
    return normalizeResponseText(lines.slice(blankLineIndex + 1).join("\n"));
  }

  if (lines.length > 1) {
    return normalizeResponseText(lines.slice(1).join("\n"));
  }

  return "";
}

const networkTrackers = new Map();
let networkBridgeListenerBound = false;
let networkBridgeReadyPromise = null;

function decodeJsonEscapedString(text) {
  try {
    return JSON.parse(`"${text}"`);
  } catch (error) {
    return String(text || "")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}

function isPromptEchoText(text, promptVariants = []) {
  const normalized = normalizeResponseText(text).toLowerCase();
  if (!normalized) return true;
  if (normalized.length < 16) return false;

  return promptVariants.some((variant) => {
    const candidate = normalizeResponseText(variant).toLowerCase();
    if (!candidate || candidate.length < 12) return false;
    if (normalized === candidate) return normalized.length >= 24;
    if (candidate.includes(normalized) && normalized.length >= 36) return true;
    if (normalized.includes(candidate) && candidate.length >= 36 && normalized.length - candidate.length < 80) {
      return true;
    }
    return false;
  });
}

function collectStringCandidatesFromValue(value, results, path = "") {
  if (typeof value === "string") {
    results.push({
      text: value,
      path,
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStringCandidatesFromValue(item, results, `${path}[${index}]`);
    });
    return;
  }

  if (value && typeof value === "object") {
    Object.keys(value).forEach((key) => {
      collectStringCandidatesFromValue(value[key], results, path ? `${path}.${key}` : key);
    });
  }
}

function appendMergedSegment(base, segment) {
  const current = normalizeResponseText(base);
  const next = normalizeResponseText(segment);
  if (!next) return current;
  if (!current) return next;
  if (current === next) return current;
  if (current.length >= 12 && next.length >= 12) {
    if (current.includes(next)) return current;
    if (next.includes(current)) return next;
  }

  const maxOverlap = Math.min(current.length, next.length, 200);
  for (let size = maxOverlap; size >= 6; size -= 1) {
    if (current.slice(-size) === next.slice(0, size)) {
      return current + next.slice(size);
    }
  }

  for (let size = maxOverlap; size >= 6; size -= 1) {
    if (next.slice(-size) === current.slice(0, size)) {
      return next + current.slice(size);
    }
  }

  if (next.length <= 4) {
    if (current.endsWith(next)) {
      return current;
    }
    return current + next;
  }

  return current + next;
}

function parseJsonSafe(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function isUsefulGeminiNetworkText(text, promptVariants = []) {
  const normalized = stripLeadingGeminiReasoningText(text);
  if (!normalized) return "";
  if (normalized.length < 1) return "";
  if (isLikelyUiNoiseText(normalized)) return "";
  if (isTransientStatusText(normalized)) return "";
  const extraAdNoisePatterns = [
    /\u4e0b\u8f7d.*(?:\u8c46\u5305|gemini)/i,
    /(?:download|install|open).*(?:app|client)/i,
    /(?:\u5b89\u88c5|\u6253\u5f00|\u4e0b\u8f7d).*(?:app|\u5ba2\u6237\u7aef|\u5e94\u7528)/i,
    /^\s*(?:\u5e7f\u544a|ad|advertisement)\s*[:\uff1a]?/i,
  ];
  if (
    NETWORK_AD_NOISE_PATTERNS.some((pattern) => pattern.test(normalized)) ||
    extraAdNoisePatterns.some((pattern) => pattern.test(normalized))
  ) {
    return "";
  }
  if (GEMINI_REASONING_NOISE_PATTERNS.some((pattern) => pattern.test(normalized)) && normalized.length <= 80) {
    return "";
  }
  if (isPromptEchoText(normalized, promptVariants)) return "";
  return normalized;
}

function extractGeminiTextFromRcBlock(block, promptVariants = []) {
  if (!Array.isArray(block)) return "";
  if (typeof block[0] !== "string" || !block[0].startsWith("rc_")) return "";
  if (!Array.isArray(block[1])) return "";

  let merged = "";
  block[1].forEach((segment) => {
    if (typeof segment !== "string") return;
    const usefulText = isUsefulGeminiNetworkText(segment, promptVariants);
    if (!usefulText) return;
    merged = appendMergedSegment(merged, usefulText);
  });
  return merged;
}

function extractGeminiNetworkDataFromValue(value, promptVariants, collector) {
  if (!Array.isArray(value)) return;

  const responseBlockText = extractGeminiTextFromRcBlock(value, promptVariants);
  if (responseBlockText) {
    collector.text = responseBlockText;
  }

  if (
    value.length >= 2 &&
    typeof value[0] === "string" &&
    value[0].startsWith("c_") &&
    Array.isArray(value[1]) &&
    typeof value[1][1] === "string" &&
    value[1][1].startsWith("r_")
  ) {
    collector.responseId = value[1][1];
  }

  if (
    value.length >= 2 &&
    Array.isArray(value[1]) &&
    typeof value[1][0] === "string" &&
    value[1][0].startsWith("c_") &&
    typeof value[1][1] === "string" &&
    value[1][1].startsWith("r_")
  ) {
    collector.responseId = value[1][1];
  }

  value.forEach((item) => {
    if (Array.isArray(item)) {
      extractGeminiNetworkDataFromValue(item, promptVariants, collector);
    }
  });
}

function parseGeminiNetworkPayload(raw, tracker) {
  const promptVariants = Array.isArray(tracker?.promptVariants) ? tracker.promptVariants : [];
  const parsed = {
    text: "",
    responseId: tracker?.responseId || "",
  };

  String(raw || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("[["))
    .forEach((line) => {
      const outer = parseJsonSafe(line);
      if (!Array.isArray(outer)) return;

      outer.forEach((entry) => {
        if (!Array.isArray(entry) || entry[0] !== "wrb.fr" || typeof entry[2] !== "string") {
          return;
        }

        const inner = parseJsonSafe(entry[2]);
        if (!Array.isArray(inner)) return;

        const collector = {
          text: "",
          responseId: parsed.responseId,
        };
        extractGeminiNetworkDataFromValue(inner, promptVariants, collector);
        if (!collector.responseId) {
          const stringCandidates = [];
          collectStringCandidatesFromValue(inner, stringCandidates);
          const responseIdCandidate = stringCandidates.find((item) => {
            const value = typeof item?.text === "string" ? item.text.trim() : "";
            if (!/^r_[a-z0-9_]+$/i.test(value)) return false;
            const path = String(item?.path || "");
            return /\.18$/.test(path) || /\[1\]\[1\]$/.test(path);
          });
          if (responseIdCandidate) {
            collector.responseId = responseIdCandidate.text;
          }
        }

        if (!parsed.responseId && collector.responseId) {
          parsed.responseId = collector.responseId;
        }
        if (parsed.responseId && collector.responseId && collector.responseId !== parsed.responseId) {
          return;
        }

        const candidate = collector.text;
        if (candidate) {
          parsed.text = candidate;
        }
      });
    });

  parsed.text = normalizeResponseText(parsed.text);
  return parsed;
}

function createNetworkTracker(requestId, promptText) {
  return {
    requestId,
    promptText,
    promptVariants: getPromptTextVariants(promptText),
    startedAt: Date.now(),
    bestText: "",
    lastUpdateAt: 0,
    completed: false,
    rawBuffer: "",
    responseId: "",
    sawStreamGenerate: false,
  };
}

function ensureNetworkBridge() {
  if (networkBridgeReadyPromise) {
    return networkBridgeReadyPromise;
  }

  if (!document.documentElement) {
    networkBridgeReadyPromise = Promise.resolve();
    return networkBridgeReadyPromise;
  }

  const script = document.createElement("script");
  script.id = NETWORK_BRIDGE_SCRIPT_ID;
  script.src = safeRuntimeGetURL("page-network-bridge.js");
  if (!script.src) {
    networkBridgeReadyPromise = Promise.resolve();
    return networkBridgeReadyPromise;
  }
  script.dataset.provider = "gemini";
  script.dataset.pageSource = NETWORK_PAGE_SOURCE;
  script.dataset.contentSource = NETWORK_CONTENT_SOURCE;

  networkBridgeReadyPromise = new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", finish, { once: true });
    setTimeout(finish, 1500);
  });

  (document.head || document.documentElement).appendChild(script);
  return networkBridgeReadyPromise;
}

function bindNetworkBridgeListener() {
  if (networkBridgeListenerBound) return;
  networkBridgeListenerBound = true;

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== NETWORK_PAGE_SOURCE || data.provider !== "gemini") return;
    if (!data.requestId) return;

    const tracker = networkTrackers.get(data.requestId);
    if (!tracker) return;

    if (data.type === "network-payload") {
      if (!GEMINI_STREAM_GENERATE_PATH_RE.test(String(data.url || ""))) {
        return;
      }

      tracker.lastUpdateAt = Date.now();
      tracker.sawStreamGenerate = true;
      const raw = typeof data.raw === "string" ? data.raw : "";
      if (data.phase === "chunk") {
        tracker.rawBuffer += raw;
      } else if (raw) {
        tracker.rawBuffer = raw.length >= tracker.rawBuffer.length ? raw : tracker.rawBuffer + raw;
      }

      const parsed = parseGeminiNetworkPayload(tracker.rawBuffer, tracker);
      if (parsed.responseId) {
        tracker.responseId = parsed.responseId;
      }
      if (
        parsed.text &&
        getResponseQualityScore(parsed.text) >= getResponseQualityScore(tracker.bestText)
      ) {
        tracker.bestText = parsed.text;
      }

      if (data.phase === "final") {
        tracker.completed = true;
      }
    }
  });
}

async function startNetworkTracking(requestId, promptText) {
  await ensureNetworkBridge();
  bindNetworkBridgeListener();

  const tracker = createNetworkTracker(requestId, promptText);
  networkTrackers.set(requestId, tracker);

  window.postMessage(
    {
      source: NETWORK_CONTENT_SOURCE,
      type: "track-start",
      requestId,
      promptText,
      promptVariants: tracker.promptVariants,
      startedAt: tracker.startedAt,
    },
    "*"
  );

  return tracker;
}

function stopNetworkTracking(requestId) {
  if (!requestId) return;
  window.postMessage(
    {
      source: NETWORK_CONTENT_SOURCE,
      type: "track-stop",
      requestId,
    },
    "*"
  );
}

function getNetworkTrackerState(requestId) {
  return networkTrackers.get(requestId) || null;
}

function cleanupTrackedRequest(requestId) {
  stopNetworkTracking(requestId);
  networkTrackers.delete(requestId);
}

void ensureNetworkBridge().then(() => {
  bindNetworkBridgeListener();
});

function collectResponseCandidates() {
  return getResponseCandidateElements()
    .map((element) => {
      const text =
        extractMeaningfulTextFromElement(element) ||
        normalizeResponseText(element.innerText || element.textContent);
      return {
        element,
        text,
        signature: getElementSignature(element),
      };
    })
    .filter((item) => item.text && !isLikelyUiNoiseText(item.text));
}

function getButtonDescriptor(button) {
  return normalizeText(
    [
      button.getAttribute("aria-label"),
      button.getAttribute("title"),
      button.getAttribute("data-test-id"),
      button.textContent,
    ]
      .filter(Boolean)
      .join(" ")
  ).toLowerCase();
}

function isLikelyCompletionToolbar(container) {
  if (!container || !isVisible(container)) return false;

  const buttons = Array.from(container.querySelectorAll("button, [role='button']")).filter(isVisible);
  if (buttons.length < 4 || buttons.length > 8) return false;

  const descriptorText = buttons.map(getButtonDescriptor).join(" ");
  const keywordHits = GEMINI_COMPLETION_ACTION_KEYWORDS.filter((keyword) =>
    descriptorText.includes(keyword)
  ).length;
  const iconButtonCount = buttons.filter((button) => button.querySelector("svg")).length;
  const compactTextLength = normalizeText(container.innerText || container.textContent || "").length;

  if (iconButtonCount >= 4 && compactTextLength <= 80) {
    return true;
  }

  return keywordHits >= 2 || (keywordHits >= 1 && iconButtonCount >= 4);
}

function getCompletionSearchContainers(candidateElement) {
  const containers = [];
  const seen = new Set();

  const push = (element) => {
    if (!element || seen.has(element)) return;
    seen.add(element);
    containers.push(element);
  };

  let current = candidateElement;
  for (let depth = 0; current && current !== document.body && depth < 5; depth += 1) {
    push(current);
    push(current.nextElementSibling);
    if (current.parentElement) {
      push(current.parentElement);
      push(current.parentElement.nextElementSibling);
      Array.from(current.parentElement.children)
        .slice(0, 12)
        .forEach(push);
    }
    current = current.parentElement;
  }

  return containers;
}

function hasResponseCompletionUi(candidateElement) {
  const containers = getCompletionSearchContainers(candidateElement);

  for (const container of containers) {
    if (isLikelyCompletionToolbar(container)) {
      return true;
    }

    const childContainers = Array.from(container.children || []).slice(0, 12);
    for (const child of childContainers) {
      if (isLikelyCompletionToolbar(child)) {
        return true;
      }
    }
  }

  return false;
}

function extractResponseFromCompletionUi(snapshot = []) {
  const toolbarCandidates = Array.from(document.querySelectorAll("div, section, article, footer")).filter(
    isLikelyCompletionToolbar
  );
  let bestText = "";
  let bestScore = -1;

  const considerElement = (element) => {
    if (!element || !isVisible(element)) return;
    const text = extractMeaningfulTextFromElement(element);
    if (!text || isLikelyUiNoiseText(text)) return;
    const score = getResponseQualityScore(text);
    if (score > bestScore || (score === bestScore && text.length > bestText.length)) {
      bestText = text;
      bestScore = score;
    }
  };

  for (let index = toolbarCandidates.length - 1; index >= 0; index -= 1) {
    let current = toolbarCandidates[index];

    for (let depth = 0; current && current !== document.body && depth < 6; depth += 1) {
      let prev = current.previousElementSibling;
      let siblingChecks = 0;
      while (prev && siblingChecks < 8) {
        considerElement(prev);
        prev = prev.previousElementSibling;
        siblingChecks += 1;
      }

      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const currentIndex = siblings.indexOf(current);
        for (let i = currentIndex - 1; i >= Math.max(0, currentIndex - 6); i -= 1) {
          considerElement(siblings[i]);
        }
      }

      current = current.parentElement;
    }
  }

  return bestText;
}

function getConversationRoot() {
  return document.querySelector("chat-app") || document.querySelector("main") || document.body;
}

function getPromptTextVariants(promptText) {
  const normalized = normalizeResponseText(promptText);
  if (!normalized) return [];

  const variants = new Set([normalized]);
  const userPromptMatch = normalized.match(/用户的提问[:：]\s*([\s\S]+)$/);
  if (userPromptMatch && userPromptMatch[1]) {
    variants.add(normalizeResponseText(userPromptMatch[1]));
  }

  const sections = normalized
    .split(/\n{2,}/)
    .map((section) => normalizeResponseText(section))
    .filter(Boolean);
  if (sections.length) {
    variants.add(sections[sections.length - 1]);
  }

  const expanded = new Set();
  variants.forEach((variant) => {
    if (!variant) return;
    expanded.add(variant);
    if (variant.length > 160) {
      expanded.add(variant.slice(0, 160));
      expanded.add(variant.slice(-160));
    }
  });

  return Array.from(expanded)
    .filter((variant) => variant && variant.length >= 2)
    .sort((a, b) => b.length - a.length);
}

function getPromptMatchScore(candidateText, promptVariants = []) {
  const candidate = normalizeResponseText(candidateText);
  if (!candidate) return -1;

  let bestScore = -1;
  promptVariants.forEach((variant) => {
    if (!variant) return;
    if (candidate === variant) {
      bestScore = Math.max(bestScore, 10000 - candidate.length);
      return;
    }
    if (variant.length >= 12 && candidate.includes(variant)) {
      bestScore = Math.max(bestScore, 9000 - (candidate.length - variant.length));
      return;
    }
    if (candidate.length >= 12 && variant.includes(candidate)) {
      bestScore = Math.max(bestScore, 8000 - (variant.length - candidate.length));
      return;
    }

    if (variant.length >= 80) {
      const tail = variant.slice(-120);
      const head = variant.slice(0, 120);
      if (tail.length >= 40 && candidate.includes(tail)) {
        bestScore = Math.max(bestScore, 7000 - (candidate.length - tail.length));
      }
      if (head.length >= 40 && candidate.includes(head)) {
        bestScore = Math.max(bestScore, 6800 - (candidate.length - head.length));
      }
    }
  });

  return bestScore;
}

function isElementAfterAnchor(anchorElement, element) {
  if (!anchorElement || !element || anchorElement === element) return false;
  if (!anchorElement.isConnected || !element.isConnected) return false;
  if (anchorElement.contains(element) || element.contains(anchorElement)) return false;

  const position = anchorElement.compareDocumentPosition(element);
  return Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING);
}

function findPromptAnchor(promptVariants = []) {
  if (!promptVariants.length) return null;

  const root = getConversationRoot();
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (!node || node === root || !isVisible(node)) return NodeFilter.FILTER_SKIP;
        if (typeof node.matches === "function") {
          if (
            node.matches("textarea, input, button, form, nav, header, footer, script, style") ||
            node.matches('[contenteditable="true"], [role="textbox"]')
          ) {
            return NodeFilter.FILTER_SKIP;
          }
        }
        if (typeof node.closest === "function" && node.closest("form")) {
          return NodeFilter.FILTER_SKIP;
        }

        const text = normalizeResponseText(node.innerText || node.textContent || "");
        if (!text) return NodeFilter.FILTER_SKIP;
        return getPromptMatchScore(text, promptVariants) >= 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    }
  );

  let best = null;
  let current = walker.nextNode();
  while (current) {
    const text = normalizeResponseText(current.innerText || current.textContent || "");
    let score = getPromptMatchScore(text, promptVariants);
    if (score >= 0) {
      const hasMatchingChild = Array.from(current.children || []).some((child) => {
        if (!isVisible(child)) return false;
        const childText = normalizeResponseText(child.innerText || child.textContent || "");
        return getPromptMatchScore(childText, promptVariants) >= 0;
      });

      score -= Math.min(1200, text.length);
      if (!hasMatchingChild) {
        score += 300;
      }

      if (!best || score >= best.score) {
        best = {
          element: current,
          score,
        };
      }
    }
    current = walker.nextNode();
  }

  return best ? best.element : null;
}

function filterCandidatesForAnchor(candidates, anchorElement = null, promptVariants = []) {
  if (!anchorElement) {
    return candidates;
  }

  return candidates.filter((candidate) => {
    if (!candidate || !candidate.element || !candidate.text) return false;
    if (!isElementAfterAnchor(anchorElement, candidate.element)) return false;
    if (getPromptMatchScore(candidate.text, promptVariants) >= 0) return false;
    return true;
  });
}

function selectLatestResponseCandidate(candidates) {
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index];
    if (getResponseQualityScore(candidate.text) >= 0) {
      return candidate;
    }
  }
  return null;
}

function selectCompletedResponseCandidate(candidates) {
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index];
    if (getResponseQualityScore(candidate.text) < 0) continue;
    if (hasResponseCompletionUi(candidate.element)) {
      return candidate;
    }
  }
  return null;
}

function captureResponseSnapshot() {
  return collectResponseCandidates().map((item) => ({
    signature: item.signature,
    text: item.text,
  }));
}

function getChangedResponseCandidates(snapshot = []) {
  const candidates = collectResponseCandidates();
  const snapshotBySignature = new Map(
    snapshot
      .filter((item) => item && item.signature)
      .map((item) => [item.signature, item.text || ""])
  );

  return candidates.filter((candidate, index) => {
    if (isLikelyUiNoiseText(candidate.text)) return false;

    const snapshotAtIndex = snapshot[index];
    if (!snapshotAtIndex) return true;
    if (snapshotAtIndex.signature !== candidate.signature) return true;
    if (snapshotAtIndex.text !== candidate.text) return true;

    const previousBySignature = snapshotBySignature.get(candidate.signature);
    return previousBySignature !== undefined && previousBySignature !== candidate.text;
  });
}

function extractLatestResponse(snapshot = []) {
  const changedCandidate = selectLatestResponseCandidate(getChangedResponseCandidates(snapshot));
  if (changedCandidate) {
    return changedCandidate.text;
  }

  const currentCandidate = selectLatestResponseCandidate(collectResponseCandidates());
  if (currentCandidate) {
    return currentCandidate.text;
  }

  return extractResponseFromCompletionUi(snapshot);
}

function extractCompletedResponse(snapshot = []) {
  const changedCandidate = selectCompletedResponseCandidate(getChangedResponseCandidates(snapshot));
  if (changedCandidate) {
    return changedCandidate.text;
  }

  const currentCandidate = selectCompletedResponseCandidate(collectResponseCandidates());
  if (currentCandidate) {
    return currentCandidate.text;
  }

  return "";
}

function setComposerText(inputElement, text) {
  inputElement.focus();

  if (inputElement.isContentEditable) {
    document.execCommand("selectAll", false, null);
    const inserted = document.execCommand("insertText", false, text);
    if (!inserted) {
      inputElement.textContent = text;
    }
    inputElement.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  if ("value" in inputElement) {
    const prototype =
      inputElement.tagName === "TEXTAREA"
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    if (descriptor && typeof descriptor.set === "function") {
      descriptor.set.call(inputElement, text);
    } else {
      inputElement.value = text;
    }

    try {
      inputElement.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: text,
          inputType: "insertText",
        })
      );
    } catch (error) {
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function getComposerText(inputElement) {
  if (!inputElement) return "";
  if (inputElement.isContentEditable) {
    return normalizeText(inputElement.innerText || inputElement.textContent || "");
  }
  if ("value" in inputElement) {
    return normalizeText(inputElement.value || "");
  }
  return "";
}

function getEnhancedSendButton() {
  const composerRoot = getComposerRoot();
  const scopes = composerRoot ? [composerRoot, document] : [document];
  const selectors = [
    '[data-test-id="send-button"]',
    '[data-testid="send-button"]',
    'button[data-test-id*="send" i]',
    'button[data-testid*="send" i]',
    'button[aria-label*="send" i]',
    'button[title*="send" i]',
    'button[aria-label*="\u53d1\u9001"]',
    'button[title*="\u53d1\u9001"]',
    '[role="button"][aria-label*="send" i]',
    '[role="button"][aria-label*="\u53d1\u9001"]',
    'button[type="submit"]',
  ];
  const seen = new Set();
  const candidates = [];

  scopes.forEach((scope) => {
    selectors.forEach((selector) => {
      Array.from(scope.querySelectorAll(selector)).forEach((element) => {
        if (!element || seen.has(element) || !isVisible(element)) return;
        seen.add(element);
        candidates.push(element);
      });
    });
  });

  const keywordCandidate = findButtonByKeywords([
    "send message",
    "send",
    "\u53d1\u9001",
    "\u63d0\u4ea4",
  ], composerRoot || document);
  if (keywordCandidate && !seen.has(keywordCandidate)) {
    candidates.push(keywordCandidate);
  }

  const activeButton = candidates.find((element) => !isElementDisabled(element));
  return activeButton || candidates[0] || null;
}

function triggerFormSubmit(inputElement) {
  if (!inputElement || !inputElement.closest) return false;
  const form = inputElement.closest("form");
  if (!form) return false;

  try {
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
    return true;
  } catch (error) {
    return false;
  }
}

function dispatchEnterKey(inputElement, options = {}) {
  if (!inputElement) return false;

  const eventInit = {
    bubbles: true,
    cancelable: true,
    key: "Enter",
    code: "Enter",
    keyCode: 13,
    which: 13,
    ctrlKey: !!options.ctrlKey,
    metaKey: !!options.metaKey,
    shiftKey: !!options.shiftKey,
  };

  try {
    inputElement.focus();
    inputElement.dispatchEvent(new KeyboardEvent("keydown", eventInit));
    inputElement.dispatchEvent(new KeyboardEvent("keypress", eventInit));
    inputElement.dispatchEvent(new KeyboardEvent("keyup", eventInit));
    return true;
  } catch (error) {
    return false;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSendStart(inputElement, beforeText, timeoutMs = 4500) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (isGenerationInProgress()) return true;

    const currentText = getComposerText(inputElement);
    if (!currentText || (beforeText && currentText !== beforeText)) {
      return true;
    }

    await wait(150);
  }

  return false;
}

async function tryTriggerSend(inputElement) {
  const beforeText = getComposerText(inputElement);

  let sendButton = getEnhancedSendButton();
  if (sendButton && !isElementDisabled(sendButton)) {
    sendButton.click();
    if (await waitForSendStart(inputElement, beforeText)) return true;
  }

  if (triggerFormSubmit(inputElement)) {
    if (await waitForSendStart(inputElement, beforeText)) return true;
  }

  if (dispatchEnterKey(inputElement)) {
    if (await waitForSendStart(inputElement, beforeText)) return true;
  }

  if (dispatchEnterKey(inputElement, { ctrlKey: true })) {
    if (await waitForSendStart(inputElement, beforeText)) return true;
  }

  if (dispatchEnterKey(inputElement, { metaKey: true })) {
    if (await waitForSendStart(inputElement, beforeText)) return true;
  }

  await wait(250);
  sendButton = getEnhancedSendButton();
  if (sendButton && !isElementDisabled(sendButton)) {
    sendButton.click();
    if (await waitForSendStart(inputElement, beforeText, 5000)) return true;
  }

  return false;
}

function getHistoryAnchors() {
  const anchors = Array.from(
    document.querySelectorAll("nav a[href], aside a[href], [role='navigation'] a[href], a[href*='/app/']")
  );

  const seen = new Set();
  const items = [];

  anchors.forEach((anchor) => {
    const title = normalizeText(anchor.innerText || anchor.textContent);
    if (!title || title.length < 2) return;

    try {
      const url = new URL(anchor.href, location.href);
      const isChatUrl = /\/app\/.+/.test(url.pathname) || /\/chat\//.test(url.pathname);
      if (!isChatUrl) return;

      const id = `${url.pathname}${url.search}`;
      if (seen.has(id)) return;
      seen.add(id);

      items.push({
        id,
        title,
        url: url.toString(),
      });
    } catch (error) {
      console.warn("Gemini Content Script: Failed to parse chat history URL.", error);
    }
  });

  return items.slice(0, 40);
}

function openHistoryItem(request) {
  const anchors = Array.from(document.querySelectorAll("a[href]"));
  const target = anchors.find((anchor) => {
    try {
      const text = normalizeText(anchor.innerText || anchor.textContent);
      const url = new URL(anchor.href, location.href);
      return (
        anchor.href === request.url ||
        `${url.pathname}${url.search}` === request.chatId ||
        text === normalizeText(request.title)
      );
    } catch (error) {
      return false;
    }
  });

  if (target) {
    target.click();
    return true;
  }

  if (request.url) {
    window.location.href = request.url;
    return true;
  }

  return false;
}

function extractAnchoredLatestResponse(snapshot, anchorElement, promptVariants) {
  const changedCandidate = selectLatestResponseCandidate(
    filterCandidatesForAnchor(getChangedResponseCandidates(snapshot), anchorElement, promptVariants)
  );
  if (changedCandidate) {
    return changedCandidate.text;
  }

  const currentCandidate = selectLatestResponseCandidate(
    filterCandidatesForAnchor(collectResponseCandidates(), anchorElement, promptVariants)
  );
  if (currentCandidate) {
    return currentCandidate.text;
  }

  return "";
}

function extractAnchoredCompletedResponse(snapshot, anchorElement, promptVariants) {
  const changedCandidate = selectCompletedResponseCandidate(
    filterCandidatesForAnchor(getChangedResponseCandidates(snapshot), anchorElement, promptVariants)
  );
  if (changedCandidate) {
    return changedCandidate.text;
  }

  const currentCandidate = selectCompletedResponseCandidate(
    filterCandidatesForAnchor(collectResponseCandidates(), anchorElement, promptVariants)
  );
  if (currentCandidate) {
    return currentCandidate.text;
  }

  return "";
}

function extractAnchoredToolbarResponse(snapshot, anchorElement, promptVariants) {
  const allCandidates = filterCandidatesForAnchor(
    collectResponseCandidates(),
    anchorElement,
    promptVariants
  );
  const bestCandidate = selectLatestResponseCandidate(allCandidates);
  if (bestCandidate && hasResponseCompletionUi(bestCandidate.element)) {
    return bestCandidate.text;
  }
  return "";
}

function createResponseTracker(promptText, snapshot, requestStartedAt) {
  return {
    createdAt: typeof requestStartedAt === "number" ? requestStartedAt : Date.now(),
    promptText,
    promptVariants: getPromptTextVariants(promptText),
    snapshot,
    anchorElement: null,
    anchorLookupAttempts: 0,
    bestText: "",
    lastObservedText: "",
    stablePolls: 0,
    sawBusyUi: false,
    readyUiStablePolls: 0,
  };
}

function finalizeResponse(sourceTabId, requestId, tracker, deadlineAt) {
  if (!tracker.anchorElement || !tracker.anchorElement.isConnected || !isVisible(tracker.anchorElement)) {
    tracker.anchorLookupAttempts += 1;
    tracker.anchorElement = findPromptAnchor(tracker.promptVariants);
  }

  let responseText = "";
  let completedResponseText = "";
  let toolbarResponseText = "";

  if (tracker.anchorElement) {
    responseText = extractAnchoredLatestResponse(
      tracker.snapshot,
      tracker.anchorElement,
      tracker.promptVariants
    );
    completedResponseText = extractAnchoredCompletedResponse(
      tracker.snapshot,
      tracker.anchorElement,
      tracker.promptVariants
    );
    toolbarResponseText =
      !responseText && !completedResponseText
        ? extractAnchoredToolbarResponse(tracker.snapshot, tracker.anchorElement, tracker.promptVariants)
        : "";
  } else if (
    tracker.anchorLookupAttempts >= 5 ||
    Date.now() + GEMINI_RESPONSE_POLL_MS >= deadlineAt
  ) {
    const changedCandidates = getChangedResponseCandidates(tracker.snapshot);
    const latestChangedCandidate = selectLatestResponseCandidate(changedCandidates);
    const completedChangedCandidate = selectCompletedResponseCandidate(changedCandidates);
    responseText = latestChangedCandidate ? latestChangedCandidate.text : "";
    completedResponseText = completedChangedCandidate ? completedChangedCandidate.text : "";
  }

  if (responseText) {
    tracker.bestText = responseText;
  }
  if (completedResponseText) {
    tracker.bestText = completedResponseText;
  }
  if (toolbarResponseText) {
    tracker.bestText = toolbarResponseText;
  }

  const networkTracker = getNetworkTrackerState(requestId);
  const networkText = networkTracker && networkTracker.bestText ? networkTracker.bestText : "";
  if (networkText) {
    tracker.bestText = chooseHigherQualityText(tracker.bestText, networkText);
  }

  const settledText = tracker.bestText;
  if (settledText) {
    if (settledText === tracker.lastObservedText) {
      tracker.stablePolls += 1;
    } else {
      tracker.lastObservedText = settledText;
      tracker.stablePolls = 0;
    }
  }

  const uiReadyNow = isComposerReadyForNextMessage();
  const uiBusyNow = !uiReadyNow;
  if (uiBusyNow) {
    tracker.sawBusyUi = true;
    tracker.readyUiStablePolls = 0;
  } else {
    tracker.readyUiStablePolls += 1;
  }

  const hasUiCompletionSignal = tracker.sawBusyUi && tracker.readyUiStablePolls >= GEMINI_UI_READY_STABLE_POLLS;
  const hasMinResponseDelay = Date.now() - tracker.createdAt >= GEMINI_MIN_RESPONSE_DELAY_MS;
  const canFinalizeByUi = hasUiCompletionSignal && hasMinResponseDelay;

  if (!canFinalizeByUi && Date.now() < deadlineAt) {
    setTimeout(
      () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
      GEMINI_RESPONSE_POLL_MS
    );
    return;
  }

  if (canFinalizeByUi) {
    const finalCandidate = chooseHigherQualityText(
      chooseHigherQualityText(completedResponseText, networkText),
      settledText
    );
    if (isDeliverableResponseText(finalCandidate)) {
      cleanupTrackedRequest(requestId);
      sendGeminiResponse({ text: finalCandidate, sourceTabId, requestId });
      return;
    }

    if (Date.now() < deadlineAt) {
      setTimeout(
        () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
        GEMINI_RESPONSE_POLL_MS
      );
      return;
    }
  }

  if (Date.now() < deadlineAt) {
    setTimeout(
      () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
      GEMINI_RESPONSE_POLL_MS
    );
    return;
  }

  if (!canFinalizeByUi) {
    cleanupTrackedRequest(requestId);
    sendGeminiResponse({
      text: "Error: Gemini response timeout. UI completion signal was not observed.",
      sourceTabId,
      requestId,
    });
    return;
  }

  const deadlineCandidate = chooseHigherQualityText(
    chooseHigherQualityText(tracker.bestText, completedResponseText),
    networkText
  );
  if (isDeliverableResponseText(deadlineCandidate)) {
    cleanupTrackedRequest(requestId);
    sendGeminiResponse({ text: deadlineCandidate, sourceTabId, requestId });
    return;
  }

  cleanupTrackedRequest(requestId);
  sendGeminiResponse({
    text: "Error: Gemini generated content, but the extension could not identify a new response for this request.",
    sourceTabId,
    requestId,
  });
}

function observeResponse(sourceTabId, requestId, promptText, snapshot, deadlineAt, requestStartedAt) {
  const tracker = createResponseTracker(promptText, snapshot, requestStartedAt);
  setTimeout(() => {
    finalizeResponse(sourceTabId, requestId, tracker, deadlineAt);
  }, 1200);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ success: true, page: "gemini" });
    return false;
  }

  if (request.action === "send_prompt") {
    const inputElement = getInputElement();
    if (!inputElement) {
      sendGeminiResponse({
        text: "Error: Could not find the Gemini input box on the page.",
        sourceTabId: request.sourceTabId,
        requestId: request.requestId,
      });
      sendResponse({ success: false, message: "Input box not found." });
      return true;
    }

    const snapshot = captureResponseSnapshot();
    const requestStartedAt = Date.now();
    const deadlineAt = Date.now() + GEMINI_RESPONSE_WAIT_MS;
    setComposerText(inputElement, request.text);

    setTimeout(() => {
      void (async () => {
        try {
          await startNetworkTracking(request.requestId, request.text);
          const sent = await tryTriggerSend(inputElement);
          if (!sent) {
            cleanupTrackedRequest(request.requestId);
            sendGeminiResponse({
              text: "Error: Could not trigger Gemini send action on the page.",
              sourceTabId: request.sourceTabId,
              requestId: request.requestId,
            });
            return;
          }

          observeResponse(
            request.sourceTabId,
            request.requestId,
            request.text,
            snapshot,
            deadlineAt,
            requestStartedAt
          );
        } catch (error) {
          cleanupTrackedRequest(request.requestId);
          sendGeminiResponse({
            text: `Error: Failed to send prompt to Gemini. ${error?.message || ""}`.trim(),
            sourceTabId: request.sourceTabId,
            requestId: request.requestId,
          });
        }
      })();
    }, 800);

    sendResponse({ success: true, message: "Prompt injected and send process started." });
    return true;
  }

  if (request.action === "gemini_new_chat") {
    const newChatButton = getNewChatButton();
    if (!newChatButton) {
      sendResponse({ success: false, message: "未找到 Gemini 的“新建对话”按钮。" });
      return true;
    }

    newChatButton.click();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "gemini_get_history") {
    const items = getHistoryAnchors();
    sendResponse({ success: true, items });
    return true;
  }

  if (request.action === "gemini_open_chat") {
    const opened = openHistoryItem(request);
    sendResponse({
      success: opened,
      message: opened ? "Opened Gemini chat." : "未找到指定的 Gemini 历史对话。",
    });
    return true;
  }

  return false;
});
