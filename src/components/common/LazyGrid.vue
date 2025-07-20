<template>
  <div class="lazy-grid-container" ref="container">
    <!-- Header slot for filters, titles, etc. -->
    <slot name="header"></slot>

    <!-- Viewport for visible items only -->
    <div class="lazy-grid-viewport" ref="viewport" @scroll="handleScroll">
      <!-- Spacer at top to maintain scroll position -->
      <div class="lazy-grid-spacer" :style="{ height: `${topSpacerHeight}px` }"></div>

      <!-- Actual visible items -->
      <div class="lazy-grid" :class="gridClass" ref="grid">
        <slot
          v-for="item in visibleItems"
          :key="getItemKey(item)"
          :item="item"
          name="item"
        ></slot>
      </div>

      <!-- Spacer at bottom to maintain scroll height -->
      <div class="lazy-grid-spacer" :style="{ height: `${bottomSpacerHeight}px` }"></div>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useThrottleFn } from '@vueuse/core';

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
    itemHeight: {
      type: Number,
      default: 400 // Default item height in pixels
    },
    itemKey: {
      type: String,
      default: 'id'
    },
    overscan: {
      type: Number,
      default: 5 // Number of items to render above/below visible area
    },
    columnCount: {
      type: Number,
      default: 5 // Approximate number of columns
    },
    loadMoreThreshold: {
      type: Number,
      default: 500 // px from bottom to trigger load more
    }
  },
  emits: ['load-more', 'visible-items-change'],
  setup(props, { emit }) {
    const container = ref(null);
    const viewport = ref(null);
    const grid = ref(null);
    const scrollTop = ref(0);
    const viewportHeight = ref(0);
    const itemsPerRow = ref(props.columnCount);
    const isScrolling = ref(false);
    const scrollTimeout = ref(null);

    // Calculate the approximate number of rows based on item count and columns
    const rowCount = computed(() => Math.ceil(props.items.length / itemsPerRow.value));

    // Calculate which items should be visible
    const visibleRange = computed(() => {
      const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan);
      const visibleRows = Math.ceil(viewportHeight.value / props.itemHeight) + props.overscan * 2;
      const end = Math.min(rowCount.value, start + visibleRows);

      return { start, end };
    });

    // Calculate the items that should be currently rendered
    const visibleItems = computed(() => {
      if (!props.items.length) return [];

      const { start, end } = visibleRange.value;
      const startIndex = start * itemsPerRow.value;
      const endIndex = Math.min(props.items.length, end * itemsPerRow.value);

      return props.items.slice(startIndex, endIndex);
    });

    // Calculate spacer heights
    const topSpacerHeight = computed(() => {
      return visibleRange.value.start * props.itemHeight;
    });

    const bottomSpacerHeight = computed(() => {
      const visibleRows = visibleRange.value.end - visibleRange.value.start;
      const remainingRows = rowCount.value - visibleRange.value.end;
      return remainingRows * props.itemHeight;
    });

    // Check if items array is empty
    const isEmpty = computed(() => {
      return props.items.length === 0 && !props.loading;
    });

    // Get the key for an item
    const getItemKey = (item) => {
      return item[props.itemKey] || JSON.stringify(item);
    };

    // Update viewport dimensions
    const updateViewportDimensions = () => {
      if (!viewport.value) return;

      viewportHeight.value = viewport.value.clientHeight;
      scrollTop.value = viewport.value.scrollTop;

      // Calculate actual number of columns if grid is rendered
      if (grid.value && grid.value.children.length > 0) {
        const firstItem = grid.value.children[0];
        const itemWidth = firstItem.offsetWidth;
        const gridWidth = grid.value.offsetWidth;

        if (itemWidth && gridWidth) {
          itemsPerRow.value = Math.floor(gridWidth / itemWidth);
          if (itemsPerRow.value < 1) itemsPerRow.value = 1;
        }
      }
    };

    // Handle scroll events with throttling
    const handleScroll = useThrottleFn(() => {
      if (!viewport.value) return;

      scrollTop.value = viewport.value.scrollTop;

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

      // Check if we need to load more items
      const { scrollHeight, clientHeight, scrollTop } = viewport.value;
      if (scrollHeight - clientHeight - scrollTop <= props.loadMoreThreshold) {
        emit('load-more');
      }
    }, 100);

    // Watch for changes in visible items
    watch(visibleItems, (newItems) => {
      emit('visible-items-change', newItems);
    });

    // Setup resize observer
    let resizeObserver = null;

    const setupResizeObserver = () => {
      if (!container.value) return;

      resizeObserver = new ResizeObserver(() => {
        updateViewportDimensions();
      });

      resizeObserver.observe(container.value);
    };

    // Clean up resize observer
    const cleanupResizeObserver = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      updateViewportDimensions();
      setupResizeObserver();

      // Initial load more check
      setTimeout(() => {
        if (viewport.value) {
          const { scrollHeight, clientHeight } = viewport.value;
          if (scrollHeight <= clientHeight) {
            emit('load-more');
          }
        }
      }, 200);
    });

    onBeforeUnmount(() => {
      cleanupResizeObserver();

      if (scrollTimeout.value) {
        clearTimeout(scrollTimeout.value);
      }
    });

    return {
      container,
      viewport,
      grid,
      visibleItems,
      topSpacerHeight,
      bottomSpacerHeight,
      isEmpty,
      getItemKey,
      handleScroll
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
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.lazy-grid {
  position: relative;
  width: 100%;
}

.lazy-grid-spacer {
  width: 100%;
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
