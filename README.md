# NoteGraph

NoteGraph is a privacy-first, fully local Markdown knowledge base and visual graph editor. It runs entirely in the browser, persisting data locally to IndexedDB, and does not require a backend.

![NoteGraph Editor Mode](./public/preview-1.png)

## Features

- **Local-First Architecture:** Your notes never leave your device. All files and metadata are stored securely using browser IndexedDB.
- **Visual Knowledge Graph:** See connections between your thoughts. The app extracts `[[wikilinks]]` automatically and renders a physics-based, interactive 2D node graph using `react-force-graph-2d`.
- **Integrated Markdown Ecosystem:**
  - Real-time side-by-side editing and previewing.
  - GFM (GitHub Flavored Markdown) support.
  - Mathematical formulas using KaTeX (`remark-math` / `rehype-katex`).
  - Diagram rendering using `mermaid.js`.
  - First-class Wikilinks support.
- **Powerful CodeMirror 6 Editor:**
  - Full syntax highlighting.
  - Vim keybindings support.
  - Search and replace.
- **Refined UX & Polish:**
  - Fluid motion and micro-interactions powered by `motion/react`.
  - Comprehensive dark mode / light mode themes with `Tailwind CSS v4`.
  - Split-pane layout with smooth resizing.
  - Keyboard-driven workflows (Command Palette `Cmd/Ctrl+P`, Sidebar toggle `Cmd/Ctrl+B`).
- **Export Capabilities:** Export your entire workspace into a single JSON payload or export individual notes to PDF/HTML.

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + PostCSS
- **State Management:** Zustand
- **Storage:** `idb` (IndexedDB Wrapper)
- **Editor:** CodeMirror 6
- **Markdown Parsing:** `react-markdown` + `unified` ecosystem
- **Graph Engine:** `react-force-graph-2d`
- **Animations:** `motion/react`

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Build for production: `npm run build`

## Deployment

The application includes a GitHub Actions workflow `.github/workflows/deploy.yml` configured to build and deploy NoteGraph automatically to GitHub Pages.

To enable this:
1. Push to `main`.
2. Go to your repository settings -> Pages.
3. Under "Build and deployment", set the source to "GitHub Actions".

## License

MIT License
