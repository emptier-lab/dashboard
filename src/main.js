import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

// Initialize AdBlocker immediately
import { adBlocker } from "./services/adblocker";

// Inject aggressive anti-ad CSS immediately
const antiAdCSS = `
/* Aggressive Ad Blocking CSS */
.ad, .ads, .advertisement, .sponsored, .promotion, .banner,
[id*="ad"]:not([id*="add"]):not([id*="head"]):not([id*="read"]),
[class*="ad"]:not([class*="add"]):not([class*="head"]):not([class*="read"]),
[id*="ads"], [class*="ads"], [id*="banner"], [class*="banner"],
[id*="popup"], [class*="popup"], [id*="modal"]:not(.video-modal),
.video-ads, .player-ads, .preroll, .midroll, .postroll,
.vast-ad, .vpaid-ad, .ima-ad, .jwplayer-ad, .videojs-ad,
.overlay-ad, .modal-ad, .popup-ad, .floating-ad, .sticky-ad,
.fixed-ad, .absolute-ad, .interstitial, .adsbygoogle,
ins.adsbygoogle, [data-ad-client], [data-ad-slot],
.amazon-ad, .facebook-ad, .google-ad, .outbrain, .taboola,
iframe[src*="googleads"], iframe[src*="googlesyndication"],
iframe[src*="doubleclick"], iframe[src*="outbrain"],
iframe[src*="taboola"], iframe[src*="porn"], iframe[src*="xxx"],
iframe[src*="adult"], iframe[src*="sex"], iframe[src*="casino"],
script[src*="googleads"], script[src*="googlesyndication"],
script[src*="google-analytics"], img[src*="google-analytics"],
img[width="1"][height="1"], [href*="porn"], [href*="xxx"],
[href*="adult"], [href*="sex"], [href*="dating"],
[href*="casino"], [href*="poker"], [href*="bet"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
  left: -9999px !important;
  pointer-events: none !important;
}

/* Block suspicious popups and overlays */
div[style*="position: fixed"][style*="z-index"]:not(.video-player):not(.app-container) {
  display: none !important;
}

/* Hide tracking pixels */
img[width="1"], img[height="1"], img[style*="width: 1px"], img[style*="height: 1px"] {
  display: none !important;
}

/* Block social media tracking */
.fb-like, .twitter-follow, .social-share:not(.main-share) {
  display: none !important;
}
`;

// Inject CSS immediately
const style = document.createElement("style");
style.type = "text/css";
style.innerHTML = antiAdCSS;
document.head.appendChild(style);

// Vuetify
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// Views
import HomeView from "./views/HomeView.vue";
import MovieDetailView from "./views/MovieDetailView.vue";
import TVDetailView from "./views/TVDetailView.vue";
import WatchView from "./views/WatchView.vue";
import SearchView from "./views/SearchView.vue";
import MoviesView from "./views/MoviesView.vue";
import TVShowsView from "./views/TVShowsView.vue";
import TrendingView from "./views/TrendingView.vue";
import FavoritesView from "./views/FavoritesView.vue";
import WatchlistView from "./views/WatchlistView.vue";
import PersonDetailView from "./views/PersonDetailView.vue";
import NotFoundView from "./views/NotFoundView.vue";

// Router configuration
const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/movies",
    name: "Movies",
    component: MoviesView,
  },
  {
    path: "/tv-shows",
    name: "TVShows",
    component: TVShowsView,
  },
  {
    path: "/trending",
    name: "Trending",
    component: TrendingView,
  },
  {
    path: "/search",
    name: "Search",
    component: SearchView,
  },
  {
    path: "/movie/:id",
    name: "MovieDetail",
    component: MovieDetailView,
    props: true,
  },
  {
    path: "/tv/:id",
    name: "TVDetail",
    component: TVDetailView,
    props: true,
  },
  {
    path: "/watch/:type/:id",
    name: "Watch",
    component: WatchView,
    props: true,
  },
  {
    path: "/watch/:type/:id/:season/:episode",
    name: "WatchEpisode",
    component: WatchView,
    props: true,
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: FavoritesView,
  },
  {
    path: "/watchlist",
    name: "Watchlist",
    component: WatchlistView,
  },
  {
    path: "/person/:id",
    name: "PersonDetail",
    component: PersonDetailView,
    props: true,
  },

  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Vuetify configuration
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        dark: true,
        colors: {
          background: "#0f172a",
          surface: "#1e293b",
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
          error: "#ef4444",
          info: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
        },
      },
    },
  },
});

// Create and mount app
const app = createApp(App).use(router).use(vuetify);

// Initialize AdBlocker before mounting (silent mode)
if (adBlocker) {
  // AdBlocker running silently in background
}

app.mount("#app");
