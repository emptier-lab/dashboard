<template>
  <div class="animated-loader" :class="{ 'fullscreen': fullscreen }">
    <div class="loader-container" :style="{ width: `${size}px`, height: `${size}px` }">
      <div v-if="type === 'spinner'" class="loader-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-inner-circle"></div>
        <div class="spinner-dot" v-for="n in 8" :key="n" :style="{ transform: `rotate(${(n-1) * 45}deg)` }">
          <span :style="{ animationDelay: `${(n-1) * 0.1}s` }"></span>
        </div>
      </div>

      <div v-else-if="type === 'pulse'" class="loader-pulse">
        <div class="pulse-circle" v-for="n in 3" :key="n" :style="{ animationDelay: `${(n-1) * 0.15}s` }"></div>
      </div>

      <div v-else-if="type === 'bars'" class="loader-bars">
        <div class="bar" v-for="n in 5" :key="n" :style="{ animationDelay: `${(n-1) * 0.1}s` }"></div>
      </div>

      <div v-else-if="type === 'dots'" class="loader-dots">
        <div class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: `${(n-1) * 0.15}s` }"></div>
      </div>

      <div v-else-if="type === 'logo'" class="loader-logo">
        <v-icon icon="mdi-play-circle" size="48" color="primary" class="logo-icon" />
        <div class="logo-pulse"></div>
      </div>
    </div>

    <div v-if="text" class="loader-text" :class="{ 'visible': textVisible }">
      {{ text }}
      <span v-if="showDots" class="loading-dots">
        <span class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: `${(n-1) * 0.15}s` }"></span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedLoader',
  props: {
    type: {
      type: String,
      default: 'spinner',
      validator: (value) => ['spinner', 'pulse', 'bars', 'dots', 'logo'].includes(value)
    },
    size: {
      type: Number,
      default: 60
    },
    color: {
      type: String,
      default: '#00D4AA'
    },
    text: {
      type: String,
      default: ''
    },
    showDots: {
      type: Boolean,
      default: true
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      textVisible: false
    }
  },
  mounted() {
    // Delay showing the text for a smoother appearance
    setTimeout(() => {
      this.textVisible = true
    }, 500)
  }
}
</script>

<style scoped>
.animated-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.animated-loader.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(26, 29, 41, 0.95);
  backdrop-filter: blur(5px);
  z-index: 9999;
}

.loader-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-text {
  margin-top: 16px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.loader-text.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Spinner loader */
.loader-spinner {
  position: relative;
  width: 100%;
  height: 100%;
}

.spinner-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(0, 212, 170, 0.1);
  border-top: 3px solid rgba(0, 212, 170, 1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-inner-circle {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
  border: 3px solid transparent;
  border-top: 3px solid rgba(0, 212, 170, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite reverse;
}

.spinner-dot {
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 50%;
  transform-origin: bottom center;
}

.spinner-dot span {
  position: absolute;
  top: 10%;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: rgba(0, 212, 170, 1);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
}

/* Pulse loader */
.loader-pulse {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.pulse-circle {
  width: 30%;
  height: 30%;
  background-color: rgba(0, 212, 170, 0.8);
  border-radius: 50%;
  margin: 0 5%;
  animation: pulse-scale 1.5s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%, 100% { transform: scale(0.3); opacity: 0.3; }
  50% { transform: scale(1); opacity: 1; }
}

/* Bars loader */
.loader-bars {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 4px;
}

.loader-bars .bar {
  width: 15%;
  height: 70%;
  background-color: rgba(0, 212, 170, 0.8);
  border-radius: 3px;
  animation: bar-height 1s ease-in-out infinite;
}

@keyframes bar-height {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* Dots loader */
.loader-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 6px;
}

.loader-dots .dot {
  width: 25%;
  height: 25%;
  background-color: rgba(0, 212, 170, 0.8);
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite;
}

@keyframes dot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* Logo loader */
.loader-logo {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  position: relative;
  z-index: 2;
  animation: logo-pulse 2s ease-in-out infinite alternate, logo-spin 4s linear infinite;
}

.logo-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 170, 0.5) 0%, rgba(0, 212, 170, 0) 70%);
  animation: logo-ripple 2s ease-in-out infinite;
}

@keyframes logo-pulse {
  0% { transform: scale(0.9); }
  100% { transform: scale(1.1); }
}

@keyframes logo-ripple {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

@keyframes logo-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading dots animation for text */
.loading-dots {
  display: inline-flex;
  margin-left: 4px;
}

.loading-dots .dot {
  width: 6px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  margin: 0 2px;
  display: inline-block;
  animation: dot-fade 1.4s ease-in-out infinite;
}

@keyframes dot-fade {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
</style>
