# lien_migrations

Shared slideshow app files are kept at repository root:

- `index.html`
- `viewer.js`
- `styles.css`
- `README.md`

Deck-specific files stay in deck folders (for example `presences-capverdiennes/`).

## Run locally

Start from the project root:

```bash
cd /Users/kirill.mitsurov/My_WS/Liens_Migrations/lien_migrations
python3 -m http.server 8000
```

If `python3` fails because of a missing Homebrew library such as `libintl.8.dylib`, reinstall gettext and run the server again:

```bash
brew reinstall gettext
python3 -m http.server 8000
```

When the server is running, open the project in a browser at:

- `http://localhost:8000/`

## View the project in browser

Main entry points:

- Root viewer: `http://localhost:8000/`
- Deck directly: `http://localhost:8000/presences-capverdiennes/`

Important:

- The folder name is `presences-capverdiennes` with hyphens, not `presences_capverdiennes` with underscores.
- The slide files are loaded from JSON and SVG assets. Do not request pages such as `page_01.html`, because those files do not exist in this project.

## URL format

Use query param `deck` plus hash route `#<lang>/<slide-id>`.

Local:

- `http://localhost:8000/?deck=presences-capverdiennes#en/01-page`
- `http://localhost:8000/?deck=presences-capverdiennes#fr/01-page`

GitHub Pages:

- `https://c2dh.github.io/lien_migrations/?deck=presences-capverdiennes#en/01-page`
- `https://c2dh.github.io/lien_migrations/?deck=presences-capverdiennes#fr/01-page`

## How to compress SVG in a bulk

- Use this website: `https://tiny.imagestool.com/svg-compressor`
- Download the compressed folder
- Update the slides (EN) or slides-fr folder on your computer
- Push the updated version on GitHub
