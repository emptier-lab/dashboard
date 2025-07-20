// AdBlocker Service - Comprehensive Ad Blocking for empty.tv
// Blocks ads, trackers, and unwanted content for better user experience

export class AdBlockerService {
  constructor() {
    this.isEnabled = true;
    this.blockedDomains = new Set();
    this.blockedSelectors = new Set();
    this.blockedKeywords = new Set();
    this.observer = null;
    this.stats = {
      blockedAds: 0,
      blockedTrackers: 0,
      blockedRequests: 0
    };

    this.initializeBlockLists();
    this.setupCSS();
    this.startBlocking();
  }

  initializeBlockLists() {
    // Ad networks and tracking domains
    const adDomains = [
      'googleads.g.doubleclick.net',
      'googlesyndication.com',
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'connect.facebook.net',
      'amazon-adsystem.com',
      'adsystem.amazon.com',
      'pubmatic.com',
      'rubiconproject.com',
      'openx.net',
      'adsrvr.org',
      'casalemedia.com',
      'rlcdn.com',
      'smartadserver.com',
      'criteo.com',
      'outbrain.com',
      'taboola.com',
      'media.net',
      'adsnative.com',
      'adnxs.com',
      'adsystem.amazon.co.uk',
      'amazon.co.uk/gp/ads',
      'ads.yahoo.com',
      'advertising.com',
      'adsystem.amazon.de',
      'amazon.de/gp/ads',
      'googleadservices.com',
      'youtube.com/pagead',
      'youtube.com/ptracking',
      'twitter.com/i/adsct',
      'analytics.twitter.com',
      'linkedin.com/px',
      'snapchat.com/tr',
      'tiktok.com/i18n/pixel',
      'pinterest.com/ct',
      'reddit.com/api/v1/pixel',
      'branch.io',
      'amplitude.com',
      'mixpanel.com',
      'hotjar.com',
      'fullstory.com',
      'logrocket.com',
      'sentry.io',
      'bugsnag.com',
      'newrelic.com',
      'datadoghq.com',
      'segment.com',
      'segment.io',
      'chartbeat.com',
      'quantserve.com',
      'scorecardresearch.com',
      'nielsen.com',
      'comscore.com',
      'kissmetrics.com',
      'crazyegg.com',
      'optimizely.com',
      'google.com/recaptcha',
      'recaptcha.net',
      'hcaptcha.com',
      'cloudflare.com/ajax/libs',
      'jsdelivr.net',
      'unpkg.com',
      'cdnjs.cloudflare.com'
    ];

    // CSS selectors for ad elements
    const adSelectors = [
      '[class*="ad-"]',
      '[class*="ads-"]',
      '[class*="advertisement"]',
      '[class*="banner"]',
      '[class*="popup"]',
      '[class*="modal"]',
      '[id*="ad-"]',
      '[id*="ads-"]',
      '[id*="advertisement"]',
      '[id*="banner"]',
      '[id*="popup"]',
      '[id*="modal"]',
      '.ad',
      '.ads',
      '.advertisement',
      '.banner',
      '.popup',
      '.modal',
      '.sponsored',
      '.promo',
      '.promotion',
      '.commercial',
      '.affiliate',
      '.advert',
      '.adspace',
      '.adslot',
      '.adblock',
      '.adsbox',
      '.adsbanner',
      '.adsense',
      '.google-ad',
      '.facebook-ad',
      '.twitter-ad',
      '.youtube-ad',
      '.instagram-ad',
      '.linkedin-ad',
      '.snapchat-ad',
      '.tiktok-ad',
      '.pinterest-ad',
      '.reddit-ad',
      'iframe[src*="googleads"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="amazon-adsystem"]',
      'iframe[src*="facebook.com/tr"]',
      'iframe[src*="outbrain"]',
      'iframe[src*="taboola"]',
      'iframe[src*="media.net"]',
      'iframe[src*="criteo"]',
      'iframe[src*="pubmatic"]',
      'iframe[src*="rubiconproject"]',
      'iframe[src*="casalemedia"]',
      'iframe[src*="smartadserver"]',
      'script[src*="googleads"]',
      'script[src*="googlesyndication"]',
      'script[src*="doubleclick"]',
      'script[src*="google-analytics"]',
      'script[src*="googletagmanager"]',
      'script[src*="facebook.com/tr"]',
      'script[src*="connect.facebook.net"]',
      'script[src*="amazon-adsystem"]',
      'script[src*="outbrain"]',
      'script[src*="taboola"]',
      'script[src*="media.net"]',
      'script[src*="criteo"]',
      'script[src*="pubmatic"]',
      'script[src*="rubiconproject"]',
      'script[src*="casalemedia"]',
      'script[src*="smartadserver"]',
      'link[href*="googleads"]',
      'link[href*="googlesyndication"]',
      'link[href*="doubleclick"]',
      'link[href*="google-analytics"]',
      'link[href*="googletagmanager"]',
      'img[src*="googleads"]',
      'img[src*="googlesyndication"]',
      'img[src*="doubleclick"]',
      'img[src*="google-analytics"]',
      'img[src*="facebook.com/tr"]',
      'img[src*="amazon-adsystem"]'
    ];

    // Keywords that indicate ads
    const adKeywords = [
      'advertisement',
      'sponsored',
      'promoted',
      'affiliate',
      'banner',
      'popup',
      'modal',
      'overlay',
      'interstitial',
      'preroll',
      'midroll',
      'postroll',
      'commercial',
      'promo',
      'promotion',
      'marketing',
      'campaign',
      'tracking',
      'analytics',
      'pixel',
      'beacon',
      'impression',
      'clickthrough',
      'monetization',
      'adsense',
      'adwords',
      'facebook-ad',
      'twitter-ad',
      'youtube-ad',
      'instagram-ad',
      'linkedin-ad',
      'snapchat-ad',
      'tiktok-ad',
      'pinterest-ad',
      'reddit-ad'
    ];

    adDomains.forEach(domain => this.blockedDomains.add(domain));
    adSelectors.forEach(selector => this.blockedSelectors.add(selector));
    adKeywords.forEach(keyword => this.blockedKeywords.add(keyword));
  }

