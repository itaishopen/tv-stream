<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type {Show} from "@/types/show.ts";
  import type {Episode} from "@/types/episode.ts";
  import {showService} from "@/api/showService.ts";
  import EpisodeCard from "@/components/EpisodeCard.vue";
  import RatingBadge from "@/components/RatingBadge.vue";


  const route = useRoute();
  const router = useRouter();

  const show = ref<Show | null>(null);
  const loading = ref<boolean>(true);
  const error = ref<string | null>(null);

  const episodesBySeason = computed(() => {
    if (!show.value?._embedded?.episodes) return new Map<number, Episode[]>();

    const seasonMap = new Map<number, Episode[]>();

    show.value._embedded.episodes.forEach(episode => {
      if (!seasonMap.has(episode.season)) {
        seasonMap.set(episode.season, []);
      }
      seasonMap.get(episode.season)!.push(episode);
    });

    return seasonMap;
  });

  const sortedSeasons = computed(() => {
    return Array.from(episodesBySeason.value.keys()).sort((a, b) => a - b);
  });

  const stripHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  onMounted(async () => {
    const showId = Number(route.params.id);

    if (Number.isNaN(showId)) {
      error.value = 'Invalid show ID';
      loading.value = false;
      return;
    }

    try {
      show.value = await showService.getShowDetails(showId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load show details';
      console.error('Error fetching show details:', err);
    } finally {
      loading.value = false;
    }
  });

  const goBack = () => {
    router.push('/');
  };
</script>

<template>
  <div class="show-detail min-h-screen bg-dark text-white">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <svg class="animate-spin h-16 w-16 text-accent mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400 text-lg">Loading show details...</p>
      </div>
    </div>

    <div v-else-if="error || !show" class="flex justify-center items-center min-h-screen px-4">
      <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-400 text-center font-semibold text-xl mb-2">Failed to load show</p>
        <p class="text-gray-400 text-center mb-6">{{ error || 'Show not found' }}</p>
        <button
          @click="goBack"
          class="w-full cursor-pointer bg-accent hover:bg-accent/80 text-white py-3 px-6 rounded-lg transition-colors font-semibold">
          <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>
    </div>

    <div v-else>
      <div class="tv-section relative">
        <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: show.image?.original ? `url(${show.image.original})` : 'none' }">
          <div class="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/90 to-dark"></div>
          <div class="absolute inset-0 backdrop-blur-3xl"></div>
        </div>

        <div class="relative z-10 container mx-auto px-4 py-12">
          <button
            @click="goBack"
            class="mb-8 flex cursor-pointer items-center gap-2 text-gray-300 hover:text-white transition-colors group">
            <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div class="flex flex-col md:flex-row gap-8 items-start">
            <div class="flex-shrink-0 animate-scale-in">
              <img
                :src="show.image?.original || show.image?.medium || 'https://placeholdit.com/300x450/dddddd/999999?text=NO+IMAGE'"
                :alt="show.name"
                class="w-64 md:w-80 rounded-2xl shadow-2xl border-4 border-white/10"/>
            </div>

            <div class="flex-1 animate-fade-in" style="animation-delay: 0.2s;">
              <h1 class="text-5xl md:text-6xl font-display font-bold mb-4">
                {{ show.name }}
              </h1>

              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="genre in show.genres"
                  :key="genre"
                  class="px-4 py-2 bg-accent/20 border border-accent/40 text-accent rounded-full text-sm font-semibold">
                  {{ genre }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-4 mb-6">
                <RatingBadge
                  :rating="show.rating.average"
                  size="lg"
                  show-max />

                <div
                  v-if="show.status"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                  :class="{
                    'bg-green-500/20 border border-green-500/40 text-green-400': show.status === 'Running',
                    'bg-red-500/20 border border-red-500/40 text-red-400': show.status === 'Ended',
                    'bg-gray-500/20 border border-gray-500/40 text-gray-400': show.status !== 'Running' && show.status !== 'Ended'
                  }">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-green-400': show.status === 'Running',
                      'bg-red-400': show.status === 'Ended',
                      'bg-gray-400': show.status !== 'Running' && show.status !== 'Ended'
                    }"></span>
                  {{ show.status }}
                </div>

                <div
                  v-if="show.premiered"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Premiered {{ show.premiered }}
                </div>
              </div>

              <div class="prose prose-invert max-w-none">
                <h2 class="text-2xl font-display font-bold mb-3 text-accent">Overview</h2>
                <p class="text-gray-300 text-lg leading-relaxed">
                  {{ show.summary ? stripHtml(show.summary) : 'No summary available.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container mx-auto px-4 py-12">
        <h2 class="text-4xl font-display font-bold mb-8">Episodes</h2>

        <div v-if="show._embedded?.episodes && show._embedded.episodes.length > 0">
          <div
            v-for="season in sortedSeasons"
            :key="season"
            class="mb-12 animate-slide-up">
            <h3 class="text-2xl font-display font-semibold mb-6 text-accent">
              Season {{ season }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EpisodeCard
                v-for="episode in episodesBySeason.get(season)"
                :key="episode.id"
                 :episode="episode"/>

            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500 text-lg">No episodes available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .tv-section {
    min-height: 60vh;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
    animation-fill-mode: both;
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
    animation-fill-mode: both;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s ease-out;
  }
</style>
