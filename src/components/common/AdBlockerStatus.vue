<template>
  <div v-if="showStatus" class="adblocker-status">
    <v-card
      class="adblocker-card"
      elevation="4"
      :class="{ 'minimized': isMinimized }"
    >
      <v-card-text class="pa-3">
        <div class="adblocker-header" @click="toggleMinimize">
          <div class="status-info">
            <v-icon
              icon="mdi-shield-check"
              color="success"
              size="small"
              class="mr-2"
            />
            <span class="status-text">AdBlocker Active</span>
          </div>

          <div class="status-actions">
            <v-btn
              :icon="isMinimized ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              variant="text"
              size="x-small"
              class="toggle-btn"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              size="x-small"
              @click.stop="hideStatus"
              class="close-btn"
            />
          </div>
        </div>

        <div v-if="!isMinimized" class="adblocker-details">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ stats.blockedAds }}</div>
              <div class="stat-label">Ads Blocked</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.blockedTrackers }}</div>
              <div class="stat-label">Trackers Blocked</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.blockedRequests }}</div>
              <div class="stat-label">Requests Blocked</div>
            </div>
          </div>

          <div class="protection-info">
            <v-chip
              color="success"
              size="small"
              variant="tonal"
              class="protection-chip"
            >
              <v-icon icon="mdi-shield-check" size="x-small" class="mr-1" />
              Full Protection Active
            </v-chip>

            <div class="protection-features">
              <div class="feature-item">
                <v-icon icon="mdi-check-circle" color="success" size="small" />
                <span>Pop-up Blocker</span>
              </div>
              <div class="feature-item">
                <v-icon icon="mdi-check-circle" color="success" size="small" />
                <span>Tracking Protection</span>
              </div>
              <div class="feature-item">
                <v-icon icon="mdi-check-circle" color="success" size="small" />
                <span>Mobile Optimized</span>
              </div>
            </div>
          </div>

          <div class="adblocker-controls">
            <v-btn
              :color="adBlocker?.isEnabled ? 'error' : 'success'"
              variant="outlined"
              size="small"
              @click="toggleAdBlocker"
              class="control-btn"
            >
              <v-icon
                :icon="adBlocker?.isEnabled ? 'mdi-pause' : 'mdi-play'"
                size="small"
                class="mr-1"
              />
              {{ adBlocker?.isEnabled ? 'Pause' : 'Resume' }}
            </v-btn>

            <v-btn
              variant="outlined"
              size="small"
              @click="showStats"
              class="control-btn"
            >
              <v-icon icon="mdi-chart-line" size="small" class="mr-1" />
              Stats
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Floating mini indicator when hidden -->
    <div v-if="!showStatus && showFloatingIndicator" class="floating-indicator" @click="showStatus = true">
      <v-tooltip text="AdBlocker Active - Click to show details" location="left">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-shield-check"
            color="success"
            size="small"
            variant="flat"
            class="floating-btn"
          />
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { adBlocker } from '@/services/adblocker'

export default {
  name: 'AdBlockerStatus',
  props: {
    autoHide: {
      type: Boolean,
      default: true
    },
    autoHideDelay: {
      type: Number,
      default: 10000 // 10 seconds
    },
    showFloating: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const showStatus = ref(true)
    const isMinimized = ref(false)
    const showFloatingIndicator = ref(false)
    const stats = reactive({
      blockedAds: 0,
      blockedTrackers: 0,
      blockedRequests: 0
    })

    let autoHideTimer = null
    let statsUpdateInterval = null

    function updateStats() {
      if (adBlocker) {
        const currentStats = adBlocker.getStats()
        stats.blockedAds = currentStats.blockedAds
        stats.blockedTrackers = currentStats.blockedTrackers
        stats.blockedRequests = currentStats.blockedRequests
      }
    }

    function toggleMinimize() {
      isMinimized.value = !isMinimized.value
      if (autoHideTimer) {
        clearTimeout(autoHideTimer)
        startAutoHideTimer()
      }
    }

    function hideStatus() {
      showStatus.value = false
      if (props.showFloating) {
        showFloatingIndicator.value = true
      }
    }

    function toggleAdBlocker() {
      if (adBlocker) {
        if (adBlocker.isEnabled) {
          adBlocker.disable()
        } else {
          adBlocker.enable()
        }
      }
    }

    function showStats() {
      if (adBlocker) {
        const currentStats = adBlocker.showStats()
        console.log('AdBlocker Statistics:', currentStats)

        // Show notification with stats
        const message = `Blocked: ${currentStats.blockedAds} ads, ${currentStats.blockedTrackers} trackers, ${currentStats.blockedRequests} requests`

        // You could emit an event here to show a toast notification
        // emit('show-notification', { message, type: 'info' })
      }
    }

    function startAutoHideTimer() {
      if (props.autoHide && !isMinimized.value) {
        autoHideTimer = setTimeout(() => {
          isMinimized.value = true

          // Hide completely after another delay
          setTimeout(() => {
            hideStatus()
          }, 5000)
        }, props.autoHideDelay)
      }
    }

    onMounted(() => {
      // Update stats immediately
      updateStats()

      // Update stats every 2 seconds
      statsUpdateInterval = setInterval(updateStats, 2000)

      // Start auto-hide timer
      startAutoHideTimer()
    })

    onUnmounted(() => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer)
      }
      if (statsUpdateInterval) {
        clearInterval(statsUpdateInterval)
      }
    })

    return {
      showStatus,
      isMinimized,
      showFloatingIndicator,
      stats,
      adBlocker,
      toggleMinimize,
      hideStatus,
      toggleAdBlocker,
      showStats
    }
  }
}
</script>

<style scoped>
.adblocker-status {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  max-width: 300px;
}

.adblocker-card {
  background: rgba(0, 0, 0, 0.9) !important;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.adblocker-card.minimized {
  transform: scale(0.95);
}

.adblocker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.status-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.status-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4CAF50;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toggle-btn,
.close-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.toggle-btn:hover,
.close-btn:hover {
  opacity: 1;
}

.adblocker-details {
  margin-top: 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: #4CAF50;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
}

.protection-info {
  margin-bottom: 16px;
}

.protection-chip {
  margin-bottom: 12px;
}

.protection-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.adblocker-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  flex: 1;
  font-size: 0.75rem !important;
}

.floating-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9998;
}

.floating-btn {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.6);
  }
  100% {
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .adblocker-status {
    top: 60px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-number {
    font-size: 1rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .protection-features {
    gap: 4px;
  }

  .feature-item {
    font-size: 0.75rem;
  }

  .floating-indicator {
    bottom: 15px;
    right: 15px;
  }
}

@media (max-width: 480px) {
  .adblocker-status {
    top: 50px;
  }

  .adblocker-card {
    border-radius: 8px !important;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .adblocker-controls {
    flex-direction: column;
    gap: 6px;
  }

  .control-btn {
    width: 100%;
  }
}
</style>
