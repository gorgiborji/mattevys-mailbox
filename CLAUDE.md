# Mattevy's Mailbox

A shared date-idea mailbox for Matt & Evy. Drop ideas, heart favorites, mark dates as done.

## IMPORTANT: Active Codebase

> **The React/Vite frontend (`frontend/`) is the active, deployed codebase.**
> All new features, bug fixes, and improvements MUST go in `frontend/`.
>
> The vanilla JS version (`index.html` + `src/`) is **deprecated** and exists only for reference.
> Do NOT add features to or modify the vanilla JS code. Do NOT change `vercel.json` to deploy it.

## Deployment

- **Platform**: Vercel
- **Config**: `vercel.json` builds and deploys `frontend/dist` via Vite
- **Do NOT** change `vercel.json` to point at the vanilla JS version

## Tech Stack

- **React 18** + **Vite** (in `frontend/`)
- **Zustand** for state management
- **TanStack React Query** for data fetching + caching
- **Framer Motion** for animations
- **Lucide React** for icons
- **Supabase** backend (PostgreSQL via `@supabase/supabase-js`)
- **CSS Modules** for scoped styling

## Architecture

```
frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                      # React entry point
    ├── App.jsx                       # Root: tab routing, overlays, realtime sync
    ├── App.module.css
    ├── components/
    │   ├── WriteTab.jsx              # 3-step wizard form (title → vibe+priority → location+signature)
    │   ├── WriteTab.module.css
    │   ├── BoxTab.jsx                # Top Picks + The Box with filter pills + skeleton loading
    │   ├── BoxTab.module.css
    │   ├── ArchiveTab.jsx            # Archive list with count
    │   ├── ArchiveTab.module.css
    │   ├── IdeaCard.jsx              # Card with band, actions, meta, expiry countdown, swipe
    │   ├── IdeaCard.module.css
    │   ├── FilterPills.jsx           # Category + cost + urgent filter bar
    │   ├── FilterPills.module.css
    │   ├── Header.jsx                # App header with postmark
    │   ├── Header.module.css
    │   ├── TabBar.jsx                # Bottom navigation
    │   ├── TabBar.module.css
    │   ├── EnvelopeAnimation.jsx     # Submission animation overlay
    │   ├── StampCelebration.jsx      # Done stamp + confetti overlay
    │   ├── SurpriseFab.jsx           # Random idea FAB + modal
    │   ├── SurpriseMe.module.css
    │   └── Overlays.module.css
    ├── hooks/
    │   └── useIdeas.js               # TanStack Query: fetch, create, toggle, done, delete + realtime
    ├── store/
    │   └── useStore.js               # Zustand: tabs, wizard, chips, priority, form, animations
    ├── lib/
    │   ├── constants.js              # Categories, costs, priorities, colors, icons, easing
    │   └── supabase.js               # Supabase client init
    └── styles/
        ├── tokens.css                # CSS custom properties (palette, easing, radii)
        └── global.css                # Reset + base styles
```

## Data Model

Ideas table in Supabase:
```
id: number, title: string, description: string?, location: string?,
cost: "$"|"$$"|"$$$"?, category: "Food"|"Outdoors"|"Cozy"|"Adventure"|"Culture"?,
added_by: string?, priority: "normal"|"urgent"?, expires_at: date?,
hearted: boolean, done: boolean, deleted: boolean, created_at: timestamp
```

## State Management

Zustand store (`useStore.js`):
```js
useStore((s) => s.activeTab)         // Read a slice
useStore((s) => s.setActiveTab)      // Get an action
```

Key state: `activeTab, wizardStep, selectedCost, selectedCategory, selectedPriority, formTitle, formDescription, formExpiresAt, activeFilter, username, showEnvelopeAnimation, showStampCelebration`

## Key Patterns

- **TanStack Query**: `useIdeas()` for fetching, `useCreateIdea/useToggleHeart/useMarkDone/useDeleteIdea` mutations with optimistic updates
- **Realtime sync**: Supabase postgres_changes channel auto-invalidates query cache
- **Zustand store**: Flat state, individual setters, `resetForm()` clears all form state
- **Framer Motion**: AnimatePresence for wizard steps, layout animations for cards, spring physics for hearts
- **CSS Modules**: Scoped styles, design tokens in `tokens.css`
- **Touch swipe**: Framer Motion drag on cards — left=delete, right=heart
- **Lucide React**: Icon components imported directly, no icon fonts
- **Graceful DB fallback**: `useCreateIdea` retries without priority/expires_at if columns don't exist yet

## Design System

- **Fonts**: Caveat (headers), Lora (descriptions), DM Sans (body)
- **Palette**: cream `#FDF6EC`, blush `#F2C4CE`, blush-dark `#E8A8B8`, sage `#B7C9B0`, lavender `#D4C5E2`, ink `#3D2B1F`, ink-faint `#A48B7C`, stamp-red `#C0392B`
- **Category colors**: Food `#F4A261`, Outdoors `#81B29A`, Cozy `#E8C5E5`, Adventure `#F4D35E`, Culture `#B5C7D3`
- **Easing**: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` for transitions; `--spring: cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy micro-interactions
- **Icons**: Lucide React components (stroke-based, `currentColor`)
- **Aesthetic**: Paper texture, postcard lines, envelope animation, wax-seal stamp

## UI Features

1. **Bottom tab bar** — Write / The Box / Archive with slide transitions
2. **3-step wizard** — title → category+cost+priority+expiry → location+signature
3. **Priority chips** — Normal / Time-sensitive toggle in wizard step 2
4. **Expiry date picker** — Appears when Time-sensitive is selected; countdown on cards
5. **Urgent-first sorting** — Urgent ideas float to top of Top Picks and The Box
6. **Urgent filter pill** — Red-accented filter in The Box tab
7. **Category gradient bands** — Full-width color header on cards with urgent badge
8. **Springy heart** — Scale 1.4x bounce animation on heart toggle
9. **Card removal** — Slide-down + fade-out on done/delete
10. **Swipe gestures** — Left=delete (red hint), right=heart (pink hint), touch-only
11. **Surprise Me FAB** — Floating dice picks random idea, opens modal
12. **Skeleton loading** — Shimmer placeholder cards during data fetch
13. **Filter pills** — Sticky scrollable row (category + cost + urgent filters)
14. **Confetti celebration** — Wax seal stamp slam + confetti burst on marking done
15. **Envelope animation** — 3D fold + drop into ballot box on form submit

## Deprecated: Vanilla JS Version

The files `index.html` and `src/` contain a legacy vanilla JS implementation. These are **not deployed** and should not be modified. They remain in the repo for historical reference only.
