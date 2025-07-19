<template>
  <div class="animated-tooltip-wrapper">
    <div
      class="animated-tooltip-trigger"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @focus="showTooltip = true"
      @blur="showTooltip = false"
    >
      <slot></slot>
    </div>

    <transition name="tooltip-fade">
      <div
        v-if="showTooltip"
        class="animated-tooltip"
        :class="[position, variant]"
        :style="tooltipStyle"
      >
        <div class="tooltip-content">
          <slot name="content">{{ content }}</slot>
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AnimatedTooltip',
  props: {
    content: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: 'top',
      validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    variant: {
      type: String,
      default: 'dark',
      validator: (value) => ['dark', 'light', 'primary', 'accent'].includes(value)
    },
    width: {
      type: String,
      default: 'auto'
    },
    offset: {
      type: Number,
      default: 8
    }
  },
  data() {
    return {
      showTooltip: false
    }
  },
  computed: {
    tooltipStyle() {
      return {
        width: this.width !== 'auto' ? `${this.width}px` : 'auto',
        '--tooltip-offset': `${this.offset}px`
      }
    }
  }
}
</script>

<style scoped>
.animated-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.animated-tooltip {
  position: absolute;
  z-index: 9999;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: 250px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.animated-tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(calc(-1 * var(--tooltip-offset)));
}

.animated-tooltip.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(var(--tooltip-offset));
}

.animated-tooltip.left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(calc(-1 * var(--tooltip-offset)));
}

.animated-tooltip.right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(var(--tooltip-offset));
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.animated-tooltip.top .tooltip-arrow {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px 5px 0 5px;
}

.animated-tooltip.bottom .tooltip-arrow {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 5px 5px 5px;
}

.animated-tooltip.left .tooltip-arrow {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px 0 5px 5px;
}

.animated-tooltip.right .tooltip-arrow {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px 5px 5px 0;
}

/* Variants */
.animated-tooltip.dark {
  background-color: rgba(0, 0, 0, 0.85);
  color: #fff;
  backdrop-filter: blur(5px);
}

.animated-tooltip.dark .tooltip-arrow {
  border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
}

.animated-tooltip.dark.bottom .tooltip-arrow {
  border-color: transparent transparent rgba(0, 0, 0, 0.85) transparent;
}

.animated-tooltip.dark.left .tooltip-arrow {
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.85);
}

.animated-tooltip.dark.right .tooltip-arrow {
  border-color: transparent rgba(0, 0, 0, 0.85) transparent transparent;
}

.animated-tooltip.light {
  background-color: rgba(255, 255, 255, 0.95);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.animated-tooltip.light .tooltip-arrow {
  border-color: rgba(255, 255, 255, 0.95) transparent transparent transparent;
}

.animated-tooltip.light.bottom .tooltip-arrow {
  border-color: transparent transparent rgba(255, 255, 255, 0.95) transparent;
}

.animated-tooltip.light.left .tooltip-arrow {
  border-color: transparent transparent transparent rgba(255, 255, 255, 0.95);
}

.animated-tooltip.light.right .tooltip-arrow {
  border-color: transparent rgba(255, 255, 255, 0.95) transparent transparent;
}

.animated-tooltip.primary {
  background-color: rgba(0, 212, 170, 0.95);
  color: #fff;
}

.animated-tooltip.primary .tooltip-arrow {
  border-color: rgba(0, 212, 170, 0.95) transparent transparent transparent;
}

.animated-tooltip.primary.bottom .tooltip-arrow {
  border-color: transparent transparent rgba(0, 212, 170, 0.95) transparent;
}

.animated-tooltip.primary.left .tooltip-arrow {
  border-color: transparent transparent transparent rgba(0, 212, 170, 0.95);
}

.animated-tooltip.primary.right .tooltip-arrow {
  border-color: transparent rgba(0, 212, 170, 0.95) transparent transparent;
}

.animated-tooltip.accent {
  background-color: rgba(253, 121, 168, 0.95);
  color: #fff;
}

.animated-tooltip.accent .tooltip-arrow {
  border-color: rgba(253, 121, 168, 0.95) transparent transparent transparent;
}

.animated-tooltip.accent.bottom .tooltip-arrow {
  border-color: transparent transparent rgba(253, 121, 168, 0.95) transparent;
}

.animated-tooltip.accent.left .tooltip-arrow {
  border-color: transparent transparent transparent rgba(253, 121, 168, 0.95);
}

.animated-tooltip.accent.right .tooltip-arrow {
  border-color: transparent rgba(253, 121, 168, 0.95) transparent transparent;
}

/* Animations */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

.tooltip-fade-enter-from.top,
.tooltip-fade-leave-to.top {
  transform: translateX(-50%) translateY(calc((-1 * var(--tooltip-offset)) - 10px));
}

.tooltip-fade-enter-from.bottom,
.tooltip-fade-leave-to.bottom {
  transform: translateX(-50%) translateY(calc(var(--tooltip-offset) + 10px));
}

.tooltip-fade-enter-from.left,
.tooltip-fade-leave-to.left {
  transform: translateY(-50%) translateX(calc((-1 * var(--tooltip-offset)) - 10px));
}

.tooltip-fade-enter-from.right,
.tooltip-fade-leave-to.right {
  transform: translateY(-50%) translateX(calc(var(--tooltip-offset) + 10px));
}

/* Responsive */
@media (max-width: 768px) {
  .animated-tooltip {
    max-width: 200px;
    font-size: 0.8rem;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .animated-tooltip {
    display: none;
  }
}
</style>
