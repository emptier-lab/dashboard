<template>
  <div class="notifications-container">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      location="bottom end"
      offset="8"
      transition="scale-transition"
      max-width="400"
    >
      <template #activator="{ props }">
        <v-badge
          :content="unreadCount"
          :value="unreadCount > 0"
          color="error"
          overlap
          class="notification-badge"
        >
          <v-btn
            v-bind="props"
            icon
            variant="text"
            @click="checkForWatchlistReminders"
          >
            <v-icon :icon="unreadCount > 0 ? 'mdi-bell-ring' : 'mdi-bell-outline'" />
          </v-btn>
        </v-badge>
      </template>

      <v-card class="notifications-card">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Notifications</span>
          <v-btn
            v-if="notifications.length > 0"
            size="small"
            variant="text"
            @click="markAllAsRead"
          >
            Mark all read
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-list v-if="notifications.length > 0" class="notification-list">
          <v-list-item
            v-for="notification in notifications"
            :key="notification.id"
            :value="notification"
            class="notification-item"
            :class="{ 'notification-unread': !notification.read }"
          >
            <template #prepend>
              <v-avatar
                :color="getNotificationColor(notification.type)"
                size="36"
                class="mr-3"
              >
                <v-icon :icon="getNotificationIcon(notification.type)" color="white" />
              </v-avatar>
            </template>

            <v-list-item-title class="notification-title">
              {{ notification.message }}
            </v-list-item-title>

            <v-list-item-subtitle class="notification-time">
              {{ formatTimeAgo(notification.timestamp) }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                v-if="notification.actionPath"
                size="small"
                variant="text"
                color="primary"
                @click="handleAction(notification)"
              >
                View
              </v-btn>
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                @click="dismissNotification(notification.id)"
              />
            </template>
          </v-list-item>
        </v-list>

        <div v-else class="empty-notifications">
          <v-icon icon="mdi-bell-sleep" size="48" color="grey" />
          <p>No new notifications</p>
        </div>
      </v-card>
    </v-menu>

    <!-- Snackbar for new notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template #actions>
        <v-btn
          v-if="snackbar.action"
          color="white"
          text
          @click="handleSnackbarAction"
        >
          {{ snackbar.actionText }}
        </v-btn>
        <v-btn
          color="white"
          text
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { localStorageService } from '@/services/localStorage'

export default {
  name: 'Notifications',
  setup() {
    const router = useRouter()
    const menu = ref(false)
    const notifications = ref([])
    const snackbar = ref({
      show: false,
      text: '',
      color: 'info',
      timeout: 5000,
      action: null,
      actionText: 'View'
    })

    const checkInterval = ref(null)
    const REMINDER_CHECK_INTERVAL = 60000 // Check every minute

    // Load notifications from localStorage
    const loadNotifications = () => {
      notifications.value = localStorageService.getNotifications()
    }

    // Computed property for unread count
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })

    // Check for watchlist reminders and create notifications
    const checkForWatchlistReminders = () => {
      const reminders = localStorageService.getWatchlistReminders()

      reminders.forEach(item => {
        // Create a notification for each reminder
        const message = `Time to watch "${item.title || item.name}"! It's been in your watchlist since ${formatDate(item.addedDate)}.`

        const notification = localStorageService.addNotification(
          message,
          'reminder',
          0, // Don't auto-dismiss
        )

        if (notification) {
          // Add action path to notification
          notification.actionPath = `/${item.media_type}/${item.id}`

          // Mark item as notified in watchlist
          localStorageService.markAsNotified(item.id, item.media_type)

          // Show snackbar for the newest reminder
          if (reminders.indexOf(item) === 0) {
            showReminderSnackbar(item, notification.id)
          }

          // Refresh notifications list
          loadNotifications()
        }
      })
    }

    // Show reminder snackbar
    const showReminderSnackbar = (item, notificationId) => {
      snackbar.value = {
        show: true,
        text: `Time to watch "${item.title || item.name}"!`,
        color: 'info',
        timeout: 8000,
        action: () => {
          router.push(`/${item.media_type}/${item.id}`)
          markNotificationAsRead(notificationId)
        },
        actionText: 'Watch Now'
      }
    }

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date)
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
        return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`
      } else if (diffHour > 0) {
        return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`
      } else if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`
      } else {
        return 'Just now'
      }
    }

    // Get notification color based on type
    const getNotificationColor = (type) => {
      switch (type) {
        case 'error':
          return 'error'
        case 'warning':
          return 'warning'
        case 'success':
          return 'success'
        case 'reminder':
          return 'primary'
        default:
          return 'info'
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

    // Handle notification action
    const handleAction = (notification) => {
      if (notification.actionPath) {
        router.push(notification.actionPath)
      }
      markNotificationAsRead(notification.id)
      menu.value = false
    }

    // Handle snackbar action
    const handleSnackbarAction = () => {
      if (snackbar.value.action) {
        snackbar.value.action()
      }
      snackbar.value.show = false
    }

    // Mark notification as read
    const markNotificationAsRead = (id) => {
      localStorageService.markNotificationAsRead(id)
      loadNotifications()
    }

    // Mark all notifications as read
    const markAllAsRead = () => {
      notifications.value.forEach(notification => {
        if (!notification.read) {
          markNotificationAsRead(notification.id)
        }
      })
    }

    // Dismiss notification
    const dismissNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id)
      const allNotifications = localStorageService.getNotifications()
      const updatedNotifications = allNotifications.filter(n => n.id !== id)
      localStorage.setItem('empty-tv-notifications', JSON.stringify(updatedNotifications))
    }

    // Start periodic reminder check
    const startReminderCheck = () => {
      // Check immediately on load
      checkForWatchlistReminders()

      // Then set up interval
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
      menu,
      notifications,
      unreadCount,
      snackbar,
      loadNotifications,
      checkForWatchlistReminders,
      formatTimeAgo,
      getNotificationColor,
      getNotificationIcon,
      handleAction,
      handleSnackbarAction,
      markNotificationAsRead,
      markAllAsRead,
      dismissNotification
    }
  }
}
</script>

<style scoped>
.notifications-container {
  position: relative;
}

.notification-badge {
  cursor: pointer;
}

.notifications-card {
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--glass-effect);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.notification-list {
  overflow-y: auto;
  max-height: 320px;
}

.notification-item {
  border-left: 3px solid transparent;
  transition: background-color 0.2s ease;
  margin-bottom: 4px;
}

.notification-unread {
  border-left-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.08);
}

.notification-title {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-secondary);
  text-align: center;
}

.empty-notifications p {
  margin-top: 12px;
  font-size: 0.9rem;
}
</style>
