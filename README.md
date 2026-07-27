# Compliance Brain 🧠

AI-powered compliance assistant for Textile, Construction & Pharmaceutical industries across Pakistan, UAE, Saudi Arabia, and Egypt.

## Setup (10 minutes)

### 1. Create Supabase project
- Go to supabase.com → New project
- Run `supabase_schema.sql` in SQL Editor
- Create storage buckets: `documents` (private) and `reports` (private)

### 2. Get your API keys
From Supabase dashboard:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY`

From Anthropic console (console.anthropic.com):
- API key → `ANTHROPIC_API_KEY`

### 3. Setup environment
```bash
cp .env.local.example .env.local
# Fill in your keys
```

### 4. Install & run
```bash
npm install
npm run dev
```

### 5. Deploy to Vercel
```bash
npx vercel
# Add all env vars in Vercel dashboard
```

## Adding regulations to DB

Run this SQL in Supabase to add a regulation:
```sql
INSERT INTO regulations (title, country, industry, category, document_name, section_number, page_number, line_number, content)
VALUES (
  'Fire Safety Equipment Requirements',
  'Pakistan',
  'Textile',
  'Safety',
  'Punjab Factory Act 1934',
  '12',
  34,
  6,
  'Every factory must be equipped with adequate fire extinguishers...'
);
```

Saeed can fill these in from the PDFs he collects!

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **PDF**: jsPDF
- **Hosting**: Vercel
