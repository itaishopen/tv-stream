<script lang="ts" setup>
import {onMounted, ref, watch} from "vue";
import type {SearchResult} from "@/types/search-result.ts";
import {showService} from "@/api/showService.ts";
import {useRoute, useRouter} from "vue-router";

const searchResults = ref<SearchResult[]>([]);
const isLoading = ref<boolean>(false);
const searchQuery = ref<string>("");

const route = useRoute();
const router = useRouter();

const fetchResults = async (query: string) => {
  if (!query || query.trim().length < 2) {
    searchResults.value = [];
    return;
  }
  isLoading.value = true;
  try {
    searchResults.value = await showService.searchShows(query.trim());
  } catch (err) {
    console.error('Search error:', err);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const query = route.query.search;
  searchQuery.value = typeof query === 'string' ? query : '';
  fetchResults(searchQuery.value);
});

watch(() => route.query.search, (newQuery) => {
  searchQuery.value = typeof newQuery === 'string' ? newQuery : '';
  fetchResults(searchQuery.value);
});

const selectShow = (showId: number) => {
  router.push(`/shows/${showId}`);
};

const getImageUrl = (result: SearchResult) => {
  return result.show.image?.medium || 'https://placeholdit.com/100x140/dddddd/999999?text=NO+IMAGE';
};
const goBack = () => {
  router.push('/');
};
</script>
<template>
  <div class="min-h-screen bg-dark-200 pt-24 px-6">
    <div class="max-w-6xl mx-auto">
      <button
        @click="goBack"
        class="mb-8 flex cursor-pointer items-center gap-2 text-gray-300 hover:text-white transition-colors group">
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>
      <h1 class="text-3xl font-display font-bold text-white mb-6">
        Search Results for "{{ searchQuery }}"
      </h1>

      <div v-if="isLoading" class="flex justify-center py-12">
        <svg class="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="searchResults.length === 0 && searchQuery.length >= 2" class="text-center py-12">
        <p class="text-gray-400 text-lg">No shows found for "{{ searchQuery }}"</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <button
          v-for="result in searchResults"
          :key="result.show.id"
          @click="selectShow(result.show.id)"
          class="bg-dark-100/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all cursor-pointer text-left group">
          <img
            :src="getImageUrl(result)"
            :alt="result.show.name"
            class="w-full h-64 object-cover"/>
          <div class="p-4">
            <h3 class="text-white font-display font-semibold group-hover:text-accent transition-colors line-clamp-1">
              {{ result.show.name }}
            </h3>
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="genre in result.show.genres.slice(0, 3)"
                :key="genre"
                class="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                {{ genre }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-3">
              <span
                v-if="result.show.rating.average"
                class="text-sm text-accent font-bold">
                {{ result.show.rating.average.toFixed(1) }}
              </span>
              <span class="text-xs text-gray-500">
                Score: {{ result.score.toFixed(2) }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>

</style>
