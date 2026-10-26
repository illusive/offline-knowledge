# AGENTS.md — Development and Agent Guide

## 1. Purpose

This document defines how AI development agents should approach planning, architecture, implementation, testing and documentation for the Offline Knowledge project.

Read `PROJECT.md` before making architectural or product decisions.

The objective is to create a reliable, maintainable and thoughtfully designed mobile application that works independently of network connectivity.

Do not equate rapid implementation with progress. Prioritize well-understood requirements, sound decisions and verified functionality.

## 2. Grilling-first development

Treat every substantive development session as a structured discovery and review process.

Use a "grilling with docs" methodology. If a suitable `grill-me` skill is available, follow it. Otherwise, apply the following procedure directly.

### Before implementation

1. Read relevant project documentation and inspect the existing implementation.
2. Identify assumptions, ambiguities, constraints and unresolved decisions.
3. Challenge the proposed approach where meaningful alternatives exist.
4. Ask focused questions that materially affect product behavior, architecture, usability or maintainability.
5. Present reasonable alternatives with their benefits, drawbacks and implications.
6. Recommend a preferred approach and explain why.
7. Document decisions before implementing significant changes.

Ask questions in small, prioritized groups rather than overwhelming the user with a large questionnaire.

Do not ask for decisions that can be resolved safely through existing conventions, documented requirements or ordinary engineering judgment.

If a request is already clear, proceed without artificially extending the discovery process.

### Required areas of consideration

For each substantial feature, assess:

- User problem and expected behavior.
- Offline functionality and failure scenarios.
- Data ownership, storage and lifecycle.
- Accessibility and interface consistency.
- Performance, storage and battery impact.
- Security, privacy and relevant licensing.
- Alternative technical approaches.
- Testability, maintainability and future extensibility.

Do not assume that a technically feasible feature belongs in the product.

## 3. Documentation as persistent context

Maintain concise project documentation so future agent sessions can continue without repeatedly revisiting resolved questions.

Use the following structure when relevant:

- `PROJECT.md` — Product vision, requirements and scope.
- `AGENTS.md` — Agent behavior and engineering standards.
- `docs/ARCHITECTURE.md` — System structure and technical decisions.
- `docs/DECISIONS.md` — Decision log with rationale and alternatives.
- `docs/ROADMAP.md` — Development milestones and current priorities.
- `docs/OPEN_QUESTIONS.md` — Unresolved questions and assumptions.
- `docs/CONTENT_POLICY.md` — Source selection, content processing, attribution and verification.

Documentation should be maintained as part of implementation, not postponed until a later cleanup.

Do not create additional documents unless they solve a clear organizational problem.

When decisions change, update the relevant documentation and remove contradictory instructions.

> **Current state (2026-10-26):** M1 in progress. The app is a PWA in `web/` (React + Vite, D-021–D-023), live on GitHub Pages, with the food storage lookup working offline. Food guides (D-033) are being written: 21 of 101 done; the continuation point is in `docs/ROADMAP.md` (M1, food guides) and the workflow in `content/authoring/README.md`.

## 4. Engineering principles

### Offline-first architecture

All core functionality must operate using local resources.

Never introduce mandatory runtime dependencies on external APIs, remote authentication, cloud databases, network-hosted fonts, external images, remote configuration or online search.

Optional connectivity may support downloading or updating content, but its absence must never prevent users from accessing locally available functionality.

Avoid hidden internet dependencies in third-party libraries.

Test application behavior with connectivity completely disabled, not merely with mocked network responses.

### Simplicity over complexity

Prefer the simplest implementation that reliably satisfies the requirements.

Avoid speculative abstractions, unnecessary state management, premature optimization and excessive architectural layering.

Introduce complexity only when supported by demonstrable requirements.

Prefer established platform capabilities and well-maintained third-party libraries over custom implementations when they provide a clear advantage.

### Reusable components

Build a consistent, configurable component system.

Favor reusable primitives for typography, buttons, cards, lists, search interfaces, content rendering, navigation and feedback states.

Use composition and explicit properties to support legitimate variations.

Avoid duplicating established patterns, but do not create complex abstractions for components that have no meaningful reuse.

Centralize design tokens for spacing, typography, colors, radii and interaction states.

### Strong typing and clear boundaries

Use TypeScript with strict type checking.

Maintain clear separation between presentation, business logic, persistence, device capabilities and content processing.

Use explicit interfaces for content, downloaded packs, metadata and offline resources.

Avoid broad use of `any`, hidden global state and implicit data transformations.

Keep dependencies and imports predictable.

## 5. Third-party dependencies

Evaluate existing libraries before building complex functionality.

Potential candidates include:

- Expo and maintained Expo modules for platform integration.
- Expo Router or another established navigation solution.
- Expo SQLite for persistent data and full-text search.
- MapLibre React Native for offline maps.
- NativeWind for styling, using a stable, compatible version.
- Lucide React Native for iconography.

> Update (D-021): the app is a PWA, so the Expo and React Native candidates above no longer apply. Their web counterparts (e.g. `@sqlite.org/sqlite-wasm` instead of Expo SQLite, MapLibre GL JS instead of MapLibre React Native) take their place. Check compatibility with the browsers we support instead of Expo versions.
- Proven bottom-sheet, gesture and animation libraries.

Before introducing a dependency, verify:

1. Compatibility with the selected Expo and React Native versions.
2. Maintenance status and community adoption.
3. Native configuration and build requirements.
4. License compatibility and distribution restrictions.
5. Performance, binary size and offline behavior.
6. Whether the functionality already exists within the project's dependencies.

Do not install dependencies speculatively.

Record consequential dependency choices in the decision log.

## 6. Content architecture

Treat content as a first-class product component, not merely database records.

