import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DashboardView from '../DashboardView.vue'
import { useShowStore } from '@/stores/ShowsStore'
import { showService } from '@/api/showService'
import type { Show } from '@/types/show'

vi.mock('@/api/showService', () => ({
  showService: {
    getShows: vi.fn(),
    searchShows: vi.fn(),
  },
}))

const mockedGetShows = vi.mocked(showService.getShows)

describe('DashboardView', () => {
  const createMockShow = (id: number, name: string, genres: string[], rating: number): Show => ({
    id,
    name,
    genres,
    rating: { average: rating },
    status: 'Ended',
    image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
    summary: '<p>Test summary</p>',
  })

  const mockShows: Show[] = [
    createMockShow(1, 'Breaking Bad', ['Drama', 'Crime'], 9.5),
    createMockShow(2, 'The Office', ['Comedy'], 8.5),
    createMockShow(3, 'Game of Thrones', ['Drama', 'Fantasy'], 9.0),
  ]

  const mountComponent = () => {
    return mount(DashboardView, {
      global: {
        stubs: {
          GenreRow: {
            template: '<div class="genre-row-stub" :data-genre="genre"><slot /></div>',
            props: ['genre', 'shows'],
          },
          SearchBar: {
            template: '<div class="search-bar-stub"></div>',
          },
          RouterLink: true,
        },
      },
    })
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial load', () => {
    it('should fetch shows on mount', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)

      mountComponent()
      await flushPromises()

      expect(mockedGetShows).toHaveBeenCalledWith(0)
    })

    it('should render the dashboard title', () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      expect(wrapper.find('h1').text()).toBe('TV-Show Dashboard')
    })

    it('should render the SearchBar component', () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      expect(wrapper.find('.search-bar-stub').exists()).toBe(true)
    })
  })

  describe('loading state', () => {
    it('should show loading spinner while fetching', async () => {
      mockedGetShows.mockImplementation(() => new Promise(() => {}))
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading shows...')
    })

    it('should hide loading spinner after fetch completes', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.find('.animate-spin').exists()).toBe(false)
    })
  })

  describe('error state', () => {
    it('should show error message when fetch fails', async () => {
      mockedGetShows.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Failed to load shows')
      expect(wrapper.text()).toContain('Network error')
    })

    it('should show retry button when error occurs', async () => {
      mockedGetShows.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await flushPromises()

      const retryButton = wrapper.find('button')
      expect(retryButton.text()).toContain('Try Again')
    })

    it('should retry fetching when retry button is clicked', async () => {
      mockedGetShows.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await flushPromises()

      mockedGetShows.mockResolvedValueOnce(mockShows)
      await wrapper.find('button').trigger('click')
      await flushPromises()

      expect(mockedGetShows).toHaveBeenCalledTimes(2)
    })
  })

  describe('content display', () => {
    it('should render GenreRow for each genre group', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      const genreRows = wrapper.findAll('.genre-row-stub')
      expect(genreRows.length).toBeGreaterThan(0)
    })

    it('should show empty state when no shows', async () => {
      mockedGetShows.mockResolvedValueOnce([])
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('No shows available')
    })
  })

  describe('pagination', () => {
    it('should display current page number', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Page')
      expect(wrapper.text()).toContain('1')
    })

    it('should have previous button disabled on first page', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      const prevButton = wrapper.findAll('button').find(b => b.text().includes('Previous'))
      expect(prevButton?.attributes('disabled')).toBeDefined()
    })

    it('should have next button enabled', async () => {
      mockedGetShows.mockResolvedValueOnce(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      const nextButton = wrapper.findAll('button').find(b => b.text().includes('Next'))
      expect(nextButton?.attributes('disabled')).toBeUndefined()
    })

    it('should call nextPage when next button is clicked', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      const nextButton = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextButton?.trigger('click')
      await flushPromises()

      expect(mockedGetShows).toHaveBeenCalledWith(1)
    })

    it('should call prevPage when previous button is clicked', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      // First go to page 1
      const store = useShowStore()
      store.currentPage = 1

      await flushPromises()

      const prevButton = wrapper.findAll('button').find(b => b.text().includes('Previous'))
      await prevButton?.trigger('click')
      await flushPromises()

      expect(mockedGetShows).toHaveBeenCalledWith(0)
    })

    it('should update page number display after navigation', async () => {
      mockedGetShows.mockResolvedValue(mockShows)
      const wrapper = mountComponent()

      await flushPromises()

      const nextButton = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextButton?.trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('2')
    })
  })
})
