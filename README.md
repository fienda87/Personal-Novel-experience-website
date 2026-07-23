# GOD OF COLLEGE

A **Personal Novel Experience Website** — built for readers who want more than just text on a white background.

This is where I publish and present my web novel *God of College*. Every line of code exists to pull you deeper into the world of Baydar, ITK, and the chaos that follows an SSS+ Skill named *Loli Hunter*.

---

## What You'll Find Here

**The Novel** — Full chapters of *God of College*, an Indonesian dark fantasy web novel. A parallel world. A dangerous campus. A protagonist who didn't sign up for any of this.

**Immersive Reading** — Glassmorphism UI. Animated paragraph reveals. Font controls. Focus mode. Ambient audio. Entity highlights that let you tap or hover any name — character, location, item — and see their lore without leaving the page.

**The World** — A character wiki with stat blocks, lore snippets, and artwork. A living knowledge base that grows with every chapter.

**The Atmosphere** — Custom WebGL animated backgrounds. An ambient music player. Per-chapter audio. Every visit should feel like stepping into a different world.

---

## Built With

| Layer | |
|-------|-|
| Framework | Next.js 16 · TypeScript 5 |
| Frontend | React 19 · Tailwind CSS v4 · Framer Motion 12 |
| Editor | TipTap 3 (rich text for writing chapters) |
| Graph | React Flow 12 (world-building map) |
| Storage | Flat JSON files — no database, no vendor lock |
| Audio | Custom Web Audio engine with ambient player & radio |
| Background | Raw WebGL fragment shader (fBm noise) |
| Icons | Phosphor · Lucide |

---

## For Readers

Open `http://localhost:3000` (or the live URL), browse the **Library**, pick a chapter, and read. The interface adapts to desktop and mobile. On mobile, entity info appears as a bottom sheet. On desktop, hover tooltips.

Characters, locations, and items glow in the text — explore them as you read. No ads. No distractions. Just the story and its world.

---

## For Writers (Me)

The admin panel (`/admin`) gives me a writer dashboard, a TipTap-based chapter editor with `/` slash commands and `@` mention autocomplete, character management, a world graph editor, and file-based data I can edit in any text editor or commit to git.

---

## Getting Started

```shell
npm install
npm run dev
```

Then open `http://localhost:3000` and start reading.

```shell
npm run build    # production build
npm run test     # run tests
```

---

## Project Structure

```
src/
├── app/
│   ├── (reader)/       # Chapter reader, library, character wiki
│   ├── (admin)/        # Writing dashboard, editor, canvas, gallery
│   └── api/            # REST endpoints (chapters, characters, entities, uploads)
├── components/
│   ├── layout/         # Navigation, backgrounds, audio widget
│   ├── reader/         # Interactive text, audio player, reading controls
│   ├── editor/         # TipTap rich text editor
│   ├── canvas/         # World graph nodes
│   ├── wiki/           # Character stat blocks
│   └── ui/             # Glass panels, cards, buttons, modals
└── lib/                # Types and utilities
data/                    # JSON storage — chapters, characters, entities, canvas
```

---

*Created by Fi · A206 Studio*

*Some doors don't need a key. They need a story.*
