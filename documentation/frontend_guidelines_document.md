# jergadic-starter-pro Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the jergadic-starter-pro project. It serves as a clear guide for any developer or team member—regardless of technical background—to understand and contribute to the frontend setup.

## 1. Frontend Architecture

### Frameworks and Libraries
- **Next.js (App Router)**: Provides file-based routing, server components, and API routes under `app/`.  
- **React**: Core UI library for building interactive components.  
- **TypeScript**: Ensures type safety and improves maintainability.  
- **Clerk**: Third-party authentication provider integrated via a React context/provider component.
- **PostCSS**: Built into Next.js for autoprefixing and future CSS transformations.

### Folder Structure
```
/ app/                  # Pages, layouts, API routes
  ├ api/webhooks/route.ts  # Webhook endpoint
  ├ fonts/                 # Custom font files (Geist VF, GeistMono VF)
  ├ globals.css            # Global CSS variables and resets
  ├ layout.tsx             # Root layout & global providers
  └ page.tsx               # Home page component
/ components/           # Reusable UI components
  └ providers/           # Context/Provider wrappers (e.g., Clerk)
/ .cursor/ rules/        # Project-specific guidelines & docs
```

### Scalability, Maintainability, Performance
- **Scalability**: File-based routing and modular components make it easy to add features and pages without global configuration.  
- **Maintainability**: Clear separation between routes (`app/`), UI components (`components/`), and docs/rules (`.cursor/`). TypeScript types and interfaces reduce runtime errors.  
- **Performance**: Next.js automatic code splitting, SSR/SSG, and built-in image/font optimizations deliver fast load times.

## 2. Design Principles

### Key Principles
- **Usability**: Intuitive navigation, clear visual hierarchy, consistent UI patterns.  
- **Accessibility**: Semantic HTML, ARIA attributes where needed, keyboard navigation support, color-contrast checks.  
- **Responsiveness**: Mobile-first approach, fluid layouts with Flexbox and CSS Grid.  
- **Consistency**: Shared design tokens (colors, spacing, typography) used across all components.

### Application in UI
- Navigation menus collapse into a mobile drawer.  
- Buttons, forms, and alerts use consistent spacing and feedback states (hover, focus, disabled).  
- All interactive elements maintain a minimum 4.5:1 contrast ratio against backgrounds.

## 3. Styling and Theming

### Styling Approach
- **Global CSS** (`app/globals.css`): Defines resets, base typography, and CSS variables.  
- **CSS Modules**: Each component can have a paired `.module.css` file for scoped styles using the BEM naming convention (e.g., `.button`, `.button--primary`).  
- **PostCSS**: Handles autoprefixing and can be extended for future plugins.

### Theming
- **CSS Variables**: Defined in `:root` in `globals.css`. Easily overridden for light/dark mode.
- **Switching Themes**: Toggling a `data-theme` attribute on the `<html>` element flips color variables.

### Visual Style
- **Overall Style**: Modern flat design with subtle glassmorphism panels (translucent backgrounds with `backdrop-filter: blur(8px)`) to add depth.  

### Color Palette
```
:root {
  /* Primary Brand */
  --color-primary:    #4F46E5;  /* Indigo 600 */
  --color-primary-light: #6366F1; 
  --color-secondary:  #10B981;  /* Emerald 500 */
  --color-accent:     #F59E0B;  /* Amber 500 */

  /* Neutral */
  --color-bg:         #F9FAFB;
  --color-surface:    rgba(255, 255, 255, 0.75); /* for glass panels */
  --color-border:     #E5E7EB;  /* Gray 200 */
  --color-text:       #111827;  /* Gray 900 */
  --color-text-muted: #6B7280;  /* Gray 500 */
}
[data-theme="dark"] {
  --color-bg:         #111827;
  --color-surface:    rgba(17, 24, 39, 0.75);
  --color-text:       #F9FAFB;
  --color-text-muted: #9CA3AF;
}
```

### Typography
- **Primary Font (Headings & Body)**: `Geist VF`, fallback `sans-serif`.  
- **Monospace Font**: `GeistMono VF`, fallback `monospace`, used for code snippets and terminal-style components.

## 4. Component Structure

### Organization
- **components/atoms/**: Basic building blocks (Button, Input, Avatar).  
- **components/molecules/**: Combinations of atoms (FormGroup, Card, NavLink).  
- **components/organisms/**: Complex, page-specific groups (Header, Footer, DashboardPanel).  
- **components/providers/**: Context providers (ClerkAuthProvider).

### Reusability and Maintainability
- Each component lives in its own folder:  
  - `index.tsx` for the React component.  
  - `styles.module.css` for scoped styles.  
  - `types.ts` for any component-specific TypeScript interfaces.  
- **Prop-driven**: Components accept props for styling variants, data, and event callbacks.
- **Documentation**: Storybook (optional future integration) or a simple `README.md` in each component folder explains usage.

## 5. State Management

### Approach
- **Local State**: React’s `useState` and `useReducer` for component-level state.  
- **Global State**: React Context API for cross-component data (e.g., theme, user session).  
- **Authentication State**: Managed by Clerk’s context provider, injected at the root layout.

### Guidelines
- Avoid deep prop drilling by elevating state to the nearest common ancestor or using Context.  
- For complex data flows, consider lightweight state libraries (Zustand, Jotai) in the future.

## 6. Routing and Navigation

### Routing
- **Next.js App Router**: File-based under `app/`:  
  - `app/page.tsx` → `/`  
  - `app/about/page.tsx` → `/about`  
  - `app/api/...` → REST API endpoints.

### Navigation
- Use `<Link>` from `next/link` for client-side transitions.  
- Central navigation defined in `layout.tsx` for consistent headers/footers.  
- Protected routes: wrap page components in a `withAuth` HOC or guard using Clerk’s `SignedIn`/`SignedOut` components.

## 7. Performance Optimization

### Strategies
- **Automatic Code Splitting**: Next.js splits code by route.  
- **Dynamic Imports**: `next/dynamic` for heavy components or non-critical features.  
- **Font Optimization**: Using `next/font` (or manual preloading) to serve only used subsets.  
- **Image Optimization**: `next/image` for responsive, lazy-loaded images.  
- **Asset Compression**: Gzip/Brotli via hosting platform.  
- **Caching**: Leverage ISR (Incremental Static Regeneration) and HTTP caching headers.

## 8. Testing and Quality Assurance

### Testing Layers
- **Unit Tests**: Jest + React Testing Library for components and utility functions.  
- **Integration Tests**: Testing login flows, form submissions, and API interactions.  
- **End-to-End (E2E)**: Cypress or Playwright for full user journeys (login, navigation, form usage).

### Linters and Formatters
- **ESLint**: Enforce code style, catch errors early.  
- **Prettier**: Consistent formatting rules.  
- **TypeScript**: `tsc --noEmit` for type checking in CI.

### Continuous Integration
- **GitHub Actions** (or similar): Run lint, type check, unit tests, and E2E tests on each pull request.

## 9. Conclusion and Overall Frontend Summary

The jergadic-starter-pro frontend is built on a **modern, scalable, and maintainable** foundation:
- **Next.js & React + TypeScript** deliver performance and developer productivity.  
- **Component-based architecture** promotes reusability, clear boundaries, and easy testing.  
- **Global design tokens** (colors, fonts, spacing) ensure a consistent user experience.  
- **Clerk integration** offloads authentication complexity, while `.cursor/rules` maintain high code quality and standards.

Together, these guidelines align with the project’s goals of rapid development, strong UX, and robust maintainability—ensuring that every contributor can understand, extend, and optimize the frontend with confidence.