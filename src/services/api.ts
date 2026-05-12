import axios from 'axios';
import { HerbariumRecord, SolrResponse, SuggesterResponse, FacetData } from '@types';
import { FACET_CONFIG } from '@/types/facets';

const API_BASE_URL = 'https://herbarium.biodiversity.cz/solr/specimens';

/**
 * Build the facet.field params for all enabled facets.
 * Uses the facetField from the FACET_CONFIG registry so the API layer
 * stays in sync with the model automatically.
 */
const buildFacetParams = (
  facetLimit = 50
): Record<string, string | number> => {
  const params: Record<string, string | number> = {
    facet: 'true',
    'facet.limit': facetLimit,
    'facet.mincount': 1,
  };

  let idx = 0;
  for (const cfg of FACET_CONFIG) {
    if (!cfg.enabled || cfg.type !== 'terms') continue;
    params[`facet.field.${idx}`] = cfg.facetField;
    idx++;
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

  if (filters.length > 0) {
    params.fq = filters.join(' AND ');
  }

  const response = await axios.get<SolrResponse>(`${API_BASE_URL}/select`, { params });
  return response.data;
}

/**
 * Fetch facet data only (rows=0) for specific fields.
 * Useful for sidebar initialisation without fetching result documents.
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
    params.fq = filters.join(' AND ');
  }

  const response = await axios.get<FacetData>(`${API_BASE_URL}/select`, { params });
  return response.data;
}

/**
 * Get a single herbarium record by ID.
 * Uses the /select endpoint with an exact id filter (the /records/ endpoint does not exist).
 */
export async function getRecordById(id: string): Promise<HerbariumRecord> {
  const response = await axios.get<SolrResponse>(`${API_BASE_URL}/select`, {
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
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
}

/**
 * Get suggestions from Solr suggesters.
 * All three suggesters (taxon, creator, locality) are queried simultaneously.
 */
export async function getSuggestions(query: string): Promise<SuggesterResponse> {
  const params: Record<string, string> = {
    'suggest.q': query,
    wt: 'json',
    'suggest.highlight': 'false',
  };

  const response = await axios.get<SuggesterResponse>(`${API_BASE_URL}/suggest`, { params });
  return response.data;
}
