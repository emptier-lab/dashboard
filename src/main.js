import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Views
import HomeView from './views/HomeView.vue'
import MovieDetailView from './views/MovieDetailView.vue'
import TVDetailView from './views/TVDetailView.vue'
import WatchView from './views/WatchView.vue'
import SearchView from './views/SearchView.vue'
import MoviesView from './views/MoviesView.vue'
import TVShowsView from './views/TVShowsView.vue'
import TrendingView from './views/TrendingView.vue'
import FavoritesView from './views/FavoritesView.vue'
import WatchlistView from './views/WatchlistView.vue'
import TestView from './views/TestView.vue'
import NotFoundView from './views/NotFoundView.vue'

// Router configuration
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/movies',
    name: 'Movies',
    component: MoviesView
  },
  {
    path: '/tv-shows',
    name: 'TVShows',
    component: TVShowsView
  },
  {
    path: '/trending',
    name: 'Trending',
    component: TrendingView
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchView
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetailView,
    props: true
  },
  {
    path: '/tv/:id',
    name: 'TVDetail',
    component: TVDetailView,
    props: true
  },
  {
    path: '/watch/:type/:id',
    name: 'Watch',
    component: WatchView,
    props: true
  },
  {
    path: '/watch/:type/:id/:season/:episode',
    name: 'WatchEpisode',
    component: WatchView,
    props: true
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: FavoritesView
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    component: WatchlistView
  },
  {
    path: '/test',
    name: 'Test',
    component: TestView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Vuetify configuration
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#1A1D29',
          surface: '#2D1B42',
          primary: '#00D4AA',
          secondary: '#6C5CE7',
          accent: '#FD79A8',
          error: '#E17055',
          info: '#74B9FF',
          success: '#00B894',
          warning: '#FDCB6E',
        }
      }
    }
  }
})

// Create and mount app
createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
