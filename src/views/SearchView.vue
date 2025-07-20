<template>
  <div class="search-view">
    <v-container>
      <!-- Search Header -->
      <div class="search-header">
        <h1 class="page-title">
          <v-icon icon="mdi-magnify" class="mr-3" />
          Search
        </h1>
        <p class="page-subtitle">Find your favorite movies and TV shows</p>
      </div>

      <!-- Search Input -->
      <div class="search-input-section">
        <v-text-field
          v-model="searchQuery"
          label="Search movies, TV shows, and people..."
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          clearable
          @keyup.enter="performSearch"
          @click:clear="clearSearch"
          @input="onSearchInput"
          class="search-input"
          autofocus
        />

        <div class="search-filters">
          <v-btn-toggle
            v-model="searchType"
            color="primary"
            variant="outlined"
            mandatory
          >
            <v-btn value="multi">All</v-btn>
            <v-btn value="movie">Movies</v-btn>
            <v-btn value="tv">TV Shows</v-btn>
            <v-btn value="person">People</v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h2 class="results-title">
          Search Results for "{{ lastSearchQuery }}"
          <span class="results-count">({{ totalResults }} results)</span>
        </h2>

        <LazyGrid
          :items="searchResults"
          :loading="loadingMore"
          :item-height="cardHeight"
          :overscan="5"
          grid-class="media-grid media-grid--large"
          @load-more="loadMoreResults"
        >
          <template #item="{ item }">
            <MediaCard
              v-if="item.media_type !== 'person'"
              :item="item"
              :media-type="item.media_type || searchType"
            />

            <!-- Person Card -->
            <v-card
              v-else
              class="person-card"
              @click="goToPerson(item.id)"
              hover
            >
              <v-img
                :src="getProfileUrl(item.profile_path)"
                :alt="item.name"
                aspect-ratio="2/3"
                cover
                class="person-image"
              >
                <template #placeholder>
                  <div class="person-placeholder">
                    <v-icon icon="mdi-account" size="48" />
                  </div>
                </template>
                <template #error>
                  <div class="person-placeholder">
                    <v-icon icon="mdi-account" size="48" />
                    <p>No Image</p>
                  </div>
                </template>
              </v-img>

              <v-card-text>
                <h4 class="person-name">{{ item.name }}</h4>
                <p class="person-known-for">{{ item.known_for_department }}</p>
                <div v-if="item.known_for && item.known_for.length > 0" class="known-for-works">
                  <p class="known-for-title">Known for:</p>
                  <p class="known-for-list">
                    {{ item.known_for.slice(0, 2).map(work => work.title || work.name).join(', ') }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </template>

          <template #loading>
            <v-progress-circular indeterminate color="primary" size="48" />
            <p class="loading-text">Loading more results...</p>
          </template>

          <template #empty>
            <v-icon icon="mdi-magnify-close" size="64" color="grey" />
            <p>No search results found</p>
          </template>

          <template #footer>
            <!-- End of results indicator -->
            <div v-if="!hasMoreResults && searchResults.length > 0" class="end-of-results">
              <v-icon icon="mdi-check-circle" color="success" size="32" />
              <p>You've reached the end of the results</p>
            </div>
          </template>
        </LazyGrid>
      </div>

      <!-- No Results -->
      <div v-else-if="searched && !loading" class="no-results">
        <v-icon icon="mdi-magnify-close" size="64" color="grey" />
        <h2>No results found</h2>
        <p>Try searching with different keywords or check your spelling</p>
      </div>

      <!-- Popular Content (when no search) -->
      <div v-else-if="!searched" class="popular-content">
        <h2 class="section-title">Popular This Week</h2>
        <v-row>
          <v-col
            v-for="item in popularContent"
            :key="item.id"
            cols="6"
            sm="4"
            md="3"
            lg="3"
            xl="2"
          >
            <MediaCard
              :item="item"
              :media-type="item.media_type || 'movie'"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="loading-text">Searching...</p>
      </div>
    </v-container>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaCard from '@/components/common/MediaCard.vue'
import LazyGrid from '@/components/common/LazyGrid.vue'
import { tmdbService, imageService } from '@/services/tmdb'

export default {
  name: 'SearchView',
  components: {
    MediaCard,
    LazyGrid
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const searchQuery = ref('')
    const searchType = ref('multi')
    const searchResults = ref([])
    const popularContent = ref([])
    const loading = ref(false)
    const loadingMore = ref(false)
    const searched = ref(false)
    const lastSearchQuery = ref('')
    const currentPage = ref(1)
    const totalPages = ref(0)
    const totalResults = ref(0)
    const infiniteScrollEnabled = ref(true)
    const scrollThreshold = ref(800)
    const cardHeight = ref(450) // Average height of a search result card in pixels

    const hasMoreResults = computed(() => {
      return currentPage.value < totalPages.value
    })

    async function performSearch() {
      if (!searchQuery.value.trim()) return

      loading.value = true
      searched.value = true
      lastSearchQuery.value = searchQuery.value
      currentPage.value = 1

      try {
        let response
        switch (searchType.value) {
          case 'movie':
            response = await tmdbService.searchMovies(searchQuery.value)
            break
          case 'tv':
            response = await tmdbService.searchTV(searchQuery.value)
            break
          case 'person':
            response = await tmdbService.searchPeople(searchQuery.value)
            break
          default:
            response = await tmdbService.searchMulti(searchQuery.value)
        }

        searchResults.value = response.results || []
        totalPages.value = response.total_pages || 0
        totalResults.value = response.total_results || 0

        // Update URL
        router.push({
          query: {
            q: searchQuery.value,
            type: searchType.value
          }
        })
      } catch (error) {
        console.error('Search failed:', error)
        searchResults.value = []
      } finally {
        loading.value = false
      }
    }

    async function loadMoreResults() {
      if (!hasMoreResults.value || loadingMore.value) return

      console.log('Loading more search results, page:', currentPage.value + 1)
      loadingMore.value = true
      currentPage.value += 1

      try {
        let response
        switch (searchType.value) {
          case 'movie':
            response = await tmdbService.searchMovies(lastSearchQuery.value, currentPage.value)
            break
          case 'tv':
            response = await tmdbService.searchTV(lastSearchQuery.value, currentPage.value)
            break
          case 'person':
            response = await tmdbService.searchPeople(lastSearchQuery.value, currentPage.value)
            break
          default:
            response = await tmdbService.searchMulti(lastSearchQuery.value, currentPage.value)
        }

        searchResults.value.push(...(response.results || []))
      } catch (error) {
        console.error('Failed to load more results:', error)
      } finally {
        loadingMore.value = false
        console.log('Finished loading more search results, now showing:', searchResults.value.length)

        // Check if we need to load more content if the page isn't filled
        setTimeout(() => {
          if (document.documentElement.scrollHeight <= window.innerHeight && hasMoreResults.value) {
            console.log('Page not filled, loading additional search results')
            loadMoreResults()
          }
        }, 300)
      }
    }

    // LazyGrid handles scrolling automatically, so we don't need these scroll handlers

    function clearSearch() {
      searchQuery.value = ''
      searchResults.value = []
      searched.value = false
      lastSearchQuery.value = ''
      router.push({ query: {} })
    }

    async function loadPopularContent() {
      try {
        const response = await tmdbService.getTrending('all', 'week')
        popularContent.value = response.results?.slice(0, 12) || []
      } catch (error) {
        console.error('Failed to load popular content:', error)
      }
    }

    function goToPerson(personId) {
      router.push(`/person/${personId}`)
    }

    function onSearchInput() {
      if (searchQuery.value && searchQuery.value.trim().length > 2) {
        performSearch()
      } else if (!searchQuery.value.trim()) {
        clearSearch()
      }
    }

    function getProfileUrl(path) {
      if (!path) {
        return 'https://via.placeholder.com/185x278/2a2a2a/ffffff?text=No+Image'
      }
      return imageService.getProfileUrl(path, 'w342')
    }

    // Watch for search type changes
    watch(searchType, () => {
      if (searched.value && searchQuery.value.trim()) {
        performSearch()
      }
    })

    // Watch for immediate search type changes
    watch(searchType, () => {
      if (searched.value && searchQuery.value.trim()) {
        performSearch()
      }
    })

    // Initialize from URL query params
    onMounted(() => {
      if (route.query.q) {
        searchQuery.value = route.query.q
        searchType.value = route.query.type || 'multi'
        performSearch()
      } else {
        loadPopularContent()
      }

      // Enable infinite scrolling
      infiniteScrollEnabled.value = true
    })

    return {
    searchQuery,
    searchType,
    searchResults,
    popularContent,
    loading,
    loadingMore,
    searched,
    lastSearchQuery,
    totalResults,
    hasMoreResults,
    infiniteScrollEnabled,
    cardHeight,
    performSearch,
    loadMoreResults,
    clearSearch,
    goToPerson,
    getProfileUrl,
    onSearchInput
  }
  }
}
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background: var(--background-color);
  padding: 100px 0 40px 0;
}

