<template>
  <div class="side-notifications">
    <transition-group name="notification" tag="div" class="notifications-list">
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        class="notification-toast"
        :class="[`notification-toast--${notification.type}`]"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <v-icon :icon="getNotificationIcon(notification.type)" />
          </div>
          <div class="notification-text">
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTimeAgo(notification.timestamp) }}</div>
          </div>
          <div class="notification-actions">
            <v-btn
              v-if="notification.actionPath"
              size="small"
              variant="text"
              color="white"
              @click.stop="handleAction(notification)"
            >
              View
            </v-btn>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="white"
              @click.stop="dismissNotification(notification.id)"
            />
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { localStorageService } from '@/services/localStorage'

export default {
  name: 'SideNotifications',
  setup() {
    const router = useRouter()
    const notifications = ref([])
    const checkInterval = ref(null)
    const REMINDER_CHECK_INTERVAL = 60000 // Check every minute
    const MAX_VISIBLE_NOTIFICATIONS = 5

    // Load notifications from localStorage
    const loadNotifications = () => {
      notifications.value = localStorageService.getNotifications()
    }

    // Get only unread notifications for display
    const visibleNotifications = computed(() => {
      return notifications.value
        .filter(n => !n.read)
        .slice(0, MAX_VISIBLE_NOTIFICATIONS)
    })

    // Check for watchlist reminders and create notifications
    const checkForWatchlistReminders = () => {
      const reminders = localStorageService.getWatchlistReminders()

      reminders.forEach(item => {
        const message = `Time to watch "${item.title || item.name}"!`

        const notification = localStorageService.addNotification(
          message,
          'reminder',
          0
        )

        if (notification) {
          notification.actionPath = `/${item.media_type}/${item.id}`
          localStorageService.markAsNotified(item.id, item.media_type)
          loadNotifications()
        }
      })
    }

    // Format time ago
    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)

      if (diffDay > 0) {
        return diffDay === 1 ? '1d' : `${diffDay}d`
      } else if (diffHour > 0) {
        return `${diffHour}h`
      } else if (diffMin > 0) {
        return `${diffMin}m`
      } else {
        return 'now'
      }
    }

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'error':
          return 'mdi-alert-circle'
        case 'warning':
          return 'mdi-alert'
        case 'success':
          return 'mdi-check-circle'
        case 'reminder':
          return 'mdi-calendar-clock'
        default:
          return 'mdi-information'
      }
    }

    // Handle notification click
    const handleNotificationClick = (notification) => {
      markNotificationAsRead(notification.id)
    }

    // Handle notification action
    const handleAction = (notification) => {
      if (notification.actionPath) {
        router.push(notification.actionPath)
      }
      markNotificationAsRead(notification.id)
    }

    // Mark notification as read
    const markNotificationAsRead = (id) => {
      localStorageService.markNotificationAsRead(id)
      loadNotifications()
    }

    // Dismiss notification
    const dismissNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id)
      const allNotifications = localStorageService.getNotifications()
      const updatedNotifications = allNotifications.filter(n => n.id !== id)
      localStorage.setItem('empty-tv-notifications', JSON.stringify(updatedNotifications))
      loadNotifications()
    }

    // Start periodic reminder check
    const startReminderCheck = () => {
      checkForWatchlistReminders()
      checkInterval.value = setInterval(() => {
        checkForWatchlistReminders()
      }, REMINDER_CHECK_INTERVAL)
    }

    // Stop reminder check
    const stopReminderCheck = () => {
      if (checkInterval.value) {
        clearInterval(checkInterval.value)
      }
    }

    // Handle storage events from other tabs
    const handleStorageChange = (event) => {
      if (event.key === 'empty-tv-notifications' || event.key === 'empty-tv-watchlist') {
        loadNotifications()
      }
    }

    onMounted(() => {
      loadNotifications()
      startReminderCheck()
      window.addEventListener('storage', handleStorageChange)
    })

    onBeforeUnmount(() => {
      stopReminderCheck()
      window.removeEventListener('storage', handleStorageChange)
    })

    return {
      visibleNotifications,
      formatTimeAgo,
      getNotificationIcon,
      handleNotificationClick,
      handleAction,
      dismissNotification
    }
  }
}
</script>

<style scoped>
.side-notifications {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notification-toast {
  background: rgba(26, 29, 41, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  max-width: 380px;
  min-width: 320px;
}

.notification-toast:hover {
  transform: translateX(-8px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.notification-toast--error {
  border-left: 4px solid #ff6b6b;
}

.notification-toast--warning {
  border-left: 4px solid #ffd43b;
}

.notification-toast--success {
  border-left: 4px solid #51cf66;
}

.notification-toast--reminder {
  border-left: 4px solid #667eea;
}

.notification-toast--info {
  border-left: 4px solid #74c0fc;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-message {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.notification-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.notification-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (max-width: 768px) {
  .side-notifications {
    top: 80px;
    right: 16px;
    left: 16px;
  }

  .notifications-list {
    max-width: none;
  }

  .notification-toast {
    min-width: auto;
    max-width: none;
  }

  .notification-content {
    gap: 8px;
  }

  .notification-message {
    font-size: 0.8rem;
  }
}
</style>
