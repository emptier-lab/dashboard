<template>
  <div class="tv-shows-view">
    <v-container>
      <div class="page-header">
        <h1 class="page-title">TV Shows</h1>
        <p class="page-subtitle">Discover amazing TV series</p>
      </div>

      <div v-if="tvShows.length > 0" class="tv-grid">
        <v-row>
          <v-col
            v-for="show in tvShows"
            :key="show.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <MediaCard
              :item="show"
              media-type="tv"
            />
          </v-col>
        </v-row>
      </div>

      <div v-else-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="loading-text">Loading TV shows...</p>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'TVShowsView',
  components: {
    MediaCard
  },
  setup() {
    const tvShows = ref([])
    const loading = ref(true)

    async function loadTVShows() {
      try {
        const response = await tmdbService.getPopularTV()
        tvShows.value = response.results || []
      } catch (error) {
        console.error('Failed to load TV shows:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadTVShows()
    })

    return {
      tvShows,
      loading
    }
  }
}
</script>

<style scoped>
.tv-shows-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1D29 0%, #2D1B42 100%);
  padding: 80px 0 40px 0;
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
