// TMDB API Service
// Handles all interactions with The Movie Database API

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
// FORCE CACHE INVALIDATION - API key must be ac014b130a8e6344c91dff4e68b18d47
const API_KEY = "ac014b130a8e6344c91dff4e68b18d47";
const FORCE_API_KEY = "ac014b130a8e6344c91dff4e68b18d47";

class TMDBService {
  constructor() {
    this.baseURL = TMDB_BASE_URL;
    this.imageBaseURL = TMDB_IMAGE_BASE_URL;
    this.apiKey = FORCE_API_KEY; // MUST BE ac014b130a8e6344c91dff4e68b18d47
    // CRITICAL DEBUG: Log API key to console to verify it's correct
    console.log("CRITICAL - TMDB API Key being used:", this.apiKey);
    console.log(
      "CRITICAL - API Key should end in 47:",
      this.apiKey.endsWith("47"),
    );
  }

  // Helper method to make API requests
  async makeRequest(endpoint, params = {}, retryCount = 0) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    // FORCE USE OF CORRECT API KEY - ac014b130a8e6344c91dff4e68b18d47
    url.searchParams.append("api_key", "ac014b130a8e6344c91dff4e68b18d47");

    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    // CRITICAL DEBUG: Log the exact URL being called
    console.log("CRITICAL - TMDB API Request URL:", url.toString());
    console.log(
      "CRITICAL - API Key in URL should be ac014b130a8e6344c91dff4e68b18d47",
    );
    console.log(
      "CRITICAL - URL contains correct key:",
      url.toString().includes("ac014b130a8e6344c91dff4e68b18d47"),
    );

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // Check if we should retry rate limited requests
        if (response.status === 429 && retryCount < 3) {
          console.warn(`Rate limited, retrying (${retryCount + 1}/3)...`);
          const retryAfter = response.headers.get("Retry-After") || 2;
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
          return this.makeRequest(endpoint, params, retryCount + 1);
        }

