<script setup lang="ts">
import type { Episode } from "@/types/episode.ts";
import RatingBadge from "@/components/RatingBadge.vue";
import { stripHtml } from "@/utils/html.ts";

interface Props {
  episode: Episode;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click="handleBackdropClick">
        <div class="relative w-full max-w-2xl max-h-[90vh] bg-dark-100 rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer"
            aria-label="Close modal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="aspect-video bg-dark-200 overflow-hidden">
            <img
              v-if="episode.image"
              :src="episode.image.original || episode.image.medium"
              :alt="episode.name"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
              <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div class="p-6 overflow-y-auto max-h-[50vh]">
            <h2 class="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              {{ episode.name }}
            </h2>

            <p class="text-accent font-semibold mb-4">
              Season {{ episode.season }} • Episode {{ episode.number }}
            </p>

            <div class="mb-6">
              <RatingBadge
                :rating="episode.rating.average"
                size="md"
                show-max />
              <span v-if="!episode.rating.average" class="text-gray-500 text-sm">No rating available</span>
            </div>

            <div>
              <h3 class="text-lg font-display font-semibold text-white mb-2">Summary</h3>
              <p class="text-gray-300 leading-relaxed">
                {{ episode.summary ? stripHtml(episode.summary) : 'No summary available.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
</style>
