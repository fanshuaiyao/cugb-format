# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web-based tool for automatically formatting Word (.docx) documents according to Beihang University (BUAA/北航) undergraduate thesis standards. It works by unpacking .docx files (which are OpenXML ZIP archives of XML), applying thesis formatting rules programmatically, and repacking them. An online version is at https://ianpas.github.io/auto-format/.

## Common Commands

```bash
npm install              # Install lerna (monorepo manager)
npm run bootstrap        # Install dependencies for all packages (lerna exec npm install)
npm run build            # Build all packages (lerna run build)
npm run test             # Run tests across all packages (lerna run test)
npm run start            # Start the React web app (auto-format package)
npm run clean            # Remove all node_modules and build dirs
npm run clean:build      # Remove only build dirs
```

To run tests for a single package:
```bash
cd packages/<package-name> && npx jest
```

## Architecture

This is a **Lerna monorepo** (`lerna ^3.15.0`). All packages live under `packages/`. Each library package uses **Gulp** for building and **Jest** for testing. The React app (`auto-format`) uses Create React App.

### Processing Pipeline

The formatting pipeline flows through these packages in order:

1. **docx-package** — Unpack/repack .docx ZIP files
2. **docx-ts** — Low-level TypeScript model of OpenXML document structure (paragraphs, tables, XML components, document import)
3. **xml-util** — XML parsing utilities (captions, sections, text search, conversions)
4. **style-sheet** — Distill/extract style information from documents (uses distiller pattern in `src/distillers/`)
5. **docx-style** — Apply standard thesis styles (`std-style.ts`) and user-defined styles (`user-style.ts`)
6. **docx-numbering** — Handle numbered lists and outline numbering
7. **style-gardener** — Section-aware style application (`src/section/` for per-section logic)
8. **docx-secretary** — Orchestrate standard (`std-secretary.ts`) and user (`user-secretary.ts`) content rules
9. **docx-inject** — Inject processed XML back into the document
10. **docx-driver** — High-level driver orchestrating the full pipeline end-to-end

### Frontend

- **auto-format** — React web app (entry: `src/index.tsx`), the user-facing UI

### Shared Resources

- **common** — Sample `.docx` files and pre-extracted XML fixtures in `samples/` and `samples-xml/`, used by tests across packages
- **file-util** — File I/O helpers

## Key Concepts

- A `.docx` file is a ZIP archive containing XML files following the OpenXML specification
- The core approach: parse the XML, apply formatting transformations based on thesis standards, repack into `.docx`
- The test fixtures in `packages/common/samples-xml/` are the most valuable reference for understanding document structure
