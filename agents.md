# Agents & Future Projects

This file tracks the roadmap and future feature ideas for Mattevy's Mailbox as it evolves from a 2-person web app into a multi-tenant native iOS app.

## Current Phase: Web App (React/Vite + Supabase)

Single-tenant, no auth, deployed on Vercel. See CLAUDE.md for full architecture.

---

## Phase 1: Foundation (Native App + Auth + Multi-Tenancy)

### Native App Migration
- [ ] Set up Expo (React Native) project
- [ ] Port existing React components to React Native equivalents
- [ ] Implement native navigation (bottom tabs, stack navigator)
- [ ] Port animations from Framer Motion to React Native Reanimated
- [ ] Configure EAS Build for iOS
- [ ] App Store listing, icons, screenshots, review submission

### Authentication (Supabase Auth)
- [ ] Magic link (passwordless email)
- [ ] Sign in with Apple
- [ ] Sign in with Google
- [ ] Auth context/provider in app
- [ ] Protected routes — redirect to login if unauthenticated
- [ ] Replace localStorage username with authenticated user identity

### Multi-Tenancy (Mailboxes)
- [ ] `mailboxes` table — each couple gets a mailbox
- [ ] `mailbox_members` table — maps users to their mailbox
- [ ] Add `mailbox_id` foreign key to `ideas` table
- [ ] Invite flow — one partner creates mailbox, invites the other via link/code
- [ ] Supabase RLS policies — users can only access their own mailbox's data
- [ ] Onboarding flow — create mailbox or join existing one

### Push Notifications
- [ ] Expo Notifications setup (expo-notifications)
- [ ] Store push tokens in Supabase per user
- [ ] Supabase Edge Function to send push via Expo Push API
- [ ] Notification triggers: new idea, heart, idea expiring soon
- [ ] Keep SMS (Twilio) as fallback for users without push enabled
- [ ] Notification preferences screen (push, SMS, or both)

### iOS Widgets (WidgetKit)
- [ ] Native Swift widget extension via Expo config plugin or bare workflow
- [ ] Small widget: random date idea or next expiring idea
- [ ] Medium widget: top 2-3 hearted ideas
- [ ] Widget data sync via shared App Group + background fetch
- [ ] Deep link from widget tap into specific idea in app

---

## Phase 2: Feature Expansion

### Edit Ideas
- [ ] Edit button on IdeaCard (only for idea author)
- [ ] Edit modal/screen pre-filled with existing data
- [ ] `updated_at` timestamp column on ideas table
- [ ] Optimistic update via TanStack Query mutation

### Comments & Reactions
- [ ] `comments` table (id, idea_id, mailbox_id, user_id, text, created_at)
- [ ] Comment thread UI on idea detail screen
- [ ] Emoji reactions beyond heart (e.g., fire, laughing, eyes)
- [ ] `reactions` table (id, idea_id, mailbox_id, user_id, emoji)
- [ ] Push notification on new comment

### Photo Attachments
- [ ] Image upload to Supabase Storage (scoped by mailbox_id)
- [ ] `idea_photos` table (id, idea_id, mailbox_id, photo_url, created_at)
- [ ] Image picker in write wizard
- [ ] Photo carousel/preview on idea cards
- [ ] Image compression before upload

### Calendar Integration
- [ ] "Schedule this date" action on idea cards
- [ ] Native calendar API integration (expo-calendar)
- [ ] Date/time picker for scheduling
- [ ] Optional: sync with Google Calendar / Apple Calendar
- [ ] Mark idea as "scheduled" state (between active and done)
- [ ] `scheduled_at` column on ideas table

### History & Stats
- [ ] Stats screen/tab showing:
  - Total dates completed
  - Dates per month/year
  - Most common category
  - Streak tracking (consecutive weeks with a date)
  - Cost breakdown
- [ ] "Date journal" — add notes/photos after completing a date
- [ ] `date_journal` table (id, idea_id, mailbox_id, notes, photo_urls, completed_at)
- [ ] Year-in-review summary

### Dark Mode
- [ ] Design dark palette that preserves the paper/postcard aesthetic
- [ ] System preference detection + manual toggle
- [ ] Update design tokens for dark variant
- [ ] Ensure all category colors have sufficient contrast in dark mode

---

## Phase 3: Polish & Growth

### Onboarding & Discovery
- [ ] App Store Optimization (ASO) — keywords, screenshots, description
- [ ] Onboarding tutorial for new couples
- [ ] Template/starter ideas ("Seed your mailbox with 5 classic date ideas")
- [ ] Share mailbox via link / QR code

### Social & Community
- [ ] Public idea templates that couples can browse and add to their mailbox
- [ ] "Date idea of the week" curated suggestion
- [ ] Optional anonymous stats ("couples in your city love Outdoors ideas")

### Performance & Reliability
- [ ] Offline support with local-first sync
- [ ] Background refresh for widgets
- [ ] Error boundaries and crash reporting (Sentry)
- [ ] Analytics (PostHog or similar, privacy-respecting)

---

## Technical Debt & Housekeeping
- [ ] Remove deprecated vanilla JS version (index.html + src/) once native app is stable
- [ ] Move Supabase credentials to environment variables (currently hardcoded)
- [ ] Add Supabase RLS policies (currently zero access control)
- [ ] Add automated tests (unit + integration)
- [ ] CI/CD pipeline for native builds (EAS Build + GitHub Actions)
