import axios from 'axios';
import { HerbariumRecord, SolrResponse, SuggesterResponse, FacetData } from '@types';

const API_BASE_URL = 'https://herbarium.biodiversity.cz/solr/specimens';

/**
 * Fetch facet data for specific fields
 */
export async function getFacets(
  query: string = '*:*',
  filters: string[] = [],
  facetFields: string[] = ['taxon', 'collector', 'locality'],
  facetSize: number = 50
): Promise<FacetData> {
  const params: Record<string, any> = {
    q: query,
    facet: 'true',
    'facet.limit': facetSize
  };

  // Add facet fields dynamically
  facetFields.forEach((field, index) => {
    params[`facet.field.${index}`] = field;
  });

  if (filters.length > 0) {
    // Join multiple filters with AND, but pass as single string to avoid fq[] encoding
    params.fq = filters.join(' AND ');
  }

  const response = await axios.get<FacetData>(`${API_BASE_URL}/select`, {
    params
  });

  return response.data;
}

/**
 * Search herbarium records using Solr
 * When includeFacets is true, also returns facet counts for configured fields
 */
export async function searchRecords(
  query: string = '*:*',
  filters: string[] = [],
  start: number = 0,
  rows: number = 10,
  includeFacets: boolean = false
): Promise<SolrResponse> {
  const params: Record<string, any> = {
    q: query,
    start,
    rows,
    facet: includeFacets ? 'true' : 'false'
  };

  if (includeFacets) {
    params['facet.limit'] = 50;
    params['facet.field.0'] = 'taxon';
    params['facet.field.1'] = 'collector';
    params['facet.field.2'] = 'locality';
  }

  if (filters.length > 0) {
    // Join multiple filters with AND, but pass as single string to avoid fq[] encoding
    params.fq = filters.join(' AND ');
  }

  const response = await axios.get<SolrResponse>(`${API_BASE_URL}/select`, {
    params
  });

  return response.data;
}

/**
 * Get a single herbarium record by ID
 */
export async function getRecordById(id: string): Promise<HerbariumRecord> {
  const response = await axios.get<HerbariumRecord>(`${API_BASE_URL}/records/${id}`);
  return response.data;
}

/**
 * Health check for the backend
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
}

/**
 * Get suggestions from Solr suggester
 * All suggesters are searched by default, no need to specify individual dictionaries
 */
export async function getSuggestions(query: string): Promise<SuggesterResponse> {
  const params: Record<string, string> = {
    'suggest.q': query,
    'wt': 'json',
    'suggest.highlight': 'false'
  };

  const response = await axios.get<SuggesterResponse>(`${API_BASE_URL}/suggest`, {
    params
  });

  return response.data;
}
