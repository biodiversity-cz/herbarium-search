# Herbarium Search - Project Structure

## Overview
This is a React 19 + TypeScript web application for searching and browsing herbarium specimens. It uses Vite as the build tool, Bootstrap 5 for styling (via SASS), and includes a mock backend for testing purposes.

## Directory Structure

```
herbarium-search/
├── public/                      # Static assets
│   └── assets/                  # Images and other static files
│
├── src/
│   ├── components/              # React components
│   │   ├── common/             # Reusable components
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   └── search/             # Search-specific components
│   │       └── CustomReactiveList.tsx
│   │
│   ├── pages/                   # Page components
│   │   ├── IndexPage.tsx       # Home page with simple search
│   │   ├── SearchPage.tsx      # Advanced search with facets
│   │   └── DetailPage.tsx      # Specimen detail view
│   │
│   ├── services/                # API and service layer
│   │   └── api.ts              # API calls to backend
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts            # Shared types
│   │
│   ├── styles/                  # SASS styles
│   │   ├── main.scss           # Main stylesheet (imports Bootstrap)
│   │   └── components/         # Component-specific styles
│   │       ├── _search.scss
│   │       ├── _detail.scss
│   │       └── _layout.scss
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   │
│   ├── mock-backend/            # Mock backend for testing
│   │   ├── server.js           # Express server
│   │   └── mockData.js         # Mock data and response generators
│   │
│   ├── App.tsx                  # Main App component
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite type declarations
│
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node
├── vite.config.ts              # Vite configuration
├── .gitignore
├── LICENSE
└── README.md
```

## Key Features

### 1. **Index Page** (`/`)
- Simple search interface with a single input field
- Quick navigation to advanced search
- Clean, centered layout

### 2. **Advanced Search Page** (`/search`)
- Faceted search interface
- Filters for:
  - Family (taxonomic)
  - Genus
  - Country
  - Institution
- Real-time search results
- Pagination support
- Result count display

### 3. **Detail Page** (`/detail/:id`)
- Comprehensive specimen information
- Sections:
  - Taxonomy (Family, Genus, Species, Author)
  - Collection Information (Collector, Date, Institution)
  - Location (Country, Locality, Habitat, Coordinates, Altitude)
  - Additional Information (Determiner, Notes)
- Image display
- Back navigation

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Bootstrap 5** - UI framework (via SASS)
- **Axios** - HTTP client
- **Express** (mock backend) - Testing API

## Data Flow

1. **Frontend** → Makes requests via `src/services/api.ts`
2. **API Service** → Communicates with backend at `/api/*`
3. **Mock Backend** → Returns Solr-style responses from `mockData.js`
4. **Components** → Display data using TypeScript interfaces

## Type Definitions

### HerbariumRecord
```typescript
interface HerbariumRecord {
  id: string;
  catalogNumber: string;
  scientificName: string;
  family?: string;
  genus?: string;
  species?: string;
  // ... and more fields
}
```

### SolrResponse
```typescript
interface SolrResponse {
  responseHeader: { ... };
  response: {
    numFound: number;
    start: number;
    docs: HerbariumRecord[];
  };
  facet_counts?: { ... };
}
```

## API Endpoints (Mock Backend)

- `GET /api/solr/search` - Search specimens (Solr-style response)
  - Query params: `q`, `fq` (filter query), `start`, `rows`, `facet`
  
- `GET /api/records/:id` - Get single specimen details

- `GET /api/health` - Health check

## Styling Architecture

- **Bootstrap 5** imported as SASS in `main.scss`
- **Component-specific styles** in `styles/components/`
- **Custom color scheme**:
  - Primary: `#667eea` (purple-blue)
  - Secondary: `#764ba2` (purple)
  - Gradients used in headers

## Development Workflow

1. Install dependencies: `npm install`
2. Start mock backend: `npm run mock-server` (port 3001)
3. Start dev server: `npm run dev` (port 3000)
4. Build for production: `npm run build`

## Path Aliases

The project uses TypeScript path aliases for cleaner imports:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@services/*` → `src/services/*`
- `@types/*` → `src/types/*`
- `@hooks/*` → `src/hooks/*`
- `@utils/*` → `src/utils/*`
- `@styles/*` → `src/styles/*`

## Future Enhancements

- Replace mock backend with real Solr integration
- Add map visualization for specimen locations
- Implement export functionality (CSV, JSON)
- Add image gallery/lightbox for specimen images
- Enhanced filtering (date ranges, altitude ranges)
- User authentication for data management
- Multi-language support
