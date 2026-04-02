(() => {
  const currentScript = document.currentScript;
  const provider = (currentScript && currentScript.dataset && currentScript.dataset.provider) || "unknown";
  const pageSource =
    (currentScript && currentScript.dataset && currentScript.dataset.pageSource) ||
    `__AI_SIDEBAR_PAGE_BRIDGE__${provider}`;
  const contentSource =
    (currentScript && currentScript.dataset && currentScript.dataset.contentSource) ||
    `__AI_SIDEBAR_CONTENT_BRIDGE__${provider}`;
  const installedKey = `__AI_SIDEBAR_NETWORK_BRIDGE_INSTALLED__${provider}`;

  if (window[installedKey]) {
    currentScript && currentScript.remove();
    return;
  }
  window[installedKey] = true;

  const activeTracks = new Map();
  const socketTrackIds = new WeakMap();

  function normalizeText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function normalizeBodyText(text) {
    return normalizeText(text).toLowerCase();
  }

  function matchesPrompt(bodyText, promptVariants) {
    const normalizedBody = normalizeBodyText(bodyText);
    if (!normalizedBody) return false;

    return promptVariants.some((variant) => {
      const normalizedVariant = normalizeBodyText(variant);
      if (!normalizedVariant || normalizedVariant.length < 6) return false;
      return normalizedBody.includes(normalizedVariant);
    });
  }

  function looksLikeAiRequest(url, bodyText) {
    const target = `${url || ""} ${bodyText || ""}`.toLowerCase();
    return /(generate|chat|conversation|message|prompt|assistant|model|stream|answer|completion|session|dialog|ask|doubao|gemini)/.test(
      target
    );
  }

  function postToContent(type, payload) {
    window.postMessage(
      {
        source: pageSource,
        provider,
        type,
        ...payload,
      },
      "*"
    );
  }

  function bodyToString(body) {
    if (body == null) return "";
    if (typeof body === "string") return body;
    if (body instanceof URLSearchParams) return body.toString();
    if (body instanceof FormData) {
      const parts = [];
      body.forEach((value, key) => {
        parts.push(`${key}=${typeof value === "string" ? value : "[binary]"}`);
      });
      return parts.join("&");
    }
    if (body instanceof Blob) {
      return "[blob]";
    }
    if (body instanceof ArrayBuffer) {
      try {
        return new TextDecoder().decode(body);
      } catch (error) {
        return "[array-buffer]";
      }
    }
    if (ArrayBuffer.isView(body)) {
      try {
        return new TextDecoder().decode(body);
      } catch (error) {
        return "[typed-array]";
      }
    }
    if (typeof body === "object") {
      try {
        return JSON.stringify(body);
      } catch (error) {
        return String(body);
      }
    }
    return String(body);
  }

  function getTrackForRequest(url, bodyText) {
    const now = Date.now();
    let bestTrack = null;
    let bestScore = -1;

    activeTracks.forEach((track) => {
      const age = now - track.startedAt;
      if (age < -1000 || age > 30000) return;

      let score = -1;
      if (matchesPrompt(bodyText, track.promptVariants)) {
        score = 1000 - age;
      } else if (looksLikeAiRequest(url, bodyText) && age <= 12000) {
        score = 100 - age / 1000;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTrack = track;
      }
    });

    return bestTrack;
  }

  function attachFetchHook() {
    if (typeof window.fetch !== "function") return;
    const originalFetch = window.fetch;

    function postFetchPayload(requestId, phase, requestUrl, response, extra = {}) {
      postToContent("network-payload", {
        requestId,
        transport: "fetch",
        phase,
        url: requestUrl,
        status: response && typeof response.status === "number" ? response.status : 0,
        contentType:
          (response &&
            response.headers &&
            typeof response.headers.get === "function" &&
            response.headers.get("content-type")) ||
          "",
        ...extra,
      });
    }

    async function readStreamedFetchResponse(requestId, requestUrl, response, clone) {
      const reader = clone.body && typeof clone.body.getReader === "function" ? clone.body.getReader() : null;
      if (!reader) {
        const raw = await clone.text();
        postFetchPayload(requestId, "final", requestUrl, response, { raw });
        return;
      }

      const decoder = new TextDecoder();
      let raw = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        raw += chunk;
        postFetchPayload(requestId, "chunk", requestUrl, response, { raw: chunk });
      }

      raw += decoder.decode();
      postFetchPayload(requestId, "final", requestUrl, response, { raw });
    }

    window.fetch = function patchedFetch(input, init) {
      const requestUrl =
        typeof input === "string"
          ? input
          : input && typeof input.url === "string"
            ? input.url
            : "";
      const bodyText = bodyToString((init && init.body) || null);
      const track = getTrackForRequest(requestUrl, bodyText);
      const requestId = track && track.requestId;

      return originalFetch.apply(this, arguments).then(
        (response) => {
          if (requestId) {
            const clone = response.clone();
            const responseUrl =
              (response && typeof response.url === "string" && response.url) || requestUrl;
            const contentType =
              (response &&
                response.headers &&
                typeof response.headers.get === "function" &&
                response.headers.get("content-type")) ||
              "";

            const readerPromise = /text\/event-stream/i.test(contentType)
              ? readStreamedFetchResponse(requestId, responseUrl, response, clone)
              : clone.text().then((raw) => {
                  postFetchPayload(requestId, "final", responseUrl, response, { raw });
                });

            Promise.resolve(readerPromise)
              .catch((error) => {
                postFetchPayload(requestId, "error", responseUrl, response, {
                  error: String((error && error.message) || error || "unknown"),
                  contentType,
                });
              });
          }
          return response;
        },
        (error) => {
          if (requestId) {
            postToContent("network-payload", {
              requestId,
              transport: "fetch",
              phase: "error",
              url: requestUrl,
              error: String((error && error.message) || error || "unknown"),
            });
          }
          throw error;
        }
      );
    };
  }

  function attachXhrHook() {
    if (typeof XMLHttpRequest === "undefined") return;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function patchedOpen(method, url) {
      this.__aiSidebarUrl = typeof url === "string" ? url : "";
      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function patchedSend(body) {
      const bodyText = bodyToString(body);
      const track = getTrackForRequest(this.__aiSidebarUrl || "", bodyText);
      if (track) {
        const requestId = track.requestId;
        this.addEventListener("loadend", () => {
          let raw = "";
          try {
            raw = typeof this.responseText === "string" ? this.responseText : "";
          } catch (error) {
            raw = "";
          }
          postToContent("network-payload", {
            requestId,
            transport: "xhr",
            phase: "final",
            url: this.__aiSidebarUrl || "",
            status: this.status,
            raw,
          });
        });
      }
      return originalSend.apply(this, arguments);
    };
  }

  function attachWebSocketHook() {
    if (typeof WebSocket === "undefined") return;
    const OriginalWebSocket = window.WebSocket;

    function PatchedWebSocket(url, protocols) {
      const socket =
        arguments.length > 1 ? new OriginalWebSocket(url, protocols) : new OriginalWebSocket(url);

      socket.addEventListener("message", (event) => {
        const requestId = socketTrackIds.get(socket);
        if (!requestId) return;

        const raw =
          typeof event.data === "string" ? event.data : bodyToString(event.data);
        postToContent("network-payload", {
          requestId,
          transport: "websocket",
          phase: "chunk",
          url: typeof url === "string" ? url : "",
          raw,
        });
      });

      return socket;
    }

    PatchedWebSocket.prototype = OriginalWebSocket.prototype;
    Object.setPrototypeOf(PatchedWebSocket, OriginalWebSocket);

    const originalSend = OriginalWebSocket.prototype.send;
    OriginalWebSocket.prototype.send = function patchedSend(data) {
      const bodyText = bodyToString(data);
      const track = getTrackForRequest("", bodyText);
      if (track) {
        socketTrackIds.set(this, track.requestId);
      }
      return originalSend.apply(this, arguments);
    };

    window.WebSocket = PatchedWebSocket;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== contentSource) return;

    if (data.type === "track-start" && data.requestId) {
      activeTracks.set(data.requestId, {
        requestId: data.requestId,
        startedAt: typeof data.startedAt === "number" ? data.startedAt : Date.now(),
        promptVariants: Array.isArray(data.promptVariants) ? data.promptVariants : [],
      });
      postToContent("track-started", { requestId: data.requestId });
      return;
    }

    if (data.type === "track-stop" && data.requestId) {
      activeTracks.delete(data.requestId);
    }
  });

  attachFetchHook();
  attachXhrHook();
  attachWebSocketHook();

  currentScript && currentScript.remove();
})();
