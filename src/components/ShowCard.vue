<script setup lang="ts">
import { computed } from 'vue';
import type {Show} from "@/types/show.ts";

interface Props {
  show: Show;
}

const props = defineProps<Props>();

const imageUrl = computed(() => props.show.image?.medium || 'https://placeholdit.com/210x295/dddddd/999999');
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
        class="absolute top-2 right-2 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg">
        {{ rating }}
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
