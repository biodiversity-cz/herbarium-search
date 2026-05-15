import axios from 'axios';
import { HerbariumRecord, SolrResponse, SuggesterResponse, FacetData } from '@types';
import { FACET_CONFIG } from '@/types/facets';

const API_BASE_URL = 'https://herbarium.biodiversity.cz/solr/specimens';

/**
 * Axios instance with a custom paramsSerializer.
 *
 * By default axios serialises arrays as `key[]=val1&key[]=val2`.
 * Solr requires plain repeated params: `key=val1&key=val2`.
 * This serializer handles that correctly for all requests.
 */
const solrAxios = axios.create({
  baseURL: API_BASE_URL,
  paramsSerializer: {
    serialize: (params: Record<string, unknown>): string => {
      const parts: string[] = [];
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          // Repeat the key for each value — no [] suffix
          for (const v of value) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
          }
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
      }
      return parts.join('&');
    },
  },
});

/**
 * Build the facet params for all enabled facets.
 * - Terms facets → facet.field (repeated array)
 * - Date range facets → facet.range + facet.range.start/end/gap (repeated arrays)
 *
 * The custom paramsSerializer repeats array values without [] brackets,
 * which is what Solr expects.
 */
const buildFacetParams = (facetLimit = 50): Record<string, unknown> => {
  const facetFields: string[] = [];
  const facetRanges: string[] = [];
  const rangeStarts: string[] = [];
  const rangeEnds: string[] = [];
  const rangeGaps: string[] = [];

  for (const cfg of FACET_CONFIG) {
    if (!cfg.enabled) continue;
    if (cfg.type === 'terms') {
      facetFields.push(cfg.facetField);
    } else if (cfg.type === 'dateRange') {
      facetRanges.push(cfg.facetField);
      rangeStarts.push(cfg.rangeStart);
      rangeEnds.push(cfg.rangeEnd);
      rangeGaps.push(cfg.rangeGap);
    }
  }

  const params: Record<string, unknown> = {
    facet: 'true',
    'facet.limit': facetLimit,
    'facet.mincount': 1,
  };

  if (facetFields.length > 0) params['facet.field'] = facetFields;
  if (facetRanges.length > 0) {
    params['facet.range'] = facetRanges;
    params['facet.range.start'] = rangeStarts;
    params['facet.range.end'] = rangeEnds;
    params['facet.range.gap'] = rangeGaps;
  }

  return params;
};

/**
 * Search herbarium records using Solr.
 * When includeFacets is true, facet counts for all enabled facets are included.
 */
export async function searchRecords(
  query: string = '*:*',
  filters: string[] = [],
  start: number = 0,
  rows: number = 10,
  includeFacets: boolean = false
): Promise<SolrResponse> {
  const params: Record<string, unknown> = {
    q: query,
    start,
    rows,
    ...(includeFacets ? buildFacetParams() : { facet: 'false' }),
  };

  // Pass as array — serializer will repeat: fq=...&fq=...
  if (filters.length > 0) {
    params.fq = filters;
  }

  const response = await solrAxios.get<SolrResponse>('/select', { params });
  return response.data;
}

/**
 * Fetch facet data only (rows=0) for specific fields.
 */
export async function getFacets(
  query: string = '*:*',
  filters: string[] = [],
  facetLimit: number = 50
): Promise<FacetData> {
  const params: Record<string, unknown> = {
    q: query,
    rows: 0,
    ...buildFacetParams(facetLimit),
  };

  if (filters.length > 0) {
    params.fq = filters;
  }

  const response = await solrAxios.get<FacetData>('/select', { params });
  return response.data;
}

/**
 * Get a single herbarium record by ID.
 */
export async function getRecordById(id: string): Promise<HerbariumRecord> {
  const response = await solrAxios.get<SolrResponse>('/select', {
    params: { q: '*:*', fq: `id:"${id}"`, rows: 1 },
  });
  const doc = response.data.response.docs[0];
  if (!doc) throw new Error(`Record not found: ${id}`);
  return doc;
}

/**
 * Health check for the backend.
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  const response = await solrAxios.get('/health');
  return response.data;
}

/**
 * Get suggestions from Solr suggesters.
 */
export async function getSuggestions(query: string): Promise<SuggesterResponse> {
  const params: Record<string, string> = {
    'suggest.q': query,
    wt: 'json',
    'suggest.highlight': 'false',
  };

  const response = await solrAxios.get<SuggesterResponse>('/suggest', { params });
  return response.data;
}

/**
 * Get total count of documents in the Solr collection.
 */
export async function getTotalCount(): Promise<number> {
  const response = await solrAxios.get<SolrResponse>('/select', {
    params: { q: '*:*', rows: 0 },
  });
  return response.data.response.numFound;
}

/**
 * Get count of contributing herbaria using Solr JSON Facet API.
 */
export async function getHerbariaCount(): Promise<number> {
  const response = await solrAxios.get<SolrResponse>('/select', {
    params: {
      q: '*:*',
      rows: 0,
      'json.facet': JSON.stringify({
        unique_herbaria: "unique(herbarium_acronym_facet)"
      })
    }
  });
  
  // The JSON Facet API returns the unique count directly in the facets object
  const uniqueHerbariaCount = response.data.facets?.unique_herbaria;
  
  if (typeof uniqueHerbariaCount !== 'number') {
    console.warn('Unexpected response format for herbaria count:', response.data);
    return 0;
  }
  
  return uniqueHerbariaCount;
}

/**
 * Get count of unique species using Solr JSON Facet API.
 */
export async function getSpeciesCount(): Promise<number> {
  const response = await solrAxios.get<SolrResponse>('/select', {
    params: {
      q: '*:*',
      rows: 0,
      'json.facet': JSON.stringify({
        unique_species: "unique(scientific_name_facet)"
      })
    }
  });
  
  // The JSON Facet API returns the unique count directly in the facets object
  const uniqueSpeciesCount = response.data.facets?.unique_species;
  
  if (typeof uniqueSpeciesCount !== 'number') {
    console.warn('Unexpected response format for species count:', response.data);
    return 0;
  }
  
  return uniqueSpeciesCount;
}
