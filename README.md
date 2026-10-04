# Fichtre!

A web app that helps a child practice reading and math with worksheets. Each
worksheet can be practiced as **flash cards** (sticky-note style, with text to
speech) or on a **sheet** (circle the words you can read, fill in the answers
to calculations). Progress is shared between the two modes.

The interface is in French; the code, the comments and this documentation are
in English. Everything runs in the browser: there is no account and no
server-side storage.

## Features

- **Reading worksheets** with three sections (syllables, words, sentences),
  read aloud in French with the browser's speech synthesis. The sound being
  studied (for example `u`) is highlighted in bold in every word.
- **Math worksheets** with typed answers, instant feedback on cards and a
  "check" step on the sheet.
- **Shared progress**: each item is either done, to redo, or not done yet.
  Cards only offer what is not done yet; the sheet shows the same state.
- **Parent mode** (people icon in the header): create, edit, reorder (drag and
  drop) and delete worksheets, with a calculation generator and a spelling
  check for the "words" section.
- **Settings** (`/settings`): the child's first name, written on the sheets,
  and a custom message for when a worksheet is finished (`{nom}` is replaced
  by the first name).
- Works on phones and desktops, keyboard friendly (space = "I know", backspace
  = previous card).

## Getting started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. To try it on a phone, run
`npm run dev -- -H 0.0.0.0` and open the computer's address on the same Wi-Fi.

```bash
npm run build   # production build
npm start       # serve the production build
```

## Project structure

| Path | Content |
| --- | --- |
| `app/` | Next.js App Router pages: home, `play/[id]` (cards), `sheet/[id]`, `edit/[id]`, `settings` |
| `components/` | UI components (cards, sheets, editor, header, logo and mascot as SVG) |
| `lib/` | Local storage stores (decks, progress, settings), math helpers, speech, dictionary |
| `public/fr-words.txt` | French word list, loaded only in the editor |

## Data

Everything is stored in the browser's `localStorage`, per device and per
browser. Nothing is shared between devices.

| Key | Content |
| --- | --- |
| `fichtre.decks.v2` | Worksheets |
| `fichtre.progress.v1` | Progress (done, to redo, typed answers) |
| `fichtre.settings.v1` | First name and finish message |
| `fichtre.parent` | Whether parent mode is on |

Parent mode is a convenience to hide the editing buttons from the child, not a
security feature.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) with React and TypeScript
- [dnd kit](https://dndkit.com) for drag and drop in the editor
- Fonts through `next/font/google`: Fredoka, Andika and Patrick Hand (the
  production build needs network access to fetch them)

## Deploying

The app has no environment variables and no backend, so it deploys as is, for
example on Vercel: `npx vercel`.

## Credits

The French word list in `public/fr-words.txt` comes from
[`an-array-of-french-words`](https://github.com/zeke/an-array-of-french-words)
(MIT license).
