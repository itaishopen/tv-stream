<script setup lang="ts">
import type { Episode } from "@/types/episode.ts";

/**
 * Displays a single episode card with image, title, rating, and summary.
 */
interface Props {
  /** The episode data to display */
  episode: Episode;
}

defineProps<Props>();

/**
 * Strips HTML tags from a string.
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};
</script>

<template>
  <div class="episode-card group bg-dark-100 border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
    <div class="aspect-video bg-dark-200 overflow-hidden">
      <img
        v-if="episode.image"
        :src="episode.image.medium"
        :alt="episode.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"/>
      <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <div class="p-5">
      <div class="flex items-start justify-between mb-2">
        <h4 class="font-display font-semibold text-white group-hover:text-accent transition-colors flex-1">
          {{ episode.number }}. {{ episode.name }}
        </h4>
        <span
          v-if="episode.rating.average"
          class="text-accent font-bold text-sm ml-2 flex-shrink-0">
          <svg class="w-4 h-4 inline" fill="yellow" viewBox="0 0 25 25">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ episode.rating.average.toFixed(1) }}
        </span>
      </div>

      <p class="text-gray-400 text-sm line-clamp-3">
        {{ episode.summary ? stripHtml(episode.summary) : 'No summary available.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.episode-card {
  animation: slideUp 0.5s ease-out;
  animation-fill-mode: both;
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
</style>
