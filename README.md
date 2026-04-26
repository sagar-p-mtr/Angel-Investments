# Angel Investments

Production-ready retirement planning web app for Angel Investments.

## Description

This application helps users evaluate retirement readiness with fully linked calculators:

- Seed phase: SIP/lumpsum corpus growth
- Harvest phase: retirement withdrawals and depletion age
- Life phase: inflation-adjusted monthly lifestyle requirements

All major inputs are connected, so changing key values updates dependent sections immediately.

## Tech Stack

- React
- Vite
- Chart.js + react-chartjs-2

## Run Locally

```bash
npm install
npm run dev
```

Open: http://localhost:5173/

## Production Build

```bash
npm run build
npm run preview
```

## Deploy To Vercel

### Option 1: Vercel Dashboard

1. Push this repository to GitHub.
2. Import the GitHub repo into Vercel.
3. Build command: `npm run build`
4. Output directory: `dist`

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Brand Assets

- Active company logo: `public/angel-logo.svg`
