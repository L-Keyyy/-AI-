// content-doubao.js

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

const DOUBAO_RESPONSE_WAIT_MS = 300000;
const DOUBAO_RESPONSE_POLL_MS = 1000;
const DOUBAO_UI_READY_STABLE_POLLS = 2;
const DOUBAO_MIN_RESPONSE_DELAY_MS = 2000;
const DOUBAO_COMPLETION_ACTION_KEYWORDS = [
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
  "点赞",
  "点踩",
  "复制",
  "重试",
  "重新生成",
  "更多",
];

const DOUBAO_UI_NOISE_PATTERNS = [
  /^(doubao|assistant|ai)\s*(said|says|response)?[:：]?$/i,
  /^\s*\u8c46\u5305\s*\u8bf4[:：]?\s*$/u,
  /^\s*gemini\s*\u8bf4[:：]?\s*$/iu,
  /^\s*\u53cc\u5b50\u5ea7\u8bf4[:：]?\s*$/u,
  /^\s*\.\.\.\s*$/,
  /^\s*\u2026\s*$/,
];

const DOUBAO_REFERENCE_ONLY_PATTERNS = [
  /^(?:\u53c2\u8003|references?)\s*\d+\s*(?:\u7bc7|\u6761|\u4e2a)?\s*(?:\u8d44\u6599|\u53c2\u8003\u8d44\u6599|\u6765\u6e90|\u6587\u732e|sources?)?\s*$/iu,
  /^(?:\u5f15\u7528|citations?)\s*\d+\s*(?:\u6761|\u4e2a)?\s*(?:\u6765\u6e90|sources?)?\s*$/iu,
];

const DOUBAO_TRANSIENT_STATUS_PATTERNS = [
  /^(?:\u6b63\u5728)?\u641c\u7d22(?:\u4e2d)?[.\u2026]*$/u,
  /^(?:\u6b63\u5728)?(?:\u9605\u8bfb|\u67e5\u9605|\u68c0\u7d22)(?:\u4e2d)?[.\u2026]*$/u,
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
      console.warn("Doubao extension context invalidated.", error);
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
      console.warn("Doubao extension context invalidated.", error);
      return "";
    }
    throw error;
  }
}

function sendProviderResponse(payload) {
  safeRuntimeSendMessage({
    action: "gemini_response",
    text: payload.text,
    sourceTabId: payload.sourceTabId,
    requestId: payload.requestId,
    provider: payload.provider || "doubao",
  });
}

function isVisible(element) {
  if (!element) return false;
  const styleValue = window.getComputedStyle(element);
  return styleValue.display !== "none" && styleValue.visibility !== "hidden";
}

function isElementDisabled(element) {
  if (!element) return true;
  if (element.disabled) return true;
  return element.getAttribute("aria-disabled") === "true";
}

function stripDoubaoReferenceNoise(text) {
  const normalized = normalizeResponseText(text);
  if (!normalized) return "";

  const lines = normalized
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim());

  const cleanedLines = [];
  const prefixFoundMaterialsRe =
    /^(?:\s*\u7ed3\u5408?\u641c\u7d22\u4e2d?)?(?:(?:\u627e\u5230|found)\s*\d+\s*(?:\u7bc7|\u6761|\u4e2a)?\s*(?:\u8d44\u6599|\u53c2\u8003\u8d44\u6599|sources?)\s*){1,10}/iu;
  const standaloneReferenceLineRe =
    /^(?:\u53c2\u8003|references?|citations?)\s*\d+\s*(?:\u7bc7|\u6761|\u4e2a)?\s*(?:\u8d44\u6599|\u53c2\u8003\u8d44\u6599|\u6765\u6e90|\u6587\u732e|sources?)?\s*$/iu;
  const inlineCutoffRe =
    /\s*(?:\u641c\u7d22\s*\d+\s*\u4e2a?\s*\u5173?\u952e?\u8bcd|(?:\u53c2\u8003|references?|citations?)\s*\d+\s*(?:\u7bc7|\u6761|\u4e2a)?\s*(?:\u8d44\u6599|\u53c2\u8003\u8d44\u6599|\u6765\u6e90|\u6587\u732e|sources?))/iu;

  for (const rawLine of lines) {
    let line = rawLine.replace(prefixFoundMaterialsRe, "").trim();
    if (!line) {
      continue;
    }

    if (standaloneReferenceLineRe.test(line)) {
      continue;
    }

    const inlineCutoffMatch = line.match(inlineCutoffRe);
    if (inlineCutoffMatch) {
      const cutoffAt = typeof inlineCutoffMatch.index === "number" ? inlineCutoffMatch.index : -1;
      const kept = cutoffAt > 0 ? line.slice(0, cutoffAt).trim() : "";
      if (kept) {
        cleanedLines.push(kept);
      }
      break;
    }

    cleanedLines.push(line);
  }

  return normalizeResponseText(cleanedLines.join("\n"));
}

