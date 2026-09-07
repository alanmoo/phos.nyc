# Deployment Architecture

## Overview

The site is hosted on [Vercel](https://vercel.com/) under the `moo-on-the-web` team (Pro plan). Deploys are triggered by [GitHub Actions](../.github/workflows/deploy.yml), not by Vercel's native Git integration.

## Why not Vercel's native Git integration

Vercel's default flow (`vercel.json`'s `git.deploymentEnabled`, currently `false` for `main`) has Vercel itself watch the GitHub repo via its "Vercel" GitHub App and build on every push. Two problems ruled this out:

1. **Account/org switching.** The Vercel GitHub App installation is tied to a single GitHub-account-to-Vercel-scope connection at a time. Alan's personal GitHub account (`alanmoo`) is also used to sign in to a separate Vercel org at work — connecting GitHub to that org re-points the one installation away from `moo-on-the-web`, breaking this project's ability to pull the repo until it's reconnected.
2. **Pro team collaboration checks.** For a private repo on a Pro team, Vercel requires the Git commit author to be a member of the Vercel team before it will build a git-triggered deployment (see [Vercel: Troubleshoot project collaboration](https://vercel.com/docs/deployments/troubleshoot-project-collaboration)). The site's CMS editors (who publish by committing directly via [Sveltia CMS](./cms-auth.md)) are not Vercel team members — adding them would cost a full paid seat each (~$20/mo/person), and there's no free "committer-only" role. Non-member commits were silently `BLOCKED` on Vercel's side while GitHub Actions reported success, because the old pipeline just fired a deploy hook (`curl -X POST $VERCEL_DEPLOY_HOOK`) and didn't wait to see if the build actually happened.

## Current approach: CLI deploy from CI

[`deploy.yml`](../.github/workflows/deploy.yml) checks out the repo, builds it, and pushes the build to Vercel using the Vercel CLI, authenticated by a single long-lived API token — not Vercel's Git integration.

```
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

This sidesteps both problems above:

- The deploy is authenticated by a token, not by Vercel's GitHub App connection, so it's unaffected by which Vercel org Alan's personal GitHub account is currently connected to.
- The deployment isn't evaluated as a "Git-connected" deployment, so the commit-author-must-be-a-team-member check doesn't apply — editors' CMS commits deploy without needing Vercel seats.
- Because the Action waits for the actual build/deploy to finish, a broken build now shows up as a failed GitHub Action instead of a silent no-op.

### Required secrets (GitHub → repo Settings → Secrets and variables → Actions)

| Secret | Value | Notes |
| --- | --- | --- |
| `VERCEL_TOKEN` | A Vercel access token | Must be scoped to the **team** (`moo-on-the-web`, "All Projects"), not to a single project — project-scoped (`vcp_…`) tokens currently fail with `vercel pull`/`whoami` in this CLI version. Generate at [vercel.com/account/tokens](https://vercel.com/account/tokens). |
| `VERCEL_ORG_ID` | `team_CI9J8wRRb04FwCD4ZJqGmA4O` | The `moo-on-the-web` team ID. Not secret, but stored as a secret for convenience. |
| `VERCEL_PROJECT_ID` | `prj_iaIbIZAi2lzxbhfOcj8pVAUQOp63` | The `phos-nyc` project ID. Not secret. |

The deploy hook (`VERCEL_DEPLOY_HOOK`) used by the old pipeline is no longer used and can be removed.

## Tradeoff: public vs. private repo

The repo is currently **private**. If it were made public instead:

- **Fixed:** Vercel's Pro-team collaboration check doesn't apply to public repos ("Collaboration is free for public repositories" — Vercel docs), so editors' commits would no longer risk being blocked, and the site could go back to Vercel's simpler native Git integration (auto-deploy on push, or a deploy hook) without needing to add editors as paid team members.
- **Not fixed:** the account/org-switching problem is unrelated to repo visibility — it's about which Vercel scope owns the GitHub App installation, and would still break git-integration-triggered deploys periodically.
- **New cost:** repo contents, history, and the CMS's `public/admin/config.yml` become publicly visible. Git history should be audited for anything sensitive before ever flipping visibility, since public exposure (via forks/clones) is effectively permanent even if reverted later.

Since the current CLI-token pipeline already avoids both problems regardless of repo visibility, there's no pressing need to make the repo public purely to unlock Vercel's native flow.

## CI vs. deploy

[`ci.yml`](../.github/workflows/ci.yml) (lint, format check, `astro check` + build) runs only on pull requests — it doesn't deploy anything. Most publishing happens via direct commits to `main` (through the CMS), which bypass CI and go straight to `deploy.yml`. `vercel build`'s `astro check` step is the only type-checking those commits get.
