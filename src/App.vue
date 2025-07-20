<template>
  <v-app>
    <AppNavigation />
    <v-main>
      <router-view />
    </v-main>

    <!-- AdBlocker Status Component -->
    <AdBlockerStatus
      :auto-hide="true"
      :auto-hide-delay="15000"
      :show-floating="true"
    />
  </v-app>
</template>

<script>
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AdBlockerStatus from '@/components/common/AdBlockerStatus.vue'
import { adBlocker } from '@/services/adblocker'

export default {
  name: 'App',
  components: {
    AppNavigation,
    AdBlockerStatus
  },
  mounted() {
    // Initialize AdBlocker
    if (adBlocker) {
      console.log('AdBlocker initialized and active')
    }
  }
}
</script>

<style>
:root {
  --primary-color: #667eea;
  --background-color: #0f0f23;
  --surface-color: rgba(255, 255, 255, 0.08);
  --glass-effect: rgba(255, 255, 255, 0.08);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
  --accent-color: #74c0fc;
  --error-color: #ff6b6b;
  --warning-color: #ffd43b;
  --success-color: #51cf66;
  --border-radius-sm: 8px;
  --border-radius-md: 12px;
  --border-radius-lg: 16px;
  --border-radius-xl: 20px;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 24px 60px rgba(0, 0, 0, 0.4);
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* COMPREHENSIVE AD BLOCKER CSS */
/* Block common ad selectors */
[class*="ad-"]:not([class*="add"]):not([class*="radio"]):not([class*="head"]):not([class*="read"]):not([class*="thread"]),
[class*="ads-"],
[class*="advertisement"],
[class*="banner"]:not([class*="page-banner"]):not([class*="hero-banner"]),
[class*="popup"]:not([class*="tooltip"]),
[class*="modal"]:not([class*="video-modal"]):not([class*="search-modal"]),
[id*="ad-"]:not([id*="add"]):not([id*="radio"]):not([id*="head"]):not([id*="read"]):not([id*="thread"]),
[id*="ads-"],
[id*="advertisement"],
[id*="banner"]:not([id*="page-banner"]):not([id*="hero-banner"]),
[id*="popup"]:not([id*="tooltip"]),
[id*="modal"]:not([id*="video-modal"]):not([id*="search-modal"]),
.ad:not(.add):not(.radio):not(.head):not(.read):not(.thread),
.ads,
.advertisement,
.banner:not(.page-banner):not(.hero-banner),
.popup:not(.tooltip),
.modal:not(.video-modal):not(.search-modal),
.sponsored,
.promo,
.promotion,
.commercial,
.affiliate,
.advert,
.adspace,
.adslot,
.adblock,
.adsbox,
.adsbanner,
.adsense,
.google-ad,
.facebook-ad,
.twitter-ad,
.youtube-ad,
.instagram-ad,
.linkedin-ad,
.snapchat-ad,
.tiktok-ad,
.pinterest-ad,
.reddit-ad,
.outbrain,
.taboola,
.mgid,
.revcontent,
.adblade,
.contentad,
.nativo,
.sharethrough,
.virool,
.teads,
.undertone,
.pubmatic,
.rubiconproject,
.openx,
.criteo,
.smartadserver,
.advertising,
.monetization,
iframe[src*="googleads"],
iframe[src*="googlesyndication"],
iframe[src*="doubleclick"],
iframe[src*="amazon-adsystem"],
iframe[src*="facebook.com/tr"],
iframe[src*="outbrain"],
iframe[src*="taboola"],
iframe[src*="media.net"],
iframe[src*="criteo"],
iframe[src*="pubmatic"],
iframe[src*="rubiconproject"],
iframe[src*="casalemedia"],
iframe[src*="smartadserver"],
iframe[src*="openx"],
iframe[src*="adsystem"],
iframe[src*="advertising"],
script[src*="googleads"],
script[src*="googlesyndication"],
script[src*="doubleclick"],
script[src*="google-analytics"],
script[src*="googletagmanager"],
script[src*="facebook.com/tr"],
script[src*="connect.facebook.net"],
script[src*="amazon-adsystem"],
script[src*="outbrain"],
script[src*="taboola"],
script[src*="media.net"],
script[src*="criteo"],
script[src*="pubmatic"],
script[src*="rubiconproject"],
script[src*="casalemedia"],
script[src*="smartadserver"],
script[src*="openx"],
script[src*="adsystem"],
script[src*="advertising"],
link[href*="googleads"],
link[href*="googlesyndication"],
link[href*="doubleclick"],
link[href*="google-analytics"],
link[href*="googletagmanager"],
img[src*="googleads"],
img[src*="googlesyndication"],
img[src*="doubleclick"],
img[src*="google-analytics"],
img[src*="facebook.com/tr"],
img[src*="amazon-adsystem"],
img[src*="outbrain"],
img[src*="taboola"],
img[src*="media.net"],
img[src*="criteo"],
img[src*="pubmatic"],
img[src*="rubiconproject"],
img[src*="casalemedia"],
img[src*="smartadserver"],
img[src*="openx"],
img[src*="adsystem"],
img[src*="advertising"] {
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
  pointer-events: none !important;
}

/* Block tracking pixels */
img[width="1"][height="1"],
img[style*="width:1px"],
img[style*="height:1px"],
img[style*="width: 1px"],
img[style*="height: 1px"] {
  display: none !important;
}

/* Block empty iframes that might be ads */
iframe[width="0"],
iframe[height="0"],
iframe[style*="width:0"],
iframe[style*="height:0"],
iframe[style*="width: 0"],
iframe[style*="height: 0"] {
  display: none !important;
}

/* Block overlay ads */
[style*="position:fixed"][style*="z-index"]:not(.video-player):not(.search-results):not(.navigation):not(.header):not(.footer):not(.adblocker-status) {
  display: none !important;
}

/* Block popups and modals with high z-index */
[style*="z-index: 999"]:not(.video-player):not(.search-results):not(.navigation):not(.header):not(.footer):not(.adblocker-status),
[style*="z-index:999"]:not(.video-player):not(.search-results):not(.navigation):not(.header):not(.footer):not(.adblocker-status) {
  display: none !important;
}

/* Mobile specific ad blocking */
@media (max-width: 768px) {
  [class*="mobile-ad"],
  [class*="mobile-banner"],
  [id*="mobile-ad"],
  [id*="mobile-banner"],
  .mobile-ad,
  .mobile-banner {
    display: none !important;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--background-color);
  color: var(--text-primary);
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.v-application {
  background: transparent !important;
  font-family: inherit !important;
}

.v-main {
  padding-top: 0 !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
  transition: background var(--transition-fast);
}

::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

::-webkit-scrollbar-corner {
  background: rgba(255, 255, 255, 0.05);
}

.text-primary {
  color: var(--text-primary) !important;
}

.text-secondary {
  color: var(--text-secondary) !important;
}

.text-muted {
  color: var(--text-muted) !important;
}

.text-accent {
  color: var(--accent-color) !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}

.loading-shimmer {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.glass-surface {
  background: var(--glass-effect);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
}

.glass-surface-intense {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--border-radius-lg);
}

.section-card {
  background: var(--glass-effect);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  transition: all var(--transition-normal);
}

.section-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--accent-color);
  letter-spacing: -0.01em;
}