function isReferenceOnlyText(text) {
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized) return false;

  const compact = normalized.replace(/\s+/g, "");
  if (
    /^(?:\u53c2\u8003|references?)\d+(?:\u7bc7|\u6761|\u4e2a)?(?:\u8d44\u6599|\u53c2\u8003\u8d44\u6599|\u6765\u6e90|\u6587\u732e|sources?)?$/iu.test(
      compact
    )
  ) {
    return true;
  }
  if (/^(?:\u5f15\u7528|citations?)\d+(?:\u6761|\u4e2a)?(?:\u6765\u6e90|sources?)?$/iu.test(compact)) {
    return true;
  }

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length || lines.length > 2) return false;
  return lines.every((line) => DOUBAO_REFERENCE_ONLY_PATTERNS.some((pattern) => pattern.test(line)));
}

function isLikelySearchInstructionEchoText(text) {
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized) return false;
  if (normalized.length > 320) return false;
  if (!/(https?:\/\/|www\.)/i.test(normalized)) return false;
  return /^(?:\u8bf7|\u5e2e\u6211|\u9ebb\u70e6|\u53bb|\u5148|\u518d)?\s*(?:\u67e5(?:\u4e00)?\u4e0b|\u67e5\u627e|\u641c\u7d22|\u68c0\u7d22|\u770b(?:\u4e00)?\u4e0b|\u770b\u770b|\u6d4f\u89c8|\u6253\u5f00|\u53bb\u770b|\u53bb\u67e5)/u.test(
    normalized
  );
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

