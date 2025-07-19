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
      // TODO: Load from localStorage or API
      favorites.value = []
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state h2 {
  margin: 16px 0 8px 0;
  color: #FFFFFF;
}

.empty-state p {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
