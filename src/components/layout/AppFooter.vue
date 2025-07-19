<template>
  <v-footer
    app
    class="app-footer"
    height="auto"
  >
    <v-container>
      <v-row>
        <v-col cols="12" md="4" class="footer-section">
          <div class="footer-logo">
            <v-icon icon="mdi-play-circle" size="28" color="primary" />
            <span class="footer-logo-text">Empty.tv</span>
          </div>
          <p class="footer-description">
            Your gateway to unlimited entertainment. Stream movies and TV shows from multiple sources.
          </p>
        </v-col>

        <v-col cols="12" md="2" class="footer-section">
          <h4 class="footer-title">Browse</h4>
          <v-list density="compact" class="footer-links">
            <v-list-item
              v-for="link in browseLinks"
              :key="link.name"
              :to="link.to"
              class="footer-link"
            >
              <v-list-item-title>{{ link.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" md="2" class="footer-section">
          <h4 class="footer-title">Account</h4>
          <v-list density="compact" class="footer-links">
            <v-list-item
              v-for="link in accountLinks"
              :key="link.name"
              :to="link.to"
              class="footer-link"
            >
              <v-list-item-title>{{ link.text }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" md="4" class="footer-section">
          <h4 class="footer-title">Stay Connected</h4>
          <p class="footer-text">
            Follow us for the latest updates and new features.
          </p>
          <div class="social-links">
            <v-btn
              icon="mdi-github"
              variant="text"
              size="small"
              href="https://github.com"
              target="_blank"
              class="social-btn"
            />
            <v-btn
              icon="mdi-twitter"
              variant="text"
              size="small"
              href="https://twitter.com"
              target="_blank"
              class="social-btn"
            />
            <v-btn
              icon="mdi-discord"
              variant="text"
              size="small"
              href="https://discord.com"
              target="_blank"
              class="social-btn"
            />
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4" color="rgba(255, 255, 255, 0.1)" />

      <v-row align="center">
        <v-col cols="12" md="8">
          <p class="footer-copyright">
            © {{ currentYear }} Empty.tv. Made with ❤️ for movie lovers.
          </p>
          <p class="footer-disclaimer">
            This site does not host any content. All videos are provided by third-party sources.
          </p>
        </v-col>
        <v-col cols="12" md="4" class="text-md-right">
          <!-- Technology badges removed for cleaner footer -->
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      browseLinks: [
        { name: 'movies', text: 'Movies', to: '/movies' },
        { name: 'tv', text: 'TV Shows', to: '/tv-shows' },
        { name: 'trending', text: 'Trending', to: '/trending' },
        { name: 'search', text: 'Search', to: '/search' }
      ],
      accountLinks: [
        { name: 'favorites', text: 'Favorites', to: '/favorites' },
        { name: 'watchlist', text: 'Watchlist', to: '/watchlist' },
        { name: 'test', text: 'Test Player', to: '/test' }
      ]
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.app-footer {
  background: rgba(26, 29, 41, 0.95) !important;
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem 0 1rem 0;
  margin-top: 4rem;
}

.footer-section {
  margin-bottom: 1.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.footer-logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FFFFFF;
  background: linear-gradient(135deg, #00D4AA 0%, #6C5CE7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 0;
}

.footer-title {
  color: #FFFFFF;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-links {
  background: transparent !important;
}

.footer-link {
  padding: 0.25rem 0 !important;
  min-height: auto !important;
}

.footer-link :deep(.v-list-item-title) {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.footer-link:hover :deep(.v-list-item-title) {
  color: #00D4AA;
}

.footer-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.3s ease;
}

.social-btn:hover {
  color: #00D4AA !important;
  background: rgba(0, 212, 170, 0.1) !important;
  transform: translateY(-2px);
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.footer-disclaimer {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-style: italic;
  margin-bottom: 0;
}



@media (max-width: 768px) {
  .footer-section {
    margin-bottom: 1rem;
  }
}
</style>
