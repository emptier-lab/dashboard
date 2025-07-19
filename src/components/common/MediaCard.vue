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
            size="large"
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
      isFavorite.value = !isFavorite.value
      emit('favorite', {
        item: props.item,
        isFavorite: isFavorite.value
      })
      // TODO: Implement local storage or API call
    }

    function toggleWatchlist() {
      isInWatchlist.value = !isInWatchlist.value
      emit('watchlist', {
        item: props.item,
        isInWatchlist: isInWatchlist.value
      })
      // TODO: Implement local storage or API call
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
      // TODO: Check if item is in favorites from storage
      isFavorite.value = false
    }

    function checkWatchlistStatus() {
      // TODO: Check if item is in watchlist from storage
      isInWatchlist.value = false
    }

    onMounted(() => {
      checkFavoriteStatus()
      checkWatchlistStatus()
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
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 212, 170, 0.2);
}

.media-card--loading {
  pointer-events: none;
  opacity: 0.7;
}

.media-card__image-container {
  position: relative;
  flex-shrink: 0;
}

.media-card__image {
  border-radius: 12px 12px 0 0;
}

.media-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.media-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.media-card:hover .media-card__overlay {
  opacity: 1;
}

.play-button {
  font-size: 3rem !important;
  box-shadow: 0 4px 16px rgba(0, 212, 170, 0.4);
}

.media-card__rating {
  position: absolute;
  top: 8px;
  right: 8px;
}

.rating-chip {
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.7) !important;
}

.media-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.media-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #FFFFFF;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-card__subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.media-card__genres {
  margin-bottom: 8px;
  min-height: 24px;
}

.media-card__overview {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  margin-bottom: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-card__actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
}

@media (max-width: 600px) {
  .media-card__title {
    font-size: 0.9rem;
    -webkit-line-clamp: 1;
  }

  .media-card__overview {
    -webkit-line-clamp: 2;
  }

  .play-button {
    font-size: 2rem !important;
  }
}
</style>
