# Architecture

## Overview

React + TypeScript SPA (Vite) that searches herbarium specimen records stored in a remote Apache Solr instance. Three pages: landing/search (IndexPage), results with faceted filtering (SearchPage), and specimen detail (DetailPage).

## Tech stack

| Layer | Technology |
|---|---|
| UI framework | React 18 + TypeScript |
| Build tool | Vite 8 |
| Routing | React Router v6 |
| HTTP client | Axios (with custom `paramsSerializer`) |
| Styling | SCSS + Bootstrap 5 |
| Backend | Apache Solr 10 (`/solr/specimens`) |

## Data flow

### IndexPage → SearchPage

1. User types in `SearchBox` → `useAutocomplete` fetches from `/suggest` endpoint
2. User selects suggestions (taxon / collector / locality) → stored in `selectedSuggestions` state and `sessionStorage`
3. User clicks Search → `IndexPage.handleSearch` builds URL params and navigates:
   - `?q=<freetext>&taxon=<val>&collector=<val>&locality=<val>`
4. `SearchPage` mounts → `useSearchState` reads URL params → fetches Solr

### SearchPage state machine (`useSearchState`)

**The URL is the single source of truth.** `selectedFacets` is derived directly from `searchParams` on every render — no `useState` for facets, no sync effects.

```
URL params
  ?q=  ?taxon=  ?collector=  ?locality=  ?page=
       ↓
  selectedFacets (derived each render)
       ↓
  buildFqFilters(selectedFacets) → filters[]
       ↓
  useEffect([query, filtersKey, currentPage]) → searchRecords()
       ↓
  results, totalResults, facetBuckets (useState)
```

Mutations write directly to the URL via `setSearchParams({ replace: true })`, which triggers a re-render, re-derives state, and re-fetches. No intermediate state, no race conditions.

### Facet configuration registry (`src/types/facets.ts`)

`FACET_CONFIG` is the single place to add/remove/configure facets. Each entry has:
- `filterField` — Solr field used in `fq` expressions
- `facetField` — Solr field used in `facet.field` requests (must have `docValues=true`)
- `type` — `'terms'` | `'dateRange'` | `'numericRange'`
- `enabled` — flip to `false` to hide without deleting

`FacetSidebar` iterates `FACET_CONFIG` and renders the appropriate panel component. Adding a new facet requires only a new entry in `FACET_CONFIG` (and a new panel component if it's a new type).

## Solr schema design

Two separate fields per text facet:

| Purpose | Field | Type | Notes |
|---|---|---|---|
| Filtering | `scientific_name` | `text_general` | Tokenized + lowercased → case-insensitive phrase match |
| Facet counts | `scientific_name_facet` | `strings` (StrField) | `docValues=true` → exact counts, no analysis |
| Filtering | `creator` | `text_general` | Same pattern |
| Facet counts | `creator_facet` | `strings` | `docValues=true` |
| Filtering | `locality` | `text_general` | Same pattern |
| Facet counts | `locality_facet` | `strings` | `docValues=true` |

The `*_facet` fields are populated via `<copyField>` in `managed-schema.xml` and require a full re-index after schema changes.

## Routes

| Path | Component | Notes |
|---|---|---|
| `/` | `IndexPage` | Landing, autocomplete, sessionStorage persistence |
| `/search` | `SearchPage` | URL-driven faceted search |
| `/detail/:id` | `DetailPage` | `id` is URL-encoded ARK identifier |
