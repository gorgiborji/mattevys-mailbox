# Mattevy's Mailbox

A shared date-idea mailbox for Matt & Evy. Drop ideas, heart favorites, mark dates as done.

## Tech Stack

- **Vanilla JS** (ES modules, no framework, no bundler)
- **Supabase** backend (PostgreSQL via `@supabase/supabase-js` CDN)
- **Single HTML entry** (`index.html`) with module scripts
- No build step — files served directly

## Architecture

```
index.html                    # Structure: header, 3 tab panes, overlays, bottom nav
src/
├── main.js                   # Entry: store subscriptions, bind events, fetch data
├── config.js                 # Supabase client (URL + anon key)
├── actions/
│   ├── ideas.js              # CRUD: fetchIdeas, createIdea, toggleHeart, markDone, removeIdea
│   └── ui.js                 # UI state: chips, form reset, watermark, filter, animating
├── data/
│   └── ideasRepo.js          # Supabase queries (list, add, update, delete)
├── state/
│   ├── store.js              # Custom pub/sub store with one-level-deep merge
│   └── selectors.js          # selectTopPicks, selectBox, selectArchive
├── ui/
│   ├── dom.js                # All getElementById refs as `$` object
│   ├── renderBoard.js        # Renders all 3 card lists with filter + skeleton logic
│   ├── renderCard.js         # Single card DOM builder (gradient band, SVG checkmark)
│   ├── bindEvents.js         # All event wiring (cards, submit, tabs, wizard, swipe, filters, surprise)
│   ├── animation.js          # Submission envelope-drop animation
│   ├── chips.js              # Chip toggle (cost/category radio buttons)
│   ├── tabs.js               # Bottom tab navigation with slide transitions
│   ├── wizard.js             # 3-step form wizard (title → vibe → details)
│   ├── swipe.js              # Touch swipe gestures (left=delete, right=heart)
│   ├── surpriseMe.js         # Random idea FAB + full-screen modal
│   └── confetti.js           # Stamp slam + confetti burst celebration
├── utils/
│   ├── escapeHtml.js         # XSS prevention
│   └── preferences.js        # localStorage for saved username
└── styles/
    └── base.css              # All styling (single file, CSS custom properties)
```

## Data Model

Ideas table in Supabase:
```
id: number, title: string, description: string?, location: string?,
cost: "$"|"$$"|"$$$"?, category: "Food"|"Outdoors"|"Cozy"|"Adventure"|"Culture"?,
added_by: string?, hearted: boolean, done: boolean, created_at: timestamp
```

## State Management

Custom pub/sub store (`store.js`). One-level-deep merge for nested objects.
```js
store.get()           // Read state
store.set({ ui: { loading: true } })  // Merge (doesn't clobber sibling keys)
store.subscribe(fn)   // Listen for changes
```

State shape: `{ ideas[], ui{}, form{}, prefs{} }`

UI state includes: `selectedCost, selectedCategory, archiveOpen, animating, loading, error, activeFilter`

## Key Patterns

- **Event delegation**: Card actions (heart/done/delete) use delegation on `.card-list` containers
- **Optimistic updates**: `toggleHeart` updates store immediately, rolls back on API failure
- **DOM refs**: All elements cached in `dom.js` as `$` — import `{ $ }` to access
- **No routing**: Tab-based SPA. `tabs.js` manages pane visibility with CSS slide animations
- **Touch-only swipe**: `swipe.js` checks `ontouchstart` before binding — no desktop interference

## Design System

- **Fonts**: Caveat (headers), Lora (descriptions), DM Sans (body)
- **Palette**: cream `#FDF6EC`, blush `#F2C4CE`, sage `#B7C9B0`, lavender `#D4C5E2`, ink `#3D2B1F`
- **Category colors**: Food `#F4A261`, Outdoors `#81B29A`, Cozy `#E8C5E5`, Adventure `#F4D35E`, Culture `#B5C7D3`
- **Spring easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` used throughout as `--spring`
- **Aesthetic**: Paper texture overlay, postcard lines, envelope animation, wax-seal stamp

## UI Features

1. **Bottom tab bar** — Write / The Box / Archive with slide transitions
2. **3-step wizard** — Form split into title → category+cost → location+signature
3. **Category gradient bands** — Full-width color header on cards (replaces 4px left stripe)
4. **Springy heart** — Scale 1.4x bounce animation on heart toggle
5. **SVG checkmark draw** — Animated stroke on done button
6. **Card removal** — Slide-down + fade-out on done/delete
7. **Swipe gestures** — Left=delete (red hint), right=heart (pink hint), touch-only
8. **Surprise Me FAB** — Floating dice picks random idea, opens modal with "Let's do this tonight"
9. **Skeleton loading** — 3 shimmer placeholder cards during data fetch
10. **Filter pills** — Sticky scrollable row in The Box tab (category + cost filters)
11. **Confetti celebration** — Wax seal stamp slam + 40-piece confetti burst on marking done
12. **Envelope animation** — 3D fold + drop into ballot box on form submit
