<template>
  <div class="tv-detail-view">
    <v-container v-if="tvShow" fluid class="pa-0">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-backdrop">
          <v-img
            v-if="tvShow.backdrop_path"
            :src="getBackdropUrl(tvShow.backdrop_path)"
            :alt="tvShow.name"
            cover
            class="hero-image"
          />
          <div class="hero-overlay"></div>
        </div>

        <v-container class="hero-content">
          <v-row>
            <v-col cols="12" md="4" lg="3">
              <div class="poster-card">
                <v-img
                  :src="getPosterUrl(tvShow.poster_path)"
                  :alt="tvShow.name"
                  aspect-ratio="2/3"
                  cover
                  class="poster-image"
                />
              </div>
            </v-col>

            <v-col cols="12" md="8" lg="9">
              <div class="tv-info">
                <h1 class="tv-title">{{ tvShow.name }}</h1>
                <p v-if="tvShow.tagline" class="tv-tagline">{{ tvShow.tagline }}</p>

                <div class="tv-meta">
                  <v-chip
                    v-if="tvShow.vote_average"
                    :color="getRatingColor(tvShow.vote_average)"
                    size="small"
                    class="mr-2"
                  >
                    <v-icon icon="mdi-star" size="small" class="mr-1" />
                    {{ formatRating(tvShow.vote_average) }}
                  </v-chip>

                  <span v-if="tvShow.first_air_date" class="meta-item">
                    {{ getYear(tvShow.first_air_date) }}
                  </span>

                  <span v-if="tvShow.number_of_seasons" class="meta-item">
                    {{ tvShow.number_of_seasons }} Season{{ tvShow.number_of_seasons > 1 ? 's' : '' }}
                  </span>

                  <span v-if="tvShow.number_of_episodes" class="meta-item">
                    {{ tvShow.number_of_episodes }} Episodes
                  </span>

                  <v-chip
                    v-for="genre in tvShow.genres.slice(0, 3)"
                    :key="genre.id"
                    size="small"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ genre.name }}
                  </v-chip>
                </div>

                <p v-if="tvShow.overview" class="tv-overview">
                  {{ tvShow.overview }}
                </p>

                <div class="tv-actions">
                  <v-btn
                    color="primary"
                    size="large"
                    @click="watchTVShow"
                    class="mr-3 mb-2"
                  >
                    <v-icon icon="mdi-play" class="mr-2" />
                    Watch Now
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    @click="toggleFavorite"
                    class="mr-3 mb-2"
                  >
                    <v-icon :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" class="mr-2" />
                    {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    @click="toggleWatchlist"
                    class="mb-2"
                  >
                    <v-icon :icon="isInWatchlist ? 'mdi-bookmark' : 'mdi-bookmark-outline'" class="mr-2" />
                    {{ isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist' }}
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Video Player Section -->
      <v-container v-if="showPlayer" class="player-section">
        <VideoPlayer
          :tmdb-id="tvShow.id"
          media-type="tv"
          :title="tvShow.name"
          :backdrop-path="tvShow.backdrop_path"
          :season="selectedSeason"
          :episode="selectedEpisode"
          :seasons="tvShow.seasons"
          :auto-play="false"
          @player-closed="showPlayer = false"
          @episode-changed="handleEpisodeChange"
        />
      </v-container>

      <!-- Seasons & Episodes -->
      <v-container v-if="tvShow.seasons?.length" class="seasons-section">
        <div class="section-card">
          <h2 class="section-title">Seasons & Episodes</h2>

          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="selectedSeason"
                :items="seasonOptions"
                label="Select Season"
                variant="outlined"
                @update:model-value="loadSeasonDetails"
              />
            </v-col>
          </v-row>

          <div v-if="currentSeasonDetails" class="season-details">
            <h3 class="season-title">{{ currentSeasonDetails.name }}</h3>
            <p v-if="currentSeasonDetails.overview" class="season-overview">
              {{ currentSeasonDetails.overview }}
            </p>

            <div v-if="currentSeasonDetails.episodes" class="episodes-grid">
              <v-row>
                <v-col
                  v-for="episode in currentSeasonDetails.episodes"
                  :key="episode.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    class="episode-card"
                    @click="watchEpisode(selectedSeason, episode.episode_number)"
                    hover
                  >
                    <v-img
                      v-if="episode.still_path"
                      :src="getStillUrl(episode.still_path)"
                      :alt="episode.name"
                      aspect-ratio="16/9"
                      cover
                    >
                      <div class="episode-overlay">
                        <v-btn
                          icon="mdi-play"
                          color="primary"
                          variant="flat"
                        />
                      </div>
                    </v-img>

                    <v-card-text>
                      <div class="episode-number">Episode {{ episode.episode_number }}</div>
                      <h4 class="episode-title">{{ episode.name }}</h4>
                      <p class="episode-overview">{{ truncateText(episode.overview, 80) }}</p>
                      <div class="episode-meta">
                        <span v-if="episode.air_date">{{ formatDate(episode.air_date) }}</span>
                        <span v-if="episode.runtime">{{ episode.runtime }}m</span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </v-container>

      <!-- Details Section -->
      <v-container class="details-section">
        <v-row>
          <v-col cols="12" lg="8">
            <!-- Cast & Crew -->
            <div v-if="tvShow.credits" class="section-card">
              <h2 class="section-title">Cast & Crew</h2>

              <div v-if="creators.length" class="crew-section">
                <h3 class="crew-title">Creators</h3>
                <div class="crew-list">
                  <span v-for="(creator, index) in creators" :key="creator.id">
                    {{ creator.name }}<span v-if="index < creators.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="cast.length" class="cast-section">
                <h3 class="crew-title">Cast</h3>
                <v-row>
                  <v-col
                    v-for="person in cast"
                    :key="person.id"
                    cols="6"
                    sm="4"
                    md="3"
                    lg="2"
                  >
                    <div class="cast-card">
                      <v-img
                        :src="getProfileUrl(person.profile_path)"
                        :alt="person.name"
                        aspect-ratio="2/3"
                        cover
                        class="cast-image"
                      />
                      <div class="cast-info">
                        <p class="cast-name">{{ person.name }}</p>
                        <p class="cast-character">{{ person.character }}</p>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </div>

            <!-- Similar TV Shows -->
            <div v-if="similar.length" class="section-card">
              <h2 class="section-title">Similar TV Shows</h2>
              <v-row>
                <v-col
                  v-for="similarShow in similar"
                  :key="similarShow.id"
                  cols="6"
                  sm="4"
                  md="3"
                  lg="2"
                >
                  <MediaCard
                    :item="similarShow"
                    media-type="tv"
                    @click="goToTVShow(similarShow.id)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>

          <v-col cols="12" lg="4">
            <!-- TV Show Info Sidebar -->
            <div class="section-card">
              <h2 class="section-title">Show Info</h2>

              <div class="info-item">
                <strong>First Air Date:</strong>
                <span>{{ formatDate(tvShow.first_air_date) }}</span>
              </div>

              <div v-if="tvShow.last_air_date" class="info-item">
                <strong>Last Air Date:</strong>
                <span>{{ formatDate(tvShow.last_air_date) }}</span>
              </div>

              <div v-if="tvShow.status" class="info-item">
                <strong>Status:</strong>
                <span>{{ tvShow.status }}</span>
              </div>

              <div v-if="tvShow.networks?.length" class="info-item">
                <strong>Networks:</strong>
                <div class="networks">
                  <span v-for="(network, index) in tvShow.networks" :key="network.id">
                    {{ network.name }}<span v-if="index < tvShow.networks.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="tvShow.production_companies?.length" class="info-item">
                <strong>Production:</strong>
                <div class="production-companies">
                  <span v-for="(company, index) in tvShow.production_companies" :key="company.id">
                    {{ company.name }}<span v-if="index < tvShow.production_companies.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="tvShow.spoken_languages?.length" class="info-item">
                <strong>Languages:</strong>
                <div class="languages">
                  <span v-for="(lang, index) in tvShow.spoken_languages" :key="lang.iso_639_1">
                    {{ lang.english_name }}<span v-if="index < tvShow.spoken_languages.length - 1">, </span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Trailer -->
            <div v-if="trailerKey" class="section-card">
              <h2 class="section-title">Trailer</h2>
              <div class="trailer-container">
                <iframe
                  :src="`https://www.youtube.com/embed/${trailerKey}`"
                  frameborder="0"
                  allowfullscreen
                  class="trailer-iframe"
                ></iframe>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="loading-text">Loading TV show details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-icon icon="mdi-alert-circle" size="64" color="error" />
      <h2>Failed to load TV show</h2>
      <p>{{ error }}</p>
      <v-btn @click="loadTVShow" color="primary" variant="outlined">
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
  name: 'TVDetailView',
  components: {
    VideoPlayer,
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const tvShow = ref(null)
    const currentSeasonDetails = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const showPlayer = ref(false)
    const selectedSeason = ref(1)
    const selectedEpisode = ref(1)
    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    const creators = computed(() => {
      return tvShow.value?.created_by || []
    })

    const cast = computed(() => {
      return utilsService.getMainCast(tvShow.value?.credits, 12) || []
    })

    const similar = computed(() => {
      return tvShow.value?.similar?.results?.slice(0, 12) || []
    })

    const trailerKey = computed(() => {
      return utilsService.getTrailerKey(tvShow.value?.videos)
    })

    const seasonOptions = computed(() => {
      if (!tvShow.value?.seasons) return []
      return tvShow.value.seasons
        .filter(season => season.season_number > 0)
        .map(season => ({
          title: `Season ${season.season_number}`,
          value: season.season_number
        }))
    })

    async function loadTVShow() {
      loading.value = true
      error.value = null

      try {
        const tvId = route.params.id
        const response = await tmdbService.getTVDetails(tvId)
        tvShow.value = response

        if (tvShow.value.seasons?.length) {
          selectedSeason.value = tvShow.value.seasons.find(s => s.season_number > 0)?.season_number || 1
          await loadSeasonDetails()
        }

        checkFavoriteStatus()
        checkWatchlistStatus()
      } catch (err) {
        error.value = err.message || 'Failed to load TV show details'
      } finally {
        loading.value = false
      }
    }

    async function loadSeasonDetails() {
      if (!tvShow.value || !selectedSeason.value) return

      try {
        const response = await tmdbService.getSeasonDetails(tvShow.value.id, selectedSeason.value)
        currentSeasonDetails.value = response
      } catch (err) {
        console.error('Failed to load season details:', err)
      }
    }

    function watchTVShow() {
      showPlayer.value = true
    }

    function watchEpisode(season, episode) {
      selectedSeason.value = season
      selectedEpisode.value = episode
      showPlayer.value = true
    }

    function handleEpisodeChange(data) {
      selectedSeason.value = data.season
      selectedEpisode.value = data.episode
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

    function goToTVShow(tvId) {
      router.push(`/tv/${tvId}`)
    }

    function getPosterUrl(path) {
      return imageService.getPosterUrl(path, 'w500')
    }

    function getBackdropUrl(path) {
      return imageService.getBackdropUrl(path, 'w1280')
    }

    function getProfileUrl(path) {
      return imageService.getProfileUrl(path, 'w185')
    }

    function getStillUrl(path) {
      return imageService.getStillUrl(path, 'w300')
    }

    function formatRating(rating) {
      return utilsService.formatVoteAverage(rating)
    }

    function getRatingColor(rating) {
      return utilsService.getRatingColor(rating)
    }

    function formatDate(date) {
      return utilsService.formatDate(date)
    }

    function getYear(date) {
      return utilsService.getYear(date)
    }

    function truncateText(text, maxLength) {
      return utilsService.truncateText(text, maxLength)
    }

    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadTVShow()
      }
    })

    watch(selectedSeason, () => {
      loadSeasonDetails()
    })

    onMounted(() => {
      loadTVShow()
    })

    return {
      tvShow,
      currentSeasonDetails,
      loading,
      error,
      showPlayer,
      selectedSeason,
      selectedEpisode,
      isFavorite,
      isInWatchlist,
      creators,
      cast,
      similar,
      trailerKey,
      seasonOptions,
      loadTVShow,
      loadSeasonDetails,
      watchTVShow,
      watchEpisode,
      handleEpisodeChange,
      toggleFavorite,
      toggleWatchlist,
      goToTVShow,
      getPosterUrl,
      getBackdropUrl,
      getProfileUrl,
      getStillUrl,
      formatRating,
      getRatingColor,
      formatDate,
      getYear,
      truncateText
    }
  }
}
</script>

