# CMS Authentication Architecture

## Overview

The site uses [Sveltia CMS](https://github.com/sveltia/sveltia-cms) as a Git-based headless CMS. Editors log in via GitHub, and content changes are committed directly to this repository.

Authentication is handled by a [Cloudflare Workers](https://workers.cloudflare.com/) script ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)) acting as an OAuth middleman between Sveltia and GitHub.

## Components

| Component    | Service                              | Purpose            |
| ------------ | ------------------------------------ | ------------------ |
| CMS frontend | Vercel (`/admin`)                    | Sveltia CMS UI     |
| Auth worker  | Cloudflare Workers (`phos-cms-auth`) | Handles OAuth flow |
| Content repo | GitHub (`alanmoo/phos.nyc`)          | Stores content     |
| GitHub App   | GitHub (`PHOS CMS Auth`)             | Scoped repo access |

## Auth Flow

1. Editor clicks "Login with GitHub" in [Sveltia CMS](https://phos-nyc.vercel.app/admin)
2. Sveltia opens a popup directed to the Cloudflare Worker (`/auth`)
3. Worker redirects the popup to GitHub's OAuth authorization page
4. Editor authorizes the GitHub App
5. GitHub redirects back to the Worker's `/callback` endpoint with an auth code
6. Worker exchanges the code for an access token using the GitHub App credentials
7. Worker sends the token back to the Sveltia window via `postMessage`
8. Sveltia uses the token to read/write content to the repo via GitHub API

## Why a GitHub App (not OAuth App)

GitHub OAuth Apps request access to **all** of a user's repositories. The GitHub App approach limits access to only the repos where the app is installed — in this case, only `alanmoo/phos.nyc`. This is safer for editors who have their own GitHub repos they don't want exposed.

## Configuration

### `public/admin/config.yml`

```yaml
backend:
  name: github
  repo: alanmoo/phos.nyc
  branch: main
  base_url: https://phos-cms-auth.falling-dew-aaee.workers.dev
```

### Cloudflare Worker secrets

Set in Cloudflare dashboard → Workers & Pages → `phos-cms-auth` → Settings → Variables and Secrets:

| Secret                 | Value                         |
| ---------------------- | ----------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub App client ID          |
| `GITHUB_CLIENT_SECRET` | GitHub App client secret      |
| `ALLOWED_ORIGINS`      | `https://phos-nyc.vercel.app` |

### GitHub App settings

- **Name:** PHOS CMS Auth
- **Permissions:** Contents (Read & Write), Metadata (Read)
- **Visibility:** Public (required for editors to authorize)
- **Installed on:** `alanmoo/phos.nyc` only
- **Callback URL:** `https://phos-cms-auth.falling-dew-aaee.workers.dev/callback`

## Adding a New Editor

1. Add their GitHub account as a collaborator on `alanmoo/phos.nyc` (Settings → Collaborators)
2. Send them the CMS URL: `https://phos-nyc.vercel.app/admin/`
3. They log in with GitHub, authorize the app, and they're done

## Known Limitations

- **Private browsing:** The auth worker uses cookies for CSRF protection. Some private/incognito browser modes block third-party cookies, which breaks the login flow. Editors should use a normal browser window.
