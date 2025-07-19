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
                    <div class="cast-card" @click="goToPerson(person.id)">
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
            <div v-if="similar.length" class="section-card similar-movies-section">
              <h2 class="section-title">Similar Movies</h2>
              <div class="media-grid media-grid--large">
                <MediaCard
                  v-for="similarMovie in similar"
                  :key="similarMovie.id"
                  :item="similarMovie"
                  media-type="movie"
                  @click="goToMovie(similarMovie.id)"
                  class="similar-movie-card"
                />
              </div>
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

    function goToPerson(personId) {
      router.push(`/person/${personId}`)
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
      formatMoney,
      goToPerson
    }
  }
}
</script>

<style scoped>
.movie-detail-view {
  min-height: 100vh;
  background: var(--background-color);
}

.hero-section {
  position: relative;
  min-height: 70vh;
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
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 35, 0.85);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding: 140px 0 80px;
}

.poster-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: transform var(--transition-normal);
  background: var(--glass-effect);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.poster-card:hover {
  transform: scale(1.03) translateY(-8px);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5);
}

.poster-image {
  border-radius: var(--border-radius-lg);
}

.movie-info {
  padding: 32px 0;
}

.movie-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--text-primary);
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.movie-tagline {
  font-size: 1.25rem;
  font-style: italic;
  margin-bottom: 24px;
  color: var(--accent-color);
  font-weight: 500;
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.meta-item {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 8px 16px;
  background: var(--glass-effect);
  border-radius: var(--border-radius-sm);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.movie-overview {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 40px;
  color: var(--text-secondary);
  max-width: 900px;
  text-align: justify;
}

.movie-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.player-section {
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--border-radius-xl);
  margin: 40px 0;
  max-width: 100%;
  overflow: hidden;
}

.player-section .v-container {
  max-width: 100%;
  padding: 0;
}

.details-section {
  padding: 60px 0 100px 0;
}

.section-card {
  background: var(--glass-effect);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: 2.5rem;
  margin-bottom: 2rem;
  transition: all var(--transition-normal);
}

.section-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.similar-movies-section {
  width: 100%;
  overflow: hidden;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
}

.similar-movie-card {
  transition: all var(--transition-normal);
}

.similar-movie-card:hover {
  transform: translateY(-8px) scale(1.03);
  z-index: 10;
}

.crew-section {
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.crew-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--accent-color);
  letter-spacing: -0.01em;
}

.crew-list {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.cast-section {
  margin-top: 48px;
}

.cast-card {
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.cast-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-4px);
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: var(--shadow-lg);
}

.cast-image {
  border-radius: var(--border-radius-md);
  margin-bottom: 12px;
  box-shadow: var(--shadow-md);
}

.cast-name {
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.cast-character {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0;
  font-style: italic;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item strong {
  color: var(--accent-color);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.info-item span,
.production-companies,
.languages {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.trailer-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--border-radius-lg);
  border: none;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  color: var(--text-primary);
  padding: 2rem;
}

.loading-text {
  margin-top: 24px;
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.error-container h2 {
  margin: 24px 0 12px 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.error-container p {
  margin-bottom: 32px;
  color: var(--text-secondary);
  font-size: 1.125rem;
  max-width: 500px;
}

@media (max-width: 1200px) {
  .hero-content {
    padding: 120px 0 60px;
  }

  .section-card {
    padding: 2rem;
  }

  .movie-info {
    padding: 24px 0;
  }
}

@media (max-width: 960px) {
  .hero-content {
    padding: 100px 0 50px;
  }

  .section-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .movie-meta {
    gap: 12px;
  }

  .meta-item {
    font-size: 1rem;
    padding: 6px 12px;
  }

  .movie-overview {
    font-size: 1rem;
    margin-bottom: 32px;
  }

  .cast-card {
    padding: 12px;
  }

  .info-item {
    padding: 12px;
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .hero-content {
    padding: 80px 0 40px;
  }

  .movie-actions {
    flex-direction: column;
    gap: 12px;
  }

  .movie-actions .v-btn {
    width: 100%;
  }

  .section-card {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .section-title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .movie-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .meta-item {
    width: 100%;
    text-align: center;
  }

  .movie-overview {
    text-align: left;
    margin-bottom: 24px;
  }

  .cast-card {
    padding: 8px;
    margin-bottom: 16px;
  }

  .cast-name {
    font-size: 0.9rem;
  }

  .cast-character {
    font-size: 0.8rem;
  }

  .info-item {
    padding: 10px;
    margin-bottom: 12px;
  }

  .info-item strong {
    font-size: 0.9rem;
  }

  .info-item span,
  .production-companies,
  .languages {
    font-size: 0.9rem;
  }

  .crew-section {
    padding: 16px;
    margin-bottom: 24px;
  }

  .crew-title {
    font-size: 1.25rem;
  }

  .crew-list {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .section-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .movie-title {
    text-align: center;
  }

  .movie-tagline {
    text-align: center;
    font-size: 1.125rem;
  }

  .poster-card {
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>
