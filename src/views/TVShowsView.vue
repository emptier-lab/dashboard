<template>
  <div class="tv-shows-view">
    <v-container>
      <div class="page-header">
        <h1 class="page-title">
          <v-icon icon="mdi-television" class="mr-3" />
          TV Shows
        </h1>
        <p class="page-subtitle">Discover amazing TV series</p>
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

      <div v-if="tvShows.length > 0" class="tv-section">
        <LazyGrid
          :items="tvShows"
          :loading="loadingMore"
          :has-more-content="hasMoreTVShows"
          grid-class="media-grid media-grid--large"
          @load-more="loadMoreShows"
        >
          <template #item="{ item }">
            <MediaCard
              :item="item"
              media-type="tv"
              class="tv-card"
            />
          </template>

          <template #loading>
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="loading-text">Loading more TV shows...</p>
          </template>

          <template #empty>
            <v-icon icon="mdi-television-off" size="64" color="grey" />
            <p>No TV shows found</p>
          </template>

          <template #footer>
            <!-- End of results indicator -->
            <div v-if="!hasMoreTVShows && tvShows.length > 0" class="end-of-results">
              <v-icon icon="mdi-check-circle" color="success" size="32" />
              <p>You've reached the end of the results</p>
            </div>
          </template>
        </LazyGrid>
      </div>

      <div v-else-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="loading-text">Loading TV shows...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-container">
        <v-icon icon="mdi-alert-circle" size="64" color="error" />
        <h2>Failed to load TV shows</h2>
        <p>{{ error }}</p>
        <v-btn @click="loadTVShows" color="primary" variant="outlined">
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
import LazyGrid from '@/components/common/LazyGrid.vue'
import { tmdbService } from '@/services/tmdb'

