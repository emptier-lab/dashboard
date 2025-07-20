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
        <div class="filter-row">
          <div class="filter-group">
            <div class="filter-label">Category</div>
            <div class="filter-select">
              <v-select
                v-model="selectedCategory"
                :items="categories"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-folder"
              />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">Genre</div>
            <div class="filter-select">
              <v-select
                v-model="selectedGenre"
                :items="genres"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-tag"
              />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">Network</div>
            <div class="filter-select">
              <v-select
                v-model="selectedNetwork"
                :items="networks"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-television-classic"
              />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">Year</div>
            <div class="filter-select">
              <v-select
                v-model="selectedYear"
                :items="years"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-calendar"
              />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">Sort By</div>
            <div class="filter-select">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-sort"
              />
            </div>
          </div>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <div class="filter-label">Audience</div>
            <div class="filter-select">
              <v-select
                v-model="selectedAudience"
                :items="audienceTypes"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-account-group"
              />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">Theme</div>
            <div class="filter-select">
              <v-select
                v-model="selectedTheme"
                :items="themeTypes"
                variant="plain"
                hide-details
                density="compact"
                bg-color="rgba(0,0,0,0.2)"
                class="filter-control"
                prepend-inner-icon="mdi-flash"
              />
            </div>
          </div>
        </div>

        <div class="keyword-chips mt-4">
          <v-chip
            v-for="keyword in keywordOptions"
            :key="keyword.value"
            :value="keyword.value"
            :active="selectedKeywords.includes(keyword.value)"
            @click="toggleKeyword(keyword.value)"
            variant="outlined"
            class="mr-2 mb-2 custom-chip"
            :class="{ 'active-chip': selectedKeywords.includes(keyword.value) }"
          >
            {{ keyword.title }}
          </v-chip>
        </div>
      </div>

      <!-- Movies Grid -->
      <div v-if="movies.length > 0" class="movies-section">
        <div class="media-grid media-grid--large">
          <MediaCard
            v-for="movie in movies"
            :key="movie.id"
            :item="movie"
            media-type="movie"
            class="movie-card"
          />
        </div>

        <!-- Load More Button for fallback -->
        <div v-if="hasMoreMovies && !infiniteScrollEnabled" class="load-more-section">
          <v-btn
            @click="loadMoreMovies"
            :loading="loadingMore"
            class="btn-primary"
            variant="flat"
            size="large"
          >
            <v-icon icon="mdi-reload" class="mr-2" />
            Load More Movies
          </v-btn>
        </div>

        <!-- Infinite scroll loading indicator -->
        <div v-if="loadingMore && infiniteScrollEnabled" class="infinite-loading">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="loading-text">Loading more movies...</p>
        </div>

        <!-- End of results indicator -->
        <div v-if="!hasMoreMovies && movies.length > 0" class="end-of-results">
          <v-icon icon="mdi-check-circle" color="success" size="32" />
          <p>You've reached the end of the results</p>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
    const infiniteScrollEnabled = ref(true)
    const scrollThreshold = ref(300)

    const selectedCategory = ref('popular')
    const selectedGenre = ref(null)
    const selectedYear = ref(null)
    const selectedNetwork = ref(null)
    const sortBy = ref('popularity.desc')
    const selectedAudience = ref(null)
    const selectedTheme = ref(null)
    const selectedKeywords = ref([])
    const autoApplyTimer = ref(null)

    const categories = [
      { title: 'Popular', value: 'popular' },
      { title: 'Top Rated', value: 'top_rated' },
      { title: 'Now Playing', value: 'now_playing' },
      { title: 'Upcoming', value: 'upcoming' },
      { title: 'Discover', value: 'discover' },
      { title: 'Underground', value: 'underground' },
      { title: 'Hidden Gems', value: 'hidden_gems' }
    ]

    const sortOptions = [
      { title: 'Most Popular', value: 'popularity.desc' },
      { title: 'Highest Rated', value: 'vote_average.desc' },
      { title: 'Underground', value: 'vote_count.asc' },
      { title: 'Least Popular', value: 'popularity.asc' },
      { title: 'Newest First', value: 'release_date.desc' },
      { title: 'Oldest First', value: 'release_date.asc' },
      { title: 'Title A-Z', value: 'title.asc' },
      { title: 'Title Z-A', value: 'title.desc' }
    ]

    const networks = [
      { title: 'All Networks', value: null },
      { title: 'Netflix', value: 213 },
      { title: 'HBO', value: 49 },
      { title: 'Amazon', value: 1024 },
      { title: 'Disney+', value: 2739 },
      { title: 'Hulu', value: 453 },
      { title: 'Apple TV+', value: 2552 },
      { title: 'BBC', value: 4 }
    ]

    const audienceTypes = [
      { title: 'All Audiences', value: null },
      { title: 'Kids', value: 'kids' },
      { title: 'Family', value: 'family' },
      { title: 'Teens', value: 'teens' },
      { title: 'Adults', value: 'adult' },
      { title: 'Mature', value: 'mature' }
    ]

    const themeTypes = [
      { title: 'All Themes', value: null },
      { title: 'Superpowers', value: 'superpowers' },
      { title: 'Magic', value: 'magic' },
      { title: 'Dystopian', value: 'dystopian' },
      { title: 'Space', value: 'space' },
      { title: 'Monsters', value: 'monsters' },
      { title: 'Survival', value: 'survival' },
      { title: 'Supernatural', value: 'supernatural' }
    ]

    const keywordOptions = [
      { title: 'Indie', value: 'indie' },
      { title: 'Underrated', value: 'underrated' },
      { title: 'Cult', value: 'cult' },
      { title: 'Dark', value: 'dark' },
      { title: 'Gritty', value: 'gritty' },
      { title: 'Quirky', value: 'quirky' }
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

        // Check if any filters are applied
        const hasAdditionalFilters = selectedGenre.value || selectedYear.value ||
            selectedNetwork.value || selectedAudience.value || selectedTheme.value ||
            selectedKeywords.value.length > 0

        console.log('loadMovies called with:', {
          category: selectedCategory.value,
          genre: selectedGenre.value,
          year: selectedYear.value,
          network: selectedNetwork.value,
          hasAdditionalFilters
        })

        // Use discover API if we have filters OR if category is discover
        if (hasAdditionalFilters || selectedCategory.value === 'discover' || selectedNetwork.value) {
          const params = {
            sort_by: sortBy.value,
            page: currentPage.value
          }

          // Apply category-specific filters
          switch (selectedCategory.value) {
            case 'popular':
              if (!sortBy.value || sortBy.value === 'popularity.desc') {
                params.sort_by = 'popularity.desc'
              }
              break
            case 'top_rated':
              params.vote_average_gte = 7
              params.vote_count_gte = 100
              if (!sortBy.value || sortBy.value === 'popularity.desc') {
                params.sort_by = 'vote_average.desc'
              }
              break
            case 'now_playing':
              const now = new Date()
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
              params.primary_release_date_gte = monthAgo.toISOString().split('T')[0]
              params.primary_release_date_lte = new Date().toISOString().split('T')[0]
              break
            case 'upcoming':
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              params.primary_release_date_gte = tomorrow.toISOString().split('T')[0]
              break
            case 'underground':
              params.vote_count_gte = 20
              params.vote_count_lte = 500
              if (!sortBy.value || sortBy.value === 'popularity.desc') {
                params.sort_by = 'vote_average.desc'
              }
              break
            case 'hidden_gems':
              params.vote_count_gte = 50
              params.vote_count_lte = 500
              params.vote_average_gte = 7
              if (!sortBy.value || sortBy.value === 'popularity.desc') {
                params.sort_by = 'vote_average.desc'
              }
              break
            case 'discover':
              // No additional filters for discover
              break
          }

          if (selectedGenre.value) {
            params.with_genres = selectedGenre.value
          }

          if (selectedYear.value) {
            params.year = selectedYear.value
          }

          if (selectedNetwork.value) {
            params.with_networks = selectedNetwork.value
          }

          // Handle audience type filters
          if (selectedAudience.value) {
            switch(selectedAudience.value) {
              case 'kids':
                params.certification_country = 'US'
                params.certification = 'G'
                break
              case 'family':
                params.certification_country = 'US'
                params.certification_lte = 'PG'
                break
              case 'teens':
                params.certification_country = 'US'
                params.certification = 'PG-13'
                break
              case 'adult':
                params.certification_country = 'US'
                params.certification_gte = 'R'
                break
              case 'mature':
                params.certification_country = 'US'
                params.certification = 'NC-17'
                break
            }
          }

          // Handle theme type filters
          let allKeywords = []
          if (selectedTheme.value) {
            const themeKeywords = {
              'superpowers': 849,
              'magic': 616,
              'dystopian': 4458,
              'space': 9951,
              'monsters': 10224,
              'survival': 10292,
              'supernatural': 6152
            }
            if (themeKeywords[selectedTheme.value]) {
              allKeywords.push(themeKeywords[selectedTheme.value])
            }
          }

          // Handle additional keywords
          if (selectedKeywords.value.length > 0) {
            const keywordIds = selectedKeywords.value.map(k => {
              const keywordMap = {
                'indie': 185101,
                'underrated': 196372,
                'cult': 5990,
                'dark': 10183,
                'gritty': 184910,
                'quirky': 194662
              }
              return keywordMap[k]
            }).filter(Boolean)
            allKeywords = allKeywords.concat(keywordIds)
          }

          if (allKeywords.length > 0) {
            params.with_keywords = allKeywords.join(',')
          }

          params.include_adult = false

          console.log('Final discover params:', params)
          response = await tmdbService.discoverMovies(params)
          console.log('Discover response total results:', response.total_results)
          console.log('Discover response results count:', response.results?.length)
          if (selectedNetwork.value && response.results?.length === 0) {
            console.log('=== NO RESULTS FOR NETWORK FILTER ===')
            console.log('Company ID:', selectedNetwork.value)
            console.log('Trying alternative API call...')
            // Try without the network filter to see if API is working
            const testParams = { ...params }
            delete testParams.with_networks
            const testResponse = await tmdbService.discoverMovies(testParams)
            console.log('Without network filter - results:', testResponse.results?.length)
            console.log('==================================')
          }
        } else {
          // No filters, use category-specific endpoints
          switch (selectedCategory.value) {
            case 'popular':
              response = await tmdbService.getPopularMovies(currentPage.value)
              break
            case 'underground':
              const undergroundParams = {
                sort_by: 'vote_average.desc',
                vote_count_gte: 20,
                vote_count_lte: 500,
                page: currentPage.value
              }
              response = await tmdbService.discoverMovies(undergroundParams)
              break
            case 'hidden_gems':
              const hiddenGemsParams = {
                sort_by: 'vote_average.desc',
                vote_count_gte: 50,
                vote_count_lte: 500,
                vote_average_gte: 7,
                page: currentPage.value
              }
              response = await tmdbService.discoverMovies(hiddenGemsParams)
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
        console.log('Movies loaded:', movies.value.length, 'Total pages:', totalPages.value)
      } catch (err) {
        console.error('Error loading movies:', err)
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

        // Check if any filters are applied for pagination
        const hasAdditionalFilters = selectedGenre.value || selectedYear.value ||
            selectedNetwork.value || selectedAudience.value || selectedTheme.value ||
            selectedKeywords.value.length > 0

        if (hasAdditionalFilters || selectedCategory.value === 'discover') {
          const params = {
            sort_by: sortBy.value,
            page: currentPage.value
          }

          // Apply base category filters if not 'discover'
          if (selectedCategory.value !== 'discover' && hasAdditionalFilters) {
            switch (selectedCategory.value) {
              case 'popular':
                params.sort_by = 'popularity.desc'
                break
              case 'top_rated':
                params.vote_average_gte = 7
                params.vote_count_gte = 100
                params.sort_by = 'vote_average.desc'
                break
              case 'now_playing':
                const now = new Date()
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
                params.primary_release_date_gte = monthAgo.toISOString().split('T')[0]
                params.primary_release_date_lte = new Date().toISOString().split('T')[0]
                break
              case 'upcoming':
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                params.primary_release_date_gte = tomorrow.toISOString().split('T')[0]
                break
              case 'underground':
                params.sort_by = 'vote_average.desc'
                params.vote_count_gte = 20
                params.vote_count_lte = 500
                break
              case 'hidden_gems':
                params.sort_by = 'vote_average.desc'
                params.vote_count_gte = 50
                params.vote_count_lte = 500
                params.vote_average_gte = 7
                break
            }
          }

          if (selectedGenre.value) {
            params.with_genres = selectedGenre.value
          }

          if (selectedYear.value) {
            params.year = selectedYear.value
          }

          if (selectedNetwork.value) {
            params.with_networks = selectedNetwork.value
          }

          // Handle audience type filters
          if (selectedAudience.value) {
            switch(selectedAudience.value) {
              case 'kids':
                params.certification_country = 'US'
                params.certification = 'G'
                break
              case 'family':
                params.certification_country = 'US'
                params.certification_lte = 'PG'
                break
              case 'teens':
                params.certification_country = 'US'
                params.certification = 'PG-13'
                break
              case 'adult':
                params.certification_country = 'US'
                params.certification_gte = 'R'
                break
              case 'mature':
                params.include_adult = true
                break
            }
          }

          // Handle theme-based filtering
          if (selectedTheme.value) {
            const themeKeywordMap = {
              'superpowers': 9715,
              'magic': 12554,
              'dystopian': 4565,
              'space': 9882,
              'monsters': 12630,
              'survival': 10683,
              'supernatural': 9840
            }

            if (themeKeywordMap[selectedTheme.value]) {
              params.with_keywords = themeKeywordMap[selectedTheme.value]
            }
          }

          // Handle selected keywords
          if (selectedKeywords.value.length > 0) {
            const keywordMap = {
              'indie': 11412,
              'underrated': 209714,
              'cult': 34012,
              'dark': 10714,
              'gritty': 8399,
              'quirky': 263107
            }

            const keywordIds = selectedKeywords.value
              .map(k => keywordMap[k])
              .filter(id => id)
              .join('|')

            if (keywordIds) {
              params.with_keywords = params.with_keywords
                ? `${params.with_keywords}|${keywordIds}`
                : keywordIds
            }
          }

          params.include_adult = false

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

    // Add watchers for all filter values to trigger loadMovies
    // Watch all filters including network
    watch(selectedCategory, () => loadMovies())
    watch(selectedGenre, () => loadMovies())
    watch(selectedYear, () => loadMovies())
    watch(selectedNetwork, () => loadMovies())
    watch(sortBy, () => loadMovies())
    watch(selectedAudience, () => loadMovies())
    watch(selectedTheme, () => loadMovies())

    // Special handling for keywords with debounce
    watch(selectedKeywords, () => {
      if (autoApplyTimer.value) clearTimeout(autoApplyTimer.value)
      autoApplyTimer.value = setTimeout(() => {
        loadMovies()
      }, 300)
    })

    function toggleKeyword(value) {
      const index = selectedKeywords.value.indexOf(value)
      if (index === -1) {
        selectedKeywords.value.push(value)
      } else {
        selectedKeywords.value.splice(index, 1)
      }
    }

    function loadNetworks() {
      // Networks are static for now
      console.log('Networks loaded')
    }

    function handleScroll() {
      if (!infiniteScrollEnabled.value || loadingMore.value || !hasMoreMovies.value) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      const scrollBottom = scrollTop + windowHeight
      const threshold = documentHeight - scrollThreshold.value

      if (scrollBottom >= threshold) {
        loadMoreMovies()
      }
    }

    function debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    const debouncedHandleScroll = debounce(handleScroll, 100)

    onMounted(() => {
      loadGenres()
      loadNetworks()
      loadMovies()

      if (infiniteScrollEnabled.value) {
        window.addEventListener('scroll', debouncedHandleScroll)
      }
    })

    onUnmounted(() => {
      if (infiniteScrollEnabled.value) {
        window.removeEventListener('scroll', debouncedHandleScroll)
      }
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
      selectedAudience,
      selectedTheme,
      selectedKeywords,
      categories,
      genres,
      years,
      networks,
      sortOptions,
      audienceTypes,
      themeTypes,
      keywordOptions,
      hasMoreMovies,
      infiniteScrollEnabled,
      loadMovies,
      loadMoreMovies,
      toggleKeyword
    }
  }
}
</script>

<style scoped>
.movies-view {
  min-height: 100vh;
  background: var(--background-color);
  padding: 120px 0 60px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
}

.page-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.page-subtitle {
  font-size: 1.375rem;
  color: var(--text-secondary);
  margin-bottom: 0;
  font-weight: 500;
}

.filter-section {
  background: var(--glass-effect);
  backdrop-filter: blur(24px);
  border-radius: var(--border-radius-xl);
  padding: 2.5rem;
  margin-bottom: 3rem;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
}

.filter-section:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.filter-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  font-size: 0.9rem;
  color: var(--accent-color);
  margin-bottom: 8px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.filter-select {
  width: 100%;
}

.filter-control {
  width: 100%;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  min-height: 56px;
  background: rgba(15, 15, 35, 0.6) !important;
  border: 1px solid rgba(102, 126, 234, 0.3);
  transition: all var(--transition-normal);
  backdrop-filter: blur(12px);
}

.filter-control:hover {
  border-color: #667eea;
  background: rgba(15, 15, 35, 0.8) !important;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.filter-control:focus-within {
  border-color: #667eea;
  background: rgba(15, 15, 35, 0.9) !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.filter-control :deep(.v-field) {
  border-radius: var(--border-radius-sm);
  min-height: 52px;
  background: transparent !important;
  border: none !important;
}

.filter-control :deep(.v-field--variant-plain) {
  opacity: 1 !important;
}

.filter-control :deep(.v-field__field) {
  border-radius: var(--border-radius-sm);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  color: #FFFFFF !important;
}

.filter-control :deep(.v-field__input) {
  border-radius: 8px;
  padding: 8px 0;
  min-height: 32px;
  display: flex;
  align-items: center;
  color: #FFFFFF !important;
}

.filter-control :deep(.v-select__selection-text) {
  color: #FFFFFF !important;
}

.filter-control :deep(.v-field__prepend-inner) {
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.filter-control :deep(.v-field__append-inner) {
  padding-right: 12px;
  display: flex;
  align-items: center;
}

.filter-control :deep(.v-icon) {
  display: flex;
  align-items: center;
  color: #667eea !important;
}

.filter-control :deep(.v-field__overlay) {
  background: transparent !important;
}

.filter-control :deep(.v-field--focused) {
  color: #667eea !important;
}

.keyword-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.custom-chip {
  background-color: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.3s ease;
}

.custom-chip:hover {
  border-color: #667eea !important;
  color: #667eea !important;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.active-chip {
  background: #667eea !important;
  border-color: #667eea !important;
  color: #ffffff !important;
  font-weight: 600;
}

.movies-section {
  margin-bottom: 3rem;
}

.movie-card {
  transition: all var(--transition-normal);
}

.movie-card:hover {
  transform: translateY(-8px) scale(1.03);
  z-index: 10;
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  padding: 2rem 0;
}

.infinite-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  margin-top: 2rem;
}

.infinite-loading .loading-text {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.end-of-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  margin-top: 2rem;
  text-align: center;
}

.end-of-results p {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 3rem 1rem;
}

.loading-text {
  margin-top: 1.5rem;
  font-size: 1.25rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.error-container h2 {
  margin: 1.5rem 0 1rem 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.error-container p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
  max-width: 500px;
}

@media (max-width: 1200px) {
  .filter-row {
    gap: 1rem;
  }

  .filter-group {
    min-width: 180px;
  }
}

@media (max-width: 960px) {
  .movies-view {
    padding: 100px 0 40px 0;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .filter-section {
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .filter-row {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .filter-group {
    min-width: 100%;
  }

  .keyword-chips {
    gap: 8px;
  }
}

@media (max-width: 600px) {
  .movies-view {
    padding: 80px 0 30px 0;
  }

  .page-title {
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-subtitle {
    font-size: 1.125rem;
  }

  .filter-section {
    padding: 1.5rem;
  }

  .filter-control {
    min-height: 48px;
  }

  .filter-control :deep(.v-field__field) {
    padding: 8px 12px;
  }

  .custom-chip {
    font-size: 0.8rem;
  }

  .load-more-section {
    margin-top: 2rem;
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .filter-section {
    padding: 1rem;
  }

  .keyword-chips {
    gap: 6px;
  }

  .custom-chip {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}
</style>
