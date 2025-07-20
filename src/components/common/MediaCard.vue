<template>
  <v-card
    class="media-card"
    :class="{ 'media-card--loading': loading }"
    @click="handleClick"
    elevation="4"
    hover
  >
    <div class="media-card__image-container">
      <v-img
        :src="posterUrl"
        :alt="title"
        aspect-ratio="2/3"
        cover
        class="media-card__image"
      >
        <template #placeholder>
          <div class="media-card__placeholder">
            <v-icon icon="mdi-image" size="48" />
          </div>
        </template>

        <template #error>
          <div class="media-card__placeholder">
            <v-icon icon="mdi-image-off" size="48" />
          </div>
        </template>

        <div class="media-card__overlay">
          <v-btn
            icon="mdi-play-circle"
            size="small"
            color="primary"
            variant="flat"
            class="play-button"
          />
        </div>

        <div v-if="item.vote_average" class="media-card__rating">
          <v-chip
            :color="getRatingColor(item.vote_average)"
            size="small"
            class="rating-chip"
          >
            <v-icon icon="mdi-star" size="small" class="mr-1" />
            {{ formatRating(item.vote_average) }}
          </v-chip>
        </div>
      </v-img>
    </div>

    <v-card-text class="media-card__content">
      <h3 class="media-card__title">{{ title }}</h3>
      <p class="media-card__subtitle">{{ subtitle }}</p>

      <div v-if="item.genre_ids?.length || genres?.length" class="media-card__genres">
        <v-chip
          v-for="genre in displayGenres"
          :key="genre.id || genre"
          size="x-small"
          variant="outlined"
          class="mr-1 mb-1"
        >
          {{ getGenreName(genre) }}
        </v-chip>
      </div>

      <p v-if="item.overview" class="media-card__overview">
        {{ truncateText(item.overview, 100) }}
      </p>
    </v-card-text>

    <v-card-actions class="media-card__actions">
      <v-btn
        variant="text"
        size="small"
        @click.stop="toggleFavorite"
        :color="isFavorite ? 'error' : 'default'"
      >
        <v-icon :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'" />
      </v-btn>

      <v-btn
        variant="text"
        size="small"
        @click.stop="toggleWatchlist"
        :color="isInWatchlist ? 'primary' : 'default'"
      >
        <v-icon :icon="isInWatchlist ? 'mdi-bookmark' : 'mdi-bookmark-outline'" />
      </v-btn>

      <v-spacer />

      <v-btn
        variant="text"
        size="small"
        @click.stop="goToDetails"
      >
        Details
        <v-icon icon="mdi-chevron-right" />
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { imageService, utilsService } from '@/services/tmdb'
import { localStorageService } from '@/services/localStorage'

