import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GenreRow from '../GenreRow.vue'
import ShowCard from '../ShowCard.vue'
import type { Show } from '@/types/show'

const createMockShow = (id: number, name: string): Show => ({
  id,
  name,
  genres: ['Drama'],
  rating: { average: 8.0 },
  image: { medium: 'http://example.com/medium.jpg', original: 'http://example.com/original.jpg' },
  status: 'Ended',
  summary: '<p>Test summary</p>',
})

describe('GenreRow', () => {
  const mockShows: Show[] = [
    createMockShow(1, 'Show One'),
    createMockShow(2, 'Show Two'),
    createMockShow(3, 'Show Three'),
  ]

  const defaultProps = {
    genre: 'Drama',
    shows: mockShows,
  }

  const mountComponent = (props = defaultProps) => {
    return mount(GenreRow, {
      props,
      global: {
        stubs: {
          ShowCard: true,
          RouterLink: true,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the genre title and correct show prop to each ShowCard', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('h2').text()).toBe('Drama')
      const showCards = wrapper.findAllComponents(ShowCard)
      expect(showCards).toHaveLength(3)
      showCards.forEach((card, index) => {
        expect(card.props('show')).toEqual(mockShows[index])
      })
    })

    it('should render with different genre name', () => {
      const wrapper = mountComponent({
        genre: 'Comedy',
        shows: mockShows,
      })

      expect(wrapper.find('h2').text()).toBe('Comedy')
    })
  })

  describe('scroll buttons', () => {
    it('should hide scroll buttons when shows count is 3 or less', () => {
      const wrapper = mountComponent({
        genre: 'Drama',
        shows: mockShows.slice(0, 3),
      })

      const scrollButtons = wrapper.findAll('button[aria-label]')
      expect(scrollButtons).toHaveLength(0)
    })

    it('should show scroll buttons when shows count is more than 3', () => {
      const fourShows = [...mockShows, createMockShow(4, 'Show Four')]
      const wrapper = mountComponent({
        genre: 'Drama',
        shows: fourShows,
      })

      const leftButton = wrapper.find('button[aria-label="Scroll left"]')
      const rightButton = wrapper.find('button[aria-label="Scroll right"]')

      expect(leftButton.exists()).toBe(true)
      expect(rightButton.exists()).toBe(true)
    })
  })

  describe('scroll functionality', () => {
    it('should call scrollBy with negative value when clicking left button', async () => {
      const fourShows = [...mockShows, createMockShow(4, 'Show Four')]
      const wrapper = mountComponent({
        genre: 'Drama',
        shows: fourShows,
      })

      const scrollContainer = wrapper.find('.overflow-x-auto').element as HTMLDivElement
      const scrollBySpy = vi.fn()
      scrollContainer.scrollBy = scrollBySpy

      await wrapper.find('button[aria-label="Scroll left"]').trigger('click')

      expect(scrollBySpy).toHaveBeenCalledWith({ left: -600, behavior: 'smooth' })
    })

    it('should call scrollBy with positive value when clicking right button', async () => {
      const fourShows = [...mockShows, createMockShow(4, 'Show Four')]
      const wrapper = mountComponent({
        genre: 'Drama',
        shows: fourShows,
      })

      const scrollContainer = wrapper.find('.overflow-x-auto').element as HTMLDivElement
      const scrollBySpy = vi.fn()
      scrollContainer.scrollBy = scrollBySpy

      await wrapper.find('button[aria-label="Scroll right"]').trigger('click')

      expect(scrollBySpy).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' })
    })
  })

  describe('empty state', () => {
    it('should render no ShowCards when shows array is empty', () => {
      const wrapper = mountComponent({
        genre: 'Drama',
        shows: [],
      })

      const showCards = wrapper.findAllComponents(ShowCard)
      expect(showCards).toHaveLength(0)
    })

    it('should still render genre title when shows array is empty', () => {
      const wrapper = mountComponent({
        genre: 'Drama',
        shows: [],
      })

      expect(wrapper.find('h2').text()).toBe('Drama')
    })
  })
})
