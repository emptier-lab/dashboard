import { createApp } from "vue";
import { createVuetify } from "vuetify";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

// Initialize AdBlocker immediately
import { adBlocker } from "./services/adblocker";

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
  history: createWebHistory(
    process.env.NODE_ENV === "production" ? "/empty.tv/" : "/tv/",
  ),
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

// Initialize AdBlocker before mounting
if (adBlocker) {
  console.log("🛡️ AdBlocker initialized - protecting against ads and trackers");

  // Show initial stats after a short delay
  setTimeout(() => {
    const stats = adBlocker.getStats();
    console.log("🛡️ AdBlocker Stats:", stats);
  }, 3000);
}

app.mount("#app");
