<template>
  <v-app-bar
    app
    elevation="0"
    class="app-navigation"
    height="80"
  >
    <v-container class="d-flex align-center">
      <router-link to="/" class="logo-link">
        <div class="logo">
          <v-icon icon="mdi-play-circle" size="32" color="primary" />
          <span class="logo-text">Empty.tv</span>
        </div>
      </router-link>

      <v-spacer />

      <div class="nav-links d-none d-md-flex">
        <v-btn
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          variant="text"
          class="nav-btn"
        >
          <v-icon :icon="link.icon" class="mr-2" />
          {{ link.text }}
        </v-btn>
      </div>

      <div class="nav-actions d-flex align-center ml-4">
        <v-btn
          icon="mdi-magnify"
          variant="text"
          @click="openSearch"
          class="search-btn"
        />

        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-menu"
              variant="text"
              v-bind="props"
              class="menu-btn d-md-none"
            />
          </template>
          <v-list class="mobile-menu">
            <v-list-item
              v-for="link in navLinks"
              :key="link.name"
              :to="link.to"
              class="mobile-nav-item"
            >
              <template #prepend>
                <v-icon :icon="link.icon" />
              </template>
              <v-list-item-title>{{ link.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script>
export default {
  name: 'AppNavigation',
  data() {
    return {
      navLinks: [
        {
          name: 'home',
          text: 'Home',
          to: '/',
          icon: 'mdi-home'
        },
        {
          name: 'movies',
          text: 'Movies',
          to: '/movies',
          icon: 'mdi-movie'
        },
        {
          name: 'tv',
          text: 'TV Shows',
          to: '/tv-shows',
          icon: 'mdi-television'
        },
        {
          name: 'trending',
          text: 'Trending',
          to: '/trending',
          icon: 'mdi-trending-up'
        },
        {
          name: 'favorites',
          text: 'Favorites',
          to: '/favorites',
          icon: 'mdi-heart'
        },
        {
          name: 'watchlist',
          text: 'Watchlist',
          to: '/watchlist',
          icon: 'mdi-bookmark'
        }
      ]
    }
  },
  methods: {
    openSearch() {
      this.$router.push('/search')
    }
  }
}
</script>

<style scoped>
.app-navigation {
  background: rgba(26, 29, 41, 0.95) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  background: linear-gradient(135deg, #00D4AA 0%, #6C5CE7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  gap: 8px;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  text-transform: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  color: #00D4AA !important;
  background: rgba(0, 212, 170, 0.1) !important;
}

.nav-btn.router-link-active {
  color: #00D4AA !important;
  background: rgba(0, 212, 170, 0.1) !important;
}

.nav-actions {
  gap: 8px;
}

.search-btn,
.menu-btn {
  color: rgba(255, 255, 255, 0.8) !important;
}

.search-btn:hover,
.menu-btn:hover {
  color: #00D4AA !important;
  background: rgba(0, 212, 170, 0.1) !important;
}

.mobile-menu {
  background: rgba(26, 29, 41, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 8px;
}

.mobile-nav-item {
  color: rgba(255, 255, 255, 0.8) !important;
}

.mobile-nav-item:hover {
  background: rgba(0, 212, 170, 0.1) !important;
  color: #00D4AA !important;
}

@media (max-width: 768px) {
  .logo-text {
    font-size: 1.25rem;
  }
}
</style>
