# Conventions

## TypeScript

- All files use `.tsx` (components) or `.ts` (hooks, services, types). No `.js` files.
- Strict mode is on (`tsconfig.json`). No `any` unless absolutely unavoidable.
- Interfaces over type aliases for object shapes; type aliases for unions and primitives.
- Export helpers (`firstValue`, `asArray`) from `src/types/index.ts` for normalising Solr's mixed single/multi-value fields.

## Path aliases (vite.config.ts + tsconfig.json)

| Alias | Resolves to |
|---|---|
| `@types` | `src/types/index.ts` |
| `@/types/facets` | `src/types/facets.ts` |
| `@/types/suggestion` | `src/types/suggestion.ts` |
| `@services/api` | `src/services/api.ts` |
| `@hooks/...` | `src/hooks/...` |
| `@components/...` | `src/components/...` |
| `@pages/...` | `src/pages/...` |

Always use aliases, never relative `../../` imports across feature boundaries.

## Component conventions

- One component per file. File name = component name (PascalCase).
- Functional components only (`React.FC<Props>`). No class components.
- Props interfaces defined in the same file, above the component.
- Small presentational sub-components (e.g. `FieldRow`, `Section` in `DetailPage`) may live in the same file if they are only used there.
- Pages are thin orchestrators — no business logic, only composition of hooks and components.

## Hooks

- Custom hooks live in `src/hooks/`. File name = hook name (camelCase).
- Hooks return a plain object (not an array) so callers can destructure by name.
- Hooks that manage async state include a `cancelled` flag in `useEffect` cleanup to prevent stale responses from overwriting newer results.

## Styling

- SCSS with BEM-like naming: `.block__element--modifier`.
- Component styles live in `src/styles/components/_<name>.scss`, imported via `src/styles/main.scss`.
- Green palette tokens (used throughout):
  - Dark green: `#1a5c2a`
  - Mid green: `#2e9e47`
  - Light green bg: `#f4fbf6` (static backgrounds)
  - Highlight/hover bg: `#e8f5ec` (interactive states)
  - Border green: `#c8dece` / `#e0ede4`
- Bootstrap 5 utility classes are used freely for layout/spacing. Custom classes for anything semantic.
- Badge colour classes: `.bg-taxon` (green), `.bg-collector` (amber), `.bg-locality` (dark green).

## Facet model

All facet configuration lives in `src/types/facets.ts` in the `FACET_CONFIG` array. To add a new facet:

1. Add a key to the `FacetKey` union type.
2. Add an entry to `FACET_CONFIG` with `enabled: true` (or `false` if not yet ready).
3. If it's a new facet type (not `'terms'`), add a new panel component in `src/components/search/facets/` and a one-line `if` in `FacetSidebar.tsx`.
4. No other files need to change — `FacetSidebar`, `buildFqFilters`, and `buildFacetParams` all iterate `FACET_CONFIG` automatically.

## URL parameter conventions

| Param | Page | Meaning |
|---|---|---|
| `q` | SearchPage | Free-text query (default `*:*`) |
| `taxon` | SearchPage | Selected taxon filter value(s), repeatable |
| `collector` | SearchPage | Selected collector filter value(s), repeatable |
| `locality` | SearchPage | Selected locality filter value(s), repeatable |
| `page` | SearchPage | Current page number (absent = page 1) |

The IndexPage passes `taxon`, `collector`, `locality` as URL params when navigating to SearchPage. SearchPage reads them on mount and keeps them in sync via `useSearchState`.

## Solr field naming

| Field | Type | Use |
|---|---|---|
| `scientific_name` | `text_general` | Full-text search + filter (`fq`) |
| `scientific_name_facet` | `strings` (StrField, docValues) | Facet counts only |
| `creator` | `text_general` | Filter |
| `creator_facet` | `strings` (StrField, docValues) | Facet counts only |
| `locality` | `text_general` | Filter |
| `locality_facet` | `strings` (StrField, docValues) | Facet counts only |
| `family`, `country` | `string` (StrField, docValues) | Filter + facet counts |
| `genus`, `specific_epithet` | `string` | Filter only |
| `catalog_number` | `string` | Display |
| `material_sample_id` | `string` | External URL (JACQ etc.) |
| `event_date_raw` | `string` | Human-readable date display |
| `event_date_from/to` | `pdate` | Date range filtering (future) |

## Git

- Commit messages: imperative mood, present tense (`Fix facet filter`, not `Fixed`).
- No direct commits to `main`; use feature branches.
- Run `npm run build` before committing — TypeScript errors must be zero.
