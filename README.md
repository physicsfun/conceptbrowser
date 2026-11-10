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

## Experimental Explore mode

Switch between **Browse** and **Explore** in the header, or select **Explore connections** in the sidebar. On first entry, Explore starts from the current topic (Electric Field from the overview). It initially reveals only the selected topic and its immediate conceptual and hierarchy neighbours. Three suggested threads offer entry points into charges and energy, currents and magnetism, and heat and work.

Selecting a card reveals that concept's immediate neighbours while retaining everything already discovered. The information panel explains each conceptual link in first-year language and offers a keyboard-accessible list of connections. Solid purple lines represent conceptual relationships; dashed grey lines show the existing hierarchy. Turn off hierarchy lines to concentrate on physical connections. Select a line to inspect its description; the same descriptions are accessible through the panel.

**Reveal another layer** adds neighbours of the currently revealed network. **Focus & collapse** removes unrelated cards from view without discarding their remembered positions. **Back** revisits the previous concept; **Reset** returns to a small Electric Field network. Starting a suggested thread also resets the network. The zoom controls, fit button, and center button help manage larger maps. Drag or touch-drag empty map space to pan; scroll to zoom around the pointer. Focus the map and use arrow keys to pan. Tab to concept cards or panel links and press Enter to follow a relationship. Reveal animations respect reduced-motion preferences.

The map retains its selection, revealed cards, positions, camera, and history when switching modes or opening a topic page. Search still opens ordinary topic pages; returning to Explore resumes the graph. This exploration state lasts for the current page session, not across a reload. Resources beneath the graph use exactly the same cards, bookmarks, dialogs, practice UI, and MathJax renderer as Browse. There is no separate graph content store.

### Graph architecture and design

- `src/data/course.js`: the original, unchanged course hierarchy and stable IDs.
- `src/data/relationships.js`: manually authored undirected conceptual links, each with a stable ID, source, target, and optional plain-text description. This includes cross-domain links such as current → magnetic fields, and conservation of energy → first law. No name matching is used.
- `src/graph/model.js`: pure graph construction, reference validation, neighbour queries, and incremental layout. Parent-child edges are derived from the hierarchy. Unknown endpoints, duplicate conceptual links, and self-links fail validation.
- `src/graph/state.js`: pure interaction reducer for progressive reveal, selection, history, collapse, and reset.
- `src/graph/ConceptGraph.jsx`: SVG connections, native HTML concept buttons, camera controls, and the information panel. No visualization-library dependency is required.
- `src/graph/graph.css`: responsive graph styling and reveal animation.

Stable slots on expanding rings deliberately trade force-layout compactness for predictability: revealing a card never moves previously placed cards. Selection recenters the camera rather than moving the underlying network. The map emphasizes the selected concept's edges and mutes unrelated cards. A text panel explains *why* connections matter, so exploration is more than following unlabeled lines. Small screens prioritize the selected card and readable panel; pan to nearby cards or follow the panel links. Fit can shrink a large network to an overview, and center restores the selected concept to readable size. Straight edges can cross in larger networks; focus/collapse and the hierarchy toggle reduce this prototype's clutter.

Future relationship types could add a typed vocabulary (such as “applies to”, “energy transfer”, or “mathematical tool”), directionality, and filters while retaining stable endpoints. An instructor editor could validate these same records before saving them. Module references could live on existing topic/resource IDs. A new layout can replace `placeNodes` without changing authored course content or exploration actions. A future 3D renderer could consume the same nodes and edges and supply its own spatial positions; the present implementation remains strictly 2D. No backend, editing interface, 3D engine, or Fieldnotes integration is introduced.

Graph tests additionally cover valid endpoints, derived edges, the representative conceptual paths, progressive expansion, stable nonoverlapping slots for the entire course, collapse/reset/history, graph-to-topic round trips, shared MathJax resources, cross-domain navigation, keyboard controls, mobile layout, and the existing Browse regression suite.
