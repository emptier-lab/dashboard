<template>
  <div class="trending-view">
    <v-container>
      <div class="page-header">
        <h1 class="page-title">
          <v-icon icon="mdi-trending-up" class="mr-3" />
          Trending
        </h1>
        <p class="page-subtitle">What's popular right now</p>
      </div>

      <div class="trending-filters">
        <v-btn-toggle
          v-model="timeWindow"
          color="primary"
          variant="outlined"
          mandatory
          @update:model-value="loadTrending"
        >
          <v-btn value="day">Today</v-btn>
          <v-btn value="week">This Week</v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="trendingContent.length > 0" class="trending-section">
        <div class="media-grid media-grid--large">
          <MediaCard
            v-for="item in trendingContent"
            :key="item.id"
            :item="item"
            :media-type="item.media_type"
            class="trending-card"
          />
        </div>
      </div>

      <div v-else-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="loading-text">Loading trending content...</p>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'TrendingView',
  components: {
    MediaCard
  },
  setup() {
    const trendingContent = ref([])
    const loading = ref(true)
    const timeWindow = ref('week')

    async function loadTrending() {
      loading.value = true
      try {
        const response = await tmdbService.getTrending('all', timeWindow.value)
        trendingContent.value = response.results || []
      } catch (error) {
        console.error('Failed to load trending content:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadTrending()
    })

    return {
      trendingContent,
      loading,
      timeWindow,
      loadTrending
    }
  }
}
</script>

<style scoped>
.trending-view {
  min-height: 100vh;
  background: var(--background-color);
  padding: 120px 0 60px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
}

.page-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-subtitle {
  font-size: 1.375rem;
  color: var(--text-secondary);
  margin-bottom: 0;
  font-weight: 500;
}

.trending-filters {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.trending-section {
  margin-bottom: 3rem;
}

.trending-card {
  transition: all var(--transition-normal);
}

.trending-card:hover {
  transform: translateY(-8px) scale(1.03);
  z-index: 10;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: var(--text-primary);
  padding: 3rem 1rem;
}

.loading-text {
  margin-top: 1.5rem;
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 960px) {
  .trending-view {
    padding: 100px 0 40px 0;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .trending-filters {
    margin-bottom: 2rem;
  }
}

@media (max-width: 600px) {
  .trending-view {
    padding: 80px 0 30px 0;
  }

  .page-title {
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-subtitle {
    font-size: 1.125rem;
  }
}
</style>