        throw new Error(
          `TMDB API error: ${response.status} - ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Log debugging info for pagination
      if (data.page && data.total_pages) {
        console.log(
          `TMDB Pagination: Page ${data.page}/${data.total_pages}, Total results: ${data.total_results}`,
        );
      }

      return data;
    } catch (error) {
      console.error("TMDB API Error:", error);
      // Retry network errors
      if (error.name === "TypeError" && retryCount < 3) {
        console.warn(`Network error, retrying (${retryCount + 1}/3)...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.makeRequest(endpoint, params, retryCount + 1);
      }
      throw error;
    }
  }

  // Get trending movies/TV shows
  async getTrending(mediaType = "all", timeWindow = "day", page = 1) {
    return this.makeRequest(`/trending/${mediaType}/${timeWindow}`, { page });
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    return this.makeRequest("/movie/popular", { page });
  }

  // Get popular TV shows
  async getPopularTV(page = 1) {
    return this.makeRequest("/tv/popular", { page });
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    return this.makeRequest("/movie/top_rated", { page });
  }

  // Get top rated TV shows
  async getTopRatedTV(page = 1) {
    return this.makeRequest("/tv/top_rated", { page });
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1) {
    return this.makeRequest("/movie/upcoming", { page });
  }

  // Get now playing movies
  async getNowPlayingMovies(page = 1) {
    return this.makeRequest("/movie/now_playing", { page });
  }

  // Get airing today TV shows
  async getAiringTodayTV(page = 1) {
    return this.makeRequest("/tv/airing_today", { page });
  }

  // Get on the air TV shows
  async getOnTheAirTV(page = 1) {
    return this.makeRequest("/tv/on_the_air", { page });
  }

  // Get movie details
  async getMovieDetails(
    movieId,
    appendToResponse = "credits,videos,similar,recommendations",
  ) {
    return this.makeRequest(`/movie/${movieId}`, {
      append_to_response: appendToResponse,
    });
  }

  // Get TV show details
  async getTVDetails(
    tvId,
    appendToResponse = "credits,videos,similar,recommendations",
  ) {
    return this.makeRequest(`/tv/${tvId}`, {
      append_to_response: appendToResponse,
    });
  }

  // Get season details
  async getSeasonDetails(tvId, seasonNumber, appendToResponse = "credits") {
    return this.makeRequest(`/tv/${tvId}/season/${seasonNumber}`, {
      append_to_response: appendToResponse,
    });
  }

  // Get episode details
  async getEpisodeDetails(
    tvId,
    seasonNumber,
    episodeNumber,
    appendToResponse = "credits",
  ) {
    return this.makeRequest(
      `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      { append_to_response: appendToResponse },
    );
  }

  // Search multi (movies, TV shows, people)
  async searchMulti(query, page = 1) {
    return this.makeRequest("/search/multi", { query, page });
  }

  // Search movies
  async searchMovies(query, page = 1, year = null) {
    const params = { query, page };
    if (year) params.year = year;
    return this.makeRequest("/search/movie", params);
  }

  // Search TV shows
  async searchTV(query, page = 1, firstAirDateYear = null) {
    const params = { query, page };
    if (firstAirDateYear) params.first_air_date_year = firstAirDateYear;
    return this.makeRequest("/search/tv", params);
  }

  // Search people
  async searchPeople(query, page = 1) {
    return this.makeRequest("/search/person", { query, page });
  }

  // Get person details
  async getPersonDetails(
    personId,
    appendToResponse = "movie_credits,tv_credits",
  ) {
    return this.makeRequest(`/person/${personId}`, {
      append_to_response: appendToResponse,
    });
  }

  // Get movie genres
  async getMovieGenres() {
    return this.makeRequest("/genre/movie/list");
  }

  // Get TV genres
  async getTVGenres() {
    return this.makeRequest("/genre/tv/list");
  }

  // Discover movies with filters
  async discoverMovies(params = {}) {
    const defaultParams = {
      page: 1,
      sort_by: "popularity.desc",
      include_adult: false,
      include_video: false,
      language: "en-US",
      region: "US",
      with_watch_monetization_types: "flatrate|free|ads|rent|buy",
    };
    console.log("Discover Movies params:", { ...defaultParams, ...params });
    return this.makeRequest("/discover/movie", { ...defaultParams, ...params });
  }

  // Discover TV shows with filters
  async discoverTV(params = {}) {
    const defaultParams = {
      page: 1,
      sort_by: "popularity.desc",
      include_adult: false,
      language: "en-US",
      with_watch_monetization_types: "flatrate|free|ads",
      with_status: 0, // Status to return only shows that are in production (3), planned (2), in production (0) or post production (4)
      with_type: 0, // Filter TV shows by type, available options: 0 = Documentary, 1 = News, 2 = Miniseries, 3 = Reality, 4 = Scripted, 5 = Talk Show, 6 = Video
    };
    console.log("Discover TV params:", { ...defaultParams, ...params });
    return this.makeRequest("/discover/tv", { ...defaultParams, ...params });
  }

  // Get movies by genre
  async getMoviesByGenre(genreId, page = 1) {
    return this.discoverMovies({
      with_genres: genreId,
      page,
      sort_by: "popularity.desc",
      "vote_count.gte": 50, // Ensure some quality by requiring at least 50 votes
    });
  }

  // Get TV shows by genre
  async getTVByGenre(genreId, page = 1) {
    return this.discoverTV({
      with_genres: genreId,
      page,
      sort_by: "popularity.desc",
      "vote_count.gte": 50, // Ensure some quality by requiring at least 50 votes
    });
  }

  // Get all pages of results (use carefully - may hit rate limits)
  async getAllPages(endpoint, params = {}, maxPages = 5) {
    let allResults = [];
    let currentPage = 1;
    let totalPages = 1;

    console.log(`Fetching all pages for ${endpoint} (max: ${maxPages})`);

    do {
      const response = await this.makeRequest(endpoint, {
        ...params,
        page: currentPage,
      });

      if (response.results && response.results.length > 0) {
        allResults = [...allResults, ...response.results];
      }

      totalPages = response.total_pages || 1;
      console.log(`Fetched page ${currentPage}/${totalPages}`);
      currentPage++;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 250));
    } while (currentPage <= totalPages && currentPage <= maxPages);

    return {
      results: allResults,
      page: 1,
      total_pages: totalPages,
      total_results: allResults.length,
    };
  }

  // Get external IDs
  async getMovieExternalIds(movieId) {
    return this.makeRequest(`/movie/${movieId}/external_ids`);
  }

  async getTVExternalIds(tvId) {
    return this.makeRequest(`/tv/${tvId}/external_ids`);
  }

  async getPersonExternalIds(personId) {
    return this.makeRequest(`/person/${personId}/external_ids`);
  }

  // Get configuration
  async getConfiguration() {
    return this.makeRequest("/configuration");
  }
}

// Image service for handling TMDB images
class ImageService {
  constructor() {
    this.baseURL = TMDB_IMAGE_BASE_URL;
  }

  // Get poster URL
  getPosterUrl(posterPath, size = "w500") {
    if (!posterPath) return null;
    return `${this.baseURL}/${size}${posterPath}`;
  }

  // Get backdrop URL
  getBackdropUrl(backdropPath, size = "w1280") {
    if (!backdropPath) return null;
    return `${this.baseURL}/${size}${backdropPath}`;
  }

  // Get profile URL
  getProfileUrl(profilePath, size = "w185") {
    if (!profilePath) return null;
    return `${this.baseURL}/${size}${profilePath}`;
  }

  // Get logo URL
  getLogoUrl(logoPath, size = "w185") {
    if (!logoPath) return null;
    return `${this.baseURL}/${size}${logoPath}`;
  }

  // Get still URL (for episode stills)
  getStillUrl(stillPath, size = "w300") {
    if (!stillPath) return null;
    return `${this.baseURL}/${size}${stillPath}`;
  }

  // Get multiple poster sizes
  getPosterSizes(posterPath) {
    if (!posterPath) return {};
    return {
      small: this.getPosterUrl(posterPath, "w185"),
      medium: this.getPosterUrl(posterPath, "w342"),
      large: this.getPosterUrl(posterPath, "w500"),
      xlarge: this.getPosterUrl(posterPath, "w780"),
      original: this.getPosterUrl(posterPath, "original"),
    };
  }

  // Get multiple backdrop sizes
  getBackdropSizes(backdropPath) {
    if (!backdropPath) return {};
    return {
      small: this.getBackdropUrl(backdropPath, "w300"),
      medium: this.getBackdropUrl(backdropPath, "w780"),
      large: this.getBackdropUrl(backdropPath, "w1280"),
      original: this.getBackdropUrl(backdropPath, "original"),
    };
  }
}

// Utility service for common operations
class UtilsService {
  // Format runtime (minutes to hours and minutes)
  formatRuntime(minutes) {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  // Format date
  formatDate(dateString, options = {}) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const defaultOptions = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
  }

  // Format year from date
  getYear(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  }

  // Format vote average
  formatVoteAverage(voteAverage) {
    if (!voteAverage) return "N/A";
    return Math.round(voteAverage * 10) / 10;
  }

  // Format vote count
  formatVoteCount(voteCount) {
    if (!voteCount) return "0";
    if (voteCount >= 1000000) {
      return `${Math.round(voteCount / 100000) / 10}M`;
    }
    if (voteCount >= 1000) {
      return `${Math.round(voteCount / 100) / 10}K`;
    }
    return voteCount.toString();
  }

  // Get rating color based on vote average
  getRatingColor(voteAverage) {
    if (voteAverage >= 8) return "#4CAF50"; // Green
    if (voteAverage >= 7) return "#8BC34A"; // Light Green
    if (voteAverage >= 6) return "#FFC107"; // Yellow
    if (voteAverage >= 5) return "#FF9800"; // Orange
    return "#F44336"; // Red
  }

  // Get certification color
  getCertificationColor(certification) {
    const colors = {
      G: "#4CAF50",
      PG: "#8BC34A",
      "PG-13": "#FFC107",
      R: "#FF9800",
      "NC-17": "#F44336",
      NR: "#9E9E9E",
      "TV-Y": "#4CAF50",
      "TV-Y7": "#8BC34A",
      "TV-G": "#4CAF50",
      "TV-PG": "#FFC107",
      "TV-14": "#FF9800",
      "TV-MA": "#F44336",
    };
    return colors[certification] || "#9E9E9E";
  }

  // Extract YouTube key from videos
  getTrailerKey(videos) {
    if (!videos || !videos.results) return null;

    const trailer = videos.results.find(
      (video) =>
        video.site === "YouTube" && video.type === "Trailer" && video.official,
    );

    return trailer?.key || videos.results[0]?.key || null;
  }

  // Get YouTube thumbnail
  getYouTubeThumbnail(key, quality = "maxresdefault") {
    if (!key) return null;
    return `https://img.youtube.com/vi/${key}/${quality}.jpg`;
  }

  // Get YouTube URL
  getYouTubeUrl(key) {
    if (!key) return null;
    return `https://www.youtube.com/watch?v=${key}`;
  }

  // Truncate text
  truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  }

  // Get media type from path
  getMediaTypeFromPath(path) {
    if (path.includes("/movie/")) return "movie";
    if (path.includes("/tv/")) return "tv";
    return "unknown";
  }

  // Format crew by job
  formatCrewByJob(crew, job) {
    if (!crew) return [];
    return crew.filter((person) => person.job === job);
  }

  // Get director(s)
  getDirectors(credits) {
    if (!credits || !credits.crew) return [];
    return this.formatCrewByJob(credits.crew, "Director");
  }

  // Get writer(s)
  getWriters(credits) {
    if (!credits || !credits.crew) return [];
    const writers = credits.crew.filter(
      (person) =>
        person.job === "Writer" ||
        person.job === "Screenplay" ||
        person.job === "Story",
    );
    return writers;
  }

  // Get main cast (first 10)
  getMainCast(credits, limit = 10) {
    if (!credits || !credits.cast) return [];
    return credits.cast.slice(0, limit);
  }
}

// Create instances
export const tmdbService = new TMDBService();
export const imageService = new ImageService();
export const utilsService = new UtilsService();

export default tmdbService;
