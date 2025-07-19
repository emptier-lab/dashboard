<template>
  <v-app>
    <AppNavigation />
    <v-main>
      <router-view />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<script>
import AppNavigation from '@/components/layout/AppNavigation.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppNavigation,
    AppFooter
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Roboto', sans-serif;
  background: linear-gradient(135deg, #1A1D29 0%, #2D1B42 100%);
  color: #FFFFFF;
  overflow-x: hidden;
}

.v-application {
  background: transparent !important;
}

.v-main {
  padding-top: 0 !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

::-webkit-scrollbar-thumb {
  background: #00D4AA;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00B894;
}

/* Global text styles */
.text-primary {
  color: #00D4AA !important;
}

.text-secondary {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Global animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .v-main {
    padding-top: 0 !important;
  }
}

/* Dark theme overrides */
.v-theme--dark {
  --v-theme-background: #1A1D29;
  --v-theme-surface: #2D1B42;
  --v-theme-primary: #00D4AA;
  --v-theme-secondary: #6C5CE7;
  --v-theme-accent: #FD79A8;
  --v-theme-error: #E17055;
  --v-theme-info: #74B9FF;
  --v-theme-success: #00B894;
  --v-theme-warning: #FDCB6E;
}
</style>
