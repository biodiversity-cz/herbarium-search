# Quick Start Guide

Get the Herbarium Search application running in 3 simple steps!

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages. It may take a few minutes.

## Step 2: Start the Servers

You need two terminal windows/tabs:

### Terminal 1 - Backend Server
```bash
npm run mock-server
```

Expected output:
```
Mock backend server running on http://localhost:3001
Available endpoints:
  - GET /api/solr/search
  - GET /api/records/:id
  - GET /api/health
```

### Terminal 2 - Frontend Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.1.0  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 3: Open in Browser

Navigate to: **http://localhost:3000**

## What You'll See

1. **Home Page**: A clean search interface with a single input field
2. **Try searching for**:
   - "Quercus" (Oak)
   - "Asteraceae" (Daisy family)
   - "Czech Republic"
   
3. **Explore the features**:
   - Click "Advanced Search" to see faceted filtering
   - Click on any result to see detailed information
   - Use the filters in the sidebar to refine results

## Sample Data

The application includes 5 specimen records:

1. **Quercus robur** (Oak) - Czech Republic
2. **Taraxacum officinale** (Dandelion) - Czech Republic
3. **Acer platanoides** (Norway Maple) - Slovakia
4. **Bellis perennis** (Daisy) - Czech Republic
5. **Picea abies** (Norway Spruce) - Czech Republic

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is already in use":
- Close any other application using port 3000
- Or change the port in `vite.config.ts`

If you see "Port 3001 is already in use":
- Close any other application using port 3001
- Or change the PORT in `src/mock-backend/server.js`

### Dependencies Installation Failed

Try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

If you see TypeScript path alias errors:
```bash
# Restart your IDE/editor
# Or run the build to verify
npm run build
```

## Next Steps

- Read [README.md](./README.md) for complete documentation
- See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details
- Check [SETUP.md](./SETUP.md) for advanced configuration

## Common Tasks

### Stop the Servers
Press `Ctrl+C` in each terminal window

### Restart the Servers
Stop them first, then run the commands again

### View Logs
Both servers output logs to the console

### Check Backend Health
Visit: http://localhost:3001/api/health

### Build for Production
```bash
npm run build
```

The build will be in the `dist/` directory.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error messages in the console
3. Ensure all dependencies are installed
4. Verify Node.js version: `node --version` (should be v18+)

Happy exploring! 🌿
