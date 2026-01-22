import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {Show} from "@/types/show.ts";
import {showService} from "@/api/showService.ts";

/**
 * Represents a group of shows categorized by genre.
 */
interface GenreGroup {
  genre: string;
  shows: Show[];
}

/**
 * Pinia store for managing TV show data and pagination state.
 * Provides actions for fetching shows, navigation between pages, and computed dashboard data.
 * @returns Store instance with state, getters, and actions
 * @example
 * ```ts
 * const store = useShowStore();
 * await store.fetchShows(0);
 * console.log(store.dashboardData);
 * ```
 */
export const useShowStore = defineStore('shows', () => {
  const shows = ref<Show[]>([]);
  const currentPage = ref<number>(0);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  /**
   * Computed property that transforms the shows array into genre-grouped data for the dashboard.
   * Shows are grouped by genre, sorted by rating within each genre (descending),
   * and genres are sorted by their highest-rated show.
   * @returns Array of genre groups with sorted shows
   */
  const dashboardData = computed<GenreGroup[]>(() => {
    if (shows.value.length === 0) return [];

    const genreMap = new Map<string, Show[]>();

    shows.value.forEach(show => {
      show.genres.forEach(genre => {
        if (!genreMap.has(genre)) {
          genreMap.set(genre, []);
        }
        genreMap.get(genre)!.push(show);
      });
    });

    const sortedGenres: GenreGroup[] = Array.from(genreMap.entries()).map(([genre, genreShows]) => ({
      genre,
      shows: genreShows.sort((a, b) => {
        const ratingA = a.rating.average ?? 0;
        const ratingB = b.rating.average ?? 0;
        return ratingB - ratingA;
      })
    }));

    return sortedGenres.sort((a, b) => {
      const maxRatingA = a.shows[0]?.rating.average ?? 0;
      const maxRatingB = b.shows[0]?.rating.average ?? 0;
      return maxRatingB - maxRatingA;
    });
  });

  /**
   * Fetches TV shows for the specified page from the API.
   * Updates the store state with the fetched shows and handles loading/error states.
   * @param page - The page number to fetch (0-indexed)
   * @returns A promise that resolves when the fetch is complete
   * @example
   * ```ts
   * await store.fetchShows(0);
   * ```
   */
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

  /**
   * Navigates to the next page of shows.
   * Increments the current page and fetches the new data.
   * @returns A promise that resolves when the fetch is complete
   */
  function nextPage(): Promise<void> {
    return fetchShows(currentPage.value + 1);
  }

  /**
   * Navigates to the previous page of shows.
   * Decrements the current page and fetches the new data.
   * Does nothing if already on the first page (page 0).
   * @returns A promise that resolves when the fetch is complete, or immediately if on first page
   */
  function prevPage(): Promise<void> {
    if (currentPage.value > 0) {
      return fetchShows(currentPage.value - 1);
    }
    return Promise.resolve();
  }

  /**
   * Resets the store to its initial state.
   * Clears all shows, resets page to 0, and clears any error messages.
   */
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
