<template>
  <div class="movies-view">
    <v-container>
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">
          <v-icon icon="mdi-movie" class="mr-3" />
          Movies
        </h1>
        <p class="page-subtitle">Discover the latest and greatest movies</p>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Category"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-folder"
              @update:model-value="loadMovies"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedGenre"
              :items="genres"
              label="Genre"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-tag"
              @update:model-value="loadMovies"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedYear"
              :items="years"
              label="Year"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-calendar"
              @update:model-value="loadMovies"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort By"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-sort"
              @update:model-value="loadMovies"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Movies Grid -->
      <div v-if="movies.length > 0" class="movies-grid">
        <v-row>
          <v-col
            v-for="movie in movies"
            :key="movie.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <MediaCard
              :item="movie"
              media-type="movie"
            />
          </v-col>
        </v-row>

        <!-- Load More Button -->
        <div v-if="hasMoreMovies" class="load-more-section">
          <v-btn
            @click="loadMoreMovies"
            :loading="loadingMore"
            color="primary"
            variant="outlined"
            size="large"
          >
            <v-icon icon="mdi-reload" class="mr-2" />
            Load More Movies
          </v-btn>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="loading-text">Loading movies...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <v-icon icon="mdi-alert-circle" size="64" color="error" />
        <h2>Failed to load movies</h2>
        <p>{{ error }}</p>
        <v-btn @click="loadMovies" color="primary" variant="outlined">
          <v-icon icon="mdi-refresh" class="mr-2" />
          Try Again
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'MoviesView',
  components: {
    MediaCard
  },
  setup() {
    const movies = ref([])
    const movieGenres = ref([])
    const loading = ref(true)
    const loadingMore = ref(false)
    const error = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(0)

    const selectedCategory = ref('popular')
    const selectedGenre = ref(null)
    const selectedYear = ref(null)
    const sortBy = ref('popularity.desc')

    const categories = [
      { title: 'Popular', value: 'popular' },
      { title: 'Top Rated', value: 'top_rated' },
      { title: 'Now Playing', value: 'now_playing' },
      { title: 'Upcoming', value: 'upcoming' },
      { title: 'Discover', value: 'discover' }
    ]

    const sortOptions = [
      { title: 'Most Popular', value: 'popularity.desc' },
      { title: 'Highest Rated', value: 'vote_average.desc' },
      { title: 'Newest First', value: 'release_date.desc' },
      { title: 'Oldest First', value: 'release_date.asc' },
      { title: 'Title A-Z', value: 'title.asc' },
      { title: 'Title Z-A', value: 'title.desc' }
    ]

    const genres = computed(() => [
      { title: 'All Genres', value: null },
      ...movieGenres.value.map(genre => ({
        title: genre.name,
        value: genre.id
      }))
    ])

    const years = computed(() => {
      const currentYear = new Date().getFullYear()
      const yearList = [{ title: 'All Years', value: null }]
      for (let year = currentYear; year >= 1900; year--) {
        yearList.push({ title: year.toString(), value: year })
      }
      return yearList
    })

    const hasMoreMovies = computed(() => {
      return currentPage.value < totalPages.value
    })

    async function loadMovies() {
      loading.value = true
      error.value = null
      currentPage.value = 1

      try {
        let response

        if (selectedCategory.value === 'discover') {
          const params = {
            sort_by: sortBy.value,
            page: currentPage.value
          }

          if (selectedGenre.value) {
            params.with_genres = selectedGenre.value
          }

          if (selectedYear.value) {
            params.year = selectedYear.value
          }

          response = await tmdbService.discoverMovies(params)
        } else {
          switch (selectedCategory.value) {
            case 'popular':
              response = await tmdbService.getPopularMovies(currentPage.value)
              break
            case 'top_rated':
              response = await tmdbService.getTopRatedMovies(currentPage.value)
              break
            case 'now_playing':
              response = await tmdbService.getNowPlayingMovies(currentPage.value)
              break
            case 'upcoming':
              response = await tmdbService.getUpcomingMovies(currentPage.value)
              break
            default:
              response = await tmdbService.getPopularMovies(currentPage.value)
          }
        }

        movies.value = response.results || []
        totalPages.value = response.total_pages || 0
      } catch (err) {
        error.value = err.message || 'Failed to load movies'
      } finally {
        loading.value = false
      }
    }

    async function loadMoreMovies() {
      if (!hasMoreMovies.value || loadingMore.value) return

      loadingMore.value = true
      currentPage.value += 1

      try {
        let response

        if (selectedCategory.value === 'discover') {
          const params = {
            sort_by: sortBy.value,
            page: currentPage.value
          }

          if (selectedGenre.value) {
            params.with_genres = selectedGenre.value
          }

          if (selectedYear.value) {
            params.year = selectedYear.value
          }

          response = await tmdbService.discoverMovies(params)
        } else {
          switch (selectedCategory.value) {
            case 'popular':
              response = await tmdbService.getPopularMovies(currentPage.value)
              break
            case 'top_rated':
              response = await tmdbService.getTopRatedMovies(currentPage.value)
              break
            case 'now_playing':
              response = await tmdbService.getNowPlayingMovies(currentPage.value)
              break
            case 'upcoming':
              response = await tmdbService.getUpcomingMovies(currentPage.value)
              break
            default:
              response = await tmdbService.getPopularMovies(currentPage.value)
          }
        }

        movies.value.push(...(response.results || []))
      } catch (err) {
        console.error('Failed to load more movies:', err)
      } finally {
        loadingMore.value = false
      }
    }

    async function loadGenres() {
      try {
        const response = await tmdbService.getMovieGenres()
        movieGenres.value = response.genres || []
      } catch (err) {
        console.error('Failed to load genres:', err)
      }
    }

    onMounted(() => {
      loadGenres()
      loadMovies()
    })

    return {
      movies,
      loading,
      loadingMore,
      error,
      selectedCategory,
      selectedGenre,
      selectedYear,
      sortBy,
      categories,
      genres,
      years,
      sortOptions,
      hasMoreMovies,
      loadMovies,
      loadMoreMovies
    }
  }
}
</script>

<style scoped>
.movies-view {
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

.filter-section {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
}

.movies-grid {
  margin-bottom: 40px;
}

.load-more-section {
  text-align: center;
  margin-top: 40px;
}

.loading-container,
.error-container {
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

.error-container h2 {
  margin: 16px 0 8px 0;
  color: #FFFFFF;
}

.error-container p {
  margin-bottom: 24px;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 960px) {
  .page-title {
    font-size: 2.5rem;
  }

  .filter-section {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 2rem;
  }
}
</style>
