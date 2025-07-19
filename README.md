# Empty.tv 🎬

A modern Vue.js movie and TV streaming website with multiple video sources and a sleek design.

## ✨ Features

- **Multiple Video Sources**: Access content from various embed providers
- **VidLink Support**: Fixed sandbox issues for seamless VidLink streaming
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Search & Discovery**: Find movies and TV shows easily
- **Favorites & Watchlist**: Save your favorite content
- **Episode Navigation**: Easy season/episode selection for TV shows
- **Modern UI**: Built with Vuetify 3 and Vue 3

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/empty.tv.git

# Navigate to project directory
cd empty.tv

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: Vue 3, Vuetify 3, Vite
- **State Management**: Vue Composition API
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Icons**: Material Design Icons
- **API**: TMDB (The Movie Database)

## 📱 Video Sources

The application supports multiple streaming sources:

- VidLink (Sandbox-free for optimal performance)
- AutoEmbed
- EmbedSu
- VidSrc
- SuperEmbed
- 2Embed
- VidSrcDev
- VidSrcNL
- SmashyStream
- EmbedFlix

## 🔧 Configuration

1. Get a TMDB API key from [themoviedb.org](https://www.themoviedb.org/settings/api)
2. Create a `.env` file in the root directory:

```env
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

## 🎯 Recent Updates

### VidLink Sandbox Fix
- Resolved "Please Disable Sandbox" error for VidLink
- Implemented conditional iframe rendering
- Maintained security for other embed sources

### Enhanced Video Player
- Multiple source switching
- Error handling and fallbacks
- Responsive design improvements
- Episode selector for TV shows

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── VideoPlayer.vue
│   │   └── MediaCard.vue
│   ├── home/
│   │   ├── HeroSection.vue
│   │   └── TrendingSection.vue
│   └── layout/
│       ├── AppNavigation.vue
│       └── AppFooter.vue
├── views/
│   ├── HomeView.vue
│   ├── MovieDetailView.vue
│   ├── TVDetailView.vue
│   └── WatchView.vue
├── services/
│   ├── tmdb.js
│   └── videoEmbed.js
└── router/
    └── index.js
```

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational purposes only. All content is provided by third-party sources. We do not host any content ourselves.

## 🤝 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/empty.tv/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem

## 🎉 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie database API
- [Vuetify](https://vuetifyjs.com/) for the component library
- [Vue.js](https://vuejs.org/) for the framework
- All the embed providers for streaming sources

---

Made with ❤️ for movie and TV lovers
