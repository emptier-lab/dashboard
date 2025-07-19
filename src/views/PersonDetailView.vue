<template>
  <div class="person-detail-view">
    <v-container v-if="person" fluid class="pa-0">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-backdrop">
          <div class="hero-overlay"></div>
        </div>

        <v-container class="hero-content">
          <v-row>
            <v-col cols="12" md="4" lg="3">
              <div class="profile-card">
                <v-img
                  :src="getProfileUrl(person.profile_path)"
                  :alt="person.name"
                  aspect-ratio="2/3"
                  cover
                  class="profile-image"
                >
                  <template #placeholder>
                    <div class="profile-placeholder">
                      <v-icon icon="mdi-account" size="64" />
                    </div>
                  </template>
                  <template #error>
                    <div class="profile-placeholder">
                      <v-icon icon="mdi-account-off" size="64" />
                    </div>
                  </template>
                </v-img>
              </div>
            </v-col>

            <v-col cols="12" md="8" lg="9">
              <div class="person-info">
                <h1 class="person-name">{{ person.name }}</h1>

                <div class="person-meta">
                  <v-chip
                    v-if="person.popularity"
                    :color="getPopularityColor(person.popularity)"
                    size="small"
                    class="mr-2"
                  >
                    <v-icon icon="mdi-fire" size="small" class="mr-1" />
                    {{ formatPopularity(person.popularity) }}
                  </v-chip>

                  <span v-if="person.known_for_department" class="meta-item">
                    {{ person.known_for_department }}
                  </span>

                  <span v-if="person.birthday" class="meta-item">
                    Born: {{ formatDate(person.birthday) }}
                  </span>

                  <span v-if="person.place_of_birth" class="meta-item">
                    {{ person.place_of_birth }}
                  </span>
                </div>

                <p v-if="person.biography" class="person-biography">
                  {{ person.biography }}
                </p>
                <p v-else class="person-biography">
                  No biography available for {{ person.name }}.
                </p>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Details Section -->
      <div class="details-section">
        <v-container>
          <v-row>
            <v-col cols="12" lg="8">
              <!-- Movie Credits -->
              <div v-if="movieCredits.length" class="section-card">
                <h2 class="section-title">Movie Credits</h2>
                <div class="media-grid media-grid--large">
                  <MediaCard
                    v-for="movie in movieCredits"
                    :key="movie.id"
                    :item="movie"
                    media-type="movie"
                    class="credit-card"
                  />
                </div>
              </div>

              <!-- TV Credits -->
              <div v-if="tvCredits.length" class="section-card">
                <h2 class="section-title">TV Credits</h2>
                <div class="media-grid media-grid--large">
                  <MediaCard
                    v-for="show in tvCredits"
                    :key="show.id"
                    :item="show"
                    media-type="tv"
                    class="credit-card"
                  />
                </div>
              </div>
            </v-col>

            <v-col cols="12" lg="4">
              <!-- Personal Info -->
              <div class="section-card">
                <h2 class="section-title">Personal Info</h2>

                <div v-if="person.known_for_department" class="info-item">
                  <strong>Known For:</strong>
                  <span>{{ person.known_for_department }}</span>
                </div>

                <div v-if="person.birthday" class="info-item">
                  <strong>Birthday:</strong>
                  <span>{{ formatDate(person.birthday) }}</span>
                </div>

                <div v-if="person.deathday" class="info-item">
                  <strong>Death:</strong>
                  <span>{{ formatDate(person.deathday) }}</span>
                </div>

                <div v-if="person.place_of_birth" class="info-item">
                  <strong>Place of Birth:</strong>
                  <span>{{ person.place_of_birth }}</span>
                </div>

                <div v-if="person.also_known_as?.length" class="info-item">
                  <strong>Also Known As:</strong>
                  <div class="aliases">
                    <div v-for="alias in person.also_known_as.slice(0, 5)" :key="alias" class="alias">
                      {{ alias }}
                    </div>
                  </div>
                </div>

                <div v-if="person.homepage" class="info-item">
                  <strong>Homepage:</strong>
                  <a :href="person.homepage" target="_blank" class="homepage-link">
                    Visit Website
                    <v-icon icon="mdi-open-in-new" size="small" class="ml-1" />
                  </a>
                </div>
              </div>

              <!-- External Links -->
              <div v-if="externalIds" class="section-card">
                <h2 class="section-title">External Links</h2>
                <div class="external-links">
                  <v-btn
                    v-if="externalIds.imdb_id"
                    :href="`https://www.imdb.com/name/${externalIds.imdb_id}`"
                    target="_blank"
                    variant="outlined"
                    class="external-link-btn mr-2 mb-2"
                  >
                    <v-icon icon="mdi-movie" class="mr-2" />
                    IMDb
                  </v-btn>

                  <v-btn
                    v-if="externalIds.twitter_id"
                    :href="`https://twitter.com/${externalIds.twitter_id}`"
                    target="_blank"
                    variant="outlined"
                    class="external-link-btn mr-2 mb-2"
                  >
                    <v-icon icon="mdi-twitter" class="mr-2" />
                    Twitter
                  </v-btn>

                  <v-btn
                    v-if="externalIds.instagram_id"
                    :href="`https://instagram.com/${externalIds.instagram_id}`"
                    target="_blank"
                    variant="outlined"
                    class="external-link-btn mr-2 mb-2"
                  >
                    <v-icon icon="mdi-instagram" class="mr-2" />
                    Instagram
                  </v-btn>

                  <v-btn
                    v-if="externalIds.facebook_id"
                    :href="`https://facebook.com/${externalIds.facebook_id}`"
                    target="_blank"
                    variant="outlined"
                    class="external-link-btn mr-2 mb-2"
                  >
                    <v-icon icon="mdi-facebook" class="mr-2" />
                    Facebook
                  </v-btn>
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
      <p class="loading-text">Loading person details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-icon icon="mdi-alert-circle" size="64" color="error" />
      <h2>Failed to load person</h2>
      <p>{{ error }}</p>
      <v-btn @click="loadPerson" color="primary" variant="outlined">
        Try Again
      </v-btn>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MediaCard from '@/components/common/MediaCard.vue'
