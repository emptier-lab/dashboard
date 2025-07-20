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
            <div class="media-card-wrapper">
              <MediaCard
                :item="item"
                :media-type="item.media_type || 'movie'"
                class="flex-grow-1"
              />
              <div class="watch-by-date" v-if="item.watchByDate">
                <v-chip size="small" color="primary" variant="outlined">
                  <v-icon size="x-small" icon="mdi-calendar-clock" class="mr-1" />
                  Watch by: {{ formatDate(item.watchByDate) }}
                </v-chip>
              </div>
              <div class="watchlist-actions">
                <v-btn
                  icon="mdi-calendar-edit"
                  size="small"
                  color="primary"
                  variant="text"
                  class="edit-date-button"
                  @click="openDatePicker(item)"
                  title="Set reminder date"
                />
                <v-btn
                  icon="mdi-close"
                  size="small"
                  color="error"
                  variant="text"
                  class="remove-button"
                  @click="removeFromWatchlist(item)"
                  title="Remove from watchlist"
                />
              </div>
            </div>
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

    <!-- Date Picker Dialog -->
    <v-dialog v-model="dateDialog.show" max-width="400">
      <v-card>
        <v-card-title>Set Watch-by Date</v-card-title>
        <v-card-text>
          <p>Select a date by when you plan to watch "{{ dateDialog.item?.title || dateDialog.item?.name }}"</p>
          <v-date-picker v-model="dateDialog.selectedDate" elevation="0" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dateDialog.show = false">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="text" @click="setWatchByDate">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { localStorageService } from '@/services/localStorage'
import { useRouter } from 'vue-router'

export default {
  name: 'WatchlistView',
  components: {
    MediaCard
  },
  setup() {
    const router = useRouter()
    const watchlist = ref([])
    const dateDialog = ref({
      show: false,
      item: null,
      selectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
    })

    function loadWatchlist() {
      watchlist.value = localStorageService.getWatchlist()
      console.log('Watchlist loaded:', watchlist.value.length)
    }

    function removeFromWatchlist(item) {
      if (item && item.id) {
        localStorageService.removeFromWatchlist(item.id, item.media_type)
        loadWatchlist() // Reload watchlist after removal
      }
    }

    function formatDate(dateString) {
      if (!dateString) return 'No date set'

      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
    }

    function openDatePicker(item) {
      dateDialog.value.item = item
      if (item.watchByDate) {
        dateDialog.value.selectedDate = new Date(item.watchByDate).toISOString().substr(0, 10)
      } else {
        // Set default to 3 days from now
        dateDialog.value.selectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10)
      }
      dateDialog.value.show = true
    }

    function setWatchByDate() {
      if (dateDialog.value.item && dateDialog.value.selectedDate) {
        const selectedDate = new Date(dateDialog.value.selectedDate)

        // Update the watch-by date
        localStorageService.updateWatchByDate(
          dateDialog.value.item.id,
          dateDialog.value.item.media_type,
          selectedDate
        )

        // Reload watchlist to show updated date
        loadWatchlist()

        // Close dialog
        dateDialog.value.show = false
      }
    }

    // Mounting handled in the handleStorageEvent section above

    // Watch for storage events
    function handleStorageEvent() {
      loadWatchlist()
    }

    onMounted(() => {
      loadWatchlist()
      // Add event listener for storage changes (works for both real storage events and our custom dispatched events)
      window.addEventListener('storage', handleStorageEvent)
    })

    onBeforeUnmount(() => {
      // Clean up event listener
      window.removeEventListener('storage', handleStorageEvent)
    })

    return {
      watchlist,
      dateDialog,
      removeFromWatchlist,
      formatDate,
      openDatePicker,
      setWatchByDate
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

.media-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.watchlist-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-card-wrapper:hover .watchlist-actions {
  opacity: 1;
}

.remove-button, .edit-date-button {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
}

.watch-by-date {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 10;
  transition: transform 0.3s ease;
}

.media-card-wrapper:hover .watch-by-date {
  transform: translateY(-5px);
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
