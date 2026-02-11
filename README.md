# AE3GIS v2 Frontend

Interactive network topology visualizer built with React and ReactFlow. Provides a drill-down view of network infrastructure across three scales: geographic (sites), subnet, and LAN (containers/devices).

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (comes with Node)


1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open the URL shown in your terminal (default: `http://localhost:5173`).

## Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR       |
| `npm run build`   | Type-check and produce a production build |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Run ESLint                           |

## Project Structure

```
src/
├── App.tsx                     # Root component, view routing & state
├── data/
│   └── sampleTopology.ts       # Sample network topology data
├── store/                      # State management (Immer reducer)
├── components/
│   ├── GeographicView.tsx      # Top-level site map
│   ├── SubnetView.tsx          # Subnet graph for a site
│   ├── LanView.tsx             # Device-level LAN graph
│   ├── Breadcrumb.tsx          # Navigation breadcrumb
│   ├── NodeInfoPanel.tsx       # Detail panel for selected nodes
│   ├── TerminalOverlay.tsx     # Terminal UI overlay
│   ├── Toolbar.tsx             # Toolbar controls
│   ├── dialogs/                # Modal dialogs (add/edit/connect)
│   ├── nodes/                  # Custom ReactFlow node types
│   ├── edges/                  # Custom ReactFlow edge types
│   └── ui/                     # Reusable UI primitives
└── utils/                      # Layout helpers and utilities
```

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **@xyflow/react** (ReactFlow) for interactive graph rendering
- **dagre** for automatic graph layout
- **Immer / use-immer** for immutable state management