function getComposerRoot() {
  const explicitRoot = document.querySelector('[data-testid="chat_input"]');
  if (explicitRoot && isVisible(explicitRoot)) return explicitRoot;

  const inputElement = document.querySelector(
    'textarea[data-testid="chat_input_input"], textarea, [role="textbox"], div[contenteditable="true"]'
  );
  if (!inputElement) return null;

  let current = inputElement.parentElement;
  for (let depth = 0; current && current !== document.body && depth < 8; depth += 1) {
    if (
      current.querySelector('[data-testid="chat_input_send_button"]') ||
      current.querySelector('[data-testid="chat_input_local_break_button"]') ||
      current.querySelector('[data-testid="chat_input_stop_button"]') ||
      current.querySelector('[data-testid="asr_btn"]')
    ) {
      return current;
    }
    current = current.parentElement;
  }

  return inputElement.closest("form") || inputElement.parentElement || null;
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

function isComposerReadyIndicatorVisible() {
  const sendButton = findComposerControl(['[data-testid="chat_input_send_button"]']);
  if (sendButton && !isElementDisabled(sendButton)) return true;

  const asrButton = findComposerControl(['[data-testid="asr_btn"]']);
  if (asrButton && !isElementDisabled(asrButton)) return true;

  return false;
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
    'div[contenteditable="true"][role="textbox"]',
    'rich-textarea div[contenteditable="true"]',
    'div[contenteditable="true"]',
    'textarea[aria-label*="message" i]',
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

function getSendButton() {
  return (
    findComposerControl(['[data-testid="chat_input_send_button"]']) ||
    findComposerControl(['[data-testid*="send" i]']) ||
    findComposerControl(['[data-test-id*="send" i]']) ||
    findButtonByKeywords(
      ["send", "\u53d1\u9001", "\u63d0\u4ea4", "\u95ee\u4e00\u95ee"],
      getComposerRoot() || document
    ) ||
    findButtonByKeywords(["send", "发送", "提交"]) ||
    findComposerControl(['button[type="submit"]']) ||
    document.querySelector('button[type="submit"]')
  );
}

function getStopGeneratingButton() {
  return (
    findComposerControl(['[data-testid="chat_input_local_break_button"]']) ||
    findComposerControl(['[data-testid="chat_input_stop_button"]']) ||
    findComposerControl(['[data-testid*="stop" i]']) ||
    findComposerControl(['[data-test-id*="stop" i]']) ||
    findButtonByKeywords(
      ["stop", "stop generating", "\u505c\u6b62", "\u505c\u6b62\u751f\u6210", "\u7ec8\u6b62"],
      getComposerRoot() || document
    ) ||
    findButtonByKeywords(["stop", "停止", "终止"])
  );
}

function getReliableSendButton() {
  return (
    findComposerControl(['[data-testid="chat_input_send_button"]']) ||
    findComposerControl(['[data-testid*="send" i]']) ||
    findComposerControl(['[data-test-id*="send" i]']) ||
    findComposerControl(['button[aria-label*="send" i]']) ||
    findComposerControl(['button[title*="send" i]']) ||
    findComposerControl(['button[aria-label*="\u53d1\u9001"]']) ||
    findComposerControl(['button[title*="\u53d1\u9001"]']) ||
    findButtonByKeywords(
      ["send", "\u53d1\u9001", "\u63d0\u4ea4", "\u95ee\u4e00\u95ee"],
      getComposerRoot() || document
    ) ||
    findComposerControl(['button[type="submit"]']) ||
    document.querySelector('button[type="submit"]') ||
    getSendButton()
  );
}

function getReliableStopGeneratingButton() {
  return (
    findComposerControl(['[data-testid="chat_input_local_break_button"]']) ||
    findComposerControl(['[data-testid="chat_input_stop_button"]']) ||
    findComposerControl(['[data-testid*="stop" i]']) ||
    findComposerControl(['[data-test-id*="stop" i]']) ||
    findComposerControl(['button[aria-label*="stop" i]']) ||
    findComposerControl(['button[title*="stop" i]']) ||
    findComposerControl(['button[aria-label*="\u505c\u6b62"]']) ||
    findComposerControl(['button[title*="\u505c\u6b62"]']) ||
    findButtonByKeywords(
      ["stop", "stop generating", "\u505c\u6b62", "\u505c\u6b62\u751f\u6210", "\u7ec8\u6b62"],
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
  if (!isComposerReadyIndicatorVisible()) return false;
  return !isGenerationInProgress();
}

function getResponseCandidateElements() {
  const selector = [
    '[data-testid*="assistant" i]',
    '[data-testid*="response" i]',
    '[data-test-id*="assistant" i]',
    '[data-test-id*="response" i]',
    '[data-testid*="answer" i]',
    '[data-test-id*="answer" i]',
    '[data-testid*="message" i]',
    '[data-test-id*="message" i]',
    ".assistant",
    ".assistant-message",
    ".ai-message",
    ".message-content",
    ".markdown",
    "markdown",
    'div[class*="assistant"]',
    'div[class*="response"]',
    'div[class*="answer"]',
    'div[class*="message"]',
    'div[class*="markdown"]',
    'article[class*="assistant"]',
    'article[class*="response"]',
    "main article",
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
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized) return true;
  if (isReferenceOnlyText(normalized)) return true;
  if (isLikelySearchInstructionEchoText(normalized)) return true;
  if (isTransientStatusText(normalized)) return true;
  if (DOUBAO_UI_NOISE_PATTERNS.some((pattern) => pattern.test(normalized))) return true;
  if (normalized.length <= 8 && /(doubao|assistant|ai|gemini|\u8c46\u5305|\u53cc\u5b50\u5ea7)/iu.test(normalized)) {
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

  const text = stripDoubaoReferenceNoise(clone.innerText || clone.textContent || "");
  if (!text || isLikelyUiNoiseText(text)) return "";
  return text;
}

function getResponseQualityScore(text) {
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized || isLikelyUiNoiseText(normalized)) return -1;
  let score = normalized.length;
  const lineCount = normalized.split("\n").filter(Boolean).length;
  score += Math.min(30, lineCount * 5);
  if (/[。！？.!?]/u.test(normalized)) score += 8;
  if (/^[-*]\s/m.test(normalized) || /^\d+\.\s/m.test(normalized)) score += 6;
  return score;
}

function isTransientStatusText(text) {
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized) return true;
  if (DOUBAO_TRANSIENT_STATUS_PATTERNS.some((pattern) => pattern.test(normalized))) return true;

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length || lines.length > 3) return false;
  return lines.every((line) => DOUBAO_TRANSIENT_STATUS_PATTERNS.some((pattern) => pattern.test(line)));
}

function chooseHigherQualityText(primary, fallback) {
  const primaryScore = getResponseQualityScore(primary);
  const fallbackScore = getResponseQualityScore(fallback);
  if (primaryScore > fallbackScore) return stripDoubaoReferenceNoise(primary);
  if (fallbackScore > primaryScore) return stripDoubaoReferenceNoise(fallback);
  return stripDoubaoReferenceNoise(primary || fallback || "");
}

function isDeliverableResponseText(text) {
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized) return false;
  if (isReferenceOnlyText(normalized)) return false;
  if (isLikelySearchInstructionEchoText(normalized)) return false;
  if (isTransientStatusText(normalized)) return false;
  return getResponseQualityScore(normalized) >= 0;
}

const NETWORK_PAGE_SOURCE = "__AI_SIDEBAR_PAGE_BRIDGE__doubao";
const NETWORK_CONTENT_SOURCE = "__AI_SIDEBAR_CONTENT_BRIDGE__doubao";
const NETWORK_BRIDGE_SCRIPT_ID = "ai-sidebar-network-bridge-doubao";
const NETWORK_IDLE_SETTLE_MS = 4000;
const DOUBAO_CHAT_COMPLETION_PATH_RE = /\/chat\/completion\b/i;
const NETWORK_AD_NOISE_PATTERNS = [
  /下载.*豆包/i,
  /(打开|安装|升级).*(app|应用|客户端)/i,
  /^广告[:：]?/i,
];

const DOUBAO_PROMO_TAIL_PATTERNS = [
  /(继续挑战|再来一波|还想继续|想再来|继续试试|猜你想问|继续聊聊|继续问我)/i,
  /(下载|打开|安装|升级).*(豆包|app|应用|客户端)/i,
  /(点击|查看|体验).*(更多|功能|内容)/i,
  /[👇👉⬇️]$/u,
];

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

function parseSseEvents(raw) {
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => {
      const lines = chunk.split("\n");
      let eventName = "";
      const dataLines = [];

      lines.forEach((line) => {
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          return;
        }
        if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim());
        }
      });

      return {
        event: eventName,
        dataText: dataLines.join("\n"),
      };
    })
    .filter((item) => item.event || item.dataText);
}

