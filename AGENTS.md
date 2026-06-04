# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Marketing website for Maria Montserrat, served at **[maria-montserrat.com](https://maria-montserrat.com/)**. Static site built with Astro, deployed to GitHub Pages automatically on push to `main`. Multi-lingual support (EN / ES / DK) is a goal — i18n routing is not yet implemented; for now Maria's trilingual reach is signalled with the `Langs` component (flags) and copy.

**Why this site exists.** It replaces a third-party hosted page ([mariamontserrat.impact.me](https://mariamontserrat.impact.me/), kept around as a course-listing data source) for two reasons: avoiding recurring fees on a hosted CMS, and getting full design control instead of being limited to what the CMS templates allow. Design proposals from agents — layouts, color/type direction, copy drafts, component structure — are explicitly welcome and part of the work on this project.

**Site structure ("three universes").** The home page is a front door that splits visitors into three audiences; the global header carries the same split on every page.

- **`/` (`index.astro`)** — short intro + three "universe" cards.
- **`/teacher-yoga`** — Maria's yoga & breathwork offer for teachers, carers, and helping professionals (the original landing-page content).
- **`/brands`** — Maria's UGC / content-creator persona. Trilingual UGC for skincare, wellness, lifestyle, food, travel, and health brands.
- **Substack** — `https://mariamontserratmaria.substack.com/` — her essays / blog. Linked from the header and home page; not hosted in this repo.
- **`/courses`** — listing of self-paced courses, fed from `src/data/courses.json` (see `npm run fetch-courses`).
- **`/flyer`** — short-delay redirect to Maria's Canva site, used as a printable QR-code landing. Renders without the global header/footer via `Layout`'s `showHeader={false} showFooter={false}` props.

There is also a "Regulér" collaboration card on the home page linking to a separate Canva site Maria runs with Michala Storm — deliberately *not* in the global header (it's a joint project, not one of the three core universes).

**Stack:** Astro 5 · Svelte 5 · TypeScript 5 · Tailwind CSS 4 · Flowbite-Svelte

Svelte and Flowbite-Svelte are wired up but only used in `flyer.astro` today. There are no hydrated client islands; all interactive behaviour on the brands page (video controls, count-up animations) is in inline `<script>` blocks in the `.astro` file.

## Maria's personas

The site presents two related but distinct personas. When writing copy or building content, always reflect the actual specialties — not generic yoga or UGC marketing language.

### Yoga teacher (`/teacher-yoga`, `/courses`)

Maria's teaching practice spans nearly two decades across multiple continents.

**Teaching styles she works with:**
- **Yin yoga** — long passive holds, release of connective tissue, doorway to stillness and meditation. Her most distinctive niche.
- **Hatha & Vinyasa** — classical postures made fluid; breath-led, flowing movement with a creative quality
- **Kundalini** — kriyas, mantra, mudra, pranayama; transformational energy work
- **Breathwork / Pranayama** — nervous system regulation, somatic breath practices drawn from yoga and other traditions
- **Somatic movement** — body-awareness and creative movement for releasing stored tension and reconnecting with the body

**Background and training:**
- Formally trained in yin yoga, breathwork, and somatic movement
- Additional studies in Chinese medicine and face reading (mian xiang) — informs her holistic approach
- Based in Copenhagen; also teaches online

**Voice notes for copy:** Calm, creative, meditative — not performance-oriented or fitness-focused. The offer is about reconnecting with yourself, not achieving poses. The audience-first framing is burnout / nervous-system recovery, and the work is positioned especially for teachers, child carers, and people in helping professions.

### Content creator (`/brands`)

Mexican-born, Denmark-based, trilingual UGC creator (EN · ES · DK). The page documents organic reach (Instagram / TikTok / Facebook), spec UGC in three languages, photography, and services.

**Niches:** skincare & beauty, wellness & mindfulness, lifestyle, fashion, food & beverage, travel & hospitality, health & autoimmune, plant-based, nervous-system recovery.

**Voice notes for copy:** Honest, lived-in, conversion-focused. The pitch is authenticity — content "that feels real because it is." Personal-brand storytelling around burnout, the nervous system, and the way back to yourself is what builds the trust brands borrow.

## Commands

```bash
npm install            # First-time setup — installs dependencies
npm start              # Dev server at http://localhost:4321 (opens the browser)
npm run dev            # Dev server without opening a browser
npm run build          # Static build to ./dist/
npm run preview        # Preview the production build
npm run publish-site   # Safe build-commit-push flow (see below)
npm run fetch-courses  # Scrape impact.me and update src/data/courses.json (see below)
npm run astro          # Raw Astro CLI (e.g. `npm run astro add <integration>`)
```

There is no test framework, linter, or formatter configured. Match the style of surrounding code.

**Agents should not run the local commands above to "verify" their work** (`npm run dev`, `npm start`, `npm run build`, `npm run preview`, etc.). The maintainer runs and checks these manually. Make the code changes and describe what to look at; if something genuinely requires a command to be run, say so explicitly and let the maintainer do it.

### `npm run publish-site` (the safe deploy flow)

`scripts/publish.mjs` is a guard-railed wrapper around the commit-and-push flow, intended for non-technical contributors and for agents helping them. It:

1. Confirms the working branch is `main`.
2. Bails out if there's nothing to publish.
3. Fetches `origin/main` and refuses to proceed if the remote is ahead (avoids overwriting work).
4. Runs `npm run build` and refuses to publish if the build fails.
5. Shows the changed files, prompts for a one-line plain-language commit message (with a sensible default), then `git add -A && git commit && git push`.

When working with the non-technical contributor, **prefer this script over running `git add` / `git commit` / `git push` manually** — the build gate alone catches a lot of things that would otherwise break production. Power users can still use git directly.

### `npm run fetch-courses` (updating the course listing)

`scripts/fetch-courses.mjs` scrapes Maria's course listings from `mariamontserrat.impact.me/courses` and writes them to `src/data/courses.json`. Both the `/courses` page and the `Courses.astro` teaser component read that file at build time — there is no runtime fetch, so the site stays fully static.

**Workflow when a course is added or changed:**

```bash
npm run fetch-courses           # update src/data/courses.json
# review the output in your editor to make sure it looks right
npm run publish-site            # build + commit + push (include courses.json in the commit)
```

**If the scraper stops working** (impact.me changed their HTML), run:

```bash
npm run fetch-courses -- --debug   # writes raw HTML to debug/courses.html
```

Open `debug/courses.html`, find the course card HTML structure, and update the `SELECTORS` block near the top of `scripts/fetch-courses.mjs`. The `debug/` folder is gitignored so the file won't be committed.

**Manual fallback:** `src/data/courses.json` is just a plain JSON array. You can edit it by hand if the scraper can't be fixed quickly. Format:

```json
[
  {
    "title": "Course title",
    "description": "Short description shown on the card.",
    "image": "https://...",
    "url": "https://mariamontserrat.impact.me/courses/slug",
    "price": "€97"
  }
]
```

## Project layout

```
src/
  pages/         File-based routes — filename maps to URL (index.astro → /)
                 index.astro, teacher-yoga.astro, brands.astro, courses.astro, flyer.astro
  layouts/       Page wrappers (Layout.astro is the only one — wraps every page
                 with the global Header + SiteFooter, toggleable per page)
  components/    Reusable .astro components — Header, SiteFooter, Hero, Offerings,
                 Courses (teaser), Contact, Langs (flag row)
  styles/        global.css — Tailwind import + Mexican-palette CSS variables +
                 font-family tokens + fade-up animations
  assets/        Images processed/optimized by Astro — import them, don't reference
                 by path. `src/assets/local/` holds Maria's raw source images.
  data/          courses.json — single source of truth for the /courses listing
public/          Served as-is (favicons, manifest)
scripts/         Project scripts — publish.mjs (safe deploy), fetch-courses.mjs (scraper)
dist/            Build output — never commit, never edit
.github/workflows/deploy.yml   Auto-deploys main to GitHub Pages
```

## Conventions

**Routing.** Add a page by dropping a `.astro` file into `src/pages/`. The filename becomes the URL.

**Components.** PascalCase filenames (`Header.astro`, `Contact.astro`). Pages are lowercase (`index.astro`, `flyer.astro`). New pages should import `Layout.astro` and follow the pattern in `src/pages/index.astro` — `Layout` already renders the global Header and SiteFooter, so a new page just needs to add its own `<section>`s.

**Global chrome.** `Layout.astro` renders `Header` and `SiteFooter` on every page by default. Pass `showHeader={false}` / `showFooter={false}` to opt out (used by `flyer.astro` so the redirect splash isn't framed by the site nav).

**UI library.** Flowbite-Svelte (`Button`, `Heading`, `Spinner`, etc.) and `flowbite-svelte-icons` are available — currently only used by `flyer.astro` and `Contact.astro`. For most components, plain Astro + Tailwind has been simpler. Either pattern is fine; pick what reads cleanest at the call site.

**Styling.** Tailwind utilities first. The palette is a Mexican-inspired set defined as CSS variables in `src/styles/global.css`:

- `--color-primary-*` — orchid magenta (anchor `#b866a2`)
- `--color-secondary-*` — turquoise / teal
- `--color-accent-*` — marigold / amber
- `--color-rojo-*` — warm Mexican red, for occasional pop
- `--color-sand-*` — warm cream backgrounds

Type system: `--font-display` is Playfair Display (high-contrast serif, used for `h1–h4`), `--font-sans` is Inter (body). Both are loaded via Google Fonts in `Layout.astro`. Component-scoped styles go inside `<style>` tags in the `.astro` file (auto-scoped by Astro).

**Assets.** Import images from `src/assets/` so Astro can optimize them:

```astro
---
import maria from '../assets/maria-tree-pose.jpg';
import { Image } from 'astro:assets';
---
<Image src={maria} alt="..." widths={[480, 720, 960]} sizes="(min-width: 768px) 50vw, 90vw" />
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

- The site is 100% static generation. There are no API routes, no middleware, and no Svelte islands hydrated on the client. Two pieces of client-side JavaScript exist outside the analytics tag:
  - A **Plausible analytics** tag in `src/layouts/Layout.astro` (privacy-friendly, no cookies). Preserve it across redesigns and head/Layout refactors.
  - A redirect script in `src/pages/flyer.astro` that sends visitors to Maria's Canva site after a short delay. Older Facebook deep-link logic remains in source but is currently disabled (commented-out `openEvents()`); the live behaviour is the Canva redirect only.
  - In addition, `brands.astro` ships two inline `<script>` blocks for autoplaying-in-view video controls and the scroll-triggered analytics-card count-up animation. They run as plain client scripts, not hydrated islands.
- **Brands page images and videos are hot-linked from Maria's Canva site** (`brands.maria-montserrat.com/_assets/{media,video}`) as a temporary measure. The files are immutable content-hashed assets, but bandwidth is still on Canva's account. Swap to local files under `src/assets/brands/` (images) and `public/videos/` (videos) once Maria exports the originals.
- The **analytics figures on `/brands`** (Instagram / TikTok / Facebook reach) are a *manual snapshot*, not a live feed. The constant `analyticsUpdated` and each platform's `period` document the date range. Refresh by copying the headline numbers from each platform's own analytics dashboard.
- `src/components/Welcome.astro`, `src/assets/astro.svg`, and `src/assets/background.svg` come from the Astro starter and are not referenced anywhere. Safe to delete in a tidy-up pass.
- Contact details (email, phone, social handles) are duplicated across `src/components/Contact.astro` (used on `/teacher-yoga`), `src/components/SiteFooter.astro` (global footer), and `src/pages/brands.astro` (its own contact section) — keep them in sync when any one changes.
- The "Regulér" collaboration card on the home page links to a separate Canva site (`maria-montserrat.my.canva.site/reguler/`) and is deliberately not in the global header — it's a joint project with another teacher, not part of Maria's three core universes.
- Multi-lingual support is a planned goal. When implementing, prefer Astro's built-in [`i18n` routing](https://docs.astro.build/en/guides/internationalization/) over a third-party library. The `Langs` component (`src/components/Langs.astro`) is the current placeholder for surfacing the EN/ES/DK story.

## Keeping these docs current

This file (and `CLAUDE.md`, which points here) is the source of truth for agent guidance. **Whenever the project's stack, layout, conventions, deployment, or goals change, update `AGENTS.md` in the same change.** Examples that should trigger an update: adding i18n, introducing a CMS or content collections, adopting a linter/formatter or test framework, switching hosting, or adding a new top-level directory or page.

This repo is **public**. Keep notes factual and professional — no personal commentary, internal jokes, or anything that wouldn't belong on a public README.
