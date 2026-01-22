<script setup lang="ts">
import { computed } from 'vue';
import type {Show} from "@/types/show.ts";

interface Props {
  show: Show;
}

const props = defineProps<Props>();

const imageUrl = computed(() => props.show.image?.medium || 'https://placeholdit.com/210x295/dddddd/999999?text=NO+IMAGE');
const rating = computed(() => props.show.rating.average?.toFixed(1) || 'N/A');
</script>

<template>
  <RouterLink
    :to="`/shows/${show.id}`"
    class="show-card group block relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:z-10">
    <div class="aspect-[2/3] relative overflow-hidden bg-dark-200">
      <img
        :src="imageUrl"
        :alt="show.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"/>
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div
        v-if="show.rating.average"
        class="absolute items-center top-2 right-2 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg flex-row">
        <svg class="w-4 h-4 inline accent-yellow-300" fill="yellow" viewBox="0 0 25 25">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>{{ rating }}</span>
      </div>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
      <h3 class="text-white font-display font-bold text-sm mb-1 line-clamp-2">
        {{ show.name }}
      </h3>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="genre in show.genres.slice(0, 2)"
          :key="genre"
          class="text-xs text-accent font-medium">
          {{ genre }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
  .show-card {
    width: 180px;
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .show-card {
      width: 200px;
    }
  }

  @media (min-width: 1024px) {
    .show-card {
      width: 220px;
    }
  }
</style>
