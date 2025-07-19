<template>
  <div class="watchlist-view">
    <v-container>
      <div class="page-header">
        <h1 class="page-title">Watchlist</h1>
        <p class="page-subtitle">Movies and TV shows you want to watch later</p>
      </div>

      <div v-if="watchlist.length > 0" class="watchlist-grid">
        <v-row>
          <v-col
            v-for="item in watchlist"
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
        <v-icon icon="mdi-bookmark-outline" size="64" color="grey" />
        <h2>Your watchlist is empty</h2>
        <p>Add movies and TV shows you want to watch later!</p>
        <v-btn @click="$router.push('/')" color="primary" variant="outlined">
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
  name: 'WatchlistView',
  components: {
    MediaCard
  },
  setup() {
    const watchlist = ref([])

    function loadWatchlist() {
      // TODO: Load from localStorage or API
      watchlist.value = []
    }

    onMounted(() => {
      loadWatchlist()
    })

    return {
      watchlist
    }
  }
}
</script>

<style scoped>
.watchlist-view {
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
