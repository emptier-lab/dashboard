<template>
  <div class="watch-view">
    <v-container v-if="media" fluid class="pa-0">
      <!-- Back Navigation -->
      <div class="navigation-bar">
        <v-container>
          <v-btn
            variant="text"
            @click="goBack"
            class="back-btn"
          >
            <v-icon icon="mdi-arrow-left" class="mr-2" />
            Back
          </v-btn>
        </v-container>
      </div>

      <!-- Media Header -->
      <div class="media-header">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="8">
              <h1 class="media-title">{{ mediaTitle }}</h1>
              <p v-if="mediaSubtitle" class="media-subtitle">{{ mediaSubtitle }}</p>
            </v-col>
            <v-col cols="12" md="4" class="text-right">
              <v-btn
                variant="outlined"
                @click="toggleFavorite"
                class="mr-2"
              >
                <v-icon :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" class="mr-2" />
                {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
              </v-btn>
              <v-btn
                variant="outlined"
                @click="toggleWatchlist"
              >
                <v-icon :icon="isInWatchlist ? 'mdi-bookmark' : 'mdi-bookmark-outline'" class="mr-2" />
                {{ isInWatchlist ? 'In Watchlist' : 'Add to Watchlist' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Video Player -->
      <div class="player-container">
        <v-container>
          <VideoPlayer
            :tmdb-id="mediaId"
            :media-type="mediaType"
            :title="mediaTitle"
            :backdrop-path="media.backdrop_path"
            :season="currentSeason"
            :episode="currentEpisode"
            :seasons="media.seasons"
            :auto-play="true"
            @episode-changed="handleEpisodeChange"
          />
        </v-container>
      </div>

      <!-- Media Information -->
      <div class="media-info-section">
        <v-container>
          <v-row>
            <v-col cols="12" md="8">
              <div class="info-card">
                <h2 class="info-title">About</h2>
                <p v-if="media.overview" class="media-overview">
                  {{ media.overview }}
                </p>

                <div class="media-details">
                  <div class="detail-item">
                    <strong>Rating:</strong>
                    <v-chip
                      v-if="media.vote_average"
                      :color="getRatingColor(media.vote_average)"
                      size="small"
                      class="ml-2"
                    >
                      <v-icon icon="mdi-star" size="small" class="mr-1" />
                      {{ formatRating(media.vote_average) }}
                    </v-chip>
                  </div>

                  <div class="detail-item">
                    <strong>Release:</strong>
                    <span>{{ getReleaseDate() }}</span>
                  </div>

                  <div v-if="media.genres?.length" class="detail-item">
                    <strong>Genres:</strong>
                    <div class="genres">
                      <v-chip
                        v-for="genre in media.genres"
                        :key="genre.id"
                        size="small"
                        variant="outlined"
                        class="mr-1 mb-1"
                      >
                        {{ genre.name }}
                      </v-chip>
                    </div>
                  </div>

                  <div v-if="mediaType === 'movie' && media.runtime" class="detail-item">
                    <strong>Runtime:</strong>
                    <span>{{ formatRuntime(media.runtime) }}</span>
                  </div>

                  <div v-if="mediaType === 'tv'" class="detail-item">
                    <strong>Seasons:</strong>
                    <span>{{ media.number_of_seasons }} season{{ media.number_of_seasons > 1 ? 's' : '' }}</span>
                  </div>

                  <div v-if="mediaType === 'tv'" class="detail-item">
                    <strong>Episodes:</strong>
                    <span>{{ media.number_of_episodes }} episodes</span>
                  </div>
                </div>
              </div>

              <!-- Episode List for TV Shows -->
              <div v-if="mediaType === 'tv' && currentSeasonDetails" class="episodes-card">
                <h2 class="info-title">Episodes - Season {{ currentSeason }}</h2>

                <div class="season-selector">
                  <v-select
                    v-model="currentSeason"
                    :items="seasonOptions"
                    label="Select Season"
                    variant="outlined"
                    density="compact"
                    @update:model-value="loadSeasonDetails"
                  />
                </div>

                <div class="episodes-list">
                  <v-card
                    v-for="episode in currentSeasonDetails.episodes"
                    :key="episode.id"
                    :class="{ 'episode-active': episode.episode_number === currentEpisode }"
                    class="episode-item"
                    @click="watchEpisode(currentSeason, episode.episode_number)"
                    hover
                  >
                    <v-row no-gutters>
                      <v-col cols="4" sm="3" md="2">
                        <v-img
                          v-if="episode.still_path"
                          :src="getStillUrl(episode.still_path)"
                          :alt="episode.name"
                          aspect-ratio="16/9"
                          cover
                        />
                        <div v-else class="episode-placeholder">
                          <v-icon icon="mdi-play" />
                        </div>
                      </v-col>
                      <v-col cols="8" sm="9" md="10">
                        <v-card-text>
                          <div class="episode-number">Episode {{ episode.episode_number }}</div>
                          <h4 class="episode-title">{{ episode.name }}</h4>
                          <p class="episode-overview">{{ truncateText(episode.overview, 120) }}</p>
                          <div class="episode-meta">
                            <span v-if="episode.air_date">{{ formatDate(episode.air_date) }}</span>
                            <span v-if="episode.runtime">{{ episode.runtime }}m</span>
                          </div>
                        </v-card-text>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <!-- Similar Content -->
              <div v-if="similar.length" class="similar-card">
                <h2 class="info-title">More Like This</h2>
                <div class="similar-grid">
                  <MediaCard
                    v-for="item in similar"
                    :key="item.id"
                    :item="item"
                    :media-type="mediaType"
                    class="similar-item"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-container>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="loading-text">Loading content...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-icon icon="mdi-alert-circle" size="64" color="error" />
      <h2>Failed to load content</h2>
      <p>{{ error }}</p>
      <v-btn @click="loadMedia" color="primary" variant="outlined">
        Try Again
      </v-btn>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VideoPlayer from '@/components/common/VideoPlayer.vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService, imageService, utilsService } from '@/services/tmdb'

export default {
  name: 'WatchView',
  components: {
    VideoPlayer,
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const media = ref(null)
    const currentSeasonDetails = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    const mediaType = computed(() => route.params.type)
    const mediaId = computed(() => route.params.id)
    const currentSeason = ref(parseInt(route.params.season) || 1)
    const currentEpisode = ref(parseInt(route.params.episode) || 1)

    const mediaTitle = computed(() => {
      return media.value?.title || media.value?.name || 'Unknown Title'
    })

    const mediaSubtitle = computed(() => {
      if (mediaType.value === 'tv' && route.params.season && route.params.episode) {
        return `Season ${currentSeason.value}, Episode ${currentEpisode.value}`
      }
      return null
    })

    const seasonOptions = computed(() => {
      if (!media.value?.seasons) return []
      return media.value.seasons
        .filter(season => season.season_number > 0)
        .map(season => ({
          title: `Season ${season.season_number}`,
          value: season.season_number
        }))
    })

    const similar = computed(() => {
      return media.value?.similar?.results?.slice(0, 6) || []
    })

    async function loadMedia() {
      loading.value = true
      error.value = null

      try {
        let response
        if (mediaType.value === 'movie') {
          response = await tmdbService.getMovieDetails(mediaId.value)
        } else {
          response = await tmdbService.getTVDetails(mediaId.value)
          if (response.seasons?.length) {
            await loadSeasonDetails()
          }
        }
        media.value = response

        checkFavoriteStatus()
        checkWatchlistStatus()
      } catch (err) {
        error.value = err.message || 'Failed to load content'
      } finally {
        loading.value = false
      }
    }

    async function loadSeasonDetails() {
      if (!media.value || !currentSeason.value) return

      try {
        const response = await tmdbService.getSeasonDetails(media.value.id, currentSeason.value)
        currentSeasonDetails.value = response
      } catch (err) {
        console.error('Failed to load season details:', err)
      }
    }

    function watchEpisode(season, episode) {
      currentSeason.value = season
      currentEpisode.value = episode

      // Update URL
      const newPath = `/watch/tv/${mediaId.value}/${season}/${episode}`
      router.replace(newPath)
    }

    function handleEpisodeChange(data) {
      watchEpisode(data.season, data.episode)
    }

    function goBack() {
      router.back()
    }

    function toggleFavorite() {
      isFavorite.value = !isFavorite.value
    }

    function toggleWatchlist() {
      isInWatchlist.value = !isInWatchlist.value
    }

    function checkFavoriteStatus() {
      isFavorite.value = false
    }

    function checkWatchlistStatus() {
      isInWatchlist.value = false
    }

    function getReleaseDate() {
      const date = media.value?.release_date || media.value?.first_air_date
      return utilsService.formatDate(date)
    }

    function formatRating(rating) {
      return utilsService.formatVoteAverage(rating)
    }

    function getRatingColor(rating) {
      return utilsService.getRatingColor(rating)
    }

    function formatRuntime(minutes) {
      return utilsService.formatRuntime(minutes)
    }

    function formatDate(date) {
      return utilsService.formatDate(date)
    }

    function truncateText(text, maxLength) {
      return utilsService.truncateText(text, maxLength)
    }

    function getStillUrl(path) {
      return imageService.getStillUrl(path, 'w300')
    }

    watch(() => route.params, () => {
      currentSeason.value = parseInt(route.params.season) || 1
      currentEpisode.value = parseInt(route.params.episode) || 1
      loadMedia()
    })

    watch(currentSeason, () => {
      if (mediaType.value === 'tv') {
        loadSeasonDetails()
      }
    })

    onMounted(() => {
      loadMedia()
    })

    return {
      media,
      currentSeasonDetails,
      loading,
      error,
      mediaType,
      mediaId,
      currentSeason,
      currentEpisode,
      mediaTitle,
      mediaSubtitle,
      seasonOptions,
      similar,
      isFavorite,
      isInWatchlist,
      loadMedia,
      loadSeasonDetails,
      watchEpisode,
      handleEpisodeChange,
      goBack,
      toggleFavorite,
      toggleWatchlist,
      getReleaseDate,
      formatRating,
      getRatingColor,
      formatRuntime,
      formatDate,
      truncateText,
      getStillUrl
    }
  }
}
</script>

<style scoped>
.watch-view {
  min-height: 100vh;
  background: #1A1D29;
}

.navigation-bar {
  padding: 16px 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  color: rgba(255, 255, 255, 0.8);
}

.media-header {
  padding: 24px 0;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.media-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.media-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.player-container {
  padding: 40px 0;
}

.media-info-section {
  padding: 40px 0 80px 0;
}

.info-card,
.episodes-card,
.similar-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
}

.info-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #00D4AA;
}

.media-overview {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
}

.media-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item strong {
  color: #00D4AA;
  min-width: 80px;
}

.detail-item span {
  color: rgba(255, 255, 255, 0.8);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.season-selector {
  margin-bottom: 24px;
  max-width: 300px;
}

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.episode-item {
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.episode-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.episode-active {
  border-color: #00D4AA;
  background: rgba(0, 212, 170, 0.1);
}

.episode-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 60px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.episode-number {
  font-size: 0.75rem;
  color: #00D4AA;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.episode-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #FFFFFF;
}

.episode-overview {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 8px;
}

.episode-meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 12px;
}

.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.similar-item {
  max-width: 200px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  color: white;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.1rem;
}

.error-container h2 {
  margin: 16px 0 8px 0;
  color: #FFFFFF;
}

.error-container p {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 960px) {
  .media-title {
    font-size: 2rem;
  }

  .info-card,
  .episodes-card,
  .similar-card {
    padding: 20px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .similar-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 600px) {
  .media-title {
    font-size: 1.5rem;
  }

  .media-header .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
