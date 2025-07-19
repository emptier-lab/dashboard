<template>
  <div class="movie-detail-view">
    <v-container v-if="movie" fluid class="pa-0">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-backdrop">
          <v-img
            v-if="movie.backdrop_path"
            :src="getBackdropUrl(movie.backdrop_path)"
            :alt="movie.title"
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
                  :src="getPosterUrl(movie.poster_path)"
                  :alt="movie.title"
                  aspect-ratio="2/3"
                  cover
                  class="poster-image"
                />
              </div>
            </v-col>

            <v-col cols="12" md="8" lg="9">
              <div class="movie-info">
                <h1 class="movie-title">{{ movie.title }}</h1>
                <p v-if="movie.tagline" class="movie-tagline">{{ movie.tagline }}</p>

                <div class="movie-meta">
                  <v-chip
                    v-if="movie.vote_average"
                    :color="getRatingColor(movie.vote_average)"
                    size="small"
                    class="mr-2"
                  >
                    <v-icon icon="mdi-star" size="small" class="mr-1" />
                    {{ formatRating(movie.vote_average) }}
                  </v-chip>

                  <span v-if="movie.release_date" class="meta-item">
                    {{ getYear(movie.release_date) }}
                  </span>

                  <span v-if="movie.runtime" class="meta-item">
                    {{ formatRuntime(movie.runtime) }}
                  </span>

                  <v-chip
                    v-for="genre in movie.genres.slice(0, 3)"
                    :key="genre.id"
                    size="small"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ genre.name }}
                  </v-chip>
                </div>

                <p v-if="movie.overview" class="movie-overview">
                  {{ movie.overview }}
                </p>

                <div class="movie-actions">
                  <v-btn
                    color="primary"
                    size="large"
                    @click="watchMovie"
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
          :tmdb-id="movie.id"
          media-type="movie"
          :title="movie.title"
          :backdrop-path="movie.backdrop_path"
          :auto-play="false"
          @player-closed="showPlayer = false"
        />
      </v-container>

      <!-- Details Section -->
      <v-container class="details-section">
        <v-row>
          <v-col cols="12" lg="8">
            <!-- Cast & Crew -->
            <div v-if="movie.credits" class="section-card">
              <h2 class="section-title">Cast & Crew</h2>

              <div v-if="directors.length" class="crew-section">
                <h3 class="crew-title">Directors</h3>
                <div class="crew-list">
                  <span v-for="(director, index) in directors" :key="director.id">
                    {{ director.name }}<span v-if="index < directors.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="writers.length" class="crew-section">
                <h3 class="crew-title">Writers</h3>
                <div class="crew-list">
                  <span v-for="(writer, index) in writers" :key="writer.id">
                    {{ writer.name }}<span v-if="index < writers.length - 1">, </span>
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

            <!-- Similar Movies -->
            <div v-if="similar.length" class="section-card">
              <h2 class="section-title">Similar Movies</h2>
              <v-row>
                <v-col
                  v-for="similarMovie in similar"
                  :key="similarMovie.id"
                  cols="6"
                  sm="4"
                  md="3"
                  lg="2"
                >
                  <MediaCard
                    :item="similarMovie"
                    media-type="movie"
                    @click="goToMovie(similarMovie.id)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>

          <v-col cols="12" lg="4">
            <!-- Movie Info Sidebar -->
            <div class="section-card">
              <h2 class="section-title">Movie Info</h2>

              <div class="info-item">
                <strong>Release Date:</strong>
                <span>{{ formatDate(movie.release_date) }}</span>
              </div>

              <div v-if="movie.budget" class="info-item">
                <strong>Budget:</strong>
                <span>${{ formatMoney(movie.budget) }}</span>
              </div>

              <div v-if="movie.revenue" class="info-item">
                <strong>Revenue:</strong>
                <span>${{ formatMoney(movie.revenue) }}</span>
              </div>

              <div v-if="movie.production_companies?.length" class="info-item">
                <strong>Production:</strong>
                <div class="production-companies">
                  <span v-for="(company, index) in movie.production_companies" :key="company.id">
                    {{ company.name }}<span v-if="index < movie.production_companies.length - 1">, </span>
                  </span>
                </div>
              </div>

              <div v-if="movie.spoken_languages?.length" class="info-item">
                <strong>Languages:</strong>
                <div class="languages">
                  <span v-for="(lang, index) in movie.spoken_languages" :key="lang.iso_639_1">
                    {{ lang.english_name }}<span v-if="index < movie.spoken_languages.length - 1">, </span>
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
      <p class="loading-text">Loading movie details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-icon icon="mdi-alert-circle" size="64" color="error" />
      <h2>Failed to load movie</h2>
      <p>{{ error }}</p>
      <v-btn @click="loadMovie" color="primary" variant="outlined">
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
  name: 'MovieDetailView',
  components: {
    VideoPlayer,
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const movie = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const showPlayer = ref(false)
    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    const directors = computed(() => {
      return utilsService.getDirectors(movie.value?.credits) || []
    })

    const writers = computed(() => {
      return utilsService.getWriters(movie.value?.credits) || []
    })

    const cast = computed(() => {
      return utilsService.getMainCast(movie.value?.credits, 12) || []
    })

    const similar = computed(() => {
      return movie.value?.similar?.results?.slice(0, 12) || []
    })

    const trailerKey = computed(() => {
      return utilsService.getTrailerKey(movie.value?.videos)
    })

    async function loadMovie() {
      loading.value = true
      error.value = null

      try {
        const movieId = route.params.id
        const response = await tmdbService.getMovieDetails(movieId)
        movie.value = response

        checkFavoriteStatus()
        checkWatchlistStatus()
      } catch (err) {
        error.value = err.message || 'Failed to load movie details'
      } finally {
        loading.value = false
      }
    }

    function watchMovie() {
      showPlayer.value = true
    }

    function toggleFavorite() {
      isFavorite.value = !isFavorite.value
      // TODO: Implement favorite storage (localStorage, API, etc.)
    }

    function toggleWatchlist() {
      isInWatchlist.value = !isInWatchlist.value
      // TODO: Implement watchlist storage (localStorage, API, etc.)
    }

    function checkFavoriteStatus() {
      // TODO: Check if movie is in favorites
      isFavorite.value = false
    }

    function checkWatchlistStatus() {
      // TODO: Check if movie is in watchlist
      isInWatchlist.value = false
    }

    function goToMovie(movieId) {
      router.push(`/movie/${movieId}`)
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

    function getYear(date) {
      return utilsService.getYear(date)
    }

    function formatMoney(amount) {
      return new Intl.NumberFormat('en-US').format(amount)
    }

    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadMovie()
      }
    })

    onMounted(() => {
      loadMovie()
    })

    return {
      movie,
      loading,
      error,
      showPlayer,
      isFavorite,
      isInWatchlist,
      directors,
      writers,
      cast,
      similar,
      trailerKey,
      loadMovie,
      watchMovie,
      toggleFavorite,
      toggleWatchlist,
      goToMovie,
      getPosterUrl,
      getBackdropUrl,
      getProfileUrl,
      formatRating,
      getRatingColor,
      formatRuntime,
      formatDate,
      getYear,
      formatMoney
    }
  }
}
</script>

<style scoped>
.movie-detail-view {
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

.movie-info {
  padding: 20px 0;
}

.movie-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #FFFFFF;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.movie-tagline {
  font-size: 1.2rem;
  font-style: italic;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.movie-meta {
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

.movie-overview {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
}

.movie-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.player-section {
  padding: 40px 0;
}

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
  .movie-title {
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
  .movie-title {
    font-size: 2rem;
  }

  .movie-actions {
    flex-direction: column;
  }

  .movie-actions .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
