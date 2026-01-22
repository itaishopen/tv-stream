<script setup lang="ts">
  /**
   * Reusable rating badge component displaying a star icon with rating value.
   */
  interface Props {
    rating: number | null;
    size?: 'sm' | 'md' | 'lg';
    showMax?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    size: 'md',
    showMax: false,
  });

  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      padding: '',
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-lg',
      padding: 'px-3 py-1',
    },
    lg: {
      icon: 'w-6 h-6',
      text: 'text-2xl',
      padding: 'px-4 py-2',
    },
  };
</script>

<template>
  <div
    v-if="rating"
    class="inline-flex items-center gap-1.5"
    :class="[
      size !== 'sm' ? 'bg-accent/20 rounded-full' : '',
      sizeConfig[size].padding
    ]">
    <svg
      :class="sizeConfig[size].icon"
      fill="currentColor"
      class="text-yellow-400"
      viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <span
      class="font-bold text-accent"
      :class="sizeConfig[size].text">
      {{ rating.toFixed(1) }}
    </span>
    <span
      v-if="showMax"
      class="text-gray-400"
      :class="size === 'lg' ? 'text-xl' : 'text-sm'">
      / 10
    </span>
  </div>
</template>
