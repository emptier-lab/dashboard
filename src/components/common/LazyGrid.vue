<template>
  <div class="lazy-grid-container" ref="container">
    <!-- Header slot for filters, titles, etc. -->
    <slot name="header"></slot>

    <!-- Viewport for visible items only -->
    <div class="lazy-grid-viewport" ref="viewport" @scroll="handleScroll">
      <!-- Actual visible items -->
      <div class="lazy-grid" :class="gridClass" ref="grid">
        <slot
          v-for="item in items"
          :key="getItemKey(item)"
          :item="item"
          name="item"
        ></slot>
      </div>

      <!-- Load more trigger when near bottom -->
      <div v-if="hasMoreContent && !loading" class="load-more-trigger" ref="loadMoreTrigger"></div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="lazy-grid-loading">
      <slot name="loading">
        <v-progress-circular indeterminate color="primary" />
        <p>Loading...</p>
      </slot>
    </div>

    <!-- Empty state -->
    <div v-if="isEmpty" class="lazy-grid-empty">
      <slot name="empty">
        <v-icon icon="mdi-alert-circle-outline" size="64" color="grey" />
        <p>No items found</p>
      </slot>
    </div>

    <!-- Footer slot for pagination, load more, etc. -->
    <slot name="footer"></slot>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

export default {
  name: 'LazyGrid',
  props: {
    items: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    gridClass: {
      type: String,
      default: 'media-grid'
    },
    itemKey: {
      type: String,
      default: 'id'
    },
    loadMoreThreshold: {
      type: Number,
      default: 500
    },
    hasMoreContent: {
      type: Boolean,
      default: true
    }
  },
  emits: ['load-more'],
  setup(props, { emit }) {
    const container = ref(null);
    const viewport = ref(null);
    const loadMoreTrigger = ref(null);
    const isScrolling = ref(false);
    const scrollTimeout = ref(null);
    const intersectionObserver = ref(null);

    // Check if items array is empty
    const isEmpty = computed(() => {
      return props.items.length === 0 && !props.loading;
    });

    // Get the key for an item
    const getItemKey = (item) => {
      return item[props.itemKey] || JSON.stringify(item);
    };

    // Handle scroll events for manual scroll detection
    const handleScroll = () => {
      if (!viewport.value) return;

      // Clear previous timeout
      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }

      // Set scrolling state
      isScrolling.value = true;

      // Set timeout to detect when scrolling stops
      scrollTimeout.value = setTimeout(() => {
        isScrolling.value = false;
      }, 150);

      // Manual check for load more (backup method)
      const { scrollTop, clientHeight, scrollHeight } = viewport.value;
      const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

      if (distanceFromBottom <= props.loadMoreThreshold && props.hasMoreContent && !props.loading) {
        emit('load-more');
      }
    };

    // Setup intersection observer for load more trigger
    const setupIntersectionObserver = () => {
      if (!window.IntersectionObserver || !loadMoreTrigger.value) return;

      const options = {
        root: viewport.value,
        rootMargin: `${props.loadMoreThreshold}px`,
        threshold: 0.1
      };

      intersectionObserver.value = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && props.hasMoreContent && !props.loading) {
            console.log('Intersection Observer triggered load-more');
            emit('load-more');
          }
        });
      }, options);

      intersectionObserver.value.observe(loadMoreTrigger.value);
    };

    // Clean up intersection observer
    const cleanupIntersectionObserver = () => {
      if (intersectionObserver.value) {
        intersectionObserver.value.disconnect();
        intersectionObserver.value = null;
      }
    };

    // Watch for changes in hasMoreContent to set up/clean up observer
    watch(() => props.hasMoreContent, (hasMore) => {
      if (hasMore) {
        nextTick(() => {
          if (loadMoreTrigger.value) {
            setupIntersectionObserver();
          }
        });
      } else {
        cleanupIntersectionObserver();
      }
    });

    // Watch for items changes to check if we need more content
    watch(() => props.items.length, () => {
      nextTick(() => {
        if (viewport.value && props.hasMoreContent && !props.loading) {
          const { scrollHeight, clientHeight } = viewport.value;

          // If the content doesn't fill the viewport, load more (but only once)
          if (scrollHeight <= clientHeight + 100) {
            setTimeout(() => {
              if (viewport.value && props.hasMoreContent && !props.loading) {
                const { scrollHeight: newScrollHeight, clientHeight: newClientHeight } = viewport.value;
                if (newScrollHeight <= newClientHeight + 100) {
                  emit('load-more');
                }
              }
            }, 500);
          }
        }
      });
    });

    // Lifecycle hooks
    onMounted(() => {
      nextTick(() => {
        if (loadMoreTrigger.value && props.hasMoreContent) {
          setupIntersectionObserver();
        }

        // Initial check if we need to load more content (with delay to ensure DOM is ready)
        setTimeout(() => {
          if (viewport.value && props.hasMoreContent && !props.loading) {
            const { scrollHeight, clientHeight } = viewport.value;

            if (scrollHeight <= clientHeight + 100) {
              emit('load-more');
            }
          }
        }, 200);
      });
    });

    onBeforeUnmount(() => {
      cleanupIntersectionObserver();

      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }
    });

    return {
      container,
      viewport,
      loadMoreTrigger,
      isEmpty,
      getItemKey,
      handleScroll,
      isScrolling
    };
  }
};
</script>

<style scoped>
.lazy-grid-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.lazy-grid-viewport {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.lazy-grid {
  position: relative;
  width: 100%;
}

.load-more-trigger {
  width: 100%;
  height: 1px;
  pointer-events: none;
}

.lazy-grid-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  width: 100%;
}

.lazy-grid-loading p {
  margin-top: 1rem;
  color: var(--text-secondary);
}

.lazy-grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  width: 100%;
  color: var(--text-secondary);
  text-align: center;
}

.lazy-grid-empty p {
  margin-top: 1rem;
  font-size: 1.1rem;
}
</style>
