// External CDN-Based AdBlocker Service
// Uses proven filter lists from uBlock Origin, EasyList, and other sources

export class AdBlockerService {
  constructor() {
    this.isEnabled = true;
    this.isInitialized = false;
    this.filterLists = new Set();
    this.blockedDomains = new Set();
    this.blockedSelectors = new Set();
    this.cosmeticFilters = new Set();
    this.stats = {
      blockedAds: 0,
      blockedTrackers: 0,
      blockedRequests: 0,
      blockedElements: 0,
    };

    // External filter list URLs
    this.filterSources = {
      easylist: "https://easylist.to/easylist/easylist.txt",
      easyprivacy: "https://easylist.to/easylist/easyprivacy.txt",
      ublock:
        "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt",
      fanboy: "https://secure.fanboy.co.nz/fanboy-annoyance.txt",
      mobile: "https://easylist.to/easylist/easylistdutch.txt",
    };

    this.initialize();
  }

  async initialize() {
    console.log("🛡️ Initializing External AdBlocker...");

    try {
      // Load filter lists from external sources
      await this.loadFilterLists();

      // Set up blocking mechanisms
      this.setupNetworkBlocking();
      this.setupCosmeticBlocking();
      this.setupDOMBlocking();
      this.setupPopupBlocking();

      this.isInitialized = true;
      console.log("✅ External AdBlocker initialized successfully");

      // Start periodic cleanup
      this.startPeriodicCleanup();
    } catch (error) {
      console.warn(
        "⚠️ Failed to load external filters, using fallback:",
        error,
      );
      this.setupFallbackBlocking();
    }
  }

  async loadFilterLists() {
    const promises = Object.entries(this.filterSources).map(
      async ([name, url]) => {
        try {
          const response = await fetch(url, {
            mode: "cors",
            cache: "force-cache",
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const text = await response.text();
          this.parseFilterList(text, name);
          console.log(`📥 Loaded ${name} filter list (${text.length} chars)`);
        } catch (error) {
          console.warn(`⚠️ Failed to load ${name} filter list:`, error.message);
          // Use backup/cached filters if available
          this.loadBackupFilters(name);
        }
      },
    );

    await Promise.allSettled(promises);
  }

  parseFilterList(text, source) {
    const lines = text.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("["))
        continue;

      // Cosmetic filters (CSS selectors)
      if (trimmed.includes("##") || trimmed.includes("#@#")) {
        const [domain, selector] = trimmed.split("##");
        if (selector) {
          this.cosmeticFilters.add(selector);
        }
      }
      // Element hiding rules
      else if (trimmed.includes("#?#")) {
        const [domain, selector] = trimmed.split("#?#");
        if (selector) {
          this.cosmeticFilters.add(selector);
        }
      }
      // Network filters
      else if (trimmed.includes("||") || trimmed.includes("|http")) {
        const domain = this.extractDomain(trimmed);
        if (domain) {
          this.blockedDomains.add(domain);
        }
      }
      // Simple domain blocking
      else if (trimmed.includes(".") && !trimmed.includes(" ")) {
        const domain = trimmed.replace(/[\|\^\$\*]/g, "");
        if (domain.includes(".")) {
          this.blockedDomains.add(domain);
        }
      }
    }
  }

