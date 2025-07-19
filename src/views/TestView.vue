<template>
  <div class="test-view">
    <v-container>
      <v-row>
        <v-col cols="12">
          <div class="test-header">
            <h1 class="display-1 mb-4">Video Player Sandbox Test</h1>
            <p class="subtitle-1 mb-6">
              Testing VidLink sandbox fix - VidLink should load without sandbox restrictions
            </p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card class="video-test-card">
            <v-card-title>
              <v-icon icon="mdi-play-circle" class="mr-2" />
              Video Player Test
            </v-card-title>
            <v-card-text>
              <VideoPlayer
                :tmdb-id="550"
                media-type="movie"
                title="Fight Club"
                backdrop-path="/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg"
                :auto-play="false"
                :show-download-options="true"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card class="info-card">
            <v-card-title>
              <v-icon icon="mdi-information" class="mr-2" />
              Test Information
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-movie" color="primary" />
                  </template>
                  <v-list-item-title>Test Movie</v-list-item-title>
                  <v-list-item-subtitle>Fight Club (TMDB ID: 550)</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-shield-check" color="success" />
                  </template>
                  <v-list-item-title>VidLink Fix</v-list-item-title>
                  <v-list-item-subtitle>Sandbox attribute removed</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon icon="mdi-security" color="warning" />
                  </template>
                  <v-list-item-title>Other Sources</v-list-item-title>
                  <v-list-item-subtitle>Sandbox attribute applied</v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />

              <h4 class="mb-3">Expected Behavior:</h4>
              <v-alert type="success" variant="tonal" density="compact" class="mb-2">
                <template #prepend>
                  <v-icon icon="mdi-check" />
                </template>
                VidLink should load without "Please Disable Sandbox" error
              </v-alert>

              <v-alert type="info" variant="tonal" density="compact">
                <template #prepend>
                  <v-icon icon="mdi-information" />
                </template>
                Other sources maintain security with sandbox
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card class="mt-4 debug-card">
            <v-card-title>
              <v-icon icon="mdi-bug" class="mr-2" />
              Debug Info
            </v-card-title>
            <v-card-text>
              <p>Debug component not available in current build.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="technical-details">
            <v-card-title>
              <v-icon icon="mdi-code-tags" class="mr-2" />
              Technical Details
            </v-card-title>
            <v-card-text>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-cog" class="mr-2" />
                    Implementation Details
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <h4>Problem:</h4>
                    <p>VidLink embed service requires the sandbox attribute to be completely removed from iframes, not just configured with permissions.</p>

                    <h4>Solution:</h4>
                    <p>Created conditional iframe rendering:</p>
                    <ul>
                      <li><strong>VidLink:</strong> Uses iframe without any sandbox attribute</li>
                      <li><strong>Other sources:</strong> Uses iframe with security sandbox</li>
                    </ul>

                    <h4>Detection Logic:</h4>
                    <pre class="code-block">const isVidLink = computed(() => {
  return currentSource.value?.name?.toLowerCase().includes('vidlink') || false
})</pre>
                  </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-security" class="mr-2" />
                    Security Considerations
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <h4>Sandbox Permissions (Non-VidLink):</h4>
                    <ul>
                      <li><code>allow-scripts</code> - JavaScript execution</li>
                      <li><code>allow-same-origin</code> - Same-origin requests</li>
                      <li><code>allow-popups</code> - Popup windows</li>
                      <li><code>allow-forms</code> - Form submissions</li>
                      <li><code>allow-presentation</code> - Fullscreen API</li>
                    </ul>

                    <h4>VidLink Exception:</h4>
                    <p>VidLink requires no sandbox restrictions to function properly. This is a known requirement of their embed service.</p>
                  </v-expansion-panel-text>
                </v-expansion-panel>

                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon icon="mdi-test-tube" class="mr-2" />
                    Testing Instructions
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <h4>Manual Testing:</h4>
                    <ol>
                      <li>Click "Click to Watch" on the video player</li>
                      <li>Select VidLink from the source buttons</li>
                      <li>Verify no "Please Disable Sandbox" error appears</li>
                      <li>Switch to other sources and confirm they still work</li>
                      <li>Check browser developer tools for iframe attributes</li>
                    </ol>

                    <h4>Browser DevTools Check:</h4>
                    <p>Inspect the iframe element:</p>
                    <ul>
                      <li><strong>VidLink:</strong> No sandbox attribute present</li>
                      <li><strong>Others:</strong> sandbox="allow-scripts allow-same-origin ..." present</li>
                    </ul>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import VideoPlayer from '@/components/common/VideoPlayer.vue'

export default {
  name: 'TestView',
  components: {
    VideoPlayer
  },
  setup() {
    return {}
  }
}
</script>

<style scoped>
.test-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1A1D29 0%, #2D1B42 100%);
  padding: 2rem 0;
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;
}

.video-test-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card,
.debug-card,
.technical-details {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.code-block {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  border-left: 4px solid #00D4AA;
}

.technical-details h4 {
  color: #00D4AA;
  margin: 1rem 0 0.5rem 0;
}

.technical-details ul,
.technical-details ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.technical-details li {
  margin-bottom: 0.25rem;
}

.technical-details code {
  background: rgba(0, 212, 170, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .test-view {
    padding: 1rem 0;
  }
}
</style>
