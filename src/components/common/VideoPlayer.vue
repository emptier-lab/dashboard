<template>
  <div class="video-player">
    <div v-if="!showPlayer" class="player-placeholder" @click="initializePlayer">
      <div class="play-overlay">
        <v-btn
          icon="mdi-play-circle"
          size="x-large"
          color="primary"
          variant="flat"
          class="play-button"
        />
        <h3 class="play-text">Click to Watch</h3>
        <p class="play-subtext">{{ getPlaySubtext() }}</p>
      </div>
      <v-img
        v-if="backdropUrl"
        :src="backdropUrl"
        :alt="title"
        cover
        class="backdrop-image"
      />
    </div>

    <div v-if="showPlayer" class="player-container">
      <div class="player-header">
        <div class="player-info">
          <h4 class="player-title">{{ title }}</h4>
          <p class="player-meta">{{ getPlayerMeta() }}</p>
        </div>

        <div class="player-controls">
          <v-btn-toggle
            v-model="selectedSource"
            color="primary"
            variant="outlined"
            density="compact"
            mandatory
          >
            <v-btn
              v-for="(source, index) in availableSources"
              :key="source.name"
              :value="index"
              size="small"
              class="source-btn"
            >
              {{ source.name }}
            </v-btn>
          </v-btn-toggle>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closePlayer"
            class="close-btn"
          />
        </div>
      </div>

      <div class="iframe-container">
        <!-- VidLink iframe without sandbox -->
        <iframe
          v-if="currentEmbedUrl && isVidLink"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          referrerpolicy="origin"
          loading="lazy"
          class="video-iframe"
          @error="handleIframeError"
        />

        <!-- Other sources with sandbox -->
        <iframe
          v-if="currentEmbedUrl && !isVidLink"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          referrerpolicy="origin"
          loading="lazy"
          class="video-iframe"
          @error="handleIframeError"
        />

        <div v-if="loading" class="loading-overlay">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
          <p class="loading-text">Loading video...</p>
        </div>

        <div v-if="error" class="error-overlay">
          <v-icon icon="mdi-alert-circle" size="64" color="error" />
          <h3>Failed to load video</h3>
          <p>{{ error }}</p>
          <v-btn @click="retryLoad" color="primary" variant="outlined">
            Try Again
          </v-btn>
        </div>
      </div>

      <div v-if="showSourceInfo" class="source-info">
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="source-alert"
        >
          <template #prepend>
            <v-icon icon="mdi-information" />
          </template>
          Playing from {{ currentSource?.name }}. Switch sources if video doesn't load.
        </v-alert>
      </div>

      <div v-if="seasonEpisodeSelector" class="episode-selector">
        <v-row>
          <v-col cols="6">
            <v-select
              v-model="selectedSeason"
              :items="seasonOptions"
              label="Season"
              variant="outlined"
              density="compact"
              @update:model-value="updateEpisodeOptions"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="selectedEpisode"
              :items="episodeOptions"
              label="Episode"
              variant="outlined"
              density="compact"
              @update:model-value="loadEpisode"
            />
          </v-col>
        </v-row>
      </div>
    </div>

    <div v-if="showDownloadOptions" class="download-options">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon icon="mdi-download" class="mr-2" />
            Download Options
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="download-disclaimer">
              We don't host any content. These are external sources.
            </p>
            <div class="download-links">
              <v-btn
                v-for="source in availableSources"
                :key="source.name"
                :href="source.url"
                target="_blank"
                variant="outlined"
                size="small"
                class="download-btn"
              >
                {{ source.name }}
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { videoEmbedService, embedUtils } from '@/services/videoEmbed'
import { imageService, utilsService } from '@/services/tmdb'

