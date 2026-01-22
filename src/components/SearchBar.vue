<script setup lang="ts">
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import type {SearchResult} from "@/types/search-result.ts";
import {showService} from "@/api/showService.ts";


const router = useRouter();
  const searchQuery = ref<string>('');
  const searchResults = ref<SearchResult[]>([]);
  const isSearching = ref<boolean>(false);
  const showResults = ref<boolean>(false);
  const searchError = ref<string | null>(null);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, (newQuery) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    searchError.value = null;

    if (newQuery.trim().length < 2) {
      searchResults.value = [];
      showResults.value = false;
      return;
    }

    isSearching.value = true;

    debounceTimer = setTimeout(async () => {
      try {
        searchResults.value = await showService.searchShows(newQuery.trim());
        showResults.value = true;
      } catch (err) {
        searchError.value = err instanceof Error ? err.message : 'Search failed';
        console.error('Search error:', err);
      } finally {
        isSearching.value = false;
      }
    }, 300);
  });

  const selectShow = (showId: number) => {
    router.push(`/shows/${showId}`);
    searchQuery.value = '';
    searchResults.value = [];
    showResults.value = false;
  };

  const closeSearch = () => {
    showResults.value = false;
  };

  const getImageUrl = (result: SearchResult) => {
    return result.show.image?.medium || 'https://placeholdit.com/100x140/dddddd/999999?text=NO+IMAGE';
  };
</script>

<template>
  <div class="search-bar relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search shows..."
        class="w-full px-5 py-3 pl-12 bg-dark-100/50 backdrop-blur-md border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        @focus="showResults = searchQuery.length >= 2"/>

      <svg
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <div
        v-if="isSearching"
        class="absolute right-4 top-1/2 -translate-y-1/2">
        <svg class="animate-spin h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="showResults && searchResults.length > 0"
        class="absolute top-full mt-2 w-full bg-dark-100/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto z-50">
        <div class="p-2">
          <button
            v-for="result in searchResults"
            :key="result.show.id"
            @click="selectShow(result.show.id)"
            class="w-full flex cursor-pointer items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
            <img
              :src="getImageUrl(result)"
              :alt="result.show.name"
              class="w-16 h-24 object-cover rounded-lg flex-shrink-0"/>

            <div class="flex-1 min-w-0">
              <h3 class="text-white font-display font-semibold group-hover:text-accent transition-colors line-clamp-1">
                {{ result.show.name }}
              </h3>
              <div class="flex flex-wrap gap-2 mt-1">
                <span
                  v-for="genre in result.show.genres.slice(0, 3)"
                  :key="genre"
                  class="text-xs text-gray-400">
                  {{ genre }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span
                  v-if="result.show.rating.average"
                  class="text-xs text-accent font-bold">
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
    </Transition>

    <Transition name="fade">
      <div
        v-if="showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 2"
        class="absolute top-full mt-2 w-full bg-dark-100/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 z-50">
        <p class="text-gray-400 text-center">No shows found for "{{ searchQuery }}"</p>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="searchError"
        class="absolute top-full mt-2 w-full bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-4 z-50">
        <p class="text-red-400 text-sm">{{ searchError }}</p>
      </div>
    </Transition>

    <div
      v-if="showResults"
      class="fixed inset-0 -z-10"
      @click="closeSearch"></div>
  </div>
</template>
