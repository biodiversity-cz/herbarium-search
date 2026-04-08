import axios from 'axios';
import { HerbariumRecord, SolrResponse } from '@types/index';

const API_BASE_URL = '/api';

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

  const response = await axios.get<SolrResponse>(`${API_BASE_URL}/solr/search`, {
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
