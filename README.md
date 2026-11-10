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

## Visualization laboratory: seven perspectives

Open **Explore** in the header or **Explore connections** in the sidebar. This is an experiment, not a claim that 3D is better. Every perspective uses the same course IDs, resources, hierarchy edges, conceptual links, selected concept, revealed set, and navigation history.

Use the selector or quick-switch buttons to compare:

| Layout | Approach | Question to investigate |
|---|---|---|
| 2D Force-Directed | D3 link attraction, charge repulsion and collision avoidance; draggable cards | Does the conceptual network suggest useful structure beyond the syllabus? |
| 2D Radial | Selected topic at the centre, breadth-first distance rings, curved links, pill-shaped cards | Does organizing around one idea make its neighbourhood clearer? |
| 2D Hierarchical / Layered | Curriculum depth columns, course-order rows, curved cross-links | Does a formal scaffold make cross-branch connections easier to follow? |
| 2D Clustered | Labelled subject islands and links between them | Which concepts bridge subject communities? |
| 3D Force-Directed | D3 springs and repulsion in three dimensions; lit spheres and floating labels | Does rotating a volume reveal connections hidden by flat overlap? |
| 3D Radial / Orbital | Central topic and Fibonacci-distributed graph-distance shells | Do spatial neighbourhoods improve understanding or add navigation effort? |
| 3D Clustered | Subject regions in a volume, faceted nodes, group focus | Does spatial separation help distinguish communities and their bridges? |

Each layout has an explanatory panel with its intended emphasis, explicitly presented as a hypothesis. Optional observations are saved separately per layout in this browser's local storage. There are no accounts or remote notes.

### Shared exploration

On first entry, Explore starts from the current topic, or Electric Field from the overview. **Focused mode** shows the selected concept and its immediate conceptual and hierarchy neighbours. Clicking another concept retains prior discoveries and reveals its neighbours. **Reveal another layer** expands the currently revealed network. **Focus & collapse** returns to a local neighbourhood; **Back** revisits the previous concept. **Overview mode** displays the entire course. **Reset** returns to a small Electric Field network in the current layout. Suggested threads reset around electricity, magnetism, or thermodynamics.

The graph search searches all course topic titles, including unrevealed topics. Selecting a result reveals its neighbourhood without navigating away from the graph. The original header search still opens ordinary topic pages.

Solid purple edges are conceptual connections; dashed grey edges represent the hierarchy. Either type can be hidden independently. Layout geometry uses the complete shared graph; hiding edges changes their display, not the underlying physics or layout. Selecting a connection displays its optional explanation. The information panel also exposes conceptual descriptions and course-structure links as ordinary keyboard-accessible buttons.

**Open topic page** uses the existing browser. Returning to Explore retains layout, selection, revealed concepts, history, and observation notes. Resource cards below the map reuse the original cards, bookmarks, practice UI, dialogs, and MathJax renderer; there is no duplicate resource implementation. Exploration state is kept for the page session, while bookmarks and notes persist across reloads.

### Controls and accessibility

- **2D:** drag empty space to pan; scroll to zoom around the pointer. Force-network cards can be dragged. Focus the map and use arrow keys to pan. Tab to cards or panel links and press Enter to select.
- **3D:** drag to orbit, right-drag to pan, and scroll to zoom. On touchscreens, one finger rotates and two fingers pan/zoom. Focus the map and use arrow keys to orbit, `+` / `-` to zoom. Node labels are native buttons; the panel provides a textual alternative to camera navigation.
- **Both:** zoom buttons, fit-network, and center-selected controls are available. Cluster layouts also offer a subject-group focus selector. At overview scale, screen-sized concept chips and selectable markers keep text readable rather than shrinking labels with the camera; center or group focus restores the full cards. Hover or keyboard-focus a marker to read its full label.
- Layout reveal effects and the bounded orbital transition respect reduced-motion preferences. Force simulations settle before display; the visualization never continuously spins or jitters.
- WebGL initialization/context-loss failures show a 2D fallback action without discarding the exploration. Browse and all four 2D layouts work without WebGL.

### Architecture

