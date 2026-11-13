# Publishing the documentation site

The site is built from the `docs/` folder and deployed with GitHub Pages.

## One-time GitHub setup

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Save.

The workflow is [`.github/workflows/pages.yml`](https://github.com/vaidaraul/vintage-phone-collector/blob/main/.github/workflows/pages.yml). It runs on every push to `main` that changes `docs/` or the publishing files.

Expected URL:

```text
https://vaidaraul.github.io/vintage-phone-collector/
```

## What gets published

Only the contents of `docs/` are built. That includes:

- The process guide and device overview.
- The checklist, weather, troubleshooting, artifacts, plan, and changelog.
- The `scripts/` and `weather/` folders.

Files outside `docs/` are not published. Links to the device history use absolute GitHub URLs.

## Local preview

If you have Ruby and Jekyll installed:

```bash
cd docs
bundle exec jekyll serve
```

If you do not have Ruby, push a change to a branch and use the GitHub Actions run as the preview.

## Rules

- Keep relative links inside `docs/`.
- Use absolute GitHub URLs for anything outside `docs/`.
- Do not add firmware, APKs, ODEX files, logs, serials, or private paths.
- Do not add a custom domain until the legal and licensing pages are reviewed.
- Run the pre-push guard before pushing.

## Troubleshooting

- **The workflow fails at Jekyll build:** check `docs/_config.yml` and the plugin list. The GitHub Pages build environment includes `jekyll-relative-links`, `jekyll-readme-index`, and `jekyll-titles-from-headings`.
- **Links open `.md` files:** the relative-links plugin should rewrite them. If a link still points to `.md`, make it relative to the current page and verify it locally.
- **Assets 404:** do not hardcode `/assets/...`; let the theme use `relative_url`.
- **The site is blank:** confirm **Settings → Pages → Source** is **GitHub Actions**, and check the workflow run log.
