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
          <span class="logo-text">empty.tv</span>
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
  background: rgba(15, 15, 35, 0.92) !important;
  backdrop-filter: blur(32px) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.4) !important;
  box-shadow: var(--shadow-lg) !important;
  transition: all var(--transition-normal) !important;
  position: relative;
}

.app-navigation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-gradient);
  opacity: 0.6;
}

.logo-link {
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
}

.logo-link:hover {
  transform: scale(1.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.nav-links {
  gap: 12px;
}

.nav-btn {
  color: var(--text-secondary) !important;
  text-transform: none !important;
  font-weight: 600 !important;
  transition: all var(--transition-normal) !important;
  border-radius: var(--border-radius-md) !important;
  padding: 8px 16px !important;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--primary-color);
  transition: left var(--transition-normal);
  z-index: -1;
  opacity: 0.1;
}

.nav-btn:hover {
  color: var(--text-primary) !important;
  background: rgba(102, 126, 234, 0.2) !important;
  transform: translateY(-3px) !important;
  box-shadow: var(--shadow-md) !important;
}

.nav-btn:hover::before {
  left: 0;
}

.nav-btn.router-link-active {
  color: var(--text-primary) !important;
  background: var(--primary-color) !important;
  box-shadow: var(--shadow-lg) !important;
  transform: translateY(-2px) !important;
}

.nav-btn.router-link-active::before {
  display: none;
}

.nav-actions {
  gap: 12px;
}

.search-btn,
.menu-btn {
  color: var(--text-secondary) !important;
  transition: all var(--transition-normal) !important;
  border-radius: var(--border-radius-md) !important;
  position: relative;
  overflow: hidden;
}

.search-btn::before,
.menu-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  transition: all var(--transition-normal);
  transform: translate(-50%, -50%);
  z-index: -1;
}

.search-btn:hover,
.menu-btn:hover {
  color: var(--text-primary) !important;
  transform: translateY(-3px) scale(1.05) !important;
  box-shadow: var(--shadow-md) !important;
}

.search-btn:hover::before,
.menu-btn:hover::before {
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-md);
}

.mobile-menu {
  background: rgba(15, 15, 35, 0.98) !important;
  backdrop-filter: blur(32px) !important;
  border: 1px solid rgba(102, 126, 234, 0.4) !important;
  border-radius: var(--border-radius-lg) !important;
  margin-top: 12px !important;
  box-shadow: var(--shadow-xl) !important;
  overflow: hidden;
}

.mobile-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-color);
  opacity: 0.8;
}

.mobile-nav-item {
  color: var(--text-secondary) !important;
  transition: all var(--transition-normal) !important;
  margin: 4px 8px !important;
  border-radius: var(--border-radius-sm) !important;
  position: relative;
  overflow: hidden;
}

.mobile-nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--primary-color);
  transition: left var(--transition-normal);
  z-index: -1;
  opacity: 0.15;
}

.mobile-nav-item:hover {
  background: rgba(102, 126, 234, 0.2) !important;
  color: var(--text-primary) !important;
  transform: translateX(8px) !important;
}

.mobile-nav-item:hover::before {
  left: 0;
}

@media (max-width: 768px) {
  .logo-text {
    font-size: 1.5rem;
  }

  .nav-btn {
    padding: 6px 12px !important;
  }
}
</style>
