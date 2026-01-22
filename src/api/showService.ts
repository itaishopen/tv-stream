import axios, { type AxiosInstance } from 'axios';
import type {Show} from "@/types/show.ts";
import type {SearchResult} from "@/types/search-result.ts";

/**
 * Service for interacting with the TVMaze API.
 * Provides methods to fetch shows, search, and get detailed show information.
 */
class ShowService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.tvmaze.com',
      timeout: 10000,
    });
  }

  /**
   * Fetches a paginated list of TV shows from the API.
   * @param page - The page number to fetch (0-indexed)
   * @returns A promise that resolves to an array of shows
   * @throws Error if the API request fails
   * @example
   * ```ts
   * const shows = await showService.getShows(0);
   * ```
   */
  async getShows(page: number): Promise<Show[]> {
    const response = await this.api.get<Show[]>('/shows', {
      params: { page }
    });
    return response.data;
  }

  /**
   * Searches for TV shows matching the given query string.
   * @param query - The search term to find matching shows
   * @returns A promise that resolves to an array of search results with scores
   * @throws Error if the API request fails
   * @example
   * ```ts
   * const results = await showService.searchShows('breaking bad');
   * ```
   */
  async searchShows(query: string): Promise<SearchResult[]> {
    const response = await this.api.get<SearchResult[]>('/search/shows', {
      params: { q: query }
    });
    return response.data;
  }

  /**
   * Fetches detailed information about a specific show, including all episodes.
   * @param id - The unique identifier of the show
   * @returns A promise that resolves to the show with embedded episodes in `_embedded.episodes`
   * @throws Error if the show is not found or the API request fails
   * @example
   * ```ts
   * const show = await showService.getShowDetails(1);
   * console.log(show._embedded?.episodes);
   * ```
   */
  async getShowDetails(id: number): Promise<Show> {
    const response = await this.api.get<Show>(`/shows/${id}`, {
      params: { embed: 'episodes' }
    });
    return response.data;
  }
}

export const showService = new ShowService();
