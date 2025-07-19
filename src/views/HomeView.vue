<template>
  <div class="home-view">
    <div class="hero-section">
      <v-container>
        <v-row align="center" class="hero-content">
          <v-col cols="12" md="6">
            <div class="hero-text">
              <h1 class="hero-title">
                Welcome to <span class="text-primary">Empty.tv</span>
              </h1>
              <p class="hero-subtitle">
                Stream unlimited movies and TV shows from multiple sources.
                Your entertainment journey starts here.
              </p>
              <div class="hero-actions">
                <v-btn
                  color="primary"
                  size="large"
                  class="mr-4"
                  to="/movies"
                >
                  <v-icon icon="mdi-movie" class="mr-2" />
                  Browse Movies
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="primary"
                  size="large"
                  to="/tv-shows"
                >
                  <v-icon icon="mdi-television" class="mr-2" />
                  TV Shows
                </v-btn>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="hero-image">
              <v-icon icon="mdi-play-circle" size="200" color="primary" class="hero-icon" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <div class="features-section">
      <v-container>
        <h2 class="section-title text-center mb-8">Why Choose Empty.tv?</h2>
        <v-row>
          <v-col cols="12" md="4" v-for="feature in features" :key="feature.title">
            <v-card class="feature-card">
              <v-card-text class="text-center">
                <v-icon :icon="feature.icon" size="48" color="primary" class="mb-4" />
                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <div class="test-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="section-title mb-4">Test Our Video Player</h2>
            <p class="section-subtitle mb-6">
              Experience our VidLink-optimized video player with sandbox fix
            </p>
            <v-btn
              color="secondary"
              size="large"
              to="/test"
              class="test-btn"
            >
              <v-icon icon="mdi-test-tube" class="mr-2" />
              Test Video Player
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      features: [
        {
          title: 'Multiple Sources',
          description: 'Access content from various streaming providers including VidLink, AutoEmbed, VidSrc and more.',
          icon: 'mdi-server-network'
        },
        {
          title: 'VidLink Optimized',
          description: 'Fixed sandbox issues for seamless VidLink streaming without errors.',
          icon: 'mdi-shield-check'
        },
        {
          title: 'Responsive Design',
          description: 'Perfect viewing experience on desktop, tablet, and mobile devices.',
          icon: 'mdi-responsive'
        },
        {
          title: 'Easy Navigation',
          description: 'Browse movies and TV shows with intuitive search and filtering options.',
          icon: 'mdi-compass'
        },
        {
          title: 'Favorites & Watchlist',
          description: 'Save your favorite content and create personalized watchlists.',
          icon: 'mdi-heart'
        },
        {
          title: 'Modern Tech Stack',
          description: 'Built with Vue 3, Vuetify 3, and modern web technologies for optimal performance.',
          icon: 'mdi-rocket'
        }
      ]
    }
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: rgba(26, 29, 41, 0.95);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #FFFFFF;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-icon {
  opacity: 0.8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.features-section {
  padding: 4rem 0;
  background: rgba(255, 255, 255, 0.02);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 212, 170, 0.3);
  box-shadow: 0 10px 30px rgba(0, 212, 170, 0.2);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 1rem;
}

.feature-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.test-section {
  padding: 4rem 0;
  background: rgba(255, 255, 255, 0.02);
}

.section-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

.test-btn {
  font-weight: 600;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-actions {
    justify-content: center;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
