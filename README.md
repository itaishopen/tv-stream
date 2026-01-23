# TV Stream Dashboard

A Vue 3 application for browsing TV shows using the TVMaze API.

**Live Demo**: https://itaishopen.github.io/tv-stream/

## Requirements

- **Node.js**: ^20.19.0 or >=22.12.0
- **npm**: 10.x or higher

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test:unit

# Build for production
npm run build
```

## Architectural Decisions

### Pinia over Vuex

- **Simpler API**: Pinia eliminates mutations, using only state and actions, reducing boilerplate
- **TypeScript support**: First-class TypeScript inference without extra configuration
- **Composition API native**: Designed for Vue 3's Composition API, aligning with modern Vue patterns
- **Lighter bundle**: Smaller footprint (~1KB) compared to Vuex
- **Official recommendation**: Pinia is now the official state management solution for Vue

### Tailwind CSS

- **Utility-first**: Rapid UI development without context-switching to CSS files
- **No unused CSS**: Production builds automatically purge unused styles
- **Responsive design**: Built-in responsive modifiers (`md:`, `lg:`) simplify mobile-first development
- **Customizable**: Easy theming via `tailwind.config.js` for colors, fonts, and animations

## Project Structure

```
src/
├── api/          # API service layer (showService)
├── components/   # Reusable Vue components (EpisodeCard, EpisodeModal, GenreRow, RatingBadge, SearchBar, ShowCard)
├── stores/       # Pinia stores (ShowsStore)
├── types/        # TypeScript interfaces (Show, Episode, Rating, Image, SearchResult)
├── utils/        # Utility functions (stripHtml)
└── views/        # Page components (DashboardView, ShowDetailView)
```

## Tech Stack

- Vue 3.5 + TypeScript
- Pinia 3 (State Management)
- Vue Router 4
- Tailwind CSS 4
- Vite 7
- Vitest (Testing)