<style scoped>
.tv-detail-view {
  min-height: 100vh;
  background: #1A1D29;
}

.hero-section {
  position: relative;
  min-height: 60vh;
  overflow: hidden;
}

.hero-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(26, 29, 41, 0.9) 0%,
    rgba(26, 29, 41, 0.7) 50%,
    rgba(26, 29, 41, 0.3) 100%
  );
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding-top: 120px;
  padding-bottom: 60px;
}

.poster-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.poster-card:hover {
  transform: scale(1.05);
}

.poster-image {
  border-radius: 12px;
}

.tv-info {
  padding: 20px 0;
}

.tv-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #FFFFFF;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.tv-tagline {
  font-size: 1.2rem;
  font-style: italic;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.tv-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.meta-item {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.tv-overview {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
}

.tv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.player-section {
  padding: 40px 0;
}

.seasons-section,
.details-section {
  padding: 40px 0 80px 0;
}

.section-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #00D4AA;
}

.season-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #FFFFFF;
}

.season-overview {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.episodes-grid {
  margin-top: 24px;
}

.episode-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.episode-card:hover {
  transform: translateY(-2px);
}

.episode-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.episode-card:hover .episode-overlay {
  opacity: 1;
}

.episode-number {
  font-size: 0.75rem;
  color: #00D4AA;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.episode-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #FFFFFF;
  line-height: 1.3;
}

.episode-overview {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  margin-bottom: 8px;
}

.episode-meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 8px;
}

.crew-section {
  margin-bottom: 24px;
}

.crew-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #FFFFFF;
}

.crew-list {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.cast-section {
  margin-top: 32px;
}

.cast-card {
  text-align: center;
  margin-bottom: 16px;
}

.cast-image {
  border-radius: 8px;
  margin-bottom: 8px;
}

.cast-name {
  font-weight: 600;
  margin-bottom: 4px;
  color: #FFFFFF;
  font-size: 0.9rem;
}

.cast-character {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  gap: 4px;
}

.info-item strong {
  color: #00D4AA;
  font-size: 0.9rem;
}

.info-item span,
.networks,
.production-companies,
.languages {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.trailer-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
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
  .tv-title {
    font-size: 2.5rem;
  }

  .hero-content {
    padding-top: 80px;
    padding-bottom: 40px;
  }

  .section-card {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .tv-title {
    font-size: 2rem;
  }

  .tv-actions {
    flex-direction: column;
  }

  .tv-actions .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