.media-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  width: 100%;
}

.media-grid--similar {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.media-grid--large {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
}

.media-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.btn-primary {
  background: var(--primary-color) !important;
  color: var(--text-primary) !important;
  border: none !important;
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all var(--transition-normal) !important;
  box-shadow: var(--shadow-md) !important;
}

.btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: var(--shadow-lg) !important;
}

.btn-secondary {
  background: var(--glass-effect) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: var(--border-radius-md) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all var(--transition-normal) !important;
  backdrop-filter: blur(20px) !important;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(102, 126, 234, 0.4) !important;
  transform: translateY(-2px) !important;
}

.v-theme--dark {
  --v-theme-background: #0f0f23;
  --v-theme-surface: rgba(255, 255, 255, 0.08);
  --v-theme-primary: #667eea;
  --v-theme-secondary: #764ba2;
  --v-theme-accent: #00d4aa;
  --v-theme-error: #ff6b6b;
  --v-theme-info: #74c0fc;
  --v-theme-success: #51cf66;
  --v-theme-warning: #ffd43b;
}

.v-btn-toggle {
  background: rgba(30, 41, 59, 0.8) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  border-radius: var(--border-radius-md) !important;
  overflow: hidden;
  backdrop-filter: blur(20px) !important;
}

.v-btn-toggle .v-btn {
  color: var(--text-secondary) !important;
  border: none !important;
  font-weight: 500;
  transition: all var(--transition-normal);
  text-transform: none !important;
}

.v-btn-toggle .v-btn--active {
  background: var(--primary-color) !important;
  color: var(--text-primary) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md) !important;
}

.v-chip {
  font-weight: 500;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
}

.v-chip--variant-outlined {
  border-color: rgba(102, 126, 234, 0.4) !important;
  color: var(--text-secondary) !important;
  background: rgba(30, 41, 59, 0.5) !important;
}

.v-chip--variant-outlined:hover {
  border-color: #667eea !important;
  color: #667eea !important;
  background: rgba(102, 126, 234, 0.1) !important;
  transform: translateY(-1px);
}

.v-menu__content {
  background: rgba(30, 41, 59, 0.95) !important;
  backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  border-radius: var(--border-radius-md) !important;
  box-shadow: var(--shadow-xl) !important;
}

.v-list-item {
  border-radius: var(--border-radius-sm) !important;
  margin: 4px 8px !important;
  transition: all var(--transition-fast) !important;
}

.v-list-item:hover {
  background: rgba(102, 126, 234, 0.1) !important;
  transform: translateX(4px) !important;
}

.v-list-item--active {
  background: var(--primary-color) !important;
  color: var(--text-primary) !important;
}

.v-card {
  background: var(--glass-effect) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--glass-border) !important;
}

@media (max-width: 1200px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .media-grid--similar {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .media-grid--large {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .section-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .media-grid--similar {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }

  .media-grid--large {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.25rem;
  }

  .media-grid--compact {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .section-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .media-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .media-grid--similar {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 0.5rem;
  }
}

.container-fluid {
  max-width: 100%;
  padding: 0 1rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-skeleton {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--border-radius-md);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-muted);
}

.hero-section {
  position: relative;
  min-height: 60vh;
  overflow: hidden;
  border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
}

.hero-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 35, 0.8);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding: 120px 0 60px;
}

.rating-excellent {
  background: #51cf66 !important;
}

.rating-good {
  background: #74c0fc !important;
}

.rating-average {
  background: #ffd43b !important;
}

.rating-poor {
  background: #ff6b6b !important;
}

.custom-focus {
  outline: 2px solid rgba(102, 126, 234, 0.5);
  outline-offset: 2px;
}

.interactive-hover:hover {
  transform: translateY(-2px);
  transition: transform var(--transition-normal);
}

.backdrop-blur {
  backdrop-filter: blur(20px);
}

.backdrop-blur-intense {
  backdrop-filter: blur(30px);
}
</style>
