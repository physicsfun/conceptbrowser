# PHYS 1202 · Concept Atlas

An interactive, student-facing course browser for electricity, magnetism, and introductory thermodynamics. Built with React, Vite, and MathJax. No backend, accounts, API keys, or database.

## Run locally

Use Node.js 22.12+ (tested with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open the address Vite prints. For a production build:

```sh
npm run build
npm run preview
```

Deploy the complete `dist/` directory to a static host at the domain root. MathJax, its fonts, and interface fonts are included locally. The build intentionally copies MathJax assets to `dist/mathjax/` and `dist/mathjax-fonts/`; the Vite warning about its classic script is expected. Hash-based topic URLs work without server routing configuration.

## Explore

- Start with the three course domains, then dive through concept cards at any depth.
- Expand the persistent course map independently from selecting a topic. Breadcrumbs and sibling navigation retain context.
- Search topic titles across the full course, including topics with no resources.
- Open **Electricity → Electric Fields and Forces → Coulomb’s Law** for an explanation, worked example, placeholder video, and interactive practice question.
- Try Electric Field, Electric Potential Energy, or Resistance and Resistivity for more MathJax equations.
- Resources also appear on parent concepts such as Electric Fields and Forces and Capacitors.
- Bookmark resources to collect them in Saved resources. Bookmarks persist in this browser's local storage; no student information is stored remotely.
- The mobile navigation opens from the menu button. Resource dialogs support Escape, native focus containment, and focus restoration.

## Edit the course

`src/data/course.js` contains the hierarchy. Each topic has a stable `id`, a `title`, optional `description`, and optional `children`. Leaf topics can use the shorthand `[id, title]`. IDs must be unique and remain stable when topics move. Only top-level domain themes/icons are presentation metadata; unknown domains still render normally.

`src/data/resources.js` maps topic IDs to resource arrays. Attach resources to **any** topic, including a parent. Supported types: `video`, `explanation`, `example`, `practice`, and `link`. Every resource has a stable `id`, `title`, `type`, `duration`, and `body`. Practice resources add `choices`, zero-based `answer`, and `feedback`. External link resources add `url`. Videos are explicitly labeled placeholders; no instructional video is fabricated.

Bodies support plain paragraphs, inline `$...$` and display `$$...$$` TeX. Escape backslashes in JavaScript strings (`\\frac`, for example). Content is rendered as text rather than HTML; MathJax handles notation. No server-side LaTeX or TikZ rendering is involved. This prototype does not accept untrusted uploaded content.

Adding, moving, or deleting topics requires editing data, not components. `indexCourse` derives lookups and ancestor paths recursively and rejects duplicate IDs. Resources with deleted topic IDs should also be removed; the data integrity test catches orphan resources.

## Design decisions

The interface is a conceptual atlas: a spacious overview communicates the course's three domains, cards invite exploration, and the expandable map reveals relationships without turning the main experience into a file manager. Domain colors act as gentle orientation cues. Resources are a separate layer beneath concepts, so incomplete lessons do not erase the conceptual structure. Empty topics explain their status and offer a route back to their parent.

Presentation lives in `src/main.jsx` and `src/style.css`; course structure and learning content live separately in `src/data/`. Components derive breadcrumbs, counts, cards, search, and next-topic navigation from that model. Topic navigation uses the URL hash for deep links and browser history. Bookmarks are the only persistent local state.

## Validation

```sh
npm test
npm run build
# In a second terminal while npm run dev is running:
npx playwright install chromium
npm run test:e2e
```

Browser tests use `/usr/bin/chromium` by default in this cloud environment. Elsewhere, provide `CHROMIUM_PATH` pointing to an installed Chromium/Chrome executable (including a Playwright-installed browser). No browser download is required when system Chromium is available.

The data tests check resource integrity, unique identifiers, ancestor paths, and six-level nesting. Browser tests cover MathJax rendering, searching and deep navigation, resource filtering, bookmarking across reloads, correct/incorrect practice feedback, dialog dismissal, desktop cards, mobile navigation, and horizontal overflow.

## How it can evolve

Stable module IDs allow content to be reused independently of a course's arrangement. An editor could validate and persist this same model, with course-specific trees referring to a module registry. Resource bodies could become structured blocks compatible with an external content editor. Related-concept edges and assessment URLs can reference stable IDs without altering the hierarchy. A later notes generator could traverse an instructor-selected sequence of modules and reuse their resource blocks. None of these administrative or publishing features is implemented here.

Limitations: sample content only, one multiple-choice exercise, no progress tracking or syncing, no real video playback, no rich Markdown/HTML editor, and no continuous textbook export. Topic-title search is intentionally simple. Large courses could later use virtualized maps and lazy-loaded content without changing the underlying identity model.
