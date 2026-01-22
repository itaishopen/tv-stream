import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RatingBadge from '../RatingBadge.vue'

describe('RatingBadge', () => {
  const mountComponent = (props: { rating: number | null; size?: 'sm' | 'md' | 'lg'; showMax?: boolean }) => {
    return mount(RatingBadge, {
      props,
    })
  }

  describe('rendering', () => {
    it('should render rating when rating is provided and format to one decimal place', () => {
      const wrapper = mountComponent({ rating: 8.46 })

      expect(wrapper.text()).toContain('8.5')
    })

    it('should not render when rating is null', () => {
      const wrapper = mountComponent({ rating: null })

      expect(wrapper.find('div').exists()).toBe(false)
    })

    it('should render star icon', () => {
      const wrapper = mountComponent({ rating: 8.0 })

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })
  })

  describe('size variants', () => {
    it('should apply sm size classes', () => {
      const wrapper = mountComponent({ rating: 8.0, size: 'sm' })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('w-4')
      expect(svg.classes()).toContain('h-4')
      const ratingText = wrapper.find('span.font-bold')
      expect(ratingText.classes()).toContain('text-sm')
      const container = wrapper.find('div')
      expect(container.classes()).not.toContain('bg-accent/20')
    })

    it('should apply md size classes by default', () => {
      const wrapper = mountComponent({ rating: 8.0 })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('w-5')
      expect(svg.classes()).toContain('h-5')
      const ratingText = wrapper.find('span.font-bold')
      expect(ratingText.classes()).toContain('text-lg')
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-accent/20')
    })

    it('should apply lg size classes', () => {
      const wrapper = mountComponent({ rating: 8.0, size: 'lg' })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('w-6')
      expect(svg.classes()).toContain('h-6')
      const ratingText = wrapper.find('span.font-bold')
      expect(ratingText.classes()).toContain('text-2xl')
      const container = wrapper.find('div')
      expect(container.classes()).toContain('bg-accent/20')
    })
  })

  describe('showMax prop', () => {
    it('should not show /10 suffix by default', () => {
      const wrapper = mountComponent({ rating: 8.0 })

      expect(wrapper.text()).not.toContain('/ 10')
    })

    it('should show /10 suffix when showMax is true', () => {
      const wrapper = mountComponent({ rating: 8.0, showMax: true })

      expect(wrapper.text()).toContain('/ 10')
    })

    it('should not show /10 suffix when showMax is false', () => {
      const wrapper = mountComponent({ rating: 8.0, showMax: false })

      expect(wrapper.text()).not.toContain('/ 10')
    })

    it('should apply lg text size to /10 suffix when size is lg', () => {
      const wrapper = mountComponent({ rating: 8.0, size: 'lg', showMax: true })

      const maxSpan = wrapper.find('span.text-gray-400')
      expect(maxSpan.classes()).toContain('text-xl')
    })

    it('should apply sm text size to /10 suffix when size is not lg', () => {
      const wrapper = mountComponent({ rating: 8.0, size: 'md', showMax: true })

      const maxSpan = wrapper.find('span.text-gray-400')
      expect(maxSpan.classes()).toContain('text-sm')
    })
  })

  describe('edge cases', () => {
    it('should handle rating of 0', () => {
      const wrapper = mountComponent({ rating: 0 })

      expect(wrapper.find('div').exists()).toBe(false)
    })

    it('should handle rating of 10', () => {
      const wrapper = mountComponent({ rating: 10 })

      expect(wrapper.text()).toContain('10.0')
    })

    it('should handle very small ratings', () => {
      const wrapper = mountComponent({ rating: 0.1 })

      expect(wrapper.text()).toContain('0.1')
    })
  })
})
