/**
 * Mock data for herbarium specimens
 */

export const mockRecords = [
  {
    id: '1',
    catalogNumber: 'HERB-2024-001',
    scientificName: 'Quercus robur',
    family: 'Fagaceae',
    genus: 'Quercus',
    species: 'robur',
    author: 'L.',
    collector: 'John Smith',
    collectionDate: '2024-06-15',
    country: 'Czech Republic',
    locality: 'Brno, Lužánky Park',
    habitat: 'Deciduous forest',
    latitude: 49.1951,
    longitude: 16.6068,
    altitude: 250,
    institution: 'Masaryk University',
    imageUrl: 'https://via.placeholder.com/800x600?text=Quercus+robur',
    thumbnailUrl: 'https://via.placeholder.com/150x150?text=Q.+robur',
    determiner: 'Dr. Jane Doe',
    determinationDate: '2024-06-20',
    notes: 'Mature tree, approximately 50 years old'
  },
  {
    id: '2',
    catalogNumber: 'HERB-2024-002',
    scientificName: 'Taraxacum officinale',
    family: 'Asteraceae',
    genus: 'Taraxacum',
    species: 'officinale',
    author: 'F.H.Wigg.',
    collector: 'Mary Johnson',
    collectionDate: '2024-05-10',
    country: 'Czech Republic',
    locality: 'Prague, Botanical Garden',
    habitat: 'Grassland',
    latitude: 50.0755,
    longitude: 14.4378,
    altitude: 200,
    institution: 'Charles University',
    imageUrl: 'https://via.placeholder.com/800x600?text=Taraxacum+officinale',
    thumbnailUrl: 'https://via.placeholder.com/150x150?text=T.+officinale',
    determiner: 'Prof. Karel Novák',
    determinationDate: '2024-05-15',
    notes: 'Common dandelion, found in disturbed areas'
  },
  {
    id: '3',
    catalogNumber: 'HERB-2024-003',
    scientificName: 'Acer platanoides',
    family: 'Sapindaceae',
    genus: 'Acer',
    species: 'platanoides',
    author: 'L.',
    collector: 'Peter Brown',
    collectionDate: '2024-04-22',
    country: 'Slovakia',
    locality: 'Bratislava, Horský Park',
    habitat: 'Mixed forest',
    latitude: 48.1486,
    longitude: 17.1077,
    altitude: 300,
    institution: 'Comenius University',
    imageUrl: 'https://via.placeholder.com/800x600?text=Acer+platanoides',
    thumbnailUrl: 'https://via.placeholder.com/150x150?text=A.+platanoides',
    determiner: 'Dr. Eva Horváthová',
    determinationDate: '2024-04-25',
    notes: 'Norway maple, invasive in some regions'
  },
  {
    id: '4',
    catalogNumber: 'HERB-2024-004',
    scientificName: 'Bellis perennis',
    family: 'Asteraceae',
    genus: 'Bellis',
    species: 'perennis',
    author: 'L.',
    collector: 'Sarah Williams',
    collectionDate: '2024-03-18',
    country: 'Czech Republic',
    locality: 'Olomouc, University campus',
    habitat: 'Lawn',
    latitude: 49.5938,
    longitude: 17.2509,
    altitude: 220,
    institution: 'Palacký University',
    imageUrl: 'https://via.placeholder.com/800x600?text=Bellis+perennis',
    thumbnailUrl: 'https://via.placeholder.com/150x150?text=B.+perennis',
    determiner: 'Mgr. Tomáš Svoboda',
    determinationDate: '2024-03-20',
    notes: 'Common daisy, flowering specimen'
  },
  {
    id: '5',
    catalogNumber: 'HERB-2023-045',
    scientificName: 'Picea abies',
    family: 'Pinaceae',
    genus: 'Picea',
    species: 'abies',
    author: '(L.) H.Karst.',
    collector: 'Michael Davis',
    collectionDate: '2023-09-05',
    country: 'Czech Republic',
    locality: 'Krkonoše Mountains',
    habitat: 'Coniferous forest',
    latitude: 50.7359,
    longitude: 15.7398,
    altitude: 1200,
    institution: 'Masaryk University',
    imageUrl: 'https://via.placeholder.com/800x600?text=Picea+abies',
    thumbnailUrl: 'https://via.placeholder.com/150x150?text=P.+abies',
    determiner: 'Dr. Jan Dvořák',
    determinationDate: '2023-09-10',
    notes: 'Norway spruce, montane zone'
  }
];

/**
 * Generate mock Solr response
 */
export function getMockSolrResponse(query = '*:*', filterQuery = '', start = 0, rows = 10, includeFacets = true) {
  let filteredRecords = [...mockRecords];

  // Simple filtering based on query
  if (query && query !== '*:*') {
    const searchTerm = query.toLowerCase();
    filteredRecords = filteredRecords.filter(record =>
      record.scientificName.toLowerCase().includes(searchTerm) ||
      record.family?.toLowerCase().includes(searchTerm) ||
      record.collector?.toLowerCase().includes(searchTerm) ||
      record.locality?.toLowerCase().includes(searchTerm)
    );
  }

  // Apply filter queries
  if (filterQuery) {
    const filters = Array.isArray(filterQuery) ? filterQuery : [filterQuery];
    filters.forEach(fq => {
      if (fq.includes('family:')) {
        const family = fq.split(':')[1].replace(/"/g, '');
        filteredRecords = filteredRecords.filter(r => r.family === family);
      }
      if (fq.includes('country:')) {
        const country = fq.split(':')[1].replace(/"/g, '');
        filteredRecords = filteredRecords.filter(r => r.country === country);
      }
      if (fq.includes('genus:')) {
        const genus = fq.split(':')[1].replace(/"/g, '');
        filteredRecords = filteredRecords.filter(r => r.genus === genus);
      }
    });
  }

  const total = filteredRecords.length;
  const paginatedRecords = filteredRecords.slice(start, start + rows);

  const response = {
    responseHeader: {
      status: 0,
      QTime: 5,
      params: {
        q: query,
        start: start.toString(),
        rows: rows.toString(),
      }
    },
    response: {
      numFound: total,
      start: start,
      docs: paginatedRecords
    }
  };

  // Add facets if requested
  if (includeFacets) {
    response.facet_counts = {
      facet_fields: {
        family: [
          'Asteraceae', 2,
          'Fagaceae', 1,
          'Sapindaceae', 1,
          'Pinaceae', 1
        ],
        country: [
          'Czech Republic', 4,
          'Slovakia', 1
        ],
        genus: [
          'Quercus', 1,
          'Taraxacum', 1,
          'Acer', 1,
          'Bellis', 1,
          'Picea', 1
        ],
        institution: [
          'Masaryk University', 2,
          'Charles University', 1,
          'Comenius University', 1,
          'Palacký University', 1
        ]
      }
    };
  }

  return response;
}

/**
 * Get mock record detail by ID
 */
export function getMockRecordDetail(id) {
  return mockRecords.find(record => record.id === id);
}
