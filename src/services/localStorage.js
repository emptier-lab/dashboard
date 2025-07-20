// Local Storage Service
// Provides utilities to manage favorites and watchlist using browser's localStorage

export class LocalStorageService {
  constructor() {
    this.favoriteKey = "empty-tv-favorites";
    this.watchlistKey = "empty-tv-watchlist";
    this.recentlyWatchedKey = "empty-tv-recently-watched";
    this.notificationsKey = "empty-tv-notifications";
    this.maxRecentlyWatched = 20;
    this.maxNotifications = 10;
    this.reminderDays = 3; // Remind after 3 days
  }

  // Favorites Methods
  getFavorites() {
    try {
      const data = localStorage.getItem(this.favoriteKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  addToFavorites(item) {
    try {
      if (!item || !item.id) {
        console.error("Invalid item to add to favorites");
        return false;
      }

      const favorites = this.getFavorites();

      // Check if already exists
      if (
        favorites.some(
          (fav) => fav.id === item.id && fav.media_type === item.media_type,
        )
      ) {
        return false; // Already in favorites
      }

      // Ensure the item has required fields
      const enrichedItem = {
        ...item,
        title: item.title || item.name || "Unknown Title",
        name: item.name || item.title || "Unknown Title",
        id: Number(item.id) || item.id, // Ensure ID is a number if possible
        media_type: item.media_type || "movie",
        added_date: new Date().toISOString(),
      };

      // Add to favorites
      favorites.push(enrichedItem);
      localStorage.setItem(this.favoriteKey, JSON.stringify(favorites));

      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    }
  }

  removeFromFavorites(id, mediaType) {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(
        (item) => !(item.id === id && item.media_type === mediaType),
      );

      if (filteredFavorites.length === favorites.length) {
        return false; // Item wasn't in favorites
      }

      localStorage.setItem(this.favoriteKey, JSON.stringify(filteredFavorites));

      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    }
  }

  isFavorite(id, mediaType) {
    try {
      const favorites = this.getFavorites();
      return favorites.some(
        (item) => item.id === id && item.media_type === mediaType,
      );
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  toggleFavorite(item) {
    if (!item || !item.id) return false;

    const mediaType = item.media_type || "movie";

    if (this.isFavorite(item.id, mediaType)) {
      return this.removeFromFavorites(item.id, mediaType);
    } else {
      // Ensure the item has media_type and required fields
      const itemToAdd = {
        ...item,
        media_type: mediaType,
        title: item.title || item.name || "Unknown Title",
        name: item.name || item.title || "Unknown Title",
      };
      return this.addToFavorites(itemToAdd);
    }
  }

  // Watchlist Methods
  getWatchlist() {
    try {
      const data = localStorage.getItem(this.watchlistKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting watchlist:", error);
      return [];
    }
  }

  addToWatchlist(item, reminderDate = null) {
    try {
      if (!item || !item.id) {
        console.error("Invalid item to add to watchlist");
        return false;
      }

      const watchlist = this.getWatchlist();

      // Check if already exists
      if (
        watchlist.some(
          (w) => w.id === item.id && w.media_type === item.media_type,
        )
      ) {
        return false; // Already in watchlist
      }

      // Ensure the item has required fields
      const enrichedItem = {
        ...item,
        title: item.title || item.name || "Unknown Title",
        name: item.name || item.title || "Unknown Title",
        id: Number(item.id) || item.id, // Ensure ID is a number if possible
        media_type: item.media_type || "movie",
        added_date: new Date().toISOString(),
      };

      // Set default watch-by date if not provided (current date + reminderDays)
      const watchByDate =
        reminderDate ||
        new Date(
          Date.now() + this.reminderDays * 24 * 60 * 60 * 1000,
        ).toISOString();

      // Add to watchlist with date information
      const itemWithDate = {
        ...enrichedItem,
        addedDate: new Date().toISOString(),
        watchByDate: watchByDate,
        notified: false,
      };

      watchlist.push(itemWithDate);
      localStorage.setItem(this.watchlistKey, JSON.stringify(watchlist));

      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      return false;
    }
  }

  removeFromWatchlist(id, mediaType) {
    try {
      const watchlist = this.getWatchlist();
      const filteredWatchlist = watchlist.filter(
        (item) => !(item.id === id && item.media_type === mediaType),
      );

      if (filteredWatchlist.length === watchlist.length) {
        return false; // Item wasn't in watchlist
      }

      localStorage.setItem(
        this.watchlistKey,
        JSON.stringify(filteredWatchlist),
      );

      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      return false;
    }
  }

  isInWatchlist(id, mediaType) {
    try {
      const watchlist = this.getWatchlist();
      return watchlist.some(
        (item) => item.id === id && item.media_type === mediaType,
      );
    } catch (error) {
      console.error("Error checking watchlist status:", error);
      return false;
    }
  }

  toggleWatchlist(item) {
    if (!item || !item.id) return false;

    const mediaType = item.media_type || "movie";

    if (this.isInWatchlist(item.id, mediaType)) {
      return this.removeFromWatchlist(item.id, mediaType);
    } else {
      // Ensure the item has media_type and required fields
      const itemToAdd = {
        ...item,
        media_type: mediaType,
        title: item.title || item.name || "Unknown Title",
        name: item.name || item.title || "Unknown Title",
      };
      return this.addToWatchlist(itemToAdd);
    }
  }

  // Recently Watched Methods
  getRecentlyWatched() {
    try {
      const data = localStorage.getItem(this.recentlyWatchedKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting recently watched:", error);
      return [];
    }
  }

  addToRecentlyWatched(item, season = null, episode = null) {
    try {
      if (!item || !item.id) {
        console.error("Invalid item to add to recently watched");
        return false;
      }

      const recentlyWatched = this.getRecentlyWatched();

      // Create the entry with watch info
      const mediaType = item.media_type || "movie";
      const entry = {
        ...item,
        media_type: mediaType,
        lastWatched: new Date().toISOString(),
        watchProgress: 0,
      };

      // Add TV show specific info
      if (mediaType === "tv" && season !== null && episode !== null) {
        entry.season = season;
        entry.episode = episode;
      }

      // Remove if already exists
      const filteredRecent = recentlyWatched.filter(
        (r) => !(r.id === item.id && r.media_type === mediaType),
      );

      // Add to the beginning of the array
      filteredRecent.unshift(entry);

      // Limit the array size
      const limitedRecent = filteredRecent.slice(0, this.maxRecentlyWatched);

      localStorage.setItem(
        this.recentlyWatchedKey,
        JSON.stringify(limitedRecent),
      );
      return true;
    } catch (error) {
      console.error("Error adding to recently watched:", error);
      return false;
    }
  }

  // Get notifications for watchlist items past their watch-by date
  getWatchlistReminders() {
    try {
      const watchlist = this.getWatchlist();
      const today = new Date();

      // Find items that are past their watch-by date and not notified yet
      const reminders = watchlist.filter((item) => {
        if (!item.watchByDate || item.notified) return false;

        const watchByDate = new Date(item.watchByDate);
        return watchByDate <= today;
      });

      return reminders;
    } catch (error) {
      console.error("Error getting watchlist reminders:", error);
      return [];
    }
  }

  // Mark an item as notified
  markAsNotified(id, mediaType) {
    try {
      const watchlist = this.getWatchlist();
      const updated = watchlist.map((item) => {
        if (item.id === id && item.media_type === mediaType) {
          return { ...item, notified: true };
        }
        return item;
      });

      localStorage.setItem(this.watchlistKey, JSON.stringify(updated));

      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Error marking item as notified:", error);
      return false;
    }
  }

  // Update the watch-by date for an item
  updateWatchByDate(id, mediaType, newDate) {
    try {
      const watchlist = this.getWatchlist();
      const updated = watchlist.map((item) => {
        if (item.id === id && item.media_type === mediaType) {
          return {
            ...item,
            watchByDate: newDate.toISOString(),
            notified: false,
          };
        }
        return item;
      });

      localStorage.setItem(this.watchlistKey, JSON.stringify(updated));

      // Dispatch a custom event to notify components
      window.dispatchEvent(new Event("storage"));

      return true;
    } catch (error) {
      console.error("Error updating watch-by date:", error);
      return false;
    }
  }

  // Add a notification
  addNotification(message, type = "info", duration = 5000) {
    try {
      const notifications = JSON.parse(
        localStorage.getItem(this.notificationsKey) || "[]",
      );

      const notification = {
        id: Date.now(),
        message,
        type,
        duration,
        timestamp: new Date().toISOString(),
        read: false,
      };

      notifications.unshift(notification);

      // Limit to max notifications
      const limitedNotifications = notifications.slice(
        0,
        this.maxNotifications,
      );

      localStorage.setItem(
        this.notificationsKey,
        JSON.stringify(limitedNotifications),
      );
      return notification;
    } catch (error) {
      console.error("Error adding notification:", error);
      return null;
    }
  }

  // Get all notifications
  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(this.notificationsKey) || "[]");
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  }

  // Mark notification as read
  markNotificationAsRead(notificationId) {
    try {
      const notifications = this.getNotifications();
      const updated = notifications.map((notification) => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });

      localStorage.setItem(this.notificationsKey, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  clearData() {
    try {
      localStorage.removeItem(this.favoriteKey);
      localStorage.removeItem(this.watchlistKey);
      localStorage.removeItem(this.recentlyWatchedKey);
      localStorage.removeItem(this.notificationsKey);
      return true;
    } catch (error) {
      console.error("Error clearing local storage data:", error);
      return false;
    }
  }
}

// Create and export instance
export const localStorageService = new LocalStorageService();

export default localStorageService;
