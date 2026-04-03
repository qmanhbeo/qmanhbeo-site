# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 16 App Router site. Route entry points live in `app/`, including `app/page.tsx`, feature routes such as `app/library/`, `app/map/`, `app/letter/`, and the mail handler in `app/api/send-letter/route.ts`. Reusable UI lives in `components/`, with shared primitives under `components/ui/`. Keep hooks in `hooks/` and content/data modules in `utils/` such as `utils/content.ts` and `utils/sections.ts`. Static assets served by Next.js belong in `public/`; source imagery and working files also appear in `img/`, `tmp/`, and `tmp_screenshots/` and should stay out of normal feature PRs. The LaTeX resume lives in `resume/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local dev server.
- `npm run lint`: run ESLint across the repository.
- `npm run build`: create a production build and catch route/runtime issues.
- `npm run start`: serve the production build locally.
- `powershell -ExecutionPolicy Bypass -File .\resume\scripts\build.ps1`: rebuild the resume PDF when editing `resume/resume.tex`.

## Coding Style & Naming Conventions
Use TypeScript and TSX with 2-space indentation and the repo's existing semicolon-light style. Prefer functional React components, App Router patterns, and Tailwind utilities in JSX. Name components in PascalCase (`HeroSection.tsx`), hooks in camelCase with a `use` prefix (`useBoundaryPagedScroll.ts`), and route folders in lowercase. Section-oriented components typically use the `*Section.tsx` pattern; keep that convention for new horizontal-scroll panels.

## Testing Guidelines
There is no dedicated automated test suite or coverage gate yet. Every change should pass `npm run lint` and `npm run build`. For UI work, manually smoke test the main routes (`/`, `/library`, `/item/[id]`, `/map`, `/letter`) and verify desktop plus mobile behavior. For letter-form changes, validate the API path and error handling without committing credentials.

## Commit & Pull Request Guidelines
Recent commits use short, imperative subjects such as `Fix map cards contrast` and `Add sections to manuscripts`. Keep commits focused, present tense, and under roughly 72 characters. PRs should include a concise description, note affected routes/components, link the related task if one exists, and attach screenshots for visual changes.

## Security & Configuration Tips
Keep secrets in `.env.local` only. The current app expects `RESEND_API_KEY` and `LETTER_TO_EMAIL` for the letter API. Never hard-code keys, commit real credentials, or include temporary audit artifacts in a review branch.
