import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SearchBar from '../SearchBar.vue'
import { showService } from '@/api/showService'
import type { SearchResult } from '@/types/search-result'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/api/showService', () => ({
  showService: {
    searchShows: vi.fn(),
  },
}))

const mockedSearchShows = vi.mocked(showService.searchShows)

describe('SearchBar', () => {
  const mockSearchResults: SearchResult[] = [
    {
      score: 0.95,
      show: {
        id: 1,
        name: 'Breaking Bad',
        genres: ['Drama', 'Crime', 'Thriller'],
        rating: { average: 9.5 },
        status: 'Ended',
        image: { medium: 'http://example.com/bb.jpg', original: 'http://example.com/bb-lg.jpg' },
        summary: '<p>A chemistry teacher turns to crime</p>',
      },
    },
    {
      score: 0.85,
      show: {
        id: 2,
        name: 'Better Call Saul',
        genres: ['Drama', 'Crime'],
        rating: { average: 9.0 },
        status: 'Ended',
        image: null,
        summary: '<p>The story of Saul Goodman</p>',
      },
    },
  ]

  const mountComponent = () => {
    return mount(SearchBar, {
      global: {
        stubs: {
          Transition: false,
        },
      },
    })
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should render search input', () => {
      const wrapper = mountComponent()

      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toBe('Search shows...')
    })

    it('should not show results dropdown initially', () => {
      const wrapper = mountComponent()

      const resultsDropdown = wrapper.find('.absolute.top-full')
      expect(resultsDropdown.exists()).toBe(false)
    })
  })

  describe('search behavior', () => {
    it('should not search when query is less than 2 characters', async () => {
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('a')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(mockedSearchShows).not.toHaveBeenCalled()
    })

    it('should search after debounce when query is 2+ characters', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(mockedSearchShows).toHaveBeenCalledWith('breaking')
    })

    it('should debounce search requests', async () => {
      mockedSearchShows.mockResolvedValue(mockSearchResults)
      const wrapper = mountComponent()
      const input = wrapper.find('input')

      await input.setValue('br')
      vi.advanceTimersByTime(100)
      await input.setValue('bre')
      vi.advanceTimersByTime(100)
      await input.setValue('break')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(mockedSearchShows).toHaveBeenCalledTimes(1)
      expect(mockedSearchShows).toHaveBeenCalledWith('break')
    })

    it('should trim whitespace from search query', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('  breaking  ')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(mockedSearchShows).toHaveBeenCalledWith('breaking')
    })
  })

  describe('loading state', () => {
    it('should show loading spinner while searching', async () => {
      mockedSearchShows.mockImplementation(() => new Promise(() => {}))
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should hide loading spinner after search completes', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.find('.animate-spin').exists()).toBe(false)
    })
  })

  describe('search results', () => {
    it('should display search results and display show name', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      const results = wrapper.findAll('button.w-full')
      expect(results).toHaveLength(2)
      expect(wrapper.text()).toContain('Breaking Bad')
      expect(wrapper.text()).toContain('Better Call Saul')
    })


    it('should display show rating and search score in results', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.text()).toContain('9.5')
      expect(wrapper.text()).toContain('9.0')
      expect(wrapper.text()).toContain('Score: 0.95')
      expect(wrapper.text()).toContain('Score: 0.85')
    })

    it('should display genres in results', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.text()).toContain('Drama')
      expect(wrapper.text()).toContain('Crime')
    })

    it('should use placeholder image when show has no image', async () => {
      mockedSearchShows.mockResolvedValueOnce([mockSearchResults[1]!])
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('saul')
      vi.advanceTimersByTime(300)
      await flushPromises()

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://placeholdit.com/100x140/dddddd/999999?text=NO+IMAGE')
    })
  })

  describe('no results', () => {
    it('should show no results message when search returns empty', async () => {
      mockedSearchShows.mockResolvedValueOnce([])
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('nonexistent')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.text()).toContain('No shows found for "nonexistent"')
    })
  })

  describe('error handling', () => {
    it('should display error message when search fails', async () => {
      mockedSearchShows.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.text()).toContain('Network error')
    })

    it('should clear error when starting new search', async () => {
      mockedSearchShows.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.text()).toContain('Network error')

      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      await wrapper.find('input').setValue('breaking bad')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(wrapper.text()).not.toContain('Network error')
    })
  })

  describe('navigation', () => {
    it('should navigate to show detail when result is clicked', async () => {
      mockedSearchShows.mockResolvedValueOnce(mockSearchResults)
      const wrapper = mountComponent()

      await wrapper.find('input').setValue('breaking')
      vi.advanceTimersByTime(300)
      await flushPromises()

      const firstResult = wrapper.find('button.w-full')
      await firstResult.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/shows/1')
    })
  })
})
