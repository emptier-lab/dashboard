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
        <!-- Iframe without sandbox restrictions for specific sources and mobile devices -->
        <iframe
          v-if="currentEmbedUrl && (isVidLink || isMobileDevice || isEmbedSu || isSmashyStream)"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
          allow="autoplay; fullscreen; picture-in-picture"
          referrerpolicy="origin"
          loading="lazy"
          class="video-iframe"
          @error="handleIframeError"
        />

        <!-- Desktop iframe with sandbox for other sources -->
        <iframe
          v-if="currentEmbedUrl && !isVidLink && !isMobileDevice && !isEmbedSu && !isSmashyStream"
          :src="currentEmbedUrl"
          width="100%"
          height="100%"
          frameborder="0"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-top-navigation-by-user-activation"
          allow="autoplay; fullscreen; picture-in-picture"
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

    const isEmbedSu = computed(() => {
      return currentSource.value?.name?.toLowerCase().includes('embedsu') || false
    })

    const isSmashyStream = computed(() => {
      return currentSource.value?.name?.toLowerCase().includes('smashy') || false
    })

    const isMobileDevice = computed(() => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
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
        const preferMobile = isMobileDevice.value

        if (props.mediaType === 'movie') {
          availableSources.value = videoEmbedService.getMovieEmbeds(props.tmdbId, preferMobile)
        } else {
          availableSources.value = videoEmbedService.getTVEmbeds(
            props.tmdbId,
            selectedSeason.value,
            selectedEpisode.value,
            preferMobile
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
      isEmbedSu,
      isSmashyStream,
      isMobileDevice,
      backdropUrl,
      currentSource,
      currentEmbedUrl,
      getPlaySubtext,
      getPlayerMeta,
      initializePlayer,
      closePlayer,
      loadEmbedSources,
      handleIframeError,
      retryLoad
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.player-placeholder:hover {
  box-shadow: 0 8px 32px rgba(0, 212, 170, 0.3);
}

.backdrop-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  object-fit: cover;
}

.play-overlay {
  position: relative;
  text-align: center;
  z-index: 2;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  max-width: 100%;
  background: #1A1D29;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.source-btn {
  font-size: 0.75rem;
  min-width: 60px;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 60px;
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
  justify-content: flex-end;
  gap: 16px;
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
  min-height: 300px;
}

.video-iframe {
  display: block;
  background: #000;
  border: none;
  outline: none;
}
.source-info {
  padding: 12px 20px;
}

.source-alert {
  font-size: 0.875rem;
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







@media (max-width: 768px) {
  .player-placeholder {
    height: 350px;
    border-radius: 8px;
  }

  .player-header {
    padding: 12px 16px;
    min-height: 50px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .player-controls {
    justify-content: flex-start;
    width: 100%;
    flex-wrap: wrap;
  }

  .iframe-container {
    height: 350px;
  }

  .play-button {
    font-size: 3rem !important;
  }

  .play-text {
    font-size: 1.25rem;
  }

  .player-info {
    margin-bottom: 0;
    width: 100%;
  }

  .player-title {
    font-size: 1rem;
  }

  .player-meta {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .player-placeholder {
    height: 280px;
    border-radius: 6px;
  }

  .iframe-container {
    height: 280px;
  }

  .player-header {
    padding: 10px 12px;
    min-height: 45px;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .play-button {
    font-size: 2.5rem !important;
    margin-bottom: 12px;
  }

  .play-text {
    font-size: 1.1rem;
  }

  .play-subtext {
    font-size: 0.9rem;
  }

  .source-btn {
    flex: 1;
    min-width: auto;
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  .source-info {
    padding: 12px 16px;
  }

  .player-title {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .player-meta {
    font-size: 0.75rem;
  }

  .player-controls {
    width: 100%;
    gap: 8px;
  }

  .close-btn {
    align-self: flex-end;
  }
}

/* iOS specific fixes */
@supports (-webkit-touch-callout: none) {
  .video-iframe {
    -webkit-overflow-scrolling: touch;
  }

  .iframe-container {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
}

/* Landscape mobile optimization */
@media (max-width: 768px) and (orientation: landscape) {
  .player-placeholder,
  .iframe-container {
    height: 70vh;
    min-height: 250px;
  }

  .player-header {
    padding: 8px 12px;
    min-height: 40px;
  }

  .play-button {
    font-size: 2.5rem !important;
  }
}
</style>
