#!/usr/bin/env node
/**
 * scripts/fetch-courses.mjs
 *
 * Fetches Maria's course listings from impact.me and writes the result to
 * src/data/courses.json, which the Courses.astro component reads at build time.
 *
 * Usage:
 *   npm run fetch-courses           — fetch and update courses.json
 *   npm run fetch-courses -- --debug — also write raw HTML to debug/courses.html
 *                                      so you can inspect the page structure
 *
 * Run this whenever a course is added or updated on impact.me, then review
 * the JSON, and commit both files (courses.json is the source of truth for
 * the site).
 *
 * If the scraper stops working (impact.me changed their HTML), run with
 * --debug, inspect the HTML, and update the SELECTORS block below.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const COURSES_URL = 'https://mariamontserrat.impact.me/courses';
const OUT_FILE    = join(ROOT, 'src', 'data', 'courses.json');
const DEBUG_FILE  = join(ROOT, 'debug', 'courses.html');

const DEBUG = process.argv.includes('--debug');

// ---------------------------------------------------------------------------
// SELECTORS — update these if the scraper breaks after an impact.me redesign.
//
// impact.me course listing pages typically render each course as an <a> tag
// that links to /courses/<slug>. The text and image sit inside that anchor.
// The patterns below look for those links and extract surrounding content.
// ---------------------------------------------------------------------------

/** Matches a full <a href="..."> block (non-greedy, single course card) */
const COURSE_LINK_RE = /<a\b[^>]+href="(\/courses\/[^"#?]+)"[^>]*>([\s\S]*?)<\/a>/gi;

/** Extracts an img src from inside a course link block */
const IMG_RE = /<img\b[^>]+src="([^"]+)"/i;

/** Extracts alt text (often the course title) */
const ALT_RE = /<img\b[^>]+alt="([^"]+)"/i;

/** Heading-like text — h1/h2/h3/h4 or a <strong> or a <span> with a title class */
const HEADING_RE = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>|<strong[^>]*>([\s\S]*?)<\/strong>/i;

/** First <p> block — likely the short description */
const DESC_RE = /<p[^>]*>([\s\S]*?)<\/p>/i;

/** Price pattern: €12, $97, £49, or "Free" */
const PRICE_RE = /([€$£]\s*\d[\d.,]*|\bfree\b)/i;

// ---------------------------------------------------------------------------

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, '').trim();
}

function extractCourses(html) {
  const courses = [];
  const seenUrls = new Set();

  for (const match of html.matchAll(COURSE_LINK_RE)) {
    const [, path, inner] = match;

    // Skip duplicate links (e.g. a "view all" or repeated card)
    const url = `https://mariamontserrat.impact.me${path}`;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    // Skip very short inner blocks — probably nav links, not real cards
    if (inner.length < 40) continue;

    const imgMatch  = inner.match(IMG_RE);
    const altMatch  = inner.match(ALT_RE);
    const headMatch = inner.match(HEADING_RE);
    const descMatch = inner.match(DESC_RE);
    const priceMatch = inner.match(PRICE_RE);

    const title = stripTags(
      (headMatch && (headMatch[1] || headMatch[2])) ||
      (altMatch && altMatch[1]) ||
      ''
    );

    const description = stripTags((descMatch && descMatch[1]) || '');

    // Skip if we couldn't extract a title at all — likely a stray link
    if (!title) continue;

    courses.push({
      title,
      description,
      image: (imgMatch && imgMatch[1]) || null,
      url,
      price: (priceMatch && priceMatch[1]) || null,
    });
  }

  return courses;
}

async function main() {
  console.log(`Fetching ${COURSES_URL} …`);

  let html;
  try {
    const res = await fetch(COURSES_URL, {
      headers: {
        // Mimic a real browser so we don't get blocked
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    html = await res.text();
  } catch (err) {
    console.error(`\n❌ Fetch failed: ${err.message}`);
    console.error('   The existing courses.json has NOT been changed.');
    process.exit(1);
  }

  // Optional: write raw HTML for debugging
  if (DEBUG) {
    mkdirSync(join(ROOT, 'debug'), { recursive: true });
    writeFileSync(DEBUG_FILE, html, 'utf8');
    console.log(`   Debug HTML written to debug/courses.html`);
  }

  const courses = extractCourses(html);

  if (courses.length === 0) {
    console.warn('\n⚠️  No courses found. The page structure may have changed.');
    console.warn('   Run with --debug and inspect debug/courses.html to update the');
    console.warn('   SELECTORS block at the top of this script.');
    console.warn('   The existing courses.json has NOT been changed.\n');
    process.exit(1);
  }

  // Pretty-print so diffs are readable in git
  const json = JSON.stringify(courses, null, 2);
  writeFileSync(OUT_FILE, json, 'utf8');

  console.log(`\n✅ Found ${courses.length} course(s):\n`);
  for (const c of courses) {
    console.log(`   • ${c.title}${c.price ? ` (${c.price})` : ''}`);
    console.log(`     ${c.url}`);
  }
  console.log(`\n   Written to src/data/courses.json`);
  console.log(`   Review it, then: git add src/data/courses.json && git commit -m "Update courses"\n`);
}

main();
