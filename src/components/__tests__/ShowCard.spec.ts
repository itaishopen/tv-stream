import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShowCard from '../ShowCard.vue'
import type { Show } from '@/types/show'

describe('ShowCard', () => {
  const createMockShow = (overrides: Partial<Show> = {}): Show => ({
    id: 1,
    name: 'Breaking Bad',
    genres: ['Drama', 'Crime', 'Thriller'],
    rating: { average: 9.5 },
    status: 'Ended',
    image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
    summary: '<p>A chemistry teacher turns to crime</p>',
    ...overrides,
  })

  const mountComponent = (show: Show = createMockShow()) => {
    return mount(ShowCard, {
      props: { show },
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the show name', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('h3').text()).toBe('Breaking Bad')
    })
  })

  describe('routing', () => {
    it('should link to the correct show detail page', () => {
      const wrapper = mountComponent(createMockShow({ id: 123 }))

      const link = wrapper.find('a')
      expect(link.attributes('href')).toBe('/shows/123')
    })
  })

  describe('image', () => {
    it('should display the show image', () => {
      const wrapper = mountComponent()

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('http://example.com/medium.jpg')
    })

    it('should use placeholder when show has no image and have lazy loading enabled', () => {
      const wrapper = mountComponent(createMockShow({ image: null }))

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://placeholdit.com/210x295/dddddd/999999?text=NO+IMAGE')
      expect(img.attributes('loading')).toBe('lazy')
    })

    it('should have alt text with show name', () => {
      const wrapper = mountComponent(createMockShow({ name: 'Test Show' }))

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Test Show')
    })
  })

  describe('rating', () => {
    it('should display rating badge when rating exists', () => {
      const wrapper = mountComponent(createMockShow({ rating: { average: 8.5 } }))

      expect(wrapper.text()).toContain('8.5')
    })

    it('should format rating to one decimal place', () => {
      const wrapper = mountComponent(createMockShow({ rating: { average: 9.55 } }))

      expect(wrapper.text()).toContain('9.6')
    })

    it('should not display rating badge when rating is null', () => {
      const wrapper = mountComponent(createMockShow({ rating: { average: null } }))

      const ratingBadge = wrapper.find('.absolute.top-2.right-2')
      expect(ratingBadge.exists()).toBe(false)
    })
  })

  describe('genres', () => {
    it('should display genres', () => {
      const wrapper = mountComponent(createMockShow({ genres: ['Drama', 'Comedy'] }))

      expect(wrapper.text()).toContain('Drama')
      expect(wrapper.text()).toContain('Comedy')
    })

    it('should display only first two genres', () => {
      const wrapper = mountComponent(createMockShow({ genres: ['Drama', 'Comedy', 'Action', 'Thriller'] }))

      expect(wrapper.text()).toContain('Drama')
      expect(wrapper.text()).toContain('Comedy')
      expect(wrapper.text()).not.toContain('Action')
      expect(wrapper.text()).not.toContain('Thriller')
    })

    it('should handle single genre', () => {
      const wrapper = mountComponent(createMockShow({ genres: ['Drama'] }))

      expect(wrapper.text()).toContain('Drama')
    })

    it('should handle no genres', () => {
      const wrapper = mountComponent(createMockShow({ genres: [] }))

      const genreSpans = wrapper.findAll('.text-accent.font-medium')
      expect(genreSpans).toHaveLength(0)
    })
  })
})
