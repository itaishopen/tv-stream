<script setup lang="ts">
  import { ref } from 'vue';
  import ShowCard from './ShowCard.vue';
  import type {Show} from "@/types/show.ts";

  interface Props {
    genre: string;
    shows: Show[];
  }

  defineProps<Props>();

  const scrollContainer = ref<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };
</script>

<template>
  <div class="genre-row mb-8 animate-slide-up">
    <div class="flex items-center justify-between mb-4 px-4 md:px-8">
      <h2 class="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
        {{ genre }}
      </h2>

      <div class="hidden md:flex gap-2" v-if="shows.length > 3">
        <button
          @click="scrollLeft"
          class="w-10 h-10 rounded-full bg-dark-100/80 hover:bg-dark-100 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
          aria-label="Scroll left">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          @click="scrollRight"
          class="w-10 h-10 rounded-full bg-dark-100/80 hover:bg-dark-100 text-white flex items-center justify-center transition-colors backdrop-blur-sm border border-white/10"
          aria-label="Scroll right">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4">
      <ShowCard
        v-for="show in shows"
        :key="show.id"
        :show="show"
      />
    </div>
  </div>
</template>

<style scoped>
  .scrollbar-hide {
    scroll-snap-type: x mandatory;
  }

  .scrollbar-hide > * {
    scroll-snap-align: start;
  }


  @media (min-width: 768px) {
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
      scroll-behavior: smooth;
    }

    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  }
</style>