.search-header {
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
  color: var(--text-secondary);
  margin-bottom: 0;
  font-weight: 400;
}

.search-input-section {
  max-width: 800px;
  margin: 0 auto 60px auto;
}

.search-input {
  margin-bottom: 24px;
}

.search-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.search-input :deep(.v-field):hover {
  border-color: var(--primary-color);
  background: rgba(255, 255, 255, 0.08) !important;
}

.search-input :deep(.v-field--focused) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.search-input :deep(.v-field__input) {
  color: var(--text-primary) !important;
}

.search-input :deep(.v-icon) {
  color: var(--primary-color) !important;
}

.search-filters {
  display: flex;
  justify-content: center;
}

.search-results {
  margin-bottom: 40px;
}

.search-results .v-col {
  padding: 8px !important;
}

.search-results .media-card {
  min-width: 200px;
  height: 100%;
}

.results-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 32px;
}

.results-count {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.person-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  min-width: 200px;
  height: 100%;
}

.person-card:hover {
  transform: translateY(-4px);
}

.person-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.person-placeholder p {
  margin-top: 8px;
  font-size: 0.8rem;
}

.person-image {
  border-radius: 8px 8px 0 0;
}

.person-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.person-known-for {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.known-for-works {
  margin-top: 8px;
}

.known-for-title {
  font-size: 0.75rem;
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 4px;
}

.known-for-list {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0;
  line-height: 1.3;
}

.load-more-section {
  text-align: center;
  margin-top: 40px;
}

.no-results {
  text-align: center;
  padding: 80px 40px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  margin: 40px 20px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.no-results h2 {
  margin: 16px 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 1.5rem;
}

.popular-content {
  margin-top: 40px;
}

.popular-content .v-col {
  padding: 8px !important;
}

.popular-content .media-card {
  min-width: 200px;
  height: 100%;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 24px;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: var(--text-primary);
}

.loading-text {
  margin-top: 16px;
  font-size: 1.1rem;
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

@media (max-width: 960px) {
  .page-title {
    font-size: 2.8rem;
  }

  .search-filters {
    overflow-x: auto;
  }

  .no-results {
    margin: 20px 10px;
    padding: 40px 20px;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 2.2rem;
  }

  .results-title {
    font-size: 1.5rem;
  }

  .no-results h2 {
    font-size: 1.2rem;
  }
}
</style>
