# RK Health

**AI-powered healthcare management and patient reminder platform** — one dashboard for appointments, medication schedules, health records, and AI-generated visit summaries.

---

## Features

- **Authentication** — Secure multi-user email/password sign-in with per-user data isolation (Row Level Security).
- **Appointments** — Create, edit, and track visits with one-click Google Calendar links.
- **Medications** — Manage dosages, schedules, and active/inactive status.
- **AI Visit Summaries** — Turn raw appointment notes into patient-friendly markdown summaries (overview, plain-English explanation, instructions, follow-up) powered by Google Gemini 3 Flash.
- **Health Report** — Printable, aggregated view of all appointments, medications, and AI insights.
- **Responsive Dashboard** — Collapsible sidebar navigation with mobile support.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7, SSR) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data / Auth | Supabase (Postgres, Auth, RLS) |
| AI | Google Gemini 3 Flash |
| Server logic | TanStack `createServerFn` |
| Package manager | Bun |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- Node.js ≥ 20

### Install

```bash
bun install
```

### Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

### Develop

```bash
bun run dev        # start Vite dev server on http://localhost:8080
bun run build      # production build
bun run preview    # preview production build
bun run lint       # run ESLint
bun run format     # run Prettier
```

---

## Project Structure

```
src/
├── components/          # Shared UI (sidebar, shadcn primitives)
├── hooks/               # Reusable React hooks
├── integrations/
│   └── supabase/        # Supabase client & generated types
├── lib/                 # Utilities, AI gateway, server functions
│   ├── ai-gateway.server.ts
│   ├── calendar.ts
│   └── summaries.functions.ts
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx       # App shell + SEO metadata
│   ├── index.tsx        # Landing page
│   ├── auth.tsx         # Sign-in / sign-up
│   └── _authenticated/  # Protected routes
│       ├── route.tsx
│       ├── dashboard.tsx
│       ├── appointments.tsx
│       ├── medications.tsx
│       └── report.tsx
├── router.tsx
├── server.ts
└── styles.css
supabase/
└── migrations/          # Database schema
```

---

## Database Schema

Four core tables, all with Row Level Security so users only ever see their own rows:

- `profiles` — extended user metadata
- `appointments` — visit records + notes
- `medications` — dosage, schedule, active flag
- `ai_summaries` — generated visit summaries linked to an appointment

---

## Integration Status

| Integration | Status |
| --- | --- |
| AI Visit Summaries (Gemini 3 Flash) | Live |
| Google Calendar (link generation) | Live |
| Twilio SMS reminders | UI ready, delivery stubbed |

---

## Roadmap

- Twilio SMS delivery
- Google Calendar two-way sync via OAuth
- PDF export of the health report
- Caregiver / family sharing

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: add my feature"`)
4. Push and open a Pull Request

Please run `bun run lint` and `bun run format` before submitting.

---

## License

MIT — see [LICENSE](./LICENSE).