export default {
  name: 'MediaCard',
  props: {
    item: {
      type: Object,
      required: true
    },
    mediaType: {
      type: String,
      default: 'movie',
      validator: value => ['movie', 'tv'].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['click', 'favorite', 'watchlist'],
  setup(props, { emit }) {
    const router = useRouter()

    const isFavorite = ref(false)
    const isInWatchlist = ref(false)

    // Genre mapping for common genres
    const genreMap = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western',
      10759: 'Action & Adventure',
      10762: 'Kids',
      10763: 'News',
      10764: 'Reality',
      10765: 'Sci-Fi & Fantasy',
      10766: 'Soap',
      10767: 'Talk',
      10768: 'War & Politics'
    }

    const title = computed(() => {
      return props.item.title || props.item.name || 'Unknown Title'
    })

    const subtitle = computed(() => {
      const releaseDate = props.item.release_date || props.item.first_air_date
      if (releaseDate) {
        return utilsService.getYear(releaseDate)
      }
      return props.mediaType === 'tv' ? 'TV Series' : 'Movie'
    })

    const posterUrl = computed(() => {
      return imageService.getPosterUrl(props.item.poster_path, 'w342')
    })

    const displayGenres = computed(() => {
      if (props.item.genres) {
        return props.item.genres.slice(0, 2)
      }
      if (props.item.genre_ids) {
        return props.item.genre_ids.slice(0, 2)
      }
      return []
    })

    function handleClick() {
      if (props.clickable) {
        emit('click', props.item)
        goToDetails()
      }
    }

    function goToDetails() {
      const route = props.mediaType === 'tv' ? `/tv/${props.item.id}` : `/movie/${props.item.id}`
      router.push(route)
    }

    function toggleFavorite() {
      const itemWithType = { ...props.item, media_type: props.mediaType };

      // Use the localStorage service to toggle favorite status
      localStorageService.toggleFavorite(itemWithType);

      // Update local state
      isFavorite.value = localStorageService.isFavorite(props.item.id, props.mediaType);

      // Emit event for parent components
      emit('favorite', {
        item: props.item,
        isFavorite: isFavorite.value
      });
    }

    function toggleWatchlist() {
      const itemWithType = { ...props.item, media_type: props.mediaType };

      // Use the localStorage service to toggle watchlist status
      localStorageService.toggleWatchlist(itemWithType);

      // Update local state
      isInWatchlist.value = localStorageService.isInWatchlist(props.item.id, props.mediaType);

      // Emit event for parent components
      emit('watchlist', {
        item: props.item,
        isInWatchlist: isInWatchlist.value
      });
    }

    function formatRating(rating) {
      return utilsService.formatVoteAverage(rating)
    }

    function getRatingColor(rating) {
      return utilsService.getRatingColor(rating)
    }

    function truncateText(text, maxLength) {
      return utilsService.truncateText(text, maxLength)
    }

    function getGenreName(genre) {
      if (typeof genre === 'object') {
        return genre.name
      }
      return genreMap[genre] || 'Unknown'
    }

    function checkFavoriteStatus() {
      isFavorite.value = localStorageService.isFavorite(props.item.id, props.mediaType);
    }

    function checkWatchlistStatus() {
      isInWatchlist.value = localStorageService.isInWatchlist(props.item.id, props.mediaType);
    }

    onMounted(() => {
      checkFavoriteStatus();
      checkWatchlistStatus();

      // Add listener for storage events from other tabs
      window.addEventListener('storage', (event) => {
        if (event.key === 'empty-tv-favorites' || event.key === 'empty-tv-watchlist') {
          checkFavoriteStatus();
          checkWatchlistStatus();
        }
      });
    })

    return {
      title,
      subtitle,
      posterUrl,
      displayGenres,
      isFavorite,
      isInWatchlist,
      handleClick,
      goToDetails,
      toggleFavorite,
      toggleWatchlist,
      formatRating,
      getRatingColor,
      truncateText,
      getGenreName
    }
  }
}
</script>

<style scoped>
.media-card {
  position: relative;
  height: 100%;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  background: var(--glass-effect);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  cursor: pointer;
  box-shadow: var(--shadow-md);
}

.media-card:hover {
  transform: translateY(-12px) scale(1.03);
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: var(--shadow-xl);
  background: rgba(255, 255, 255, 0.15);
}

.media-card--loading {
  pointer-events: none;
  opacity: 0.6;
  animation: pulse 2s infinite;
}

.media-card__image-container {
  position: relative;
  flex-shrink: 0;
  height: 280px;
  overflow: hidden;
}

.media-card__image {
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  height: 100%;
  object-fit: cover;
}

.media-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(102, 126, 234, 0.15);
  color: var(--text-muted);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.media-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all var(--transition-normal);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.media-card:hover .media-card__overlay {
  opacity: 1;
}

.play-button {
  font-size: 3rem !important;
  width: 80px !important;
  height: 80px !important;
  background: var(--primary-color) !important;
  backdrop-filter: blur(12px) !important;
  border: 2px solid rgba(255, 255, 255, 0.4) !important;
  transition: all var(--transition-normal) !important;
  box-shadow: var(--shadow-lg) !important;
}

.play-button:hover {
  background: #764ba2 !important;
  transform: scale(1.15) !important;
  box-shadow: var(--shadow-xl) !important;
}

.media-card__rating {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
}

.rating-chip {
  background: rgba(15, 15, 35, 0.85) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  font-weight: 600 !important;
  box-shadow: var(--shadow-md) !important;
}

.media-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: rgba(15, 15, 35, 0.1);
  min-height: 140px;
}

.media-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
  min-height: 2.6em;
}

.media-card__subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 10px;
  font-weight: 500;
}

.media-card__genres {
  margin-bottom: 12px;
  min-height: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.media-card__overview {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.9;
}

.media-card__actions {
  border-top: 1px solid rgba(102, 126, 234, 0.25);
  padding: 16px 20px;
  background: rgba(15, 15, 35, 0.4);
  backdrop-filter: blur(12px);
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

@media (max-width: 768px) {
  .media-card {
    min-height: 380px;
  }

  .media-card__image-container {
    height: 240px;
  }

  .media-card__content {
    padding: 1rem;
    min-height: 120px;
  }

  .media-card__title {
    font-size: 1rem;
    margin-bottom: 8px;
    min-height: 2.4em;
  }

  .media-card__subtitle {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  .media-card__overview {
    font-size: 0.8rem;
    -webkit-line-clamp: 2;
  }

  .media-card__actions {
    padding: 12px 16px;
  }

  .play-button {
    font-size: 2.5rem !important;
    width: 70px !important;
    height: 70px !important;
  }
}

@media (max-width: 480px) {
  .media-card {
    min-height: 340px;
  }

  .media-card__image-container {
    height: 200px;
  }

  .media-card__content {
    padding: 0.875rem;
    min-height: 100px;
  }

  .media-card__title {
    font-size: 0.95rem;
    -webkit-line-clamp: 1;
    min-height: 1.3em;
  }

  .media-card__subtitle {
    font-size: 0.8rem;
  }

  .media-card__overview {
    -webkit-line-clamp: 2;
    font-size: 0.75rem;
  }

  .media-card__actions {
    padding: 10px 12px;
  }

  .play-button {
    font-size: 2rem !important;
    width: 60px !important;
    height: 60px !important;
  }

  .media-card__rating {
    top: 8px;
    right: 8px;
  }
}
</style>
