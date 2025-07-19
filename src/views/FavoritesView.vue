<template>
  <div class="favorites-view">
    <v-container>
      <div class="page-header">
        <h1 class="page-title">
          <v-icon icon="mdi-heart" class="mr-3" />
          Favorites
        </h1>
        <p class="page-subtitle">Your favorite movies and TV shows</p>
      </div>

      <div v-if="favorites.length > 0" class="favorites-grid">
        <v-row>
          <v-col
            v-for="item in favorites"
            :key="item.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <MediaCard
              :item="item"
              :media-type="item.media_type || 'movie'"
            />
          </v-col>
        </v-row>
      </div>

      <div v-else class="empty-state">
        <v-icon icon="mdi-heart-outline" size="64" color="grey" />
        <h2>No favorites yet</h2>
        <p>Start adding movies and TV shows to your favorites!</p>
        <v-btn @click="$router.push('/')" color="primary" variant="outlined">
          <v-icon icon="mdi-compass" class="mr-2" />
          Browse Content
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'

export default {
  name: 'FavoritesView',
  components: {
    MediaCard
  },
  setup() {
    const favorites = ref([])

    function loadFavorites() {
      const stored = localStorage.getItem('empty-tv-favorites')
      favorites.value = stored ? JSON.parse(stored) : []
    }

    onMounted(() => {
      loadFavorites()
    })

    return {
      favorites
    }
  }
}
</script>

<style scoped>
.favorites-view {
  min-height: 100vh;
  background: var(--background-color);
  padding: 100px 0 40px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 0;
  font-weight: 400;
}

.favorites-grid {
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 60px 40px;
  margin: 40px 20px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.empty-state h2 {
  margin: 16px 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 2rem;
}

.empty-state p {
  margin-bottom: 24px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.8rem;
  }

  .empty-state {
    margin: 20px 10px;
    padding: 40px 20px;
  }

  .empty-state h2 {
    font-size: 1.5rem;
  }
}
</style>
