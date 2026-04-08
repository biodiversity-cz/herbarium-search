# Setup Guide

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies:
- React 19
- TypeScript
- Vite
- React Router
- Bootstrap 5
- Axios
- Express (for mock backend)
- And all dev dependencies

### 2. Start Development

You need to run two servers:

#### Terminal 1: Mock Backend
```bash
npm run mock-server
```
This starts the Express server on port 3001.

#### Terminal 2: Frontend Dev Server
```bash
npm run dev
```
This starts the Vite dev server on port 3000.

### 3. Access the Application

Open your browser to: `http://localhost:3000`

## Available Pages

1. **Home Page** (`/`) 
   - Simple search interface
   - Quick search input field

2. **Advanced Search** (`/search`)
   - Faceted search with filters
   - Results list with pagination
   - Filter by Family, Genus, Country

3. **Detail Page** (`/detail/:id`)
   - Detailed specimen information
   - All available metadata
   - Specimen images

## Mock Data

The mock backend includes 5 sample specimens:

1. Quercus robur (Oak)
2. Taraxacum officinale (Dandelion)
3. Acer platanoides (Norway Maple)
4. Bellis perennis (Common Daisy)
5. Picea abies (Norway Spruce)

## Testing the Application

### Test Simple Search
1. Go to home page
2. Type "Quercus" or "Asteraceae"
3. Click Search or press Enter
4. See filtered results on the search page

### Test Faceted Search
1. Go to Advanced Search (`/search`)
2. Use the sidebar filters:
   - Select a Family (e.g., "Asteraceae")
   - Select a Country (e.g., "Czech Republic")
3. See results update in real-time

### Test Detail View
1. From any search results page
2. Click on a specimen card
3. View detailed information
4. Use "Back to Results" to return

## Mock Backend API

The mock backend provides these endpoints:

### Search Specimens
```
GET /api/solr/search?q=*:*&start=0&rows=10&facet=true
```

Query Parameters:
- `q` - Search query (default: `*:*` for all)
- `start` - Pagination start (default: 0)
- `rows` - Number of results (default: 10)
- `facet` - Include facets (default: true)
- `fq` - Filter queries (can be multiple)

### Get Specimen Detail
```
GET /api/records/:id
```

### Health Check
```
GET /api/health
```

## Customization

### Adding More Mock Data

Edit `src/mock-backend/mockData.js` and add more records to the `mockRecords` array.

### Changing Styles

Edit SASS files in `src/styles/`:
- `main.scss` - Global styles and Bootstrap imports
- `components/_search.scss` - Search page styles
- `components/_detail.scss` - Detail page styles
- `components/_layout.scss` - Layout and navigation styles

### Adding New Facets

1. Update `src/types/index.ts` if needed
2. Edit `src/mock-backend/mockData.js` to include facet data
3. Update `src/pages/SearchPage.tsx` to add the facet UI

## Production Build

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**For frontend (port 3000):**
Edit `vite.config.ts` and change the port:
```typescript
server: {
  port: 3002, // Change to any available port
}
```

**For backend (port 3001):**
Edit `src/mock-backend/server.js` and change:
```javascript
const PORT = 3002; // Change to any available port
```

### Path Alias Issues

If TypeScript complains about path aliases:
1. Make sure `tsconfig.json` includes the paths
2. Restart your IDE/editor
3. Run `npm run build` to verify

### Bootstrap Styles Not Loading

Make sure:
1. Bootstrap is installed: `npm install bootstrap`
2. SASS is installed: `npm install -D sass`
3. The import in `src/styles/main.scss` is correct

## Next Steps

1. **Replace Mock Backend**: Connect to a real Solr instance
2. **Add Authentication**: If needed for data management
3. **Enhance Filtering**: Add more facet options
4. **Add Maps**: Display specimen locations on a map
5. **Image Gallery**: Implement a lightbox for images
6. **Export Features**: Add CSV/JSON export functionality
