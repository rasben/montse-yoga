#!/usr/bin/env node
// Publish the site: build locally, commit, and push to main.
// GitHub Actions takes it from there and deploys to maria-montserrat.com.
//
// Designed for non-technical users (and for AI agents helping them):
// small steps, fails loudly with plain-language messages, no destructive moves.
// Power users who want full control should just use `git` directly.

import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output, exit } from 'node:process';

const SITE_URL = 'https://maria-montserrat.com';
const DEPLOY_BRANCH = 'main';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function capture(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function step(label) {
  console.log(`\n--- ${label} ---`);
}

function fail(message) {
  console.error(`\nPublish stopped: ${message}\n`);
  exit(1);
}

async function main() {
  // 1. Confirm we're in a git repo on the deploy branch.
  step('Checking your setup');

  let branch;
  try {
    branch = capture('git rev-parse --abbrev-ref HEAD');
  } catch {
    fail("This folder doesn't look like a git repository. Are you in the right place?");
  }
  if (branch !== DEPLOY_BRANCH) {
    fail(
      `You're on branch "${branch}", but publishing happens from "${DEPLOY_BRANCH}". ` +
        `Switch to ${DEPLOY_BRANCH} first (or ask Claude for help).`
    );
  }
  console.log(`On branch: ${branch}`);

  // 2. Anything to publish?
  const status = capture('git status --porcelain');
  if (!status) {
    console.log('\nNothing to publish — your local files already match the published site.\n');
    exit(0);
  }

  // 3. Make sure the server doesn't have changes you'd overwrite.
  step('Checking the server for newer changes');
  try {
    run('git fetch origin --quiet');
  } catch {
    fail("Couldn't reach GitHub. Are you online?");
  }
  const behind = capture(`git rev-list --count HEAD..origin/${DEPLOY_BRANCH}`);
  if (behind !== '0') {
    fail(
      `The server has ${behind} change(s) that you don't have locally yet. ` +
        `Pull them in before publishing (or ask Claude to do it for you).`
    );
  }
  console.log('Server is in sync.');

  // 4. Build, to catch obvious breakage before we ship it.
  step('Building the site to check for errors');
  try {
    run('npm run build');
  } catch {
    fail(
      'The site build failed (see the error above). ' +
        'Fix the problem (or ask Claude to) before publishing.'
    );
  }

  // 5. Show the user what they're about to publish.
  step('Files you changed');
  run('git status --short');

  // 6. Get a commit message in plain language.
  const rl = createInterface({ input, output });
  const answer = (
    await rl.question(
      '\nIn one short line, what did you change? (press Enter to use a default) > '
    )
  ).trim();
  rl.close();
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const message = answer || `Site update ${timestamp}`;

  // 7. Commit and push.
  step('Saving your changes');
  run('git add -A');
  // Use -m with a single argument; spawnSync would be safer but execSync is fine
  // here because we control the source of `message`.
  run(`git commit -m ${JSON.stringify(message)}`);

  step('Uploading to GitHub');
  try {
    run(`git push origin ${DEPLOY_BRANCH}`);
  } catch {
    fail(
      'The upload was rejected by GitHub. This usually means new changes appeared on the server ' +
        'while you were working. Ask Claude to pull them in, then run publish again.'
    );
  }

  // 8. Done.
  console.log(
    `\nDone! Your changes are on their way. GitHub usually takes 1–2 minutes to build and deploy.\n` +
      `Visit ${SITE_URL} in a minute to see them live.\n`
  );
}

main().catch((err) => {
  console.error('\nUnexpected error:', err.message || err);
  exit(1);
});
