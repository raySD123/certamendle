# Certamendle

Certamendle is a React app built with Vite and deployed to GitHub Pages at
<https://raysd123.github.io/certamendle/>.

## Local development

Install dependencies and start the development server:

```sh
npm ci
npm run dev
```

Run the production build locally with:

```sh
npm run build
npm run preview
```

## GitHub Pages deployment

The `Deploy to GitHub Pages` workflow builds the site and deploys it whenever
changes are pushed to `master`. It can also be started manually from the
repository's Actions tab.

For the first deployment, set the repository's Pages source to **GitHub
Actions** under **Settings > Pages**. The Vite base path is configured for the
`/certamendle/` project site URL.
