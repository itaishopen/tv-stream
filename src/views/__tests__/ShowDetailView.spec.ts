import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ShowDetailView from '../ShowDetailView.vue'
import { showService } from '@/api/showService'
import type { Show } from '@/types/show'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' },
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/api/showService', () => ({
  showService: {
    getShowDetails: vi.fn(),
  },
}))

const mockedGetShowDetails = vi.mocked(showService.getShowDetails)

describe('ShowDetailView', () => {
  const mockShow: Show = {
    id: 1,
    name: 'Breaking Bad',
    genres: ['Drama', 'Crime', 'Thriller'],
    rating: { average: 9.5 },
    image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
    summary: '<p>A chemistry teacher turns to crime.</p>',
    _embedded: {
      episodes: [
        {
          id: 101,
          name: 'Pilot',
          season: 1,
          number: 1,
          summary: '<p>Episode 1 summary</p>',
          image: { medium: 'http://example.com/ep1.jpg', original: 'http://example.com/ep1-lg.jpg' },
          rating: { average: 9.0 },
        },
        {
          id: 102,
          name: "Cat's in the Bag...",
          season: 1,
          number: 2,
          summary: '<p>Episode 2 summary</p>',
          image: null,
          rating: { average: 8.5 },
        },
        {
          id: 201,
          name: 'Seven Thirty-Seven',
          season: 2,
          number: 1,
          summary: '<p>Season 2 Episode 1</p>',
          image: { medium: 'http://example.com/s2ep1.jpg', original: 'http://example.com/s2ep1-lg.jpg' },
          rating: { average: 9.2 },
        },
      ],
    },
  }

  const mountComponent = () => {
    return mount(ShowDetailView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('should show loading spinner while fetching', async () => {
      mockedGetShowDetails.mockImplementation(() => new Promise(() => {}))
      const wrapper = mountComponent()

      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading show details...')
    })

    it('should hide loading spinner after fetch completes', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.find('.animate-spin').exists()).toBe(false)
    })
  })

  describe('error state', () => {
    it('should show error message when fetch fails', async () => {
      mockedGetShowDetails.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Failed to load show')
      expect(wrapper.text()).toContain('Network error')
    })

    it('should show back to dashboard button on error', async () => {
      mockedGetShowDetails.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Back to Dashboard')
    })

    it('should navigate to dashboard when back button clicked on error', async () => {
      mockedGetShowDetails.mockRejectedValueOnce(new Error('Network error'))
      const wrapper = mountComponent()

      await flushPromises()

      const backButton = wrapper.find('button')
      await backButton.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('show details', () => {
    it('should display show name', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.find('h1').text()).toBe('Breaking Bad')
    })

    it('should display show genres', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Drama')
      expect(wrapper.text()).toContain('Crime')
      expect(wrapper.text()).toContain('Thriller')
    })

    it('should display show rating', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('9.5')
    })

    it('should display show summary without HTML tags', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('A chemistry teacher turns to crime.')
      expect(wrapper.text()).not.toContain('<p>')
    })

    it('should display show image', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      const img = wrapper.find('img')
      expect(img.attributes('src')).toContain('example.com')
    })

    it('should show back to dashboard button', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      const backButtons = wrapper.findAll('button').filter(b => b.text().includes('Back to Dashboard'))
      expect(backButtons.length).toBeGreaterThan(0)
    })

    it('should navigate to dashboard when back button clicked', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      const backButton = wrapper.findAll('button').find(b => b.text().includes('Back to Dashboard'))
      await backButton?.trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('episodes', () => {
    it('should display episodes section', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Episodes')
    })

    it('should group episodes by season', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Season 1')
      expect(wrapper.text()).toContain('Season 2')
    })

    it('should display episode names', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('Pilot')
      expect(wrapper.text()).toContain("Cat's in the Bag...")
      expect(wrapper.text()).toContain('Seven Thirty-Seven')
    })

    it('should display episode numbers', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('1. Pilot')
      expect(wrapper.text()).toContain("2. Cat's in the Bag...")
    })

    it('should display episode ratings', async () => {
      mockedGetShowDetails.mockResolvedValueOnce(mockShow)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('9.0')
      expect(wrapper.text()).toContain('8.5')
    })

    it('should show no episodes message when no episodes', async () => {
      const showWithoutEpisodes = { ...mockShow, _embedded: undefined }
      mockedGetShowDetails.mockResolvedValueOnce(showWithoutEpisodes)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('No episodes available')
    })
  })

  describe('show without rating', () => {
    it('should not show rating section when rating is null', async () => {
      const showWithoutRating = { ...mockShow, rating: { average: null } }
      mockedGetShowDetails.mockResolvedValueOnce(showWithoutRating)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).not.toContain('/10')
    })
  })

  describe('show without summary', () => {
    it('should show fallback text when no summary', async () => {
      const showWithoutSummary = { ...mockShow, summary: '' }
      mockedGetShowDetails.mockResolvedValueOnce(showWithoutSummary)
      const wrapper = mountComponent()

      await flushPromises()

      expect(wrapper.text()).toContain('No summary available')
    })
  })
})
