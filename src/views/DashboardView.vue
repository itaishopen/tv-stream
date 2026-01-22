<script setup lang="ts">
  import { onMounted } from 'vue';
  import GenreRow from '@/components/GenreRow.vue';
  import SearchBar from '@/components/SearchBar.vue';
  import {useShowStore} from "@/stores/ShowsStore.ts";

  const showStore = useShowStore();

  onMounted(() => {
    showStore.fetchShows(0);
  });
</script>

<template>
  <div class="dashboard min-h-screen bg-dark text-white">
    <div class="tv-section relative mb-12">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-dark to-dark"></div>

      <div class="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div class="max-w-3xl mx-auto">
          <h1 class="text-5xl md:text-7xl font-display font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-accent to-primary-400 animate-fade-in">
            Tv-Show Dashboard
          </h1>
          <p class="text-gray-400 text-center mb-10 text-lg md:text-xl animate-slide-up">
            Discover your next favorite show
          </p>

          <div>
            <SearchBar />
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto">
      <div v-if="showStore.loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-accent mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-400">Loading shows...</p>
        </div>
      </div>

      <div v-else-if="showStore.error" class="flex justify-center items-center py-20">
        <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md">
          <svg class="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-red-400 text-center font-semibold mb-2">Failed to load shows</p>
          <p class="text-gray-400 text-center text-sm mb-4">{{ showStore.error }}</p>
          <button
            @click="showStore.fetchShows(showStore.currentPage)"
            class="w-full cursor-pointer bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      </div>

      <div v-else-if="showStore.dashboardData.length > 0">
        <GenreRow
          v-for="(genreGroup, index) in showStore.dashboardData"
          :key="genreGroup.genre"
          :genre="genreGroup.genre"
          :shows="genreGroup.shows"
          :style="{ animationDelay: `${index * 0.1}s` }"/>

        <div class="flex justify-center items-center gap-6 py-12 px-4">
          <button
            @click="showStore.prevPage"
            :disabled="showStore.currentPage === 0 || showStore.loading"
            class="px-6 py-3 bg-dark-100 hover:bg-dark-200 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-all hover:scale-105 border cursor-pointer border-white/10">
            ← Previous Page
          </button>

          <div class="text-center">
            <span class="text-gray-400 text-sm">Page</span>
            <span class="text-white font-bold text-sm mx-2">{{ showStore.currentPage + 1 }}</span>
          </div>

          <button
            @click="showStore.nextPage"
            :disabled="showStore.loading"
            class="px-6 py-3 bg-accent hover:bg-accent/80 text-white rounded-full font-semibold transition-all cursor-pointer hover:scale-105">
            Next Page →
          </button>
        </div>
      </div>

      <div v-else class="flex justify-center items-center py-20">
        <p class="text-gray-400">No shows available</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
    animation-fill-mode: both;
  }

  .tv-section {
    background:
      radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(229, 83, 71, 0.15) 0%, transparent 50%);
  }
</style>