Separate content ingestion and publishing from runtime content consumption.

The mobile application should use prepared, validated and versioned content rather than performing live scraping, extraction or AI summarization.

Each guide should support structured metadata including:

- Stable identifier and title.
- Category, tags and related topics.
- Short description and searchable content.
- Instructions, illustrations and warnings.
- Source references and licensing information.
- Language and content version.
- Publication and review dates.
- Appropriate safety or review classification.

Design the content model for future localization, revisions and knowledge-pack distribution.

### Source integrity

Never fabricate sources, citations or scientific claims.

Prefer authoritative primary references. Verify technical and safety-critical claims against appropriate sources.

Maintain traceability between distilled guidance and the material from which it originated.

Before redistributing extracted or transformed content, verify copyright, license conditions and attribution requirements.

Do not use AI-generated information as the sole basis for medical, electrical, food-safety or other high-risk instructions.

Content requiring expert review must remain unpublished until it has been reviewed.

> Private phase (D-028): licence and reuse-permission checks are deferred by the project owner while stead is private. Source registration, traceability and the safety rules above still apply in full. High-risk content is published verbatim only (D-027).

## 7. Data management and storage

Use SQLite for structured content and local search.

Use local file storage for images, supplementary documents and downloadable assets where appropriate.

Implement schema migrations with explicit versioning.

Content packs should have manifests containing versions, sizes, dependencies and integrity checksums.

Download and update operations must account for:

- Interrupted connections.
- Insufficient storage.
- Corrupt or incomplete files.
- Application restarts.
- Partial updates.
- Previously installed content.

Never replace a valid installed knowledge pack with an incomplete update. Verify new content before switching to it.

Monitor application size and memory consumption throughout development.

## 8. Offline maps and device capabilities

Treat offline mapping as a separate technical subsystem.

Before committing to a mapping library, implement a small proof of concept demonstrating actual offline rendering on an iPhone.

Confirm that map styles, fonts, sprites, tiles and other required assets are available locally.

Use a map provider or dataset whose license permits offline storage and redistribution.

Do not use OpenStreetMap's public tile servers for bulk offline downloads.

Allow users to choose map coverage and understand the required storage.

Location permission must be requested contextually. Provide a functional alternative when permission is denied.

GPS, heading and compass features must handle unsupported hardware, unavailable sensor data and inaccurate measurements gracefully.

Avoid unnecessary background location access.

## 9. UI and interaction standards

Follow the design principles established in `PROJECT.md`.

Maintain a consistent visual language across all screens.

Support both light and dark appearance through centralized theme tokens.

Use appropriate native interaction patterns where beneficial.

Prefer recognizable icons, concise labels and clear navigation.

Avoid emojis, unnecessary visual effects, novelty interactions and overwhelming information density.

Use animation only when it improves comprehension or provides meaningful feedback.

Always design and test:

- Empty states.
- Loading states.
- Errors and interrupted operations.
- Permission-denied scenarios.
- Low-storage scenarios.
- Long text and accessible font sizes.
- VoiceOver and other relevant accessibility features.

Do not create decorative functionality without a clear user benefit.

## 10. Development workflow

Implement features in small, independently testable vertical slices.

### Before coding

State:

- The problem being solved.
- Relevant requirements and constraints.
- Any unresolved decisions.
- The proposed technical approach.
- Acceptance criteria.

For substantial changes, present the implementation plan before proceeding.

### During implementation

Reuse established patterns and components.

Keep changes focused and avoid unrelated refactoring.

Respect the existing project structure unless there is a documented reason to change it.

Do not silently introduce online dependencies, new permissions or additional product features.

Keep the application buildable throughout development.

### After implementation

Run applicable checks, including:

- TypeScript type checking.
- Linting and formatting.
- Unit and integration tests.
- Platform build checks where feasible.
- Relevant offline and device-level tests.

Inspect the resulting interface rather than relying solely on successful compilation.

Update documentation and decision records where necessary.

Summarize what changed, what was verified, and what remains incomplete.

Never claim that a feature has been tested when it has not.

## 11. Testing and reliability

Offline behavior must be verified continuously.

Maintain tests demonstrating that:

- Core content is available on first launch.
- The application starts without internet connectivity.
- Local search works in airplane mode.
- Downloaded content survives application and device restarts.
- Content updates cannot corrupt existing valid content.
- Offline maps render without fetching remote resources.
- Location denial does not prevent manual map selection.
- Incomplete downloads do not compromise the application.
- Unsupported sensors fail gracefully.
- Core functionality remains usable under limited storage and memory conditions.

Use real iOS devices for validation of GPS, compass, offline maps, persistence and battery-sensitive features.

Automated tests cannot replace testing the production build in a genuinely offline environment.

## 12. Scope control

Maintain a clear distinction between requirements, proposed enhancements and future possibilities.

Before adding functionality, consider whether it improves access to reliable knowledge, helps users complete practical tasks or materially improves offline resilience.

Defer optional features when they threaten the reliability or simplicity of essential functionality.

Do not introduce runtime AI chat, accounts, cloud synchronization, social features or telemetry without an explicit product decision.

## 13. Session completion

At the end of every substantive development session, provide a concise handover containing:

1. Decisions made and their rationale.
2. Changes implemented.
3. Tests performed and results.
4. Outstanding issues and risks.
5. Recommended next action.

Update the relevant project documents so the next session can continue from a reliable understanding of the project's current state.

## 14. Priority order

When requirements compete, use this order:

1. Safety and correctness.
2. Offline availability and reliability.
3. Usability and accessibility.
4. Simplicity and maintainability.
5. Storage, performance and battery efficiency.
6. Visual refinement and additional functionality.

The application should never become more impressive at the expense of becoming less dependable.
