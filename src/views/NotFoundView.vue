<template>
  <div class="not-found-view">
    <v-container>
      <div class="not-found-content">
        <div class="error-animation">
          <h1 class="error-code">404</h1>
          <div class="glitch-effect">
            <span class="glitch-text">PAGE NOT FOUND</span>
            <span class="glitch-text">PAGE NOT FOUND</span>
            <span class="glitch-text">PAGE NOT FOUND</span>
          </div>
        </div>

        <div class="error-message">
          <h2 class="error-title">Oops! This page went missing</h2>
          <p class="error-description">
            The page you're looking for doesn't exist or has been moved.
            Don't worry, let's get you back on track!
          </p>
        </div>

        <div class="action-buttons">
          <v-btn
            @click="goHome"
            color="primary"
            size="large"
            class="mr-4 mb-2"
          >
            <v-icon icon="mdi-home" class="mr-2" />
            Go Home
          </v-btn>

          <v-btn
            @click="goBack"
            variant="outlined"
            size="large"
            class="mr-4 mb-2"
          >
            <v-icon icon="mdi-arrow-left" class="mr-2" />
            Go Back
          </v-btn>

          <v-btn
            @click="searchContent"
            variant="outlined"
            size="large"
            class="mb-2"
          >
            <v-icon icon="mdi-magnify" class="mr-2" />
            Search
          </v-btn>
        </div>

        <div class="suggestions">
          <h3 class="suggestions-title">Popular Content</h3>
          <div v-if="popularContent.length > 0" class="media-grid media-grid--large">
            <MediaCard
              v-for="item in popularContent"
              :key="item.id"
              :item="item"
              :media-type="item.media_type || 'movie'"
            />
          </div>

          <div v-else class="suggestions-loading">
            <v-progress-circular indeterminate color="primary" size="32" />
            <span class="ml-3">Loading suggestions...</span>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'NotFoundView',
  components: {
    MediaCard
  },
  setup() {
    const router = useRouter()
    const popularContent = ref([])

    function goHome() {
      router.push('/')
    }

    function goBack() {
      router.back()
    }

    function searchContent() {
      router.push('/search')
    }

    async function loadPopularContent() {
      try {
        const response = await tmdbService.getTrending('all', 'week')
        popularContent.value = response.results?.slice(0, 6) || []
      } catch (error) {
        console.error('Failed to load popular content:', error)
      }
    }

    onMounted(() => {
      loadPopularContent()
    })

    return {
      popularContent,
      goHome,
      goBack,
      searchContent
    }
  }
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  background: var(--background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.not-found-content {
  text-align: center;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.error-animation {
  margin-bottom: 40px;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: var(--primary-color);
  text-shadow:
    0 0 20px rgba(102, 126, 234, 0.5),
    0 0 40px rgba(102, 126, 234, 0.3),
    0 0 60px rgba(102, 126, 234, 0.2);
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite alternate;
}

.glitch-effect {
  position: relative;
  display: inline-block;
}

.glitch-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  position: relative;
}

.glitch-text:nth-child(1) {
  animation: glitch 1s linear infinite;
}

.glitch-text:nth-child(2) {
  color: var(--error-color);
  position: absolute;
  top: 0;
  left: 0;
  animation: glitch 1s linear infinite reverse;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}

.glitch-text:nth-child(3) {
  color: var(--accent-color);
  position: absolute;
  top: 0;
  left: 0;
  animation: glitch 1s linear infinite;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}

.error-message {
  margin-bottom: 40px;
}

.error-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.error-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.action-buttons {
  margin-bottom: 60px;
}

.suggestions {
  margin-top: 40px;
}

.suggestions-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 32px;
}

.suggestions-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-secondary);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    text-shadow:
      0 0 20px rgba(102, 126, 234, 0.5),
      0 0 40px rgba(102, 126, 234, 0.3),
      0 0 60px rgba(102, 126, 234, 0.2);
  }
  100% {
    transform: scale(1.05);
    text-shadow:
      0 0 25px rgba(102, 126, 234, 0.8),
      0 0 50px rgba(102, 126, 234, 0.5),
      0 0 75px rgba(102, 126, 234, 0.3);
  }
}

@keyframes glitch {
  0%, 14%, 15%, 49%, 50%, 99%, 100% {
    transform: translateX(0);
  }
  15%, 49% {
    transform: translateX(-3px);
  }
  50%, 99% {
    transform: translateX(3px);
  }
}

@media (max-width: 960px) {
  .not-found-view {
    padding: 20px 15px;
  }

  .error-code {
    font-size: 6rem;
  }

  .glitch-text {
    font-size: 1.5rem;
  }

  .error-title {
    font-size: 2rem;
  }

  .error-description {
    padding: 0 20px;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
    margin: 0;
  }
}

@media (max-width: 600px) {
  .not-found-view {
    padding: 15px 10px;
  }

  .not-found-content {
    padding: 0 10px;
  }

  .error-code {
    font-size: 4rem;
    margin-bottom: 15px;
  }

  .glitch-text {
    font-size: 1.2rem;
  }

  .error-title {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  .error-description {
    font-size: 1rem;
    padding: 0 10px;
  }

  .error-message {
    margin-bottom: 30px;
  }

  .action-buttons {
    margin-bottom: 40px;
  }

  .suggestions-title {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
}
</style>
