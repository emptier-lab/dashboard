<template>
  <div class="watchlist-view">
    <v-container>
      <div class="page-header">
        <h1 class="page-title">
          <v-icon icon="mdi-bookmark" class="mr-3" />
          Watchlist
        </h1>
        <p class="page-subtitle">Movies and TV shows you want to watch later</p>
      </div>

      <div v-if="watchlist.length > 0" class="watchlist-grid">
        <v-row align="start" justify="start">
          <v-col
            v-for="item in watchlist"
            :key="item.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
            class="d-flex"
          >
            <MediaCard
              :item="item"
              :media-type="item.media_type || 'movie'"
              class="flex-grow-1"
            />
          </v-col>
        </v-row>
      </div>

      <div v-else class="empty-state">
        <v-icon icon="mdi-bookmark-outline" size="64" color="grey" />
        <h2>Your watchlist is empty</h2>
        <p>Add movies and TV shows you want to watch later!</p>
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
  name: 'WatchlistView',
  components: {
    MediaCard
  },
  setup() {
    const watchlist = ref([])

    function loadWatchlist() {
      const stored = localStorage.getItem('empty-tv-watchlist')
      watchlist.value = stored ? JSON.parse(stored) : []
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
  background: var(--background-color);
  padding: 120px 0 60px 0;
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
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0;
  font-weight: 400;
}

.watchlist-grid {
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
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
  color: rgba(255, 255, 255, 0.8);
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
