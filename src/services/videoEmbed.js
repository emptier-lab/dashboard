// Video Embed Service - Multiple Free Sources
// Provides various embed sources for movies and TV shows
// Optimized for iOS and mobile devices

export class VideoEmbedService {
  constructor() {
    this.embedSources = [
      {
        name: "AutoEmbed",
        baseUrl: "https://player.autoembed.cc/embed",
        movieUrl: (tmdbId) =>
          `https://player.autoembed.cc/embed/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
        priority: 1,
        active: true,
        mobileCompatible: true,
      },
      {
        name: "EmbedSu",
        baseUrl: "https://embed.su/embed",
        movieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
        priority: 2,
        active: true,
        mobileCompatible: false,
      },
      {
        name: "VidSrc",
        baseUrl: "https://vidsrc.to/embed",
        movieUrl: (tmdbId) => `https://vidsrc.to/embed/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
        priority: 3,
        active: true,
        mobileCompatible: true,
      },
      {
        name: "SuperEmbed",
        baseUrl: "https://multiembed.mov",
        movieUrl: (tmdbId) =>
          `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`,
        tvUrl: (tmdbId, season, episode) =>
          `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
        priority: 4,
        active: true,
        mobileCompatible: false,
      },
      {
        name: "2Embed",
        baseUrl: "https://www.2embed.org/embed",
        movieUrl: (tmdbId) =>
          `https://www.2embed.org/embed/tmdb/movie?id=${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://www.2embed.org/embed/tmdb/tv?id=${tmdbId}&s=${season}&e=${episode}`,
        priority: 5,
        active: true,
        mobileCompatible: false,
      },
      {
        name: "VidLink",
        baseUrl: "https://vidlink.pro/movie",
        movieUrl: (tmdbId) => `https://vidlink.pro/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
        priority: 6,
        active: true,
        mobileCompatible: true,
      },
      {
        name: "VidSrcDev",
        baseUrl: "https://vidsrc.dev/embed",
        movieUrl: (tmdbId) => `https://vidsrc.dev/embed/movie?tmdb=${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://vidsrc.dev/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
        priority: 7,
        active: true,
        mobileCompatible: true,
      },
      {
        name: "VidSrcNL",
        baseUrl: "https://player.vidsrc.nl/embed",
        movieUrl: (tmdbId) => `https://player.vidsrc.nl/embed/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://player.vidsrc.nl/embed/tv/${tmdbId}/${season}/${episode}`,
        priority: 8,
        active: true,
        mobileCompatible: true,
      },
      {
        name: "SmashyStream",
        baseUrl: "https://player.smashy.stream",
        movieUrl: (tmdbId) => `https://player.smashy.stream/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://player.smashy.stream/tv/${tmdbId}/${season}/${episode}`,
        priority: 9,
        active: true,
        mobileCompatible: true,
      },
      {
        name: "EmbedFlix",
        baseUrl: "https://embedflix.today",
        movieUrl: (tmdbId) =>
          `https://embedflix.today/embed/movie?tmdb=${tmdbId}`,
        tvUrl: (tmdbId, season, episode) =>
          `https://embedflix.today/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
        priority: 10,
        active: true,
        mobileCompatible: false,
      },
    ];
  }

  getAvailableSources(preferMobileCompatible = false) {
    let sources = this.embedSources.filter((source) => source.active);

    if (preferMobileCompatible) {
      // Prioritize mobile-compatible sources
      sources = sources.sort((a, b) => {
        if (a.mobileCompatible && !b.mobileCompatible) return -1;
        if (!a.mobileCompatible && b.mobileCompatible) return 1;
        return a.priority - b.priority;
      });
    } else {
      sources = sources.sort((a, b) => a.priority - b.priority);
    }

    return sources;
  }

  getMovieEmbeds(tmdbId, preferMobileCompatible = false) {
    const sources = this.getAvailableSources(preferMobileCompatible);
    return sources.map((source) => ({
      name: source.name,
      url: source.movieUrl(tmdbId),
      priority: source.priority,
      mobileCompatible: source.mobileCompatible,
    }));
  }

  getTVEmbeds(tmdbId, season = 1, episode = 1, preferMobileCompatible = false) {
    const sources = this.getAvailableSources(preferMobileCompatible);
    return sources.map((source) => ({
      name: source.name,
      url: source.tvUrl(tmdbId, season, episode),
      priority: source.priority,
      mobileCompatible: source.mobileCompatible,
    }));
  }

  getPrimaryMovieEmbed(tmdbId) {
    const embeds = this.getMovieEmbeds(tmdbId);
    return embeds.length > 0 ? embeds[0].url : null;
  }

  getPrimaryTVEmbed(tmdbId, season = 1, episode = 1) {
    const embeds = this.getTVEmbeds(tmdbId, season, episode);
    return embeds.length > 0 ? embeds[0].url : null;
  }

  async testEmbedSource(url) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getWorkingEmbeds(
    tmdbId,
    type = "movie",
    season = 1,
    episode = 1,
    preferMobileCompatible = false,
  ) {
    const embeds =
      type === "movie"
        ? this.getMovieEmbeds(tmdbId, preferMobileCompatible)
        : this.getTVEmbeds(tmdbId, season, episode, preferMobileCompatible);

    return embeds;
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  generateEmbedHTML(url, options = {}) {
    const {
      width = "100%",
      height = "500px",
      allowFullscreen = true,
      sandbox = "",
    } = options;

    return `
      <iframe
        src="${url}"
        width="${width}"
        height="${height}"
        frameborder="0"
        scrolling="no"
        ${allowFullscreen ? "allowfullscreen webkitallowfullscreen mozallowfullscreen" : ""}
        allow="autoplay; fullscreen; picture-in-picture"
        referrerpolicy="origin"
        loading="lazy">
      </iframe>
    `;
  }

  isEmbeddable(mediaType, tmdbId) {
    if (!tmdbId || !["movie", "tv"].includes(mediaType)) {
      return false;
    }
    return true;
  }

  getSourceByName(sourceName) {
    return this.embedSources.find(
      (source) => source.name.toLowerCase() === sourceName.toLowerCase(),
    );
  }

  addCustomSource(sourceConfig) {
    const source = {
      name: sourceConfig.name,
      baseUrl: sourceConfig.baseUrl,
      movieUrl: sourceConfig.movieUrl,
      tvUrl: sourceConfig.tvUrl,
      priority: sourceConfig.priority || 999,
      active: sourceConfig.active !== false,
    };

    this.embedSources.push(source);
    return source;
  }

  toggleSource(sourceName, active = null) {
    const source = this.getSourceByName(sourceName);
    if (source) {
      source.active = active !== null ? active : !source.active;
      return source;
    }
    return null;
  }

  getEmbedStats() {
    const total = this.embedSources.length;
    const active = this.embedSources.filter((s) => s.active).length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
      sources: this.embedSources.map((s) => ({
        name: s.name,
        active: s.active,
        priority: s.priority,
      })),
    };
  }

  generateShareableLink(tmdbId, type = "movie", season = null, episode = null) {
    const baseUrl = window.location.origin;
    let path = `${baseUrl}/watch/${type}/${tmdbId}`;

    if (type === "tv" && season && episode) {
      path += `/${season}/${episode}`;
    }

    return path;
  }

  parseExternalIds(externalIds) {
    const ids = {};

    if (externalIds.imdb_id) {
      ids.imdb = externalIds.imdb_id.replace("tt", "");
    }

    if (externalIds.tvdb_id) {
      ids.tvdb = externalIds.tvdb_id;
    }

    return ids;
  }

  getAlternativeEmbeds(externalIds, type = "movie", season = 1, episode = 1) {
    const ids = this.parseExternalIds(externalIds);
    const alternatives = [];

    if (ids.imdb) {
      alternatives.push({
        name: "VidSrc IMDB",
        url:
          type === "movie"
            ? `https://vidsrc.to/embed/movie/${ids.imdb}`
            : `https://vidsrc.to/embed/tv/${ids.imdb}/${season}/${episode}`,
        priority: 99,
      });
    }

    return alternatives;
  }
}

export const videoEmbedService = new VideoEmbedService();

export const embedUtils = {
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return null;
    }
  },

  isTrustedSource(url) {
    const trustedDomains = [
      "player.autoembed.cc",
      "embed.su",
      "vidsrc.to",
      "multiembed.mov",
      "www.2embed.org",
      "vidlink.pro",
      "vidsrc.dev",
      "player.vidsrc.nl",
      "player.smashy.stream",
      "embedflix.today",
    ];

    try {
      const urlObj = new URL(url);
      return trustedDomains.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  },

  getSecureIframeAttrs() {
    return {
      referrerpolicy: "origin",
      loading: "lazy",
      allow: "autoplay; fullscreen; picture-in-picture",
      webkitallowfullscreen: true,
      mozallowfullscreen: true,
    };
  },
};

export default videoEmbedService;
