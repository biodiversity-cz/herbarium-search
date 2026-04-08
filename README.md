# Herbarium Search

A modern web application for searching and browsing herbarium specimens. Built with React 19, TypeScript, and Bootstrap 5.

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd herbarium-search
```

2. Install dependencies:
```bash
npm install
```

3. Start the mock backend (in one terminal):
```bash
npm run mock-server
```

4. Start the development server (in another terminal):
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run mock-server` - Start mock backend API

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── services/       # API services
├── types/          # TypeScript types
├── styles/         # SASS styles
├── mock-backend/   # Mock API server
└── App.tsx         # Main app component
```

For detailed project structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Bootstrap 5** - Styling (SASS)
- **Axios** - HTTP client

## Mock Backend

The project includes a mock Express backend that simulates Solr-style responses. This allows frontend development and testing without a real backend.

### Mock API Endpoints

- `GET /api/solr/search` - Search specimens
- `GET /api/records/:id` - Get specimen details
- `GET /api/health` - Health check

## Development Notes

- The mock backend runs on port **3001**
- The frontend dev server runs on port **3000**
- Vite proxies `/api/*` requests to the mock backend
- Path aliases are configured for cleaner imports (e.g., `@components`, `@pages`)

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## License

See [LICENSE](./LICENSE) file for details.

[//]: # (obligatory branding for EOSC.CZ)
<hr style="margin-top: 100px; margin-bottom: 20px">

<p style="text-align: left"> <img src="https://webcentrum.muni.cz/media/3831863/seda_eosc.png" alt="EOSC CZ Logo" height="90"> </p>
This project output was developed with financial contributions from the EOSC CZ initiative throught the project National Repository Platform for Research Data (CZ.02.01.01/00/23_014/0008787) funded by Programme Johannes Amos Comenius (P JAC) of the Ministry of Education, Youth and Sports of the Czech Republic (MEYS).

<p style="text-align: left"> <img src="https://webcentrum.muni.cz/media/3832168/seda_eu-msmt_eng.png" alt="EU and MŠMT Logos" height="90"> </p>
