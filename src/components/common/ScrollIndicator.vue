<template>
  <div class="scroll-indicator-container" :class="{ 'is-fixed': fixed, 'is-visible': isVisible, 'is-subtle': true }">
    <div
      class="scroll-indicator-track"
      ref="track"
      @click="handleTrackClick"
    >
      <div
        class="scroll-indicator-bar"
        :style="{ width: `${scrollPercentage}%` }"
      ></div>

      <div
        class="scroll-indicator-thumb"
        :style="{ left: `${scrollPercentage}%` }"
        @mousedown="startDrag"
      >
        <div class="scroll-indicator-thumb-ripple"></div>
      </div>
    </div>

    <div class="scroll-to-top" @click="scrollToTop" v-show="showScrollTop">
      <v-icon icon="mdi-arrow-up" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScrollIndicator',
  props: {
    fixed: {
      type: Boolean,
      default: true
    },
    showAtPercent: {
      type: Number,
      default: 5
    },
    color: {
      type: String,
      default: '#00D4AA'
    }
  },
  data() {
    return {
      scrollPercentage: 0,
      isVisible: false,
      showScrollTop: false,
      isDragging: false,
      animationFrameId: null
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleScroll);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.stopDrag);

    // Initialize
    this.handleScroll();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleScroll);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.stopDrag);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    handleScroll() {
      this.animationFrameId = requestAnimationFrame(() => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        this.scrollPercentage = scrolled;
        this.isVisible = winScroll > 0;
        this.showScrollTop = winScroll > (document.documentElement.clientHeight * (this.showAtPercent / 100));
      });
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    handleTrackClick(event) {
      if (this.isDragging) return;

      const track = this.$refs.track;
      const trackRect = track.getBoundingClientRect();
      const clickPosition = event.clientX - trackRect.left;
      const trackWidth = trackRect.width;
      const clickPercentage = (clickPosition / trackWidth) * 100;

      // Calculate the scroll position based on percentage
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = (clickPercentage / 100) * height;

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    },
    startDrag(event) {
      this.isDragging = true;
      event.preventDefault();
    },
    stopDrag() {
      this.isDragging = false;
    },
    handleMouseMove(event) {
      if (!this.isDragging) return;

      const track = this.$refs.track;
      const trackRect = track.getBoundingClientRect();
      const movePosition = event.clientX - trackRect.left;
      const trackWidth = trackRect.width;
      let movePercentage = (movePosition / trackWidth) * 100;

      // Clamp percentage between 0 and 100
      movePercentage = Math.max(0, Math.min(100, movePercentage));

      // Calculate the scroll position based on percentage
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPosition = (movePercentage / 100) * height;

      window.scrollTo({
        top: scrollPosition
      });
    }
  }
}
</script>

<style scoped>
.scroll-indicator-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 9999;
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.scroll-indicator-container.is-visible {
  opacity: 0.7;
  transform: translateY(0);
}

.scroll-indicator-container.is-subtle {
  opacity: 0.4;
}

.scroll-indicator-container.is-subtle:hover {
  opacity: 0.8;
}

.scroll-indicator-track {
  position: relative;
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.05);
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
}

.scroll-indicator-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: v-bind(color);
  transition: width 0.1s ease;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 100%;
  animation: slide 1s linear infinite;
}

@keyframes slide {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 20px 0;
  }
}

.scroll-indicator-thumb {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  background-color: v-bind(color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 5px rgba(0, 212, 170, 0.4);
  cursor: grab;
  transition: transform 0.2s ease;
  pointer-events: auto;
}

.scroll-indicator-thumb:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.scroll-indicator-thumb:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.3);
}

.scroll-indicator-thumb-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-color: v-bind(color);
  border-radius: 50%;
  opacity: 0.3;
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

.scroll-to-top {
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 36px;
  height: 36px;
  background-color: rgba(0, 212, 170, 0.7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: auto;
  z-index: 9998;
  animation: float 2s ease-in-out infinite;
}

.is-visible .scroll-to-top {
  opacity: 0.7;
  transform: translateY(0);
}

.scroll-to-top:hover {
  background-color: #00bfa5;
  transform: translateY(-5px);
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .scroll-indicator-container {
    height: 2px;
  }

  .scroll-indicator-track {
    height: 2px;
  }

  .scroll-indicator-thumb {
    width: 6px;
    height: 6px;
  }

  .scroll-to-top {
    width: 32px;
    height: 32px;
    right: 12px;
    bottom: 60px;
  }
}
</style>
