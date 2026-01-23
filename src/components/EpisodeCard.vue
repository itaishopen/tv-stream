<script setup lang="ts">
import type { Episode } from "@/types/episode.ts";
import RatingBadge from "@/components/RatingBadge.vue";
import { stripHtml } from "@/utils/html.ts";

interface Props {
  episode: Episode;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [episode: Episode];
}>();
</script>

<template>
  <div
    class="episode-card group bg-dark-100 border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 cursor-pointer"
    @click="emit('click', props.episode)">
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
        <RatingBadge
          :rating="episode.rating.average"
          size="sm"
          class="ml-2 flex-shrink-0" />
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
