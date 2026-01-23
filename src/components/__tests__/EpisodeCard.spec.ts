import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EpisodeCard from '../EpisodeCard.vue'
import RatingBadge from '../RatingBadge.vue'
import type { Episode } from '@/types/episode'

describe('EpisodeCard', () => {
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
    return mount(EpisodeCard, {
      props: { episode },
      global: {
        stubs: {
          RatingBadge: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render episode name with number', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('h4').text()).toBe('1. Pilot')
    })

    it('should render different episode number and name', () => {
      const wrapper = mountComponent(createMockEpisode({ number: 5, name: 'The Heist' }))

      expect(wrapper.find('h4').text()).toBe('5. The Heist')
    })

    it('should strip HTML from summary', () => {
      const wrapper = mountComponent(createMockEpisode({
        summary: '<p>This is a <strong>test</strong> summary.</p>',
      }))

      const summary = wrapper.find('p.text-gray-400')
      expect(summary.text()).toBe('This is a test summary.')
    })

    it('should show "No summary available." when summary is empty', () => {
      const wrapper = mountComponent(createMockEpisode({ summary: '' }))

      const summary = wrapper.find('p.text-gray-400')
      expect(summary.text()).toBe('No summary available.')
    })

    it('should show "No summary available." when summary is null', () => {
      const wrapper = mountComponent(createMockEpisode({ summary: null as unknown as string }))

      const summary = wrapper.find('p.text-gray-400')
      expect(summary.text()).toBe('No summary available.')
    })
  })

  describe('image', () => {
    it('should display episode image when available', () => {
      const wrapper = mountComponent()

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('http://example.com/medium.jpg')
    })

    it('should have correct alt text', () => {
      const wrapper = mountComponent(createMockEpisode({ name: 'Season Finale' }))

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Season Finale')
    })

    it('should have lazy loading enabled', () => {
      const wrapper = mountComponent()

      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })

    it('should show placeholder when episode has no image', () => {
      const wrapper = mountComponent(createMockEpisode({ image: null }))

      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)

      const placeholder = wrapper.find('.aspect-video svg')
      expect(placeholder.exists()).toBe(true)
    })

    it('should show video icon placeholder when no image', () => {
      const wrapper = mountComponent(createMockEpisode({ image: null }))

      const svgPlaceholder = wrapper.find('.aspect-video .flex svg')
      expect(svgPlaceholder.exists()).toBe(true)
    })
  })

  describe('rating', () => {
    it('should pass rating to RatingBadge component', () => {
      const wrapper = mount(EpisodeCard, {
        props: { episode: createMockEpisode({ rating: { average: 9.2 } }) },
      })

      const ratingBadge = wrapper.findComponent(RatingBadge)
      expect(ratingBadge.props('rating')).toBe(9.2)
    })

    it('should pass sm size to RatingBadge', () => {
      const wrapper = mount(EpisodeCard, {
        props: { episode: createMockEpisode() },
      })

      const ratingBadge = wrapper.findComponent(RatingBadge)
      expect(ratingBadge.props('size')).toBe('sm')
    })

    it('should handle null rating', () => {
      const wrapper = mount(EpisodeCard, {
        props: { episode: createMockEpisode({ rating: { average: null } }) },
      })

      const ratingBadge = wrapper.findComponent(RatingBadge)
      expect(ratingBadge.props('rating')).toBe(null)
    })
  })

  describe('styling', () => {
    it('should have hover border effect class', () => {
      const wrapper = mountComponent()

      const card = wrapper.find('.episode-card')
      expect(card.classes()).toContain('hover:border-accent/50')
    })

    it('should have group class for hover effects', () => {
      const wrapper = mountComponent()

      const card = wrapper.find('.episode-card')
      expect(card.classes()).toContain('group')
    })

    it('should have overflow hidden for image container', () => {
      const wrapper = mountComponent()

      const imageContainer = wrapper.find('.aspect-video')
      expect(imageContainer.classes()).toContain('overflow-hidden')
    })
  })

  describe('click events', () => {
    it('should emit click event when card is clicked', async () => {
      const episode = createMockEpisode()
      const wrapper = mountComponent(episode)

      const card = wrapper.find('.episode-card')
      await card.trigger('click')

      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should emit episode data when clicked', async () => {
      const episode = createMockEpisode({ id: 42, name: 'Test Episode' })
      const wrapper = mountComponent(episode)

      const card = wrapper.find('.episode-card')
      await card.trigger('click')

      const emittedEvents = wrapper.emitted('click')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents![0]).toEqual([episode])
    })

    it('should have cursor-pointer class for clickability', () => {
      const wrapper = mountComponent()

      const card = wrapper.find('.episode-card')
      expect(card.classes()).toContain('cursor-pointer')
    })
  })

  describe('edge cases', () => {
    it('should handle episode with very long name', () => {
      const wrapper = mountComponent(createMockEpisode({
        number: 10,
        name: 'This is a very long episode name that should be truncated or handled properly',
      }))

      expect(wrapper.find('h4').text()).toContain('10.')
      expect(wrapper.find('h4').text()).toContain('This is a very long')
    })

    it('should handle episode with special characters in name', () => {
      const wrapper = mountComponent(createMockEpisode({
        name: "The King's Speech & Other Stories",
      }))

      expect(wrapper.find('h4').text()).toContain("The King's Speech & Other Stories")
    })

    it('should handle summary with nested HTML tags', () => {
      const wrapper = mountComponent(createMockEpisode({
        summary: '<div><p>Nested <span>content</span></p></div>',
      }))

      const summary = wrapper.find('p.text-gray-400')
      expect(summary.text()).toBe('Nested content')
    })

    it('should handle summary with HTML entities', () => {
      const wrapper = mountComponent(createMockEpisode({
        summary: '<p>Test &amp; verify &lt;content&gt;</p>',
      }))

      // Note: HTML entities remain as is since we're only stripping tags
      const summary = wrapper.find('p.text-gray-400')
      expect(summary.text()).toContain('Test')
    })
  })
})
