import express from 'express';
import cors from 'cors';
import { mockRecords, getMockSolrResponse, getMockRecordDetail } from './mockData.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock Solr search endpoint
app.get('/api/solr/search', (req, res) => {
  const { q, fq, start = 0, rows = 10, facet = 'true' } = req.query;
  
  console.log('Search request:', { q, fq, start, rows });
  
  const response = getMockSolrResponse(q, fq, parseInt(start), parseInt(rows), facet === 'true');
  
  res.json(response);
});

// Mock record detail endpoint
app.get('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const record = getMockRecordDetail(id);
  
  if (record) {
    res.json(record);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock backend is running' });
});

app.listen(PORT, () => {
  console.log(`Mock backend server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - GET /api/solr/search`);
  console.log(`  - GET /api/records/:id`);
  console.log(`  - GET /api/health`);
});
