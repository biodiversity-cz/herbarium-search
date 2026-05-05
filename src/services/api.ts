import axios from 'axios';
import { HerbariumRecord, SolrResponse, SuggesterResponse } from '@types';

const API_BASE_URL = 'https://herbarium.biodiversity.cz/solr/specimens';

/**
 * Search herbarium records using Solr
 */
export async function searchRecords(
  query: string = '*:*',
  filters: string[] = [],
  start: number = 0,
  rows: number = 10,
  facet: boolean = true
): Promise<SolrResponse> {
  const params: Record<string, any> = {
    q: query,
    start,
    rows,
    facet: facet ? 'true' : 'false'
  };

  if (filters.length > 0) {
    params.fq = filters;
  }

  const response = await axios.get<SolrResponse>(`${API_BASE_URL}/search`, {
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