export default {
  name: 'VideoPlayer',
  props: {
    tmdbId: {
      type: [String, Number],
      required: true
    },
    mediaType: {
      type: String,
      required: true,
      validator: value => ['movie', 'tv'].includes(value)
    },
    title: {
      type: String,
      default: 'Unknown Title'
    },
    backdropPath: {
      type: String,
      default: null
    },
    season: {
      type: Number,
      default: 1
    },
    episode: {
      type: Number,
      default: 1
    },
    seasons: {
      type: Array,
      default: () => []
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    showDownloadOptions: {
      type: Boolean,
      default: true
    }
  },
  emits: ['player-opened', 'player-closed', 'source-changed', 'episode-changed'],
  setup(props, { emit }) {
    const showPlayer = ref(false)
    const loading = ref(false)
    const error = ref(null)
    const selectedSource = ref(0)
    const selectedSeason = ref(props.season)
    const selectedEpisode = ref(props.episode)
    const availableSources = ref([])
    const showSourceInfo = ref(true)

    const isVidLink = computed(() => {
      return currentSource.value?.name?.toLowerCase().includes('vidlink') || false
    })

    const backdropUrl = computed(() => {
      return props.backdropPath ? imageService.getBackdropUrl(props.backdropPath, 'w1280') : null
    })

    const currentSource = computed(() => {
      return availableSources.value[selectedSource.value] || null
    })

    const currentEmbedUrl = computed(() => {
      return currentSource.value?.url || null
    })

    const seasonEpisodeSelector = computed(() => {
      return props.mediaType === 'tv' && props.seasons.length > 0
    })

    const seasonOptions = computed(() => {
      return props.seasons.map(season => ({
        title: `Season ${season.season_number}`,
        value: season.season_number
      }))
    })

    const episodeOptions = computed(() => {
      const currentSeasonData = props.seasons.find(s => s.season_number === selectedSeason.value)
      if (!currentSeasonData || !currentSeasonData.episodes) return []

      return currentSeasonData.episodes.map(episode => ({
        title: `Episode ${episode.episode_number}: ${episode.name}`,
        value: episode.episode_number
      }))
    })

    function getPlaySubtext() {
      if (props.mediaType === 'tv') {
        return `Season ${props.season}, Episode ${props.episode}`
      }
      return 'Full Movie'
    }

    function getPlayerMeta() {
      if (props.mediaType === 'tv') {
        return `Season ${selectedSeason.value}, Episode ${selectedEpisode.value}`
      }
      return 'Movie'
    }

    function initializePlayer() {
      showPlayer.value = true
      loading.value = true
      error.value = null
      loadEmbedSources()
      emit('player-opened')
    }

    function closePlayer() {
      showPlayer.value = false
      availableSources.value = []
      selectedSource.value = 0
      emit('player-closed')
    }

    function loadEmbedSources() {
      try {
        if (props.mediaType === 'movie') {
          availableSources.value = videoEmbedService.getMovieEmbeds(props.tmdbId)
        } else {
          availableSources.value = videoEmbedService.getTVEmbeds(
            props.tmdbId,
            selectedSeason.value,
            selectedEpisode.value
          )
        }

        if (availableSources.value.length === 0) {
          error.value = 'No streaming sources available for this content'
        } else {
          loading.value = false
          setTimeout(() => {
            showSourceInfo.value = false
          }, 5000)
        }
      } catch (err) {
        error.value = 'Failed to load streaming sources'
        loading.value = false
      }
    }

    function handleIframeError() {
      console.warn(`Failed to load from ${currentSource.value?.name}`)
      if (selectedSource.value < availableSources.value.length - 1) {
        selectedSource.value += 1
        showSourceInfo.value = true
        setTimeout(() => {
          showSourceInfo.value = false
        }, 3000)
      } else {
        error.value = 'All streaming sources failed to load'
      }
    }

    function retryLoad() {
      error.value = null
      loading.value = true
      loadEmbedSources()
    }

    function updateEpisodeOptions() {
      selectedEpisode.value = 1
      loadEpisode()
    }

    function loadEpisode() {
      if (props.mediaType === 'tv') {
        loading.value = true
        loadEmbedSources()
        emit('episode-changed', {
          season: selectedSeason.value,
          episode: selectedEpisode.value
        })
      }
    }

    watch(selectedSource, (newIndex) => {
      if (currentSource.value) {
        emit('source-changed', currentSource.value)
        showSourceInfo.value = true
        setTimeout(() => {
          showSourceInfo.value = false
        }, 3000)
      }
    })

    onMounted(() => {
      if (props.autoPlay) {
        initializePlayer()
      }
    })

    return {
      showPlayer,
      loading,
      error,
      selectedSource,
      selectedSeason,
      selectedEpisode,
      availableSources,
      showSourceInfo,
      isVidLink,
      backdropUrl,
      currentSource,
      currentEmbedUrl,
      seasonEpisodeSelector,
      seasonOptions,
      episodeOptions,
      getPlaySubtext,
      getPlayerMeta,
      initializePlayer,
      closePlayer,
      loadEmbedSources,
      handleIframeError,
      retryLoad,
      updateEpisodeOptions,
      loadEpisode
    }
  }
}
</script>

<style scoped>
.video-player {
  width: 100%;
  max-width: 100%;
}

.player-placeholder {
  position: relative;
  width: 100%;
  height: 400px;
  background: #1A1D29;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.player-placeholder:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 32px rgba(0, 212, 170, 0.3);
}

.backdrop-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
  color: white;
}

.play-button {
  margin-bottom: 16px;
  font-size: 4rem !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.play-text {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.play-subtext {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.player-container {
  width: 100%;
  background: #1A1D29;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.player-info {
  flex: 1;
}

.player-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #FFFFFF;
}

.player-meta {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.source-btn {
  font-size: 0.75rem;
  min-width: 60px;
}

.close-btn {
  opacity: 0.7;
}

.close-btn:hover {
  opacity: 1;
}

.iframe-container {
  position: relative;
  width: 100%;
  height: 500px;
  background: #000;
}

.video-iframe {
  display: block;
  background: #000;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  z-index: 10;
}

.loading-text {
  margin-top: 16px;
  font-size: 1rem;
}

.error-overlay h3 {
  margin: 16px 0 8px 0;
  font-size: 1.25rem;
}

.error-overlay p {
  margin-bottom: 24px;
  opacity: 0.8;
}

.source-info {
  padding: 12px 20px;
}

.source-alert {
  font-size: 0.875rem;
}

.episode-selector {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.download-options {
  margin-top: 16px;
}

.download-disclaimer {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
  font-style: italic;
}

.download-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.download-btn {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .player-placeholder {
    height: 300px;
  }

  .player-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .player-controls {
    justify-content: space-between;
  }

  .iframe-container {
    height: 300px;
  }

  .play-button {
    font-size: 3rem !important;
  }

  .play-text {
    font-size: 1.25rem;
  }

  .source-btn {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .player-placeholder {
    height: 250px;
  }

  .iframe-container {
    height: 250px;
  }

  .player-header {
    padding: 12px 16px;
  }

  .source-info,
  .episode-selector {
    padding: 12px 16px;
  }
}
</style>
