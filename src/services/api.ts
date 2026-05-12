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
 * Returns facet.field as an array; the custom serializer will repeat it
 * as: facet.field=scientific_name_facet&facet.field=creator_facet&...
 */
const buildFacetParams = (facetLimit = 50): Record<string, unknown> => {
  const facetFields: string[] = [];
  for (const cfg of FACET_CONFIG) {
    if (!cfg.enabled || cfg.type !== 'terms') continue;
    facetFields.push(cfg.facetField);
  }
  return {
    facet: 'true',
    'facet.field': facetFields,
    'facet.limit': facetLimit,
    'facet.mincount': 1,
  };
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
