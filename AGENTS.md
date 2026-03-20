# Agent Instructions – lien-migrations

This file gives AI coding agents (GitHub Copilot, Claude, etc.) the rules they must follow when working on this repository.

---

## Goal

Help users bootstrap a **new subproject** (deck) that follows the same conventions as [`presences-capverdiennes/`](./presences-capverdiennes).

A subproject is a self-contained folder that contains:

```
<subproject-name>/
  index.html          ← copy/adapt from presences-capverdiennes/index.html
  slides/             ← SVG files for the English deck  (provided by the user)
  slides-<lang>/      ← SVG files for additional language decks (optional, provided by the user)
  slides-en.json      ← generated manifest for the English deck
  slides-<lang>.json  ← generated manifest for each additional language deck
```

---

## Hard rules

1. **Never modify a folder that already contains `.json` files.**  
   If the target folder already has any `*.json` file, stop and tell the user. Do not overwrite or regenerate JSON files in existing subprojects.

2. **Only work on the folder the user explicitly points you to.**  
   Do not touch `presences-capverdiennes/` or any other existing subproject unless the user specifically asks.

3. **Do not change root-level shared files** (`index.html`, `viewer.js`, `styles.css`, `README.md`) unless the user explicitly asks.

---

## Workflow – bootstrapping a new subproject

Follow these steps in order.

If you prefer automation, you can run `./bootstrap-subproject.sh <subproject-folder>` from the repository root. The script applies the same safety rules as this guide: it refuses to run when JSON manifests already exist, generates `slides-en.json`/`slides-<lang>.json` from `slides*` folders, validates required fields and file format, and creates `index.html` from `presences-capverdiennes/index.html` when missing.

### Step 1 – Receive the target folder

The user will tell you the path to a folder that contains one or more sub-folders of SVG files, for example:

```
my-new-deck/
  slides/
    01-page.svg
    02-page.svg
    03-page.svg
```

### Step 2 – Safety check

Before doing anything else:

- Check whether the target folder already contains any `*.json` file.
- If it does → **stop**. Inform the user and do nothing further.
- If it does not → proceed to step 3.

### Step 3 – Generate the JSON manifest

For each SVG folder inside the subproject (e.g. `slides/`, `slides-fr/`, …):

1. List all `.svg` files in alphabetical/numeric order (use natural sort so `10-page.svg` comes after `09-page.svg`).
2. For each file, derive:
   - `id` – the filename without the `.svg` extension (e.g. `01-page`)
   - `file` – the relative path from the subproject root (e.g. `slides/01-page.svg`)
3. Build a JSON array with one object per slide.

**Required format** (each element must have exactly these two keys):

```json
[
  { "id": "01-page", "file": "slides/01-page.svg" },
  { "id": "02-page", "file": "slides/02-page.svg" },
  { "id": "03-page", "file": "slides/03-page.svg" }
]
```

Name the output file after the folder it describes:
- `slides/` → `slides-en.json` (the bare `slides/` folder is treated as the English deck by convention)
- `slides-fr/` → `slides-fr.json`
- `slides-<lang>/` → `slides-<lang>.json`

If the user wants a different language for the bare `slides/` folder, they should rename the folder (e.g. `slides-pt/`) before running this workflow, or explicitly tell you which language to use.

> **Note:** SVG files must be placed directly inside the slides folder (no subdirectories). The path format is always `<folder>/<filename>.svg` with no further nesting.

### Step 4 – Validate the JSON against the schema

Before writing the file, validate the generated array against this JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "minItems": 1,
  "items": {
    "type": "object",
    "required": ["id", "file"],
    "additionalProperties": false,
    "properties": {
      "id": {
        "type": "string",
        "minLength": 1
      },
      "file": {
        "type": "string",
        "pattern": "^[^/]+/[^/]+\\.svg$"
      }
    }
  }
}
```

Validation rules (check each one explicitly):

- The array must have **at least one item**.
- Every item must have **both** `id` and `file` keys, and **nothing else**.
- `id` must be a non-empty string.
- `file` must be a string matching the pattern `<folder>/<filename>.svg` (exactly one `/`, ending in `.svg`).

If validation fails, report the exact errors to the user and **do not write the file**.

### Step 5 – Write the file

Write the validated JSON to `<subproject-name>/<output-file>.json`.

Use 2-space indentation and a trailing newline, matching the style of `presences-capverdiennes/slides-en.json`.

### Step 6 – Create `index.html` (if missing)

If the subproject folder does not already contain an `index.html`, create one by copying `presences-capverdiennes/index.html` and updating only the `<title>` tag to match the new subproject name.

---

## Example

User says: *"I have a folder `lisbonne-1920/` with a `slides/` subfolder containing SVG files. Please generate the manifest."*

Expected agent actions:

1. Check `lisbonne-1920/` for existing `.json` files → none found, proceed.
2. List `lisbonne-1920/slides/*.svg` in order → `01-page.svg`, `02-page.svg`, …
3. Build the JSON array:
   ```json
   [
     { "id": "01-page", "file": "slides/01-page.svg" },
     { "id": "02-page", "file": "slides/02-page.svg" }
   ]
   ```
4. Validate against the schema → passes.
5. Write `lisbonne-1920/slides-en.json`.
6. Create `lisbonne-1920/index.html` (if missing).
7. Report what was done.

---

## Reference: existing subproject

[`presences-capverdiennes/`](./presences-capverdiennes) is the canonical example.  
Its `slides-en.json` and `slides-fr.json` files show the exact expected output format.
