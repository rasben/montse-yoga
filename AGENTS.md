# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Marketing website for yoga instructor Maria Montserrat, served at **[maria-montserrat.com](https://maria-montserrat.com/)**. The site promotes her yoga business and online courses, and is intended to be **multi-lingual** (i18n is a goal — not yet implemented). Static site built with Astro, with Svelte available for interactive islands (none hydrated yet), Tailwind for styling, and Flowbite-Svelte for UI components. Deployed to GitHub Pages automatically on push to `main`.

**Why this site exists.** It replaces a third-party hosted page ([mariamontserrat.impact.me](https://mariamontserrat.impact.me/), kept around as a content/structure reference) for two reasons: avoiding recurring fees on a hosted CMS, and getting full design control instead of being limited to what the CMS templates allow. Design proposals from agents — layouts, color/type direction, copy drafts, component structure — are explicitly welcome and part of the work on this project.

**Stack:** Astro 5 · Svelte 5 · TypeScript 5 · Tailwind CSS 4 · Flowbite-Svelte

## Commands

```bash
npm install            # First-time setup — installs dependencies
npm start              # Dev server at http://localhost:4321 (opens the browser)
npm run dev            # Dev server without opening a browser
npm run build          # Static build to ./dist/
npm run preview        # Preview the production build
npm run publish-site   # Safe build-commit-push flow (see below)
npm run astro          # Raw Astro CLI (e.g. `npm run astro add <integration>`)
```

There is no test framework, linter, or formatter configured. Match the style of surrounding code.

### `npm run publish-site` (the safe deploy flow)

`scripts/publish.mjs` is a guard-railed wrapper around the commit-and-push flow, intended for non-technical contributors and for agents helping them. It:

1. Confirms the working branch is `main`.
2. Bails out if there's nothing to publish.
3. Fetches `origin/main` and refuses to proceed if the remote is ahead (avoids overwriting work).
4. Runs `npm run build` and refuses to publish if the build fails.
5. Shows the changed files, prompts for a one-line plain-language commit message (with a sensible default), then `git add -A && git commit && git push`.

When working with the non-technical contributor, **prefer this script over running `git add` / `git commit` / `git push` manually** — the build gate alone catches a lot of things that would otherwise break production. Power users can still use git directly.

## Project layout

```
src/
  pages/         File-based routes — filename maps to URL (index.astro → /)
  layouts/       Page wrappers (Layout.astro is the only one)
  components/    Reusable .astro components
  styles/        global.css (Tailwind + custom CSS variables)
  assets/        Images processed/optimized by Astro — import them, don't reference by path
public/          Served as-is (favicons, manifest)
scripts/         Project scripts (e.g. publish.mjs — see Commands)
dist/            Build output — never commit, never edit
.github/workflows/deploy.yml   Auto-deploys main to GitHub Pages
```

## Conventions

**Routing.** Add a page by dropping a `.astro` file into `src/pages/`. The filename becomes the URL.

**Components.** PascalCase filenames (`Header.astro`, `Contact.astro`). Pages are lowercase (`index.astro`, `flyer.astro`). New pages should import `Layout.astro` and follow the pattern in `src/pages/index.astro`.

**UI library.** Use Flowbite-Svelte components (`Button`, `Heading`, `Navbar`, etc.) and `flowbite-svelte-icons` for icons rather than hand-rolling markup. Pass styling via the `class` prop with Tailwind utilities.

**Styling.** Tailwind utilities first. Custom theme colors live as CSS variables in `src/styles/global.css` — `--color-primary-*` (orange/coral) and `--color-secondary-*` (sky blue). Component-scoped styles go inside `<style>` tags in the `.astro` file (auto-scoped by Astro).

**Assets.** Import images from `src/assets/` so Astro can optimize them:

```astro
---
import beach from '../assets/beach.jpg';
---
<img src={beach.src} alt="..." />
```

Files in `public/` are served as raw paths and are not processed.

**TypeScript.** Project extends `astro/tsconfigs/strict`. Astro's generated types live in `.astro/types.d.ts`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. The custom domain is **maria-montserrat.com**. There is no staging environment — verify locally with `npm run dev` and `npm run build` before merging.

> **Note for agents:** the `site` field in `astro.config.mjs` still points at `https://rasben.github.io`. When multi-lingual routing or canonical URLs / SEO meta tags are added, update `site` to `https://maria-montserrat.com` in the same change so generated URLs match the production domain.

## Working with different contributors

This repo is maintained by two people with very different technical backgrounds, and **agents should adapt their behavior based on who they're chatting with**:

- **Technical maintainer** — fluent in Astro, Svelte, Tailwind, git, and the build pipeline. With this person, agents can use technical shorthand, propose architectural changes, and skip explanations of standard tooling. Lead with the change, not the rationale; reach for code over prose.
- **Site owner (Maria)** — the subject-matter expert for the yoga business and the content, but new to git, the command line, build tools, and frontend code. With her, agents should:
  - Explain in plain language *before* acting — what each command does, what each file change implies, and what the user-visible effect will be.
  - Default to small, reversible steps. Confirm before anything destructive (deleting files, force-pushing, running migrations, mass-editing content).
  - **Push back gently** if a request would break the build, the deploy, established conventions, or the site's brand consistency. Offer a safer alternative rather than just executing. "I can do that, but here's what would happen — want me to do it this other way instead?" is the right register.
  - Lead with the business or content goal and translate it into technical changes, not the other way around.
  - Keep design feedback constructive and concrete; suggest specific changes she can accept or reject rather than open-ended questions.
  - **Use `npm run publish-site` to deploy changes**, not raw `git add/commit/push`. The script's build gate is the only thing standing between a typo and a broken live site.

Infer who you're talking to from the conversation: the technical maintainer will use technical language; the site owner won't. When in doubt, ask once and remember.

## Things to know

- The site is currently 100% static generation. There are no API routes, no middleware, and no Svelte islands hydrated on the client. The one exception is `/flyer`, which uses an inline `<script>` to detect the device and redirect to Facebook.
- `src/components/Welcome.astro` and `Hero.astro` come from the Astro starter and are not currently referenced from any page.
- Contact links (Instagram, Facebook, email, phone) appear in both `src/pages/index.astro` and `src/components/Contact.astro` — keep them in sync when updating.
- Multi-lingual support is a planned goal. When implementing, prefer Astro's built-in [`i18n` routing](https://docs.astro.build/en/guides/internationalization/) over a third-party library.

## Keeping these docs current

This file (and `CLAUDE.md`, which points here) is the source of truth for agent guidance. **Whenever the project's stack, layout, conventions, deployment, or goals change, update `AGENTS.md` in the same change.** Examples that should trigger an update: adding i18n, introducing a CMS or content collections, adopting a linter/formatter or test framework, switching hosting, or adding a new top-level directory.

This repo is **public**. Keep notes factual and professional — no personal commentary, internal jokes, or anything that wouldn't belong on a public README.
