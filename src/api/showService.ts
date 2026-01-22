import axios, { type AxiosInstance } from 'axios';
import type {Show} from "@/types/show.ts";
import type {SearchResult} from "@/types/search-result.ts";

class ShowService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.tvmaze.com',
      timeout: 10000,
    });
  }

  /**
   * Fetch shows for a specific page
   * @param page - Page number (0-indexed in the API)
   * @returns Promise<Show[]>
   */
  async getShows(page: number): Promise<Show[]> {
    const response = await this.api.get<Show[]>('/shows', {
      params: { page }
    });
    return response.data;
  }

  /**
   * Search for shows by query string
   * @param query - Search query
   * @returns Promise<SearchResult[]>
   */
  async searchShows(query: string): Promise<SearchResult[]> {
    const response = await this.api.get<SearchResult[]>('/search/shows', {
      params: { q: query }
    });
    return response.data;
  }

  /**
   * Get detailed show information with embedded episodes
   * @param id - Show ID
   * @returns Promise<Show> with _embedded.episodes populated
   */
  async getShowDetails(id: number): Promise<Show> {
    const response = await this.api.get<Show>(`/shows/${id}`, {
      params: { embed: 'episodes' }
    });
    return response.data;
  }
}

export const showService = new ShowService();
