<template>
  <div class="home-view">
    <div class="hero-section">
      <v-container>
        <v-row align="center" class="hero-content">
          <v-col cols="12" md="6">
            <div class="hero-text">
              <h1 class="hero-title">
                Welcome to <span class="neon-text">empty.tv</span>
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
        <h2 class="section-title text-center mb-8">Why Choose empty.tv?</h2>
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
  background: var(--background-color);
}

.hero-section {
  min-height: 85vh;
  display: flex;
  align-items: center;
  background: rgba(15, 15, 35, 0.95);
  position: relative;
  overflow: hidden;
  border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.05);
  opacity: 0.8;
}

.hero-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23667eea" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  opacity: 0.4;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding: 80px 0;
}

.hero-text {
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 2rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  text-shadow: 2px 2px 12px rgba(0, 0, 0, 0.5);
}

.neon-text {
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.hero-subtitle {
  font-size: 1.375rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.hero-icon {
  opacity: 0.6;
  animation: pulse-glow 3s infinite;
  filter: drop-shadow(0 0 30px rgba(102, 126, 234, 0.3));
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
    filter: drop-shadow(0 0 30px rgba(102, 126, 234, 0.3));
  }
  50% {
    transform: scale(1.08);
    opacity: 0.9;
    filter: drop-shadow(0 0 50px rgba(102, 126, 234, 0.6));
  }
}

.features-section {
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-color);
  opacity: 0.3;
}

.section-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4rem;
  letter-spacing: -0.02em;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
}

.feature-card {
  background: var(--glass-effect) !important;
  backdrop-filter: blur(24px) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: var(--border-radius-lg) !important;
  transition: all var(--transition-normal);
  height: 100%;
  overflow: hidden;
  position: relative;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-color);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(102, 126, 234, 0.4) !important;
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-xl);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.feature-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0;
}

@media (max-width: 960px) {
  .hero-title {
    margin-bottom: 1.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
  }

  .hero-actions {
    gap: 1rem;
  }

  .hero-content {
    padding: 60px 0;
  }

  .features-section {
    padding: 4rem 0;
  }

  .section-title {
    margin-bottom: 3rem;
  }
}

@media (max-width: 600px) {
  .hero-subtitle {
    font-size: 1.125rem;
    margin-bottom: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .hero-actions .v-btn {
    width: 100%;
    max-width: 280px;
  }

  .hero-content {
    padding: 40px 0;
  }

  .features-section {
    padding: 3rem 0;
  }

  .section-title {
    margin-bottom: 2rem;
  }

  .hero-image {
    margin-top: 1rem;
  }

  .hero-icon {
    font-size: 120px !important;
  }

  .feature-title {
    font-size: 1.25rem;
  }

  .feature-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .hero-text {
    text-align: center;
    padding: 0 1rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions .v-btn {
    max-width: 100%;
  }

  .feature-card {
    margin-bottom: 1rem;
  }
}

.neon-text {
  color: #667eea;
  font-weight: 900;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 100px 0 60px 0;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-actions {
    justify-content: center;
    margin-top: 2rem;
  }

  .hero-actions .v-btn {
    padding: 14px 28px !important;
    font-size: 1rem !important;
  }

  .hero-image {
    margin-top: 3rem;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .feature-card {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }
}
</style>
