# JobTracker

A modern job application tracking system built with Next.js, Supabase, and TailwindCSS. Keep your job search organized with real-time tracking, statistics, and an intuitive interface.

## Features

- **Application Management** - Track applications with company, position, status, dates, and notes
- **Real-time Statistics** - Interactive pie chart visualizing application status distribution
- **Custom Columns** - Add and reorder custom fields to match your workflow
- **Auto-save** - Inline editing with automatic debounced saves
- **Authentication** - Secure user accounts with Supabase Auth
- **Animated UI** - Purple-themed gradient background with floating particles and mouse interactions
- **Motivational Quotes** - Daily rotating quotes at the footer to keep you motivated

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Styling:** TailwindCSS 4 with custom gradients and animations
- **Tables:** TanStack Table for advanced table functionality
- **Fonts:** Rubik (300-900 weights) via next/font/google

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account and project
- Environment variables:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
  ```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
├── dashboard/           # Main application dashboard
│   ├── JobTrackerTable.tsx    # Core table with stats
│   ├── GradientBackground.tsx # Animated background
│   ├── QuoteFooter.tsx        # Motivational quotes
│   └── actions.ts             # Server actions (CRUD)
├── login/               # Authentication pages
├── signup/
├── lib/supabase/        # Supabase client config
└── globals.css          # Global styles & custom scrollbar
```

## Database Schema

**applications** table:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `company` (text)
- `role` (text)
- `status` (text) - Applied, Interview, Offer, Rejected
- `applied_at` (date)
- `notes` (text)
- `custom_fields` (jsonb) - Flexible storage for custom columns

## Key Features Explained

### Auto-save System
Uses debounced saves (1.5s delay) with optimistic UI updates. Status indicator shows "Saving..." → "Saved" transitions.

### Statistics View
Real-time pie chart calculates status distribution using SVG circles with `strokeDasharray`. Hover effects highlight segments and legend.

### Custom Columns
Drag-to-reorder interface stores column configuration. Data persists in `custom_fields` JSONB column.

### Animated Background
Purple gradient spheres with CSS keyframe animations, JavaScript particle system (80 ambient + mouse-triggered), parallax mouse tracking, grid overlay, and noise texture.

## Deployment

Deploy to Vercel with automatic environment variable detection:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Ensure Supabase environment variables are configured in project settings.

## License

MIT