const DOUBAO_NETWORK_TEXT_PATH_INCLUDE_RE =
  /(?:^|\.|\[)(?:text|text_block|plain_text|rich_text|markdown|md|answer|delta|brief)(?:$|\.|\[)/i;
const DOUBAO_NETWORK_TEXT_PATH_EXCLUDE_RE =
  /(?:^|\.|\[)(?:url|uri|link|href|image|img|icon|avatar|logo|id|uuid|token|conversation|section|message_id|query|question|prompt|suggest|recommend|button|card|action|citation|reference|source|meta|ext|trace|debug|agent|model|reasoning|thought|material|document|doc|snippet|search_result|result_list|webpage|passage|chunk_context)(?:$|\.|\[)/i;

function isUsefulNetworkText(text, promptVariants = []) {
  const normalized = stripDoubaoReferenceNoise(text);
  if (!normalized) return "";
  if (normalized.length < 1) return "";
  if (isReferenceOnlyText(normalized)) return "";
  if (isLikelySearchInstructionEchoText(normalized)) return "";
  if (/^https?:\/\/\S+$/i.test(normalized.replace(/\s+/g, ""))) return "";
  if (isLikelyUiNoiseText(normalized)) return "";
  if (isTransientStatusText(normalized)) return "";
  const extraAdNoisePatterns = [
    /\u4e0b\u8f7d.*\u8c46\u5305/i,
    /download\s*doubao/i,
    /(?:\u6253\u5f00|\u5b89\u88c5|\u5347\u7ea7).*(?:app|\u5e94\u7528|\u5ba2\u6237\u7aef)/i,
    /(?:open|install|upgrade).*(?:app|client)/i,
    /^\s*(?:\u5e7f\u544a|ad|advertisement)\s*[:\uff1a]?/i,
  ];
  if (
    NETWORK_AD_NOISE_PATTERNS.some((pattern) => pattern.test(normalized)) ||
    extraAdNoisePatterns.some((pattern) => pattern.test(normalized))
  ) {
    return "";
  }
  if (isPromptEchoText(normalized, promptVariants)) return "";
  return normalized;
}

function extractUsefulTextFromUnknownPayload(value, promptVariants = [], depth = 0) {
  const candidates = [];
  collectStringCandidatesFromValue(value, candidates, "");

  let merged = "";
  candidates.forEach((item) => {
    const path = String(item?.path || "");
    if (path && DOUBAO_NETWORK_TEXT_PATH_EXCLUDE_RE.test(path)) return;
    if (path && !DOUBAO_NETWORK_TEXT_PATH_INCLUDE_RE.test(path)) return;

    const rawText = typeof item?.text === "string" ? item.text.trim() : "";
    if (
      depth < 2 &&
      rawText &&
      ((rawText.startsWith("{") && rawText.endsWith("}")) || (rawText.startsWith("[") && rawText.endsWith("]")))
    ) {
      const parsedNested = parseJsonSafe(rawText);
      if (parsedNested && typeof parsedNested === "object") {
        const nestedText = extractUsefulTextFromUnknownPayload(parsedNested, promptVariants, depth + 1);
        if (nestedText) {
          merged = appendMergedSegment(merged, nestedText);
        }
        return;
      }
    }

    const text = isUsefulNetworkText(item?.text, promptVariants);
    if (!text) return;
    merged = appendMergedSegment(merged, text);
  });

  return merged;
}

function extractDoubaoTextFromContentBlocks(blocks, promptVariants = []) {
  if (!Array.isArray(blocks)) return "";

  let merged = "";
  blocks.forEach((block) => {
    const directFields = [
      block?.content?.text_block?.text,
      block?.content?.text,
      block?.content?.plain_text,
      block?.content?.markdown,
      block?.content?.md,
      block?.content?.rich_text?.text,
    ];

    directFields.forEach((value) => {
      const text = isUsefulNetworkText(value, promptVariants);
      if (!text) return;
      merged = appendMergedSegment(merged, text);
    });

    const recursiveText = extractUsefulTextFromUnknownPayload(block?.content, promptVariants);
    if (recursiveText) {
      merged = appendMergedSegment(merged, recursiveText);
    }
  });

  return merged;
}

function trimDoubaoPromotionalTail(text) {
  const normalized = normalizeResponseText(text);
  if (!normalized) return "";

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  while (lines.length) {
    const tail = lines[lines.length - 1];
    const compactTail = tail.replace(/\s+/g, "");
    const suggestionLikeTail =
      compactTail.length <= 60 &&
      (/[\u2192\u27a1\u2b95]$/.test(tail) ||
        /^(?:\u5199\u4e00\u7bc7|\u5982\u4f55|\u9664\u4e86|\u4e0b\u8f7d\u8c46\u5305\u7535\u8111\u7248|\u4f53\u9a8c\u66f4\u5f3a\u5927\u7684\s*ai)/iu.test(
          tail
        ));
    const looksPromotional =
      compactTail.length <= 80 &&
      DOUBAO_PROMO_TAIL_PATTERNS.some((pattern) => pattern.test(tail));

    if (!looksPromotional && !suggestionLikeTail) {
      break;
    }

    lines.pop();
  }

  return lines.join("\n").trim();
}

function createDoubaoMessageEnvelope(eventName, payload) {
  if (!payload || typeof payload !== "object") return null;

  if (eventName === "FULL_MSG_NOTIFY" && payload.message && typeof payload.message === "object") {
    const message = payload.message;
    return {
      userType: Number(message.user_type),
      messageId: typeof message.message_id === "string" ? message.message_id : "",
      replyToMessageId:
        typeof message.bot_reply_message_id === "string" ? message.bot_reply_message_id : "",
      contentBlocks: Array.isArray(message.content_block) ? message.content_block : [],
      ttsContent: typeof message.tts_content === "string" ? message.tts_content : "",
      localMessageId:
        typeof message.local_message_id === "string" ? message.local_message_id : "",
    };
  }

  const meta = payload.meta || {};
  const content = payload.content || {};
  return {
    userType: Number(meta.user_type),
    messageId: typeof meta.message_id === "string" ? meta.message_id : "",
    replyToMessageId:
      typeof meta.bot_reply_message_id === "string" ? meta.bot_reply_message_id : "",
    contentBlocks: Array.isArray(content.content_block) ? content.content_block : [],
    ttsContent: typeof content.tts_content === "string" ? content.tts_content : "",
    localMessageId: typeof meta.local_message_id === "string" ? meta.local_message_id : "",
  };
}

function mergeDoubaoAssistantMessage(parsed, envelope, promptVariants = []) {
  if (!envelope) return false;

  const userType = Number(envelope.userType);
  if (userType === 1) {
    if (!parsed.questionMessageId && envelope.messageId) {
      parsed.questionMessageId = envelope.messageId;
    }
    if (!parsed.questionLocalMessageId && envelope.localMessageId) {
      parsed.questionLocalMessageId = envelope.localMessageId;
    }
    return true;
  }

  if (userType !== 2) {
    return false;
  }

  if (
    parsed.questionMessageId &&
    envelope.replyToMessageId &&
    envelope.replyToMessageId !== parsed.questionMessageId
  ) {
    return true;
  }

  if (
    parsed.responseMessageId &&
    envelope.messageId &&
    envelope.messageId !== parsed.responseMessageId
  ) {
    return true;
  }
  if (!parsed.responseMessageId && envelope.messageId) {
    parsed.responseMessageId = envelope.messageId;
  }

  const contentText = extractDoubaoTextFromContentBlocks(envelope.contentBlocks, promptVariants);
  if (contentText) {
    parsed.sawContentBlockText = true;
    parsed.text = appendMergedSegment(parsed.text, contentText);
    return true;
  }

  // tts_content often duplicates CHUNK_DELTA, keep it only as fallback.
  if (!parsed.hasChunkDelta) {
    const fallbackTtsText = isUsefulNetworkText(envelope.ttsContent, promptVariants);
    if (fallbackTtsText && (!parsed.sawContentBlockText || fallbackTtsText.length >= 8)) {
      parsed.text = appendMergedSegment(parsed.text, fallbackTtsText);
    }
  }

  return true;
}

function parseDoubaoNetworkPayload(raw, tracker) {
  const promptVariants = Array.isArray(tracker?.promptVariants) ? tracker.promptVariants : [];
  const parsed = {
    text: "",
    completed: false,
    responseMessageId: tracker?.responseMessageId || "",
    questionMessageId: tracker?.questionMessageId || "",
    questionLocalMessageId: tracker?.questionLocalMessageId || "",
    hasChunkDelta: false,
    sawContentBlockText: false,
  };

  parseSseEvents(raw).forEach((eventItem) => {
    const payload = parseJsonSafe(eventItem.dataText);
    if (!payload) return;

    if (eventItem.event === "SSE_ACK") {
      const ackQuestionId = payload?.query_list?.[0]?.question_id;
      if (typeof ackQuestionId === "string" && ackQuestionId) {
        parsed.questionMessageId = ackQuestionId;
      }
      const ackLocalMessageId = payload?.query_list?.[0]?.local_message_id;
      if (typeof ackLocalMessageId === "string" && ackLocalMessageId) {
        parsed.questionLocalMessageId = ackLocalMessageId;
      }
      return;
    }

    if (eventItem.event === "STREAM_MSG_NOTIFY" || eventItem.event === "FULL_MSG_NOTIFY") {
      const envelope = createDoubaoMessageEnvelope(eventItem.event, payload);
      mergeDoubaoAssistantMessage(parsed, envelope, promptVariants);

      const payloadUserType = Number(payload?.meta?.user_type ?? payload?.message?.user_type);
      if (payloadUserType === 2) {
        const assistantPayloadValue =
          payload?.content ||
          (payload?.message
            ? {
                content_block: payload.message.content_block,
                tts_content: payload.message.tts_content,
                content: payload.message.content,
              }
            : payload);
        const fallbackPayloadText = extractUsefulTextFromUnknownPayload(
          assistantPayloadValue,
          promptVariants
        );
        if (fallbackPayloadText) {
          parsed.text = appendMergedSegment(parsed.text, fallbackPayloadText);
        }
      }
      return;
    }

    if (eventItem.event === "CHUNK_DELTA") {
      const deltaText = isUsefulNetworkText(payload?.text, promptVariants);
      if (deltaText) {
        parsed.text = appendMergedSegment(parsed.text, deltaText);
        parsed.hasChunkDelta = true;
      } else {
        const fallbackDeltaText = extractUsefulTextFromUnknownPayload(payload, promptVariants);
        if (fallbackDeltaText) {
          parsed.text = appendMergedSegment(parsed.text, fallbackDeltaText);
          parsed.hasChunkDelta = true;
        }
      }
      return;
    }

    if (eventItem.event === "STREAM_CHUNK") {
      const messageId = typeof payload?.message_id === "string" ? payload.message_id : "";
      if (parsed.responseMessageId && messageId && messageId !== parsed.responseMessageId) {
        return;
      }
      if (!parsed.responseMessageId && messageId) {
        parsed.responseMessageId = messageId;
      }

      const patchOps = Array.isArray(payload?.patch_op) ? payload.patch_op : [];
      patchOps.forEach((patch) => {
        const patchValue = patch?.patch_value || {};
        const patchText = extractDoubaoTextFromContentBlocks(patchValue?.content_block, promptVariants);
        if (patchText) {
          parsed.sawContentBlockText = true;
          parsed.text = appendMergedSegment(parsed.text, patchText);
        }

        const fallbackPatchText = extractUsefulTextFromUnknownPayload(patchValue, promptVariants);
        if (fallbackPatchText) {
          parsed.text = appendMergedSegment(parsed.text, fallbackPatchText);
        }

        if (!patchText && !parsed.hasChunkDelta) {
          const patchObject = Number(patch?.patch_object);
          const ttsText = isUsefulNetworkText(patchValue?.tts_content, promptVariants);
          if (
            patchObject === 111 &&
            ttsText &&
            (!parsed.sawContentBlockText || ttsText.length >= 8)
          ) {
            parsed.text = appendMergedSegment(parsed.text, ttsText);
          }
        }

        if (String(patchValue?.ext?.is_finish || "") === "1") {
          parsed.completed = true;
        }
      });
      return;
    }

    if (eventItem.event === "SSE_REPLY_END") {
      const endType = Number(payload?.end_type);
      if (endType === 1) {
        const finishedMessageId =
          typeof payload?.msg_finish_attr?.msgid === "string" ? payload.msg_finish_attr.msgid : "";
        if (!parsed.responseMessageId && finishedMessageId) {
          parsed.responseMessageId = finishedMessageId;
        }
        if (!finishedMessageId || !parsed.responseMessageId || finishedMessageId === parsed.responseMessageId) {
          parsed.completed = true;
        }

        const briefText = isUsefulNetworkText(payload?.msg_finish_attr?.brief, promptVariants);
        if (briefText && !parsed.text) {
          parsed.text = briefText;
        }
        return;
      }

      if (endType === 3 || !endType) {
        parsed.completed = true;
      }
    }
  });

  parsed.text = stripDoubaoReferenceNoise(trimDoubaoPromotionalTail(parsed.text));
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
    responseMessageId: "",
    questionMessageId: "",
    questionLocalMessageId: "",
    sawChatCompletion: false,
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
  script.dataset.provider = "doubao";
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
    if (!data || data.source !== NETWORK_PAGE_SOURCE || data.provider !== "doubao") return;
    if (!data.requestId) return;

    const tracker = networkTrackers.get(data.requestId);
    if (!tracker) return;

    if (data.type === "network-payload") {
      if (!DOUBAO_CHAT_COMPLETION_PATH_RE.test(String(data.url || ""))) {
        return;
      }

      tracker.lastUpdateAt = Date.now();
      tracker.sawChatCompletion = true;

      const raw = typeof data.raw === "string" ? data.raw : "";
      if (data.phase === "chunk") {
        tracker.rawBuffer += raw;
      } else if (raw) {
        tracker.rawBuffer = raw.length >= tracker.rawBuffer.length ? raw : tracker.rawBuffer + raw;
      }

      const parsed = parseDoubaoNetworkPayload(tracker.rawBuffer, tracker);
      if (parsed.responseMessageId) {
        tracker.responseMessageId = parsed.responseMessageId;
      }
      if (parsed.questionMessageId) {
        tracker.questionMessageId = parsed.questionMessageId;
      }
      if (parsed.questionLocalMessageId) {
        tracker.questionLocalMessageId = parsed.questionLocalMessageId;
      }
      if (
        parsed.text &&
        getResponseQualityScore(parsed.text) >= getResponseQualityScore(tracker.bestText)
      ) {
        tracker.bestText = parsed.text;
      }

      if (parsed.completed || data.phase === "final") {
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
      button.getAttribute("data-testid"),
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
  if (buttons.length < 4 || buttons.length > 10) return false;

  const descriptorText = buttons.map(getButtonDescriptor).join(" ");
  const keywordHits = DOUBAO_COMPLETION_ACTION_KEYWORDS.filter((keyword) =>
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
  return document.querySelector("main") || document.body;
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

function getRankedCandidate(candidates, requireCompletionUi = false) {
  let bestCandidate = null;
  let bestScore = -Infinity;

  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index];
    if (!candidate || !candidate.text) continue;
    if (requireCompletionUi && !hasResponseCompletionUi(candidate.element)) continue;

    const normalized = normalizeResponseText(candidate.text);
    if (!normalized || isReferenceOnlyText(normalized)) continue;

    const quality = getResponseQualityScore(normalized);
    if (quality < 0) continue;

    const distanceFromTail = candidates.length - 1 - index;
    const recencyBonus = Math.max(0, 36 - distanceFromTail * 6);
    const substantiveBonus = normalized.length >= 120 ? 28 : normalized.length >= 60 ? 14 : 0;
    const score = quality + recencyBonus + substantiveBonus;

    if (!bestCandidate || score > bestScore || (score === bestScore && index > bestCandidate.index)) {
      bestCandidate = {
        item: candidate,
        index,
      };
      bestScore = score;
    }
  }

  return bestCandidate ? bestCandidate.item : null;
}

function selectLatestResponseCandidate(candidates) {
  return getRankedCandidate(candidates, false);
}

function selectCompletedResponseCandidate(candidates) {
  return getRankedCandidate(candidates, true);
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
    '[data-testid="chat_input_send_button"]',
    '[data-testid="send-button"]',
    '[data-test-id="send-button"]',
    'button[data-testid*="send" i]',
    'button[data-test-id*="send" i]',
    '[role="button"][data-testid*="send" i]',
    '[role="button"][data-test-id*="send" i]',
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
    "send",
    "\u53d1\u9001",
    "\u63d0\u4ea4",
    "\u95ee\u4e00\u95ee",
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
    Date.now() + DOUBAO_RESPONSE_POLL_MS >= deadlineAt
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

  const hasUiCompletionSignal = tracker.sawBusyUi && tracker.readyUiStablePolls >= DOUBAO_UI_READY_STABLE_POLLS;
  const hasMinResponseDelay = Date.now() - tracker.createdAt >= DOUBAO_MIN_RESPONSE_DELAY_MS;
  const canFinalizeByUi = hasUiCompletionSignal && hasMinResponseDelay;
  const hasStableObservedText = !settledText || tracker.stablePolls >= 1;
  const networkRecentlyActive =
    !!networkTracker &&
    networkTracker.sawChatCompletion &&
    networkTracker.lastUpdateAt > 0 &&
    Date.now() - networkTracker.lastUpdateAt < NETWORK_IDLE_SETTLE_MS;

  if (!canFinalizeByUi && Date.now() < deadlineAt) {
    setTimeout(
      () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
      DOUBAO_RESPONSE_POLL_MS
    );
    return;
  }

  if (canFinalizeByUi && (!hasStableObservedText || networkRecentlyActive) && Date.now() < deadlineAt) {
    setTimeout(
      () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
      DOUBAO_RESPONSE_POLL_MS
    );
    return;
  }

  if (canFinalizeByUi) {
    const finalCandidate = chooseHigherQualityText(
      chooseHigherQualityText(networkText, completedResponseText),
      settledText
    );
    if (isDeliverableResponseText(finalCandidate)) {
      const cleanedFinalCandidate = stripDoubaoReferenceNoise(finalCandidate);
      cleanupTrackedRequest(requestId);
      sendProviderResponse({ text: cleanedFinalCandidate, sourceTabId, requestId });
      return;
    }

    if (Date.now() < deadlineAt) {
      setTimeout(
        () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
        DOUBAO_RESPONSE_POLL_MS
      );
      return;
    }
  }

  if (Date.now() < deadlineAt) {
    setTimeout(
      () => finalizeResponse(sourceTabId, requestId, tracker, deadlineAt),
      DOUBAO_RESPONSE_POLL_MS
    );
    return;
  }

  if (!canFinalizeByUi) {
    cleanupTrackedRequest(requestId);
    sendProviderResponse({
      text: "Error: Doubao response timeout. UI completion signal was not observed.",
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
    const cleanedDeadlineCandidate = stripDoubaoReferenceNoise(deadlineCandidate);
    cleanupTrackedRequest(requestId);
    sendProviderResponse({ text: cleanedDeadlineCandidate, sourceTabId, requestId });
    return;
  }

  cleanupTrackedRequest(requestId);
  sendProviderResponse({
    text: "Error: Doubao generated content, but the extension could not identify a new response for this request.",
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

function getDoubaoNewChatButton() {
  return (
    document.querySelector('[data-testid*="new" i][data-testid*="chat" i]') ||
    document.querySelector('[data-test-id*="new" i][data-test-id*="chat" i]') ||
    findButtonByKeywords(["新对话", "新建对话", "新聊天", "发起新对话", "new chat", "new conversation"]) ||
    Array.from(document.querySelectorAll("a[href], button, [role='button']")).find((element) => {
      if (!isVisible(element)) return false;
      const text = normalizeText(element.innerText || element.textContent || "").toLowerCase();
      if (!text) return false;
      return /^(?:新对话|新建对话|new chat|new conversation)/i.test(text);
    }) ||
    null
  );
}

function isDoubaoHistoryNoiseTitle(title) {
  const value = normalizeText(title);
  if (!value || value.length < 2) return true;
  return /^(?:新对话|新建对话|AI创作|云盘|更多|历史对话|关于豆包|登录|下载电脑版|Ctrl\s*K|\+\s*新对话)$/iu.test(
    value
  );
}

function getDoubaoHistoryItems() {
  const seen = new Set();
  const items = [];

  const push = (item) => {
    const id = String(item && item.id ? item.id : "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    items.push(item);
  };

  Array.from(document.querySelectorAll("aside a[href], nav a[href], a[href*='/chat/']")).forEach((anchor) => {
    if (!isVisible(anchor)) return;
    const title = normalizeText(anchor.innerText || anchor.textContent || "");
    if (isDoubaoHistoryNoiseTitle(title)) return;

    try {
      const url = new URL(anchor.href, location.href);
      if (!/\/chat\/\d+/i.test(url.pathname)) return;
      push({
        id: `${url.pathname}${url.search}`,
        title,
        url: url.toString(),
      });
    } catch (error) {
      // ignore malformed URLs
    }
  });

  if (items.length) {
    return items.slice(0, 60);
  }

  const historyContainers = Array.from(
    document.querySelectorAll(
      "aside [class*='history' i], aside [class*='conversation' i], nav [class*='history' i], nav [class*='conversation' i]"
    )
  );
  const scopedRoots = historyContainers.length
    ? historyContainers
    : Array.from(document.querySelectorAll("aside, nav")).filter(isVisible);

  scopedRoots.forEach((root, rootIndex) => {
    Array.from(root.querySelectorAll("[role='button'], button, li, div")).forEach((node, nodeIndex) => {
      if (!isVisible(node)) return;
      const title = normalizeText(node.innerText || node.textContent || "");
      if (isDoubaoHistoryNoiseTitle(title) || title.length > 120) return;

      const clickable = node.matches("[role='button'], button, a[href]") || node.tabIndex >= 0;
      if (!clickable) return;

      push({
        id: `title:${title}:${rootIndex}:${nodeIndex}`,
        title,
      });
    });
  });

  return items.slice(0, 60);
}

function openDoubaoHistoryItem(request) {
  const targetTitle = normalizeText(request.title || "");
  const targetChatId = normalizeText(request.chatId || "");
  const targetUrl = normalizeText(request.url || "");

  const anchor = Array.from(document.querySelectorAll("a[href]")).find((item) => {
    if (!isVisible(item)) return false;
    const title = normalizeText(item.innerText || item.textContent || "");
    try {
      const url = new URL(item.href, location.href);
      const id = `${url.pathname}${url.search}`;
      if (targetUrl && normalizeText(url.toString()) === targetUrl) return true;
      if (targetChatId && normalizeText(id) === targetChatId) return true;
      if (targetTitle && title === targetTitle && /\/chat\/\d+/i.test(url.pathname)) return true;
    } catch (error) {
      return false;
    }
    return false;
  });

  if (anchor) {
    anchor.click();
    return true;
  }

  const buttonLike = Array.from(document.querySelectorAll("aside [role='button'], aside button, nav [role='button'], nav button")).find(
    (item) => {
      if (!isVisible(item)) return false;
      const title = normalizeText(item.innerText || item.textContent || "");
      if (!title || isDoubaoHistoryNoiseTitle(title)) return false;
      return !!targetTitle && title === targetTitle;
    }
  );

  if (buttonLike) {
    buttonLike.click();
    return true;
  }

  if (targetUrl) {
    window.location.href = targetUrl;
    return true;
  }

  return false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ success: true, page: "doubao" });
    return false;
  }

  if (request.action === "send_prompt") {
    const inputElement = getInputElement();
    if (!inputElement) {
      sendProviderResponse({
        text: "Error: Could not find the Doubao input box on the page.",
        sourceTabId: request.sourceTabId,
        requestId: request.requestId,
      });
      sendResponse({ success: false, message: "Input box not found." });
      return true;
    }

    const snapshot = captureResponseSnapshot();
    const requestStartedAt = Date.now();
    const deadlineAt = Date.now() + DOUBAO_RESPONSE_WAIT_MS;
    setComposerText(inputElement, request.text);

    setTimeout(() => {
      void (async () => {
        try {
          await startNetworkTracking(request.requestId, request.text);
          const sent = await tryTriggerSend(inputElement);
          if (!sent) {
            cleanupTrackedRequest(request.requestId);
            sendProviderResponse({
              text: "Error: Could not trigger Doubao send action on the page.",
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
          sendProviderResponse({
            text: `Error: Failed to send prompt to Doubao. ${error?.message || ""}`.trim(),
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
    const newChatButton = getDoubaoNewChatButton();
    if (!newChatButton) {
      sendResponse({ success: false, message: "未找到豆包的“新对话”按钮。" });
      return true;
    }

    newChatButton.click();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "gemini_get_history") {
    const items = getDoubaoHistoryItems();
    sendResponse({ success: true, items });
    return true;
  }

  if (request.action === "gemini_open_chat") {
    const opened = openDoubaoHistoryItem(request);
    sendResponse({
      success: opened,
      message: opened ? "Opened Doubao chat." : "未找到指定的豆包历史对话。",
    });
    return true;
  }

  return false;
});
