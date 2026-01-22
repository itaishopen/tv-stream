import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import type {Show} from "@/types/show.ts";
import type {SearchResult} from "@/types/search-result.ts";

vi.mock('axios')

const mockedAxiosCreate = vi.mocked(axios.create)

describe('ShowService', () => {
  let showService: typeof import('@/api/showService').showService

  const mockShow: Show = {
    id: 1,
    name: 'Test Show',
    genres: ['Drama', 'Comedy'],
    rating: { average: 8.5 },
    status: 'Ended',
    image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
    summary: '<p>Test summary</p>',
  }

  const mockShowWithEpisodes: Show = {
    ...mockShow,
    _embedded: {
      episodes: [
        {
          id: 101,
          name: 'Pilot',
          season: 1,
          number: 1,
          summary: '<p>Episode summary</p>',
          image: null,
          rating: { average: 8.0 },
        },
      ],
    },
  }

  const mockSearchResult: SearchResult = {
    score: 0.95,
    show: mockShow,
  }

  const mockAxiosInstance = {
    get: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockedAxiosCreate.mockReturnValue(mockAxiosInstance as unknown as ReturnType<typeof axios.create>)

    const module = await import('@/api/showService')
    showService = module.showService
  })

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxiosCreate).toHaveBeenCalledWith({
        baseURL: 'https://api.tvmaze.com',
        timeout: 10000,
      })
    })
  })

  describe('getShows', () => {
    it('should fetch shows for a given page', async () => {
      const mockShows = [mockShow]
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockShows })

      const result = await showService.getShows(0)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/shows', {
        params: { page: 0 },
      })
      expect(result).toEqual(mockShows)
    })

    it('should pass different page numbers correctly', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      await showService.getShows(5)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/shows', {
        params: { page: 5 },
      })
    })

    it('should propagate errors from the API', async () => {
      const error = new Error('Network error')
      mockAxiosInstance.get.mockRejectedValueOnce(error)

      await expect(showService.getShows(0)).rejects.toThrow('Network error')
    })
  })

  describe('searchShows', () => {
    it('should search shows with the given query', async () => {
      const mockResults = [mockSearchResult]
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResults })

      const result = await showService.searchShows('breaking bad')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/shows', {
        params: { q: 'breaking bad' },
      })
      expect(result).toEqual(mockResults)
    })

    it('should return empty array when no results found', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      const result = await showService.searchShows('nonexistent show xyz')

      expect(result).toEqual([])
    })

    it('should handle special characters in search query', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] })

      await showService.searchShows('show & special <chars>')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/shows', {
        params: { q: 'show & special <chars>' },
      })
    })

    it('should propagate errors from the API', async () => {
      const error = new Error('Search failed')
      mockAxiosInstance.get.mockRejectedValueOnce(error)

      await expect(showService.searchShows('test')).rejects.toThrow('Search failed')
    })
  })

  describe('getShowDetails', () => {
    it('should fetch show details with embedded episodes', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockShowWithEpisodes })

      const result = await showService.getShowDetails(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/shows/1', {
        params: { embed: 'episodes' },
      })
      expect(result).toEqual(mockShowWithEpisodes)
      expect(result._embedded?.episodes).toHaveLength(1)
    })

    it('should handle different show IDs', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockShowWithEpisodes })

      await showService.getShowDetails(12345)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/shows/12345', {
        params: { embed: 'episodes' },
      })
    })

    it('should propagate errors for invalid show ID', async () => {
      const error = new Error('Show not found')
      mockAxiosInstance.get.mockRejectedValueOnce(error)

      await expect(showService.getShowDetails(99999)).rejects.toThrow('Show not found')
    })
  })
})
