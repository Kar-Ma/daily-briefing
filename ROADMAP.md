# Roadmap

A running list of card types and product directions for the Daily Briefing app. The architecture is designed so that adding a new card type is a small, isolated change: a new `src/lib/<name>.ts` module + a section in `src/app/page.tsx`. Each card runs independently and caches independently.

## Currently shipped

- ☀️ **Weather** — Open-Meteo + LLM clothing recommendation
- 📰 **Top headlines** — Brave Search + LLM curation in OpenClaw style
- 📅 **Today's calendar** — Google iCal across multiple calendars, with LLM closing note
- 🧘 **Daily stoic quote** — LLM, varied across thinkers

## On the horizon

### 🐦 Twitter trends overnight
What's trending on Twitter while I was asleep — catches cultural and news pulse that doesn't make it into formal news feeds.
*Likely stack:* Twitter API (paid tier) or a third-party trends aggregator. Filter to last ~8 hours.

### 📧 Overnight email summary
What came into the inbox while I was asleep? Brief summary plus flagging of anything urgent or requires-response.
*Likely stack:* Gmail API with OAuth → fetch unread since previous evening → LLM summary with urgency classification.

### 💪 Workout schedule
What workouts are coming up at the gym (David Lloyd in my case)? Today's class, this week's plan, anything I've booked.
*Likely stack:* Varies per gym. May require unofficial scraping, browser automation, or manual entry via a small admin UI.

## Open ideas — not committed

- "What to focus on today" card based on calendar load + outstanding tasks
- Air quality / pollen forecast
- Tomorrow's weather (for evening planning)
- Word or concept of the day
- Daily reflection prompt

## Design constraint for future card visual/interaction work

As the visual treatment (skeuomorphic polish) and interaction model (swipeable card stacks) evolves, the design system must accommodate **card types that don't exist yet**. Concretely:

- **Layout extensibility** — a new card should drop in without restructuring the page.
- **Visual distinction within unity** — each card type has its own visual identity, but they all clearly belong to the same product.
- **Interaction scaling** — any swipe/scroll/stack pattern needs to feel right with 4 cards *and* with 12.
- **Empty / loading / error states per card** — adding a card must include thoughtful handling for "no data," "still loading," and "API failed."

Treat this file as the canonical list of "things we know we want to build" when making design decisions today.
