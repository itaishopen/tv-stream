import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EpisodeModal from '../EpisodeModal.vue'
import RatingBadge from '../RatingBadge.vue'
import type { Episode } from '@/types/episode'

describe('EpisodeModal', () => {
  const createMockEpisode = (overrides: Partial<Episode> = {}): Episode => ({
    id: 1,
    name: 'Pilot',
    season: 1,
    number: 1,
    summary: '<p>The first episode of the series.</p>',
    image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
    rating: { average: 8.5 },
    ...overrides,
  })

  const mountComponent = (episode: Episode = createMockEpisode()) => {
    return mount(EpisodeModal, {
      props: { episode },
      global: {
        stubs: {
          Teleport: true,
          RatingBadge: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render episode name', () => {
      const wrapper = mountComponent(createMockEpisode({ name: 'The Beginning' }))

      expect(wrapper.find('h2').text()).toBe('The Beginning')
    })

    it('should render season and episode number', () => {
      const wrapper = mountComponent(createMockEpisode({ season: 2, number: 5 }))

      const seasonEpisode = wrapper.find('p.text-accent')
      expect(seasonEpisode.text()).toBe('Season 2 • Episode 5')
    })

    it('should render summary header', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('h3').text()).toBe('Summary')
    })

    it('should strip HTML from summary', () => {
      const wrapper = mountComponent(createMockEpisode({
        summary: '<p>This is a <strong>test</strong> summary.</p>',
      }))

      const summary = wrapper.find('p.text-gray-300')
      expect(summary.text()).toBe('This is a test summary.')
    })

    it('should show "No summary available." when summary is empty', () => {
      const wrapper = mountComponent(createMockEpisode({ summary: '' }))

      const summary = wrapper.find('p.text-gray-300')
      expect(summary.text()).toBe('No summary available.')
    })

    it('should show "No summary available." when summary is null', () => {
      const wrapper = mountComponent(createMockEpisode({ summary: null as unknown as string }))

      const summary = wrapper.find('p.text-gray-300')
      expect(summary.text()).toBe('No summary available.')
    })
  })

  describe('close button', () => {
    it('should render close button with aria-label', () => {
      const wrapper = mountComponent()

      const closeButton = wrapper.find('button[aria-label="Close modal"]')
      expect(closeButton.exists()).toBe(true)
    })

    it('should emit close event when close button is clicked', async () => {
      const wrapper = mountComponent()

      const closeButton = wrapper.find('button[aria-label="Close modal"]')
      await closeButton.trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should have X icon in close button', () => {
      const wrapper = mountComponent()

      const closeButton = wrapper.find('button[aria-label="Close modal"]')
      const svg = closeButton.find('svg')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('backdrop', () => {
    it('should emit close when clicking on backdrop', async () => {
      const wrapper = mountComponent()

      const backdrop = wrapper.find('.fixed.inset-0')
      await backdrop.trigger('click')

      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('should not emit close when clicking on modal content', async () => {
      const wrapper = mountComponent()

      const modalContent = wrapper.find('.relative.w-full.max-w-2xl')
      await modalContent.trigger('click')

      expect(wrapper.emitted('close')).toBeUndefined()
    })
  })

  describe('image', () => {
    it('should display episode image when available', () => {
      const wrapper = mountComponent(createMockEpisode({
        image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
      }))

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('http://example.com/original.jpg')
    })

    it('should prefer original image over medium', () => {
      const wrapper = mountComponent(createMockEpisode({
        image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
      }))

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('http://example.com/original.jpg')
    })

    it('should fall back to medium image when original is not available', () => {
      const wrapper = mountComponent(createMockEpisode({
        image: { medium: 'http://example.com/medium.jpg', original: '' },
      }))

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('http://example.com/medium.jpg')
    })

    it('should have correct alt text', () => {
      const wrapper = mountComponent(createMockEpisode({ name: 'Season Finale' }))

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Season Finale')
    })

    it('should show placeholder when episode has no image', () => {
      const wrapper = mountComponent(createMockEpisode({ image: null }))

      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)

      const placeholder = wrapper.find('.aspect-video svg')
      expect(placeholder.exists()).toBe(true)
    })
  })

  describe('rating', () => {
    it('should pass rating to RatingBadge component', () => {
      const wrapper = mount(EpisodeModal, {
        props: { episode: createMockEpisode({ rating: { average: 9.2 } }) },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      const ratingBadge = wrapper.findComponent(RatingBadge)
      expect(ratingBadge.props('rating')).toBe(9.2)
    })

    it('should pass md size to RatingBadge', () => {
      const wrapper = mount(EpisodeModal, {
        props: { episode: createMockEpisode() },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      const ratingBadge = wrapper.findComponent(RatingBadge)
      expect(ratingBadge.props('size')).toBe('md')
    })

    it('should pass show-max to RatingBadge', () => {
      const wrapper = mount(EpisodeModal, {
        props: { episode: createMockEpisode() },
        global: {
          stubs: {
            Teleport: true,
          },
        },
      })

      const ratingBadge = wrapper.findComponent(RatingBadge)
      expect(ratingBadge.props('showMax')).toBe(true)
    })

    it('should show "No rating available" when rating is null', () => {
      const wrapper = mountComponent(createMockEpisode({ rating: { average: null } }))

      expect(wrapper.text()).toContain('No rating available')
    })

    it('should not show "No rating available" when rating exists', () => {
      const wrapper = mountComponent(createMockEpisode({ rating: { average: 8.5 } }))

      expect(wrapper.text()).not.toContain('No rating available')
    })
  })

  describe('styling', () => {
    it('should have fixed positioning for backdrop', () => {
      const wrapper = mountComponent()

      const backdrop = wrapper.find('.fixed.inset-0')
      expect(backdrop.exists()).toBe(true)
    })

    it('should have z-50 for proper layering', () => {
      const wrapper = mountComponent()

      const backdrop = wrapper.find('.z-50')
      expect(backdrop.exists()).toBe(true)
    })

    it('should have rounded corners on modal', () => {
      const wrapper = mountComponent()

      const modal = wrapper.find('.rounded-2xl')
      expect(modal.exists()).toBe(true)
    })

    it('should have max-width constraint', () => {
      const wrapper = mountComponent()

      const modal = wrapper.find('.max-w-2xl')
      expect(modal.exists()).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle episode with very long name', () => {
      const wrapper = mountComponent(createMockEpisode({
        name: 'This is a very long episode name that should be displayed properly in the modal',
      }))

      expect(wrapper.find('h2').text()).toContain('This is a very long episode name')
    })

    it('should handle episode with special characters in name', () => {
      const wrapper = mountComponent(createMockEpisode({
        name: "The King's Speech & Other Stories",
      }))

      expect(wrapper.find('h2').text()).toBe("The King's Speech & Other Stories")
    })

    it('should handle summary with nested HTML tags', () => {
      const wrapper = mountComponent(createMockEpisode({
        summary: '<div><p>Nested <span>content</span></p></div>',
      }))

      const summary = wrapper.find('p.text-gray-300')
      expect(summary.text()).toBe('Nested content')
    })

    it('should handle high season and episode numbers', () => {
      const wrapper = mountComponent(createMockEpisode({ season: 25, number: 100 }))

      const seasonEpisode = wrapper.find('p.text-accent')
      expect(seasonEpisode.text()).toBe('Season 25 • Episode 100')
    })
  })
})