import { tmdbService, imageService, utilsService } from '@/services/tmdb'

export default {
  name: 'PersonDetailView',
  components: {
    MediaCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const person = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const externalIds = ref(null)

    const movieCredits = computed(() => {
      if (!person.value?.movie_credits) return []
      return person.value.movie_credits.cast
        .filter(movie => movie.poster_path && movie.popularity > 1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20)
    })

    const tvCredits = computed(() => {
      if (!person.value?.tv_credits) return []
      return person.value.tv_credits.cast
        .filter(show => show.poster_path && show.popularity > 1)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20)
    })

    async function loadPerson() {
      try {
        loading.value = true
        error.value = null

        const personId = route.params.id
        if (!personId) {
          throw new Error('No person ID provided')
        }

        // Load person details with credits
        const response = await tmdbService.getPersonDetails(personId)
        person.value = response

        // Load external IDs
        try {
          const externalResponse = await tmdbService.getPersonExternalIds(personId)
          externalIds.value = externalResponse
        } catch (err) {
          console.warn('Failed to load external IDs:', err)
        }

      } catch (err) {
        console.error('Failed to load person:', err)
        error.value = err.message || 'Failed to load person details'
      } finally {
        loading.value = false
      }
    }

    function getProfileUrl(path) {
      return imageService.getProfileUrl(path, 'w500')
    }

    function formatDate(dateString) {
      return utilsService.formatDate(dateString)
    }

    function formatPopularity(popularity) {
      if (popularity > 50) return 'Very Popular'
      if (popularity > 20) return 'Popular'
      if (popularity > 10) return 'Known'
      return 'Emerging'
    }

    function getPopularityColor(popularity) {
      if (popularity > 50) return 'error'
      if (popularity > 20) return 'warning'
      if (popularity > 10) return 'info'
      return 'success'
    }

    watch(() => route.params.id, () => {
      if (route.params.id) {
        loadPerson()
      }
    })

    onMounted(() => {
      loadPerson()
    })

    return {
      person,
      loading,
      error,
      externalIds,
      movieCredits,
      tvCredits,
      loadPerson,
      getProfileUrl,
      formatDate,
      formatPopularity,
      getPopularityColor
    }
  }
}
</script>

<style scoped>
.person-detail-view {
  min-height: 100vh;
  background: var(--background-color);
}

.hero-section {
  position: relative;
  min-height: 60vh;
  overflow: hidden;
  background: rgba(15, 15, 35, 0.95);
}

.hero-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 35, 0.8);
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding: 140px 0 80px;
}

.profile-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: transform var(--transition-normal);
  background: var(--glass-effect);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.profile-card:hover {
  transform: scale(1.03) translateY(-8px);
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5);
}

.profile-image {
  border-radius: var(--border-radius-lg);
}

.profile-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(102, 126, 234, 0.15);
  color: var(--text-muted);
}

.person-info {
  padding: 32px 0;
}

.person-name {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 16px;
  color: var(--text-primary);
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.person-meta {
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

.person-biography {
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 40px;
  color: var(--text-secondary);
  max-width: 900px;
  text-align: justify;
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

.credit-card {
  transition: all var(--transition-normal);
}

.credit-card:hover {
  transform: translateY(-8px) scale(1.03);
  z-index: 10;
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

.info-item span {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.aliases {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alias {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.homepage-link {
  color: var(--primary-color) !important;
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.homepage-link:hover {
  color: var(--accent-color) !important;
  text-decoration: underline;
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.external-link-btn {
  transition: all var(--transition-normal);
}

.external-link-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

  .person-info {
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

  .person-meta {
    gap: 12px;
  }

  .meta-item {
    font-size: 1rem;
    padding: 6px 12px;
  }

  .person-biography {
    font-size: 1rem;
    margin-bottom: 32px;
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

  .section-card {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .section-title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }

  .person-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .meta-item {
    width: 100%;
    text-align: center;
  }

  .person-biography {
    text-align: left;
    margin-bottom: 24px;
  }

  .info-item {
    padding: 10px;
    margin-bottom: 12px;
  }

  .info-item strong {
    font-size: 0.9rem;
  }

  .info-item span {
    font-size: 0.9rem;
  }

  .external-links {
    flex-direction: column;
  }

  .external-link-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .section-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .person-name {
    text-align: center;
  }

  .profile-card {
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>
