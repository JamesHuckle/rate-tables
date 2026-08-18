# Rate tables

A standalone Vite application for turning benefit-pricing PDFs into traceable rate tables, eligibility rules, and employee cost scenarios.

## What it includes

- Browser-side PDF text extraction; source PDFs are not uploaded.
- Structured rate-table extraction through an OpenAI-backed Vercel Function.
- Deterministic client-side evaluation of eligibility, options, calculations, payer splits, and pricing rules.
- Source citations, extraction warnings, editable example personas, JSON output, and a built-in worked example.
- Responsive desktop and mobile workspaces.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `OPENAI_API_KEY` for PDF extraction. The built-in example and deterministic evaluation work without it.

## Verification

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Deployment

The repository is configured for Vercel. `api/extract.ts` is deployed as a serverless function and the Vite app is served as a single-page application.

PDFs must contain selectable text. Scanned PDFs should be OCR-processed before upload. Up to five PDFs can be selected; extracted text is capped to keep the serverless request bounded.
