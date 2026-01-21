import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {Show} from "@/types/show.ts";
import {showService} from "@/api/showService.ts";

interface GenreGroup {
  genre: string;
  shows: Show[];
}

export const useShowStore = defineStore('shows', () => {
  // State
  const shows = ref<Show[]>([]);
  const currentPage = ref<number>(0);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const dashboardData = computed<GenreGroup[]>(() => {
    if (shows.value.length === 0) return [];

    // Extract all unique genres
    const genreMap = new Map<string, Show[]>();

    shows.value.forEach(show => {
      show.genres.forEach(genre => {
        if (!genreMap.has(genre)) {
          genreMap.set(genre, []);
        }
        genreMap.get(genre)!.push(show);
      });
    });

    // Sort shows within each genre by rating (descending)
    const sortedGenres: GenreGroup[] = Array.from(genreMap.entries()).map(([genre, genreShows]) => ({
      genre,
      shows: genreShows.sort((a, b) => {
        const ratingA = a.rating.average ?? 0;
        const ratingB = b.rating.average ?? 0;
        return ratingB - ratingA;
      })
    }));

    // Sort genres by the highest-rated show in each genre
    return sortedGenres.sort((a, b) => {
      const maxRatingA = a.shows[0]?.rating.average ?? 0;
      const maxRatingB = b.shows[0]?.rating.average ?? 0;
      return maxRatingB - maxRatingA;
    });
  });

  // Actions
  async function fetchShows(page: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const data = await showService.getShows(page);
      shows.value = data;
      currentPage.value = page;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch shows';
      console.error('Error fetching shows:', err);
    } finally {
      loading.value = false;
    }
  }

  function nextPage(): Promise<void> {
    return fetchShows(currentPage.value + 1);
  }

  function prevPage(): Promise<void> {
    if (currentPage.value > 0) {
      return fetchShows(currentPage.value - 1);
    }
    return Promise.resolve();
  }

  function resetStore(): void {
    shows.value = [];
    currentPage.value = 0;
    loading.value = false;
    error.value = null;
  }

  return {
    shows,
    currentPage,
    loading,
    error,
    dashboardData,
    fetchShows,
    nextPage,
    prevPage,
    resetStore,
  };
});
