// Local Storage Service
// Provides utilities to manage favorites and watchlist using browser's localStorage

export class LocalStorageService {
  constructor() {
    this.favoriteKey = 'empty-tv-favorites';
    this.watchlistKey = 'empty-tv-watchlist';
    this.recentlyWatchedKey = 'empty-tv-recently-watched';
    this.maxRecentlyWatched = 20;
  }

  // Favorites Methods
  getFavorites() {
    try {
      const data = localStorage.getItem(this.favoriteKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  addToFavorites(item) {
    try {
      if (!item || !item.id) {
        console.error('Invalid item to add to favorites');
        return false;
      }

      const favorites = this.getFavorites();

      // Check if already exists
      if (favorites.some(fav => fav.id === item.id && fav.media_type === item.media_type)) {
        return false; // Already in favorites
      }

      // Add to favorites
      favorites.push(item);
      localStorage.setItem(this.favoriteKey, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  removeFromFavorites(id, mediaType) {
    try {
      const favorites = this.getFavorites();
      const filteredFavorites = favorites.filter(
        item => !(item.id === id && item.media_type === mediaType)
      );

      if (filteredFavorites.length === favorites.length) {
        return false; // Item wasn't in favorites
      }

      localStorage.setItem(this.favoriteKey, JSON.stringify(filteredFavorites));
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  isFavorite(id, mediaType) {
    try {
      const favorites = this.getFavorites();
      return favorites.some(item => item.id === id && item.media_type === mediaType);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  toggleFavorite(item) {
    if (!item || !item.id) return false;

    const mediaType = item.media_type || 'movie';

    if (this.isFavorite(item.id, mediaType)) {
      return this.removeFromFavorites(item.id, mediaType);
    } else {
      // Ensure the item has media_type
      const itemToAdd = { ...item, media_type: mediaType };
      return this.addToFavorites(itemToAdd);
    }
  }

  // Watchlist Methods
  getWatchlist() {
    try {
      const data = localStorage.getItem(this.watchlistKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  addToWatchlist(item) {
    try {
      if (!item || !item.id) {
        console.error('Invalid item to add to watchlist');
        return false;
      }

      const watchlist = this.getWatchlist();

      // Check if already exists
      if (watchlist.some(w => w.id === item.id && w.media_type === item.media_type)) {
        return false; // Already in watchlist
      }

      // Add to watchlist
      watchlist.push(item);
      localStorage.setItem(this.watchlistKey, JSON.stringify(watchlist));
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  removeFromWatchlist(id, mediaType) {
    try {
      const watchlist = this.getWatchlist();
      const filteredWatchlist = watchlist.filter(
        item => !(item.id === id && item.media_type === mediaType)
      );

      if (filteredWatchlist.length === watchlist.length) {
        return false; // Item wasn't in watchlist
      }

      localStorage.setItem(this.watchlistKey, JSON.stringify(filteredWatchlist));
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  isInWatchlist(id, mediaType) {
    try {
      const watchlist = this.getWatchlist();
      return watchlist.some(item => item.id === id && item.media_type === mediaType);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
      return false;
    }
  }

  toggleWatchlist(item) {
    if (!item || !item.id) return false;

    const mediaType = item.media_type || 'movie';

    if (this.isInWatchlist(item.id, mediaType)) {
      return this.removeFromWatchlist(item.id, mediaType);
    } else {
      // Ensure the item has media_type
      const itemToAdd = { ...item, media_type: mediaType };
      return this.addToWatchlist(itemToAdd);
    }
  }

  // Recently Watched Methods
  getRecentlyWatched() {
    try {
      const data = localStorage.getItem(this.recentlyWatchedKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting recently watched:', error);
      return [];
    }
  }

  addToRecentlyWatched(item, season = null, episode = null) {
    try {
      if (!item || !item.id) {
        console.error('Invalid item to add to recently watched');
        return false;
      }

      const recentlyWatched = this.getRecentlyWatched();

      // Create the entry with watch info
      const mediaType = item.media_type || 'movie';
      const entry = {
        ...item,
        media_type: mediaType,
        lastWatched: new Date().toISOString(),
        watchProgress: 0
      };

      // Add TV show specific info
      if (mediaType === 'tv' && season !== null && episode !== null) {
        entry.season = season;
        entry.episode = episode;
      }

      // Remove if already exists
      const filteredRecent = recentlyWatched.filter(
        r => !(r.id === item.id && r.media_type === mediaType)
      );

      // Add to the beginning of the array
      filteredRecent.unshift(entry);

      // Limit the array size
      const limitedRecent = filteredRecent.slice(0, this.maxRecentlyWatched);

      localStorage.setItem(this.recentlyWatchedKey, JSON.stringify(limitedRecent));
      return true;
    } catch (error) {
      console.error('Error adding to recently watched:', error);
      return false;
    }
  }

  clearData() {
    try {
      localStorage.removeItem(this.favoriteKey);
      localStorage.removeItem(this.watchlistKey);
      localStorage.removeItem(this.recentlyWatchedKey);
      return true;
    } catch (error) {
      console.error('Error clearing local storage data:', error);
      return false;
    }
  }
}

// Create and export instance
export const localStorageService = new LocalStorageService();

export default localStorageService;