export default {
  name: 'TVShowsView',
  components: {
    MediaCard,
    LazyGrid
  },
  setup() {
    const tvShows = ref([])
    const tvGenres = ref([])
    const loading = ref(true)
    const loadingMore = ref(false)
    const error = ref(null)
    const currentPage = ref(1)
    const totalPages = ref(0)
    const infiniteScrollEnabled = ref(true)
    const scrollThreshold = ref(800) // Increased threshold to detect scroll earlier
    const lastLoadTime = ref(0)
    const minLoadInterval = 1000 // Minimum 1 second between loads
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
      { title: 'On The Air', value: 'on_the_air' },
      { title: 'Airing Today', value: 'airing_today' },
      { title: 'Discover', value: 'discover' },
      { title: 'Underground', value: 'underground' },
      { title: 'Hidden Gems', value: 'hidden_gems' }
    ]

    const sortOptions = [
      { title: 'Most Popular', value: 'popularity.desc' },
      { title: 'Highest Rated', value: 'vote_average.desc' },
      { title: 'Newest First', value: 'first_air_date.desc' },
      { title: 'Oldest First', value: 'first_air_date.asc' },
      { title: 'Title A-Z', value: 'name.asc' },
      { title: 'Title Z-A', value: 'name.desc' }
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
      ...tvGenres.value.map(genre => ({
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

    const hasMoreTVShows = computed(() => {
      return currentPage.value < totalPages.value
    })

    async function loadTVShows() {
      loading.value = true
      error.value = null
      currentPage.value = 1

      try {
        let response

        if (selectedCategory.value === 'discover' || selectedGenre.value || selectedYear.value ||
            selectedNetwork.value || selectedAudience.value || selectedTheme.value || selectedKeywords.value.length > 0) {
          const params = {
            sort_by: sortBy.value,
            page: currentPage.value
          }

          if (selectedGenre.value) {
            params.with_genres = selectedGenre.value
          }

          if (selectedYear.value) {
            params.first_air_date_year = selectedYear.value
          }

          if (selectedNetwork.value) {
            params.with_networks = selectedNetwork.value
          }

          // For underground content, adjust the vote count range
          if (sortBy.value === 'vote_count.asc' || selectedCategory.value === 'underground') {
            params.vote_count_gte = 20 // Minimum votes to ensure some quality
            params.vote_count_lte = 500 // Maximum votes to ensure it's not mainstream
          }

          // Handle audience type filters
          if (selectedAudience.value) {
            switch(selectedAudience.value) {
              case 'kids':
                params.with_keywords = 9840 // Children's content
                break
              case 'family':
                params.with_keywords = 10751 // Family content
                break
              case 'teens':
                params.with_keywords = 9714 // Teen drama
                break
              case 'adult':
                params.with_keywords = 12623 // Adult content
                break
              case 'mature':
                params.include_adult = true
                break
            }
          }

          // Handle theme-based filtering
          if (selectedTheme.value) {
            // Map themes to keyword IDs from TMDB
            const themeKeywordMap = {
              'superpowers': 9715, // superhero keyword ID
              'magic': 12554,
              'dystopian': 4565,
              'space': 9882,
              'monsters': 12630,
              'survival': 10683,
              'supernatural': 9840
            }

            if (themeKeywordMap[selectedTheme.value]) {
              params.with_keywords = params.with_keywords
                ? `${params.with_keywords}|${themeKeywordMap[selectedTheme.value]}`
                : themeKeywordMap[selectedTheme.value]
            }
          }

          // Handle selected keywords
          if (selectedKeywords.value.length > 0) {
            // Convert our custom keywords to TMDB keyword IDs
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

          // Apply NSFW filter - always disabled
          params.include_adult = false

          response = await tmdbService.discoverTV(params)
        } else {
          switch (selectedCategory.value) {
            case 'popular':
              response = await tmdbService.getPopularTV(currentPage.value)
              break
            case 'top_rated':
              response = await tmdbService.getTopRatedTV(currentPage.value)
              break
            case 'on_the_air':
              response = await tmdbService.getOnTheAirTV(currentPage.value)
              break
            case 'airing_today':
              response = await tmdbService.getAiringTodayTV(currentPage.value)
              break
            case 'underground':
              // For underground, use discover with special parameters
              const undergroundParams = {
                sort_by: 'vote_average.desc',
                vote_count_gte: 20,
                vote_count_lte: 300,
                page: currentPage.value
              }
              response = await tmdbService.discoverTV(undergroundParams)
              break
            case 'hidden_gems':
              // For hidden gems, use discover with different parameters
              const hiddenGemsParams = {
                sort_by: 'vote_average.desc',
                vote_count_gte: 50,
                vote_count_lte: 500,
                vote_average_gte: 7,
                page: currentPage.value
              }
              response = await tmdbService.discoverTV(hiddenGemsParams)
              break
            default:
              response = await tmdbService.getPopularTV(currentPage.value)
          }
        }

        tvShows.value = response.results || []
        totalPages.value = response.total_pages || 0
      } catch (err) {
        error.value = err.message || 'Failed to load TV shows'
        console.error('Failed to load TV shows:', err)
      } finally {
        loading.value = false
      }
    }

    async function loadMoreShows() {
      if (!hasMoreTVShows.value || loadingMore.value) return

      // Prevent rapid successive calls
      const now = Date.now()
      if (now - lastLoadTime.value < minLoadInterval) {
        console.log('Load more throttled - too soon since last load')
        return
      }
      lastLoadTime.value = now

      console.log('Loading more TV shows, page:', currentPage.value + 1)
      loadingMore.value = true
      currentPage.value += 1

      try {
        let response

        if (selectedCategory.value === 'discover' || selectedGenre.value || selectedYear.value ||
            selectedNetwork.value || selectedAudience.value || selectedTheme.value || selectedKeywords.value.length > 0) {
          const params = {
            sort_by: sortBy.value,
            page: currentPage.value
          }

          if (selectedGenre.value) {
            params.with_genres = selectedGenre.value
          }

          if (selectedYear.value) {
            params.first_air_date_year = selectedYear.value
          }

          if (selectedNetwork.value) {
            params.with_networks = selectedNetwork.value
          }

          response = await tmdbService.discoverTV(params)
        } else {
          switch (selectedCategory.value) {
            case 'popular':
              response = await tmdbService.getPopularTV(currentPage.value)
              break
            case 'top_rated':
              response = await tmdbService.getTopRatedTV(currentPage.value)
              break
            case 'on_the_air':
              response = await tmdbService.getOnTheAirTV(currentPage.value)
              break
            case 'airing_today':
              response = await tmdbService.getAiringTodayTV(currentPage.value)
              break
            default:
              response = await tmdbService.getPopularTV(currentPage.value)
          }
        }

        tvShows.value.push(...(response.results || []))
      } catch (err) {
        console.error('Failed to load more TV shows:', err)
      } finally {
        loadingMore.value = false
        console.log('Finished loading more TV shows, now showing:', tvShows.value.length)

        // Let LazyGrid's Intersection Observer handle load more detection
      }
    }

    async function loadGenres() {
      try {
        const response = await tmdbService.getTVGenres()
        tvGenres.value = response.genres || []
      } catch (err) {
        console.error('Failed to load genres:', err)
      }
    }

    // Add watchers for all filter values to trigger loadTVShows
    const filtersToWatch = [
      selectedCategory,
      selectedGenre,
      selectedYear,
      selectedNetwork,
      sortBy,
      selectedAudience,
      selectedTheme
    ]

    // Watch all filter values except keywords
    filtersToWatch.forEach(filter => {
      watch(filter, () => {
        console.log('Filter changed, reloading TV shows')
        loadTVShows()
      })
    })

    // Special handling for keywords with debounce
    watch(selectedKeywords, () => {
      if (autoApplyTimer.value) clearTimeout(autoApplyTimer.value)
      autoApplyTimer.value = setTimeout(() => {
        loadTVShows()
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

    // LazyGrid handles scrolling automatically, so we don't need these scroll handlers
    onMounted(() => {
      loadGenres()
      loadTVShows()
    })

    return {
      tvShows,
      tvGenres,
      loading,
      loadingMore,
      error,
      selectedCategory,
      selectedGenre,
      selectedYear,
      selectedNetwork,
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
      hasMoreTVShows,
      infiniteScrollEnabled,
      loadTVShows,
      loadMoreShows,
      toggleKeyword
    }
  }
}
</script>

<style scoped>
.tv-shows-view {
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
  border-radius: var(--border-radius-sm);
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
  transition: all var(--transition-normal);
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

.tv-section {
  margin-bottom: 3rem;
}

.tv-card {
  transition: all var(--transition-normal);
}

.tv-card:hover {
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
  color: var(--text-primary);
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
  .tv-shows-view {
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
  .tv-shows-view {
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
