import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShowStore } from '../ShowsStore'
import { showService } from '@/api/showService'
import type { Show } from '@/types/show'

vi.mock('@/api/showService', () => ({
  showService: {
    getShows: vi.fn(),
  },
}))

const mockedGetShows = vi.mocked(showService.getShows)

describe('ShowsStore', () => {
  const createMockShow = (id: number, name: string, genres: string[], rating: number | null): Show => ({
    id,
    name,
    genres,
    rating: { average: rating },
    image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
    summary: '<p>Test summary</p>',
  })

  const mockShows: Show[] = [
    createMockShow(1, 'Breaking Bad', ['Drama', 'Crime'], 9.5),
    createMockShow(2, 'The Office', ['Comedy'], 8.5),
    createMockShow(3, 'Game of Thrones', ['Drama', 'Fantasy'], 9.0),
    createMockShow(4, 'Friends', ['Comedy'], 8.0),
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty shows array', () => {
      const store = useShowStore()
      expect(store.shows).toEqual([])
    })

    it('should have currentPage set to 0', () => {
      const store = useShowStore()
      expect(store.currentPage).toBe(0)
    })

    it('should have loading set to false', () => {
      const store = useShowStore()
      expect(store.loading).toBe(false)
    })

    it('should have error set to null', () => {
      const store = useShowStore()
      expect(store.error).toBeNull()
    })
  })

  describe('fetchShows', () => {
    it('should fetch shows and update state', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(0)

      expect(mockedGetShows).toHaveBeenCalledWith(0)
      expect(store.shows).toEqual(mockShows)
      expect(store.currentPage).toBe(0)
    })

    it('should set loading to true while fetching', async () => {
      mockedGetShows.mockImplementation(() => new Promise(() => {}))
      const store = useShowStore()

      store.fetchShows(0)

      expect(store.loading).toBe(true)
    })

    it('should set loading to false after fetching', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(0)

      expect(store.loading).toBe(false)
    })

    it('should clear error before fetching', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()
      store.error = 'Previous error'

      await store.fetchShows(0)

      expect(store.error).toBeNull()
    })

    it('should set error on fetch failure', async () => {
      mockedGetShows.mockRejectedValueOnce(new Error('Network error'))
      const store = useShowStore()

      await store.fetchShows(0)

      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })

    it('should update currentPage on successful fetch', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(5)

      expect(store.currentPage).toBe(5)
    })
  })

  describe('nextPage', () => {
    it('should fetch next page', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const store = useShowStore()
      store.currentPage = 2

      await store.nextPage()

      expect(mockedGetShows).toHaveBeenCalledWith(3)
    })

    it('should increment currentPage', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const store = useShowStore()
      store.currentPage = 0

      await store.nextPage()

      expect(store.currentPage).toBe(1)
    })
  })

  describe('prevPage', () => {
    it('should fetch previous page when not on first page', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const store = useShowStore()
      store.currentPage = 3

      await store.prevPage()

      expect(mockedGetShows).toHaveBeenCalledWith(2)
    })

    it('should not fetch when on first page', async () => {
      const store = useShowStore()
      store.currentPage = 0

      await store.prevPage()

      expect(mockedGetShows).not.toHaveBeenCalled()
    })

    it('should decrement currentPage when not on first page', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const store = useShowStore()
      store.currentPage = 2

      await store.prevPage()

      expect(store.currentPage).toBe(1)
    })
  })

  describe('resetStore', () => {
    it('should reset all state to initial values', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(5)
      store.error = 'Some error'

      store.resetStore()

      expect(store.shows).toEqual([])
      expect(store.currentPage).toBe(0)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('dashboardData', () => {
    it('should return empty array when no shows', () => {
      const store = useShowStore()

      expect(store.dashboardData).toEqual([])
    })

    it('should group shows by genre', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(0)

      const genres = store.dashboardData.map(g => g.genre)
      expect(genres).toContain('Drama')
      expect(genres).toContain('Comedy')
      expect(genres).toContain('Crime')
      expect(genres).toContain('Fantasy')
    })

    it('should include shows in correct genre groups', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(0)

      const dramaGroup = store.dashboardData.find(g => g.genre === 'Drama')
      expect(dramaGroup?.shows.map(s => s.name)).toContain('Breaking Bad')
      expect(dramaGroup?.shows.map(s => s.name)).toContain('Game of Thrones')
    })

    it('should sort shows within genre by rating descending', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(0)

      const dramaGroup = store.dashboardData.find(g => g.genre === 'Drama')
      expect(dramaGroup?.shows[0]?.name).toBe('Breaking Bad') // 9.5
      expect(dramaGroup?.shows[1]?.name).toBe('Game of Thrones') // 9.0
    })

    it('should sort genres by highest-rated show descending', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const store = useShowStore()

      await store.fetchShows(0)

      const genres = store.dashboardData.map(g => g.genre)
      // Drama has Breaking Bad (9.5), Crime has Breaking Bad (9.5), Fantasy has GoT (9.0), Comedy has The Office (8.5)
      expect(genres[0]).toBe('Drama') // or Crime (both have 9.5)
    })

    it('should handle shows with null rating', async () => {
      const showsWithNullRating = [
        createMockShow(1, 'Show A', ['Drama'], null),
        createMockShow(2, 'Show B', ['Drama'], 8.0),
      ]
      mockedGetShows.mockResolvedValueOnce(showsWithNullRating)
      const store = useShowStore()

      await store.fetchShows(0)

      const dramaGroup = store.dashboardData.find(g => g.genre === 'Drama')
      expect(dramaGroup?.shows[0]?.name).toBe('Show B') // 8.0 > null (0)
      expect(dramaGroup?.shows[1]?.name).toBe('Show A') // null treated as 0
    })

    it('should handle show appearing in multiple genres', async () => {
      const multiGenreShow = createMockShow(1, 'Multi Genre', ['Drama', 'Comedy', 'Action'], 9.0)
      mockedGetShows.mockResolvedValueOnce([multiGenreShow])
      const store = useShowStore()

      await store.fetchShows(0)

      expect(store.dashboardData).toHaveLength(3)
      store.dashboardData.forEach(group => {
        expect(group.shows).toHaveLength(1)
        expect(group.shows[0]?.name).toBe('Multi Genre')
      })
    })
  })
})
