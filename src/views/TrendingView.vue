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

      <div v-if="trendingContent.length > 0" class="trending-grid">
        <v-row>
          <v-col
            v-for="item in trendingContent"
            :key="item.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <MediaCard
              :item="item"
              :media-type="item.media_type"
            />
          </v-col>
        </v-row>
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
  min-height: 120vh;
  background: #1A1D29;
  padding: 80px 0 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.trending-filters {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: white;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.1rem;
}
</style>
