# Gotchas

Known pitfalls, non-obvious behaviours, and lessons learned. Read this before making changes.

---

## 1. Axios serialises arrays with `[]` brackets — Solr ignores them

**Symptom:** Facet filters or `facet.field` params are sent but Solr returns all records (unfiltered).

**Cause:** Axios default behaviour serialises `{ fq: ['a','b'] }` as `fq[]=a&fq[]=b`. Solr only understands `fq=a&fq=b` (repeated params, no brackets). Solr silently ignores unknown param names like `fq[]`.

**Fix:** `src/services/api.ts` uses a dedicated `solrAxios` instance with a custom `paramsSerializer` that repeats keys without brackets:

```ts
paramsSerializer: {
  serialize: (params) => {
    // Arrays → key=val1&key=val2 (no [] suffix)
  }
}
```

**Rule:** All Solr HTTP calls MUST go through `solrAxios`, never the default `axios` instance.

---

## 2. `scientific_name_facet` is case-sensitive — use `scientific_name` for filtering

**Symptom:** Filtering by a taxon name returns 0 results even though the specimen exists.

**Cause:** `scientific_name_facet` is a `StrField` (no analysis, exact match). The URL may carry a lowercase variant (e.g. `"Polemonium caeruleum l."`) while Solr stores `"Polemonium caeruleum L."`.

**Fix:** In `FACET_CONFIG`, `taxon.filterField = 'scientific_name'` (text_general, tokenized + lowercased → case-insensitive phrase match). The `facetField` stays as `scientific_name_facet` for accurate bucket counts.

**Rule:** Always use `text_general` fields for `fq` filters on free-text data. Use `*_facet` (StrField + docValues) only for `facet.field` count requests.

---

## 3. `useSearchState` — URL is the single source of truth

**Symptom:** Facet selections are ignored, or removed filters reappear on F5.

**Cause (historical):** An earlier design used `useState` for `selectedFacets` and a `useEffect` to sync it to the URL. The sync effect called `setSearchParams` on mount, which changed `searchParams`, which caused a re-render where the fetch ran with stale (empty) facets.

**Fix:** `selectedFacets` and `currentPage` are derived directly from `searchParams` on every render — no `useState` for facets, no sync effect. All mutations write directly to the URL via `setSearchParams({ replace: true })`.

**Rule:** Never introduce a separate `useState` for facet selections. The URL is the only state store for filters and pagination.

---

## 4. `facet.field` must be a `docValues=true` field

**Symptom:** Facet counts are empty or Solr returns an error.

**Cause:** Solr requires `docValues=true` on fields used in `facet.field` requests. The `text_general` fields (`scientific_name`, `creator`, `locality`) do NOT have `docValues`.

**Fix:** Use the `*_facet` copy-fields (`scientific_name_facet`, `creator_facet`, `locality_facet`) which are `strings` type with `docValues=true`. These are populated via `<copyField>` in `managed-schema.xml`.

**Rule:** After any schema change, a full re-index is required. The `*_facet` fields are `stored=false` — they exist only for faceting, not display.

---

## 5. Solr `id` field contains ARK identifiers with slashes

**Symptom:** `DetailPage` fails to fetch a record, or the URL breaks.

**Cause:** Record IDs look like `ark:12661/nrp1HERB/PRC/453511/11373` — they contain slashes and colons which must be URL-encoded.

**Fix:** `CustomReactiveList` encodes the id: `navigate(\`/detail/${encodeURIComponent(record.id)}\`)`. `DetailPage` decodes it: `getRecordById(decodeURIComponent(id))`. The API uses `fq: \`id:"${id}"\`` (quoted) to avoid Solr parsing the slashes as path separators.

---

## 6. Solr multivalued fields come back as `string[]`, single-value as `string`

**Symptom:** TypeScript errors or runtime crashes when accessing `.scientific_name.toUpperCase()`.

**Cause:** Solr returns multivalued fields as arrays but single-value fields as plain strings. The actual type depends on the document, not the schema declaration.

**Fix:** `HerbariumRecord` types these fields as `string[] | undefined`. Use the helpers from `src/types/index.ts`:
- `firstValue(field)` — safely returns the first element or `undefined`
- `asArray(field)` — always returns `string[]`, normalising single values

---

## 7. `facet.range` params must be sent as parallel arrays

When multiple date range facets are enabled, Solr expects the `facet.range`, `facet.range.start`, `facet.range.end`, and `facet.range.gap` params to be repeated in the same order:

```
facet.range=event_date_from
facet.range.start=1700-01-01T00:00:00Z
facet.range.end=2026-01-01T00:00:00Z
facet.range.gap=+10YEAR
```

`buildFacetParams` in `api.ts` builds four parallel arrays and the custom `paramsSerializer` repeats each key without brackets. The order of entries in `FACET_CONFIG` determines the order of the arrays — they must stay in sync.