1. `src/data/course.js` remains the source of topic identities and curriculum hierarchy.
2. `src/data/relationships.js` retains manually authored conceptual links with optional descriptions. No word matching or decorative edges are generated.
3. `src/graph/model.js` constructs the shared graph, validates references, and provides neighbours and descriptions. Parent-child edges are derived from the existing hierarchy. Its original fixed-slot helper remains for exploration-state compatibility.
4. `src/graph/state.js` is the shared pure reducer for selection, progressive reveal, overview, collapse, history, and reset. No renderer owns a copy of the course.
5. `src/graph/layouts.js` supplies the layout registry, breadth-first distances, subject grouping and coordinate algorithms. Each algorithm returns plain `{id: {x, y, z}}` positions. D3 operates on temporary node/link copies, leaving course content untouched. Previously settled force positions are retained as anchors when adding nodes, reducing disruption.
6. `src/graph/Graph2D.jsx` provides SVG edges, HTML cards, pan/zoom and force-card dragging. `Graph3D.jsx` uses Three.js, OrbitControls and CSS2D labels. It is dynamically imported only when selecting a 3D view; Browse and 2D do not load Three.js.
7. `src/graph/ConceptGraph.jsx` coordinates layout selection, shared controls, comparison notes, topic information and existing resource cards.

3D uses a capped pixel ratio, modest meshes, demand-driven drawing, explicit geometry/material disposal and context cleanup. It renders after camera changes, resizing, selection, or the short orbital transition, then stops. Labels retain a constant screen size and use small screen-space offsets to reduce overlap, prioritizing the selected concept and neighbours. Switching between 3D layouts reuses the renderer; leaving 3D disposes it. Returning from a topic page retains the active renderer and camera, without drawing while idle.

Subject groups derive from current hierarchy paths: electricity's three branches, magnetism, thermodynamics, and the course root. This grouping is presentation metadata, not a second hierarchy or a new set of conceptual relationships. A future community-detection layout could replace the grouping function.

### Tradeoffs and extension points

Whole-course views can still have crossing edges and overlapping projected labels, especially when several concepts align along a camera direction. Orbit, focus, edge filters, panel links and search provide ways to inspect those cases. Layered overview can become tall; clustered views intentionally use more space. Force expansions anchor prior positions, so incremental layouts can differ from a freshly computed whole-course network. Dragged 2D positions and viewport adjustments are temporary renderer state; changing between dimensions can refit the camera. The prototype does not store exploration paths across reloads.

Add another style by registering its name, dimension, hypothesis and algorithm in `layouts.js`; reuse the shared state and renderer where possible. A new renderer can consume the same node IDs, typed edges and plain coordinates. More sophisticated relationship types can extend the edge vocabulary and add direction/filter semantics. Instructor editing can validate the same endpoint IDs before saving. Links to learning modules already use stable topic/resource IDs. None of these possibilities requires a backend for this prototype, and no Fieldnotes dependency or modification is involved.

### Laboratory validation

`npm test` checks shared data integrity, representative relationship paths, graph construction, progressive state, overview/focus, deterministic force placement, stable expansion anchors, hierarchy-derived groups and all seven coordinate sets. `npm run test:e2e` preserves the existing browser regression suite and adds all seven rendered modes, layout-switch state preservation, overview/focus, node dragging, edge filters, graph search, local observations, shared MathJax resources, topic round trips, mobile/keyboard interaction, simulated WebGL failure, lazy 3D loading and idle GPU rendering.

## Readability and fullscreen

`src/typography.css` defines the shared `--type-*` scale: body copy is 16–17 px at standard browser settings, navigation is 15 px, controls 14–16 px, and secondary labels 12–14 px. It retains DM Sans, Manrope, the existing palette and the landing heading. The sidebar is slightly wider, longer topic names wrap, and responsive layouts give text room rather than shrinking it on phones. Reading descriptions use a stronger muted shade from the existing colour family.

The 2D graph renderer now switches to compact, screen-sized labels below normal reading zoom. Selected and neighbouring concepts get priority for label space; other concepts remain visible, selectable markers with full labels on hover or keyboard focus. Label chips are separated in screen space and linked to their original anchors when offset. This is presentation only: `labelPlacement.js` does not change topic positions, graph algorithms, connections, or selection behaviour. 3D labels also use larger, fixed screen sizes.

Choose **Fullscreen** in the graph toolbar to devote the display to the map. The compact fullscreen toolbar offers visualization selection, reset, fit, reveal another layer and exit. It retains the selected concept, revealed network and current layout; switching between all seven layouts remains available. Exit with the toolbar button or the browser's Escape shortcut. Browsers without the Fullscreen API (or that deny it) use an in-window fullscreen layout with the same controls and Escape support. Keyboard focus stays within fullscreen and returns to its opener on exit. The normal topic panel and resources return when leaving fullscreen.

Readability checks cover 1440, 1024, 768 and 390 px viewports, minimum readable type, absence of horizontal page overflow, screen-sized graph labels, marker focus, native fullscreen, the in-window fallback, layout switching, state preservation and focus restoration. No additional dependencies are required for these refinements.
