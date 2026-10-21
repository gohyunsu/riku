# RIKU

**Research in Imaging, Knowledge & Understanding** — a vision-centered research team site. The deployment target is [gohyunsu.github.io/riku](https://gohyunsu.github.io/riku/).

The site is a buildless static project in `dist/`. Open `dist/index.html` through a local HTTP server to preview it. Content and layout live in `dist/index.html` and `dist/styles.css`; interactions live in `dist/script.js`.

## Content status

- Verified team roster: Hyunsu Go (team lead), Dohyeon Kwon, Jinyong Jun.
- Research themes and question cards are editorial directions. SurfaceTrace is a real project by ISM × RIKU, linked from the Projects section.
- Publications lists three 2026 papers with arXiv links. Conference acceptance labels (AICAS and APCCAS) were supplied by the team; titles and abstracts were checked against arXiv.
- The hero portrait was extracted from the team's reference PDF. The site identifies itself as an independent team with no NCT WISH or SM Entertainment affiliation.
- `dist/assets/wish-star-collage.webp` is an original generated mixed-media image used for the visual interlude. Prompt: "A dreamy, energetic handmade scrapbook collage with a dimensional silver-blue fabric star, iridescent stars, sky-blue beads, stitched daisies, pink and lime paper accents on tactile pale blue denim and paper; no people, logos, words or reproduction of an album cover." Generated with the built-in image tool.

## Editing

1. Update the text and cards in `dist/index.html` and styles in `dist/styles.css`.
2. Keep site assets in `dist/assets/` and use relative paths so the project works at `/riku/`.
3. Push to `main` to deploy `dist/` with `.github/workflows/deploy-pages.yml`.