---

## 8. `buildFacetParams` uses `facetField`, `buildFqFilters` uses `filterField`

These are intentionally different fields in `FACET_CONFIG`:

| Property | Used by | Solr field type |
|---|---|---|
| `filterField` | `buildFqFilters` → `fq=` | `text_general` (tokenized, case-insensitive) |
| `facetField` | `buildFacetParams` → `facet.field=` | `strings` (StrField, docValues=true) |

Do not swap them. Using `filterField` for facet counts will fail (no docValues). Using `facetField` for filters will fail (case-sensitive exact match).

---

## 9. IndexPage persistence uses `sessionStorage`, SearchPage uses URL

- **IndexPage** (`useAutocomplete` with `persist: true`): selected suggestions (taxon/collector/locality) are saved to `sessionStorage` under key `herbarium_search_state`. This survives page refresh but is cleared when the browser tab is closed.
- **SearchPage** (`useSearchState`): all filter state lives in the URL (`?taxon=&collector=&locality=&page=`). F5 restores the exact filter state. Removing a filter removes it from the URL immediately.

These two mechanisms are independent. When the user navigates from IndexPage to SearchPage, the URL params are the handoff mechanism — `sessionStorage` is not read by SearchPage.

---

## 10. Solr suggester keys are case-sensitive

The three suggesters are named exactly: `taxonSuggest`, `creatorSuggest`, `localitySuggest`. These names appear in:
- `solrconfig.xml` (`<str name="name">`)
- `src/types/facets.ts` (`suggesterKey` field in `TermsFacetConfig`)
- `src/hooks/useAutocomplete.ts` (response parsing)
- `src/hooks/useFacetAutocomplete.ts` (response parsing)

If you rename a suggester in Solr, update all four locations.

---

## 11. `npm run build` must pass before committing

The build runs `tsc` (TypeScript type-check) then `vite build`. TypeScript errors are fatal. The CSS timing warning from `vite:css` is informational only and can be ignored.

---

## 12. Header logo gradient backgrounds — unified spotlight effect with CSS variables

**Design:** The Header has white-optimized logos (PNGs optimized for white backgrounds). To keep them visible on both transparent (hero) and dark green (scrolled) navbar states, a unified `.logos-gradient-overlay` div spans the entire header width and creates a customizable white "spotlight".

**Implementation:**
- `.logos-gradient-overlay` is an absolutely positioned overlay above the navbar (`z-index: 1`) but below actual content (`z-index: 2`)
- Gradient is controlled by **CSS custom properties (variables)** defined on `.app-header`:
  - `--gradient-fade-start`: Where dark zone starts (default: `0%`)
  - `--gradient-fade-end`: Where dark zone ends / white fade-in begins (default: `8%`)
  - `--gradient-white-start`: Where solid white begins (default: `20%`)
  - `--gradient-white-end`: Where solid white ends / fade-out begins (default: `65%`) ← **MAIN CONTROL**
  - `--gradient-fade-out-end`: Where gradient fully fades (default: `85%`)

**How to customize:**

Edit `src/styles/components/_layout.scss` around line 30:

```scss
.app-header {
  // ... existing code ...

  // Customize via CSS variables below – adjust these to fine-tune the gradient
  --gradient-fade-start: 0%;           // Keep this at 0% usually
  --gradient-fade-end: 8%;             // Fine-tune white fade-in speed
  --gradient-white-start: 20%;         // Where white zone begins
  --gradient-white-end: 65%;           // SHORTEN THIS to end white sooner (e.g., 55%)
  --gradient-fade-out-end: 85%;        // Fine-tune final fade
}
```

**Common adjustments:**

| Need | Change | Example |
|------|--------|---------|
| Gradient too long (white reaches right edge) | Decrease `--gradient-white-end` | `55%` instead of `65%` |
| Gradient too short (white ends too early) | Increase `--gradient-white-end` | `75%` instead of `65%` |
| Fade-in too fast | Decrease gap between `--gradient-fade-end` and `--gradient-white-start` | Change to `--gradient-fade-end: 15%` |
| Fade-out too fast on right | Increase `--gradient-fade-out-end` | `90%` instead of `85%` |

**CSS details:**
- Both default state (hero) and `.app-header--scrolled` state use the **same variables**
- Only the edge colors change: `transparent` (hero) vs `$herb-900` (scrolled)
- `pointer-events: none` ensures the gradient overlay doesn't block interactions
- `transition: background 0.3s ease` smoothly animates color changes

**Example: Make gradient end at 55% instead of 65%**

```scss
.app-header {
  --gradient-white-end: 55%;  // Instead of 65%
}
```

This will make the white zone end much earlier (before reaching EOSC logo area).

**Rule:** Use percentages (%) for the positions. All variables are inherited by both hero and scrolled states automatically.