  extractDomain(rule) {
    try {
      // Remove filter syntax
      let domain = rule.replace(/^\|\|/, "").replace(/\^.*$/, "");
      domain = domain.replace(/\$.*$/, "").replace(/\/.*$/, "");

      if (domain.includes(".") && !domain.includes(" ")) {
        return domain.toLowerCase();
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  loadBackupFilters(name) {
    // Hardcoded backup filters for essential blocking
    const backupFilters = {
      easylist: [
        "googleads.g.doubleclick.net",
        "googlesyndication.com",
        "amazon-adsystem.com",
        "outbrain.com",
        "taboola.com",
      ],
      easyprivacy: [
        "google-analytics.com",
        "googletagmanager.com",
        "facebook.com/tr",
        "connect.facebook.net",
      ],
    };

    if (backupFilters[name]) {
      backupFilters[name].forEach((domain) => this.blockedDomains.add(domain));
      console.log(`📦 Loaded backup filters for ${name}`);
    }
  }

  setupNetworkBlocking() {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = async (resource, options = {}) => {
      if (!this.isEnabled) return originalFetch(resource, options);

      const url = typeof resource === "string" ? resource : resource.url;

      if (this.shouldBlockURL(url)) {
        this.stats.blockedRequests++;
        console.log("🚫 Blocked fetch:", this.getDomainFromURL(url));
        throw new Error("Request blocked by AdBlocker");
      }

      return originalFetch(resource, options);
    };

    // Override XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      if (
        window.adBlocker?.isEnabled &&
        window.adBlocker?.shouldBlockURL(url)
      ) {
        window.adBlocker.stats.blockedRequests++;
        console.log("🚫 Blocked XHR:", window.adBlocker.getDomainFromURL(url));
        return;
      }
      return originalOpen.apply(this, [method, url, ...args]);
    };

    // Block script and iframe creation
    this.interceptElementCreation();
  }

  shouldBlockURL(url) {
    if (!url || !this.isEnabled) return false;

    const urlLower = url.toLowerCase();
    const domain = this.getDomainFromURL(url);

    // Check against blocked domains
    for (const blockedDomain of this.blockedDomains) {
      if (urlLower.includes(blockedDomain.toLowerCase())) {
        return true;
      }
    }

    // Check for common ad patterns
    const adPatterns = [
      /\/ads?[\/\?]/i,
      /\/advertisement/i,
      /\/banner/i,
      /\/popup/i,
      /googlesyndication/i,
      /googleads/i,
      /doubleclick/i,
      /amazon-adsystem/i,
      /facebook\.com\/tr/i,
      /outbrain/i,
      /taboola/i,
      /criteo/i,
      /pubmatic/i,
      /rubiconproject/i,
    ];

    return adPatterns.some((pattern) => pattern.test(url));
  }

  getDomainFromURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "";
    }
  }

  interceptElementCreation() {
    const originalCreateElement = document.createElement;
    document.createElement = (tagName) => {
      const element = originalCreateElement.call(document, tagName);

      if (
        tagName.toLowerCase() === "script" ||
        tagName.toLowerCase() === "iframe"
      ) {
        // Intercept src attribute setting
        let srcValue = "";
        Object.defineProperty(element, "src", {
          get() {
            return srcValue;
          },
          set(value) {
            if (window.adBlocker?.shouldBlockURL(value)) {
              console.log(
                `🚫 Blocked ${tagName} src:`,
                window.adBlocker.getDomainFromURL(value),
              );
              window.adBlocker.stats.blockedRequests++;
              return;
            }
            srcValue = value;
            element.setAttribute("src", value);
          },
        });

        // Intercept setAttribute for src
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = (name, value) => {
          if (name === "src" && window.adBlocker?.shouldBlockURL(value)) {
            console.log(
              `🚫 Blocked ${tagName} setAttribute:`,
              window.adBlocker.getDomainFromURL(value),
            );
            window.adBlocker.stats.blockedRequests++;
            return;
          }
          return originalSetAttribute.call(element, name, value);
        };
      }

      return element;
    };
  }

  setupCosmeticBlocking() {
    // Apply CSS hiding for ad elements
    this.applyCosmeticFilters();

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldReapply = true;
        }
      });

      if (shouldReapply) {
        clearTimeout(this.cosmeticTimeout);
        this.cosmeticTimeout = setTimeout(() => {
          this.applyCosmeticFilters();
          this.blockAggresiveElements();
        }, 100);
      }
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  applyCosmeticFilters() {
    if (!this.isEnabled) return;

    // Combine external filters with aggressive selectors
    const allSelectors = [
      ...Array.from(this.cosmeticFilters),
      // Aggressive built-in selectors
      '[class*="ad-"]:not([class*="add"]):not([class*="read"]):not([class*="head"])',
      '[class*="ads-"]',
      '[class*="advertisement"]',
      '[id*="ad-"]:not([id*="add"]):not([id*="read"]):not([id*="head"])',
      '[id*="ads-"]',
      '[id*="advertisement"]',
      ".sponsored:not(.video-player)",
      ".promoted:not(.video-player)",
      ".banner:not(.page-banner):not(.hero-banner)",
      ".popup:not(.tooltip)",
      ".modal:not(.video-modal):not(.search-modal)",
      'iframe[src*="googleads"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="outbrain"]',
      'iframe[src*="taboola"]',
      'script[src*="googleads"]',
      'script[src*="googlesyndication"]',
      'script[src*="google-analytics"]',
      'img[src*="google-analytics"]',
      'img[width="1"][height="1"]',
    ];

    // Create comprehensive CSS
    const css = allSelectors
      .map(
        (selector) =>
          `${selector} { display: none !important; visibility: hidden !important; opacity: 0 !important; }`,
      )
      .join("\n");

    this.injectCSS(css);
  }

  injectCSS(css) {
    const existingStyle = document.getElementById("external-adblocker-css");
    if (existingStyle) {
      existingStyle.textContent = css;
    } else {
      const style = document.createElement("style");
      style.id = "external-adblocker-css";
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  setupDOMBlocking() {
    // Block elements that match patterns
    const blockElement = (element) => {
      if (!element || element.hasAttribute("data-adblocker-hidden")) return;

      element.style.display = "none !important";
      element.style.visibility = "hidden !important";
      element.style.opacity = "0 !important";
      element.setAttribute("data-adblocker-hidden", "true");
      this.stats.blockedElements++;
    };

    const checkElement = (element) => {
      if (!element || !element.tagName) return;

      const className = element.className || "";
      const id = element.id || "";
      const src = element.src || "";
      const text = (className + " " + id + " " + src).toLowerCase();

      // Check for ad-related keywords
      const adKeywords = [
        "advertisement",
        "sponsored",
        "promoted",
        "banner",
        "popup",
        "modal",
        "overlay",
        "interstitial",
        "commercial",
        "affiliate",
      ];

      if (adKeywords.some((keyword) => text.includes(keyword))) {
        blockElement(element);
        return;
      }

      // Check for tracking pixels
      if (element.tagName.toLowerCase() === "img") {
        const width = element.getAttribute("width");
        const height = element.getAttribute("height");
        if (
          (width === "1" && height === "1") ||
          src.includes("pixel") ||
          src.includes("tracking")
        ) {
          blockElement(element);
          return;
        }
      }

      // Block suspicious iframes and scripts
      if (
        (element.tagName.toLowerCase() === "iframe" ||
          element.tagName.toLowerCase() === "script") &&
        src
      ) {
        if (this.shouldBlockURL(src)) {
          blockElement(element);
          return;
        }
      }
    };

    // Check existing elements
    const checkExistingElements = () => {
      document.querySelectorAll("*").forEach(checkElement);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", checkExistingElements);
    } else {
      checkExistingElements();
    }
  }

  blockAggresiveElements() {
    // Additional aggressive blocking for stubborn ads
    const aggressiveSelectors = [
      '[style*="position: fixed"][style*="z-index"]:not(.video-player):not(.adblocker-status)',
      '[style*="position:fixed"][style*="z-index"]:not(.video-player):not(.adblocker-status)',
      'div[class*="ad"]:not([class*="add"]):not([class*="read"])',
      'div[id*="ad"]:not([id*="add"]):not([id*="read"])',
    ];

    aggressiveSelectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (!element.hasAttribute("data-adblocker-hidden")) {
            element.style.display = "none !important";
            element.setAttribute("data-adblocker-hidden", "true");
            this.stats.blockedElements++;
          }
        });
      } catch (e) {
        // Invalid selector, skip
      }
    });
  }

  setupPopupBlocking() {
    // Block window.open popups
    const originalOpen = window.open;
    window.open = (...args) => {
      const url = args[0];
      if (this.shouldBlockURL(url)) {
        this.stats.blockedAds++;
        console.log("🚫 Blocked popup:", this.getDomainFromURL(url));
        return null;
      }
      return originalOpen.apply(window, args);
    };

    // Block suspicious alerts
    const originalAlert = window.alert;
    window.alert = (message) => {
      if (typeof message === "string") {
        const lowerMessage = message.toLowerCase();
        const suspiciousKeywords = [
          "advertisement",
          "sponsored",
          "click here",
          "win now",
          "congratulations",
        ];

        if (
          suspiciousKeywords.some((keyword) => lowerMessage.includes(keyword))
        ) {
          console.log("🚫 Blocked suspicious alert");
          return;
        }
      }
      return originalAlert.call(window, message);
    };
  }

  setupFallbackBlocking() {
    console.log("🔄 Setting up fallback ad blocking...");

    // Basic pattern-based blocking
    const patterns = [
      /googleads|googlesyndication|doubleclick/i,
      /amazon-adsystem|adsystem\.amazon/i,
      /facebook\.com\/tr|connect\.facebook\.net/i,
      /outbrain|taboola|criteo|pubmatic/i,
      /google-analytics|googletagmanager/i,
    ];

    const shouldBlock = (url) => patterns.some((pattern) => pattern.test(url));

    // Simple fetch override
    const originalFetch = window.fetch;
    window.fetch = async (resource, options = {}) => {
      const url = typeof resource === "string" ? resource : resource.url;
      if (shouldBlock(url)) {
        this.stats.blockedRequests++;
        throw new Error("Blocked by fallback AdBlocker");
      }
      return originalFetch(resource, options);
    };

    // Basic CSS injection
    const css = `
      [class*="ad-"]:not([class*="add"]):not([class*="read"]),
      [class*="ads-"], .advertisement, .sponsored, .promoted,
      iframe[src*="googleads"], iframe[src*="doubleclick"],
      script[src*="googleads"], script[src*="google-analytics"] {
        display: none !important;
      }
    `;
    this.injectCSS(css);

    this.isInitialized = true;
  }

  startPeriodicCleanup() {
    // Periodic cleanup every 5 seconds
    setInterval(() => {
      if (this.isEnabled) {
        this.blockAggresiveElements();
      }
    }, 5000);

    // Stats logging every 30 seconds
    setInterval(() => {
      if (this.stats.blockedRequests > 0 || this.stats.blockedAds > 0) {
        console.log("📊 AdBlocker Stats:", this.getStats());
      }
    }, 30000);
  }

  getStats() {
    return {
      ...this.stats,
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      filterCount: this.blockedDomains.size + this.cosmeticFilters.size,
    };
  }

  enable() {
    this.isEnabled = true;
    console.log("✅ External AdBlocker enabled");
  }

  disable() {
    this.isEnabled = false;
    console.log("⏸️ External AdBlocker disabled");
  }

  showStats() {
    const stats = this.getStats();
    console.log("📊 Detailed AdBlocker Statistics:", stats);
    return stats;
  }

  async updateFilters() {
    console.log("🔄 Updating external filter lists...");
    this.blockedDomains.clear();
    this.cosmeticFilters.clear();
    await this.loadFilterLists();
    this.applyCosmeticFilters();
    console.log("✅ Filter lists updated");
  }
}

// Create and export global instance
export const adBlocker = new AdBlockerService();

// Make available globally for debugging
if (typeof window !== "undefined") {
  window.adBlocker = adBlocker;
}

export default adBlocker;
