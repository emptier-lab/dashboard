<template>
  <div class="search-view">
    <v-container>
      <!-- Search Header -->
      <div class="search-header">
        <h1 class="page-title">Search</h1>
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
          class="search-input"
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

        <v-row>
          <v-col
            v-for="item in searchResults"
            :key="item.id"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
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
              >
                <template #placeholder>
                  <div class="person-placeholder">
                    <v-icon icon="mdi-account" size="48" />
                  </div>
                </template>
              </v-img>

              <v-card-text>
                <h4 class="person-name">{{ item.name }}</h4>
                <p class="person-known-for">{{ item.known_for_department }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Load More Button -->
        <div v-if="hasMoreResults" class="load-more-section">
          <v-btn
            @click="loadMoreResults"
            :loading="loadingMore"
            color="primary"
            variant="outlined"
            size="large"
          >
            Load More Results
          </v-btn>
        </div>
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
            lg="2"
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
import { tmdbService, imageService } from '@/services/tmdb'

export default {
  name: 'SearchView',
  components: {
    MediaCard
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
      }
    }

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

    function getProfileUrl(path) {
      return imageService.getProfileUrl(path, 'w185')
    }

    // Watch for search type changes
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
      performSearch,
      loadMoreResults,
      clearSearch,
      goToPerson,
      getProfileUrl
    }
  }
}
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1D29 0%, #2D1B42 100%);
  padding: 80px 0 40px 0;
}

.search-header {
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

.search-input-section {
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.search-input {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  justify-content: center;
}

.search-results {
  margin-bottom: 40px;
}

.results-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 24px;
}

.results-count {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.person-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.person-card:hover {
  transform: translateY(-4px);
}

.person-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.person-name {
  font-size: 1rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.person-known-for {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.load-more-section {
  text-align: center;
  margin-top: 40px;
}

.no-results {
  text-align: center;
  padding: 80px 0;
  color: rgba(255, 255, 255, 0.7);
}

.no-results h2 {
  margin: 16px 0 8px 0;
  color: #FFFFFF;
}

.popular-content {
  margin-top: 40px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #00D4AA;
  margin-bottom: 24px;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: white;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.1rem;
}

@media (max-width: 960px) {
  .page-title {
    font-size: 2.5rem;
  }

  .search-filters {
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 2rem;
  }

  .results-title {
    font-size: 1.5rem;
  }
}
</style>