  setupCSS() {
    const style = document.createElement('style');
    style.id = 'adblocker-css';
    style.textContent = `
      /* AdBlocker CSS - Hide ad elements */
      ${Array.from(this.blockedSelectors).join(',\n')} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        z-index: -1 !important;
      }

      /* Hide common ad containers */
      [class*="ad"]:not([class*="add"]):not([class*="radio"]):not([class*="bad"]):not([class*="head"]):not([class*="read"]):not([class*="thread"]):not([class*="bread"]) {
        display: none !important;
      }

      /* Hide tracking pixels */
      img[width="1"][height="1"],
      img[style*="width:1px"],
      img[style*="height:1px"] {
        display: none !important;
      }

      /* Hide empty iframes that might be ads */
      iframe[width="0"],
      iframe[height="0"],
      iframe[style*="width:0"],
      iframe[style*="height:0"] {
        display: none !important;
      }

      /* Hide overlay ads */
      [style*="position:fixed"][style*="z-index"]:not(.video-player):not(.search-results):not(.navigation):not(.header):not(.footer) {
        display: none !important;
      }

      /* Specific ad networks */
      [src*="googleads"],
      [src*="googlesyndication"],
      [src*="doubleclick"],
      [src*="amazon-adsystem"],
      [src*="facebook.com/tr"],
      [src*="outbrain"],
      [src*="taboola"],
      [src*="media.net"] {
        display: none !important;
      }
    `;

    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
      });
    }
  }

  startBlocking() {
    // Block network requests
    this.interceptNetworkRequests();

    // Block DOM elements
    this.startDOMObserver();

    // Block existing elements
    this.blockExistingElements();

    // Block window popups
    this.blockPopups();

    // Clean up periodically
    setInterval(() => this.cleanupAds(), 5000);
  }

  interceptNetworkRequests() {
    // Override fetch
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const url = args[0];
      if (typeof url === 'string' && this.shouldBlockURL(url)) {
        this.stats.blockedRequests++;
        console.log('AdBlocker: Blocked fetch request to', url);
        return Promise.reject(new Error('Blocked by AdBlocker'));
      }
      return originalFetch.apply(window, args);
    };

    // Override XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && window.adBlocker?.shouldBlockURL(url)) {
        window.adBlocker.stats.blockedRequests++;
        console.log('AdBlocker: Blocked XMLHttpRequest to', url);
        this.abort();
        return;
      }
      return originalOpen.apply(this, [method, url, ...args]);
    };

    // Block script loading
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);

      if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe') {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
          if (name === 'src' && window.adBlocker?.shouldBlockURL(value)) {
            window.adBlocker.stats.blockedRequests++;
            console.log('AdBlocker: Blocked', tagName, 'loading from', value);
            return;
          }
          return originalSetAttribute.call(this, name, value);
        };
      }

      return element;
    };
  }

  shouldBlockURL(url) {
    if (!this.isEnabled || !url) return false;

    const urlString = url.toString().toLowerCase();

    // Check blocked domains
    for (const domain of this.blockedDomains) {
      if (urlString.includes(domain.toLowerCase())) {
        return true;
      }
    }

    // Check blocked keywords
    for (const keyword of this.blockedKeywords) {
      if (urlString.includes(keyword)) {
        return true;
      }
    }

    return false;
  }

  startDOMObserver() {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkAndBlockElement(node);
            // Check child elements
            if (node.querySelectorAll) {
              node.querySelectorAll('*').forEach(child => {
                this.checkAndBlockElement(child);
              });
            }
          }
        });
      });
    });

    if (document.body) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }
  }

  blockExistingElements() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => this.blockExistingElements());
      return;
    }

    // Block by selectors
    this.blockedSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => this.blockElement(element));
      } catch (e) {
        // Invalid selector, skip
      }
    });

    // Block by content
    document.querySelectorAll('*').forEach(element => {
      this.checkAndBlockElement(element);
    });
  }

  checkAndBlockElement(element) {
    if (!element || !element.tagName) return;

    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    const src = element.src || '';
    const href = element.href || '';
    const textContent = element.textContent || '';

    // Check for ad-related attributes
    const attributes = [className, id, src, href, textContent].join(' ').toLowerCase();

    // Check blocked keywords
    for (const keyword of this.blockedKeywords) {
      if (attributes.includes(keyword)) {
        this.blockElement(element);
        return;
      }
    }

    // Check blocked URLs
    if (src && this.shouldBlockURL(src)) {
      this.blockElement(element);
      return;
    }

    if (href && this.shouldBlockURL(href)) {
      this.blockElement(element);
      return;
    }

    // Block suspicious iframes
    if (tagName === 'iframe') {
      const iframeSrc = src.toLowerCase();
      if (iframeSrc.includes('ad') || iframeSrc.includes('banner') || iframeSrc.includes('popup')) {
        this.blockElement(element);
        return;
      }
    }

    // Block tracking pixels
    if (tagName === 'img') {
      const width = element.getAttribute('width');
      const height = element.getAttribute('height');
      if ((width === '1' && height === '1') || src.includes('pixel') || src.includes('tracking')) {
        this.blockElement(element);
        return;
      }
    }
  }

  blockElement(element) {
    if (!element || element.hasAttribute('data-adblocked')) return;

    element.setAttribute('data-adblocked', 'true');
    element.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
    element.remove();

    this.stats.blockedAds++;
    console.log('AdBlocker: Blocked element', element);
  }

  blockPopups() {
    // Override window.open
    const originalOpen = window.open;
    window.open = (...args) => {
      const url = args[0];
      if (url && this.shouldBlockURL(url)) {
        this.stats.blockedAds++;
        console.log('AdBlocker: Blocked popup to', url);
        return null;
      }
      return originalOpen.apply(window, args);
    };

    // Block alert, confirm, prompt if they're ad-related
    const originalAlert = window.alert;
    window.alert = (message) => {
      if (message && typeof message === 'string') {
        const lowerMessage = message.toLowerCase();
        for (const keyword of this.blockedKeywords) {
          if (lowerMessage.includes(keyword)) {
            console.log('AdBlocker: Blocked alert with ad content');
            return;
          }
        }
      }
      return originalAlert.call(window, message);
    };
  }

  cleanupAds() {
    // Remove any new ad elements that might have appeared
    this.blockExistingElements();

    // Clean up tracking scripts
    document.querySelectorAll('script').forEach(script => {
      const src = script.src || '';
      if (this.shouldBlockURL(src)) {
        script.remove();
        this.stats.blockedRequests++;
      }
    });

    // Clean up tracking iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.src || '';
      if (this.shouldBlockURL(src)) {
        iframe.remove();
        this.stats.blockedRequests++;
      }
    });
  }

  getStats() {
    return { ...this.stats };
  }

  enable() {
    this.isEnabled = true;
    this.startBlocking();
    console.log('AdBlocker: Enabled');
  }

  disable() {
    this.isEnabled = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    console.log('AdBlocker: Disabled');
  }

  addBlockedDomain(domain) {
    this.blockedDomains.add(domain);
  }

  removeBlockedDomain(domain) {
    this.blockedDomains.delete(domain);
  }

  addBlockedSelector(selector) {
    this.blockedSelectors.add(selector);
    this.updateCSS();
  }

  removeBlockedSelector(selector) {
    this.blockedSelectors.delete(selector);
    this.updateCSS();
  }

  updateCSS() {
    const existingStyle = document.getElementById('adblocker-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    this.setupCSS();
  }

  showStats() {
    console.log('AdBlocker Stats:', this.getStats());
    return this.getStats();
  }
}

// Initialize global adblocker
export const adBlocker = new AdBlockerService();

// Make it available globally
if (typeof window !== 'undefined') {
  window.adBlocker = adBlocker;
}

export default adBlocker;
