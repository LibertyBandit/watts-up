# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project

**Watts Up** — a single-file, browser-based aircraft electrical load analysis (ELA) tool: `watts-up.html` (~780 KB; HTML, CSS and JavaScript inline; no build, no server, no dependencies except JSZip from a CDN for Word files). The owner has an aircraft-electrical background and drives development in small steps. GitHub: `LibertyBandit/watts-up`, branch `master`.

`tictactoe.html` is a leftover from the first test of this folder; ignore it.

## Files that matter

| File | Role |
|---|---|
| `watts-up.html` | The program, and the only file users get. Contains the embedded user guide (between the `USER-GUIDE-BEGIN/END` markers — generated, never hand-edit) and the Word template as `DOCX_TEMPLATE_B64`. |
| `watts-up-unified-requirements.md` | Requirements and design history, one numbered section per change (§1 … §98+). Add a section for every change. |
| `CHANGELOG.md` | User-facing changes per version. |
| `RELEASING.md` | Version numbering and the release checklist. |
| `Watts Up - User Guide.md` / `.docx` | Guide source / generated Word copy. |
| `Watts Up - IT Summary and Security Assessment.md` / `.docx` | IT review document; §9 holds the SHA-256 of `watts-up.html`. |
| `tools/` | `package-docs.sh` (rebuilds guide, Word copies, IT hash), `build-guide.py`, `md2docx.py`, `regression-checks.js`, `regression-tracking.js`, `test-upload-server.py`. |

Edit the `.md` files; the `.docx` files are regenerated and any hand edit to them is lost. Everything else in the folder (spreadsheets, `Archive*`, `WattsUp_*.json`, customer Word reports) is reference or customer data: never commit it, never publish it.

## Running and checking

- Preview: `.claude/launch.json` defines `watts-up` (`py -m http.server 3131`); open `http://localhost:3131/watts-up.html` in the built-in browser. Add a `?v=N` query to dodge caching.
- Regression loops live in `tools/regression-*.js`; run them in the browser pane with `(0,eval)(await (await fetch('/tools/regression-checks.js')).text())`, then call the `window.__…` functions they define (`__moveSynthetic`, `__trkReject`, `__trkNotesRefs`, …).
- Word output is checked by generating a report in the page (`fillBlankWattsUpDocx`), POSTing it to `tools/test-upload-server.py`, and inspecting it through Word COM (PowerShell), not by eye.
- `tools/package-docs.sh` needs Python 3 with `markdown` and `python-docx`.

## Architecture

- **Data**: two analyses, `ap` (Active Project) and `pcm` (Previous & Concurrent Modifications); `state.nodes` / `state.meta` are accessors onto the current one (`installAnalysisView`, `curAn`). Items carry `type`, `status` (existing | removed | new), `voltage`, `acDc`, `capacity`, `existingLoad`, `loadValue`, `netChangeOverride`, `rowNotes`, `rowRefs`, `parentId`/`childIds`. Power groups are `{w,var,va,a,pf}` (AC) or `{a,w}` (DC). Shared items are linked by `sharedPeerId`; phase-mates by `phase`/`phaseGroupId`/`phaseSeq`; a TRU is an IN/OUT group (`convGroupId`, `convRole`, one IN node per input phase).
- **Calculation**: `recalc()` → `recalcCore()` → `calcNC` (net change), new load, reserve, `warnNode` (W1–W7). Computed fields start with `_` and are never saved. Only a root (and a conversion output's voltage) holds its own voltage / AC-DC; `voltAcdcWalk` passes a change down.
- **Reports**: on screen (summary, power distribution, load analysis detail horizontal and vertical — `ladSiblingPlan` is shared with Word) and Word (`wx*` XML builders, `buildWordDataRow`, `buildLadSiblingWordTable`), written into content controls (`wu-*` tags) by `fillWattsUpXmlPart`. Live Word sync uses the File System Access API; `wuShowOpenPicker`/`wuShowSavePicker` remember the last folder in IndexedDB.
- **Change tracking**: `state.track` holds a baseline; marks are computed, never stored (`trackBaseView`, `chgCell`).
- **Versioning**: `APP_VERSION` and `APP_RELEASE_DATE` (near `const LS=`) are the only places the version lives.
- Storage key `wattsup_v1` (localStorage). No network calls except the JSZip CDN, no `eval`; keep it that way or update the IT summary first.

## Working conventions

- Make changes with Edit, or with a small Python patch script that asserts each target string occurs exactly once; the file is too big to read whole, so use Grep and offset reads.
- Reproduce a bug with a failing check before fixing it; test changes live in the browser pane before saying they work.
- The owner often starts a request with `/grill-me` (numbered questions with a recommended answer; "yes" accepts). Answer the questions, then implement.
- Every change: bump `APP_VERSION` (+ `APP_RELEASE_DATE` to today), add `CHANGELOG.md` and a requirements section, update the guide if users will notice, then run `bash tools/package-docs.sh` last. Commit locally with the trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- **Push only when the owner says "Push it."** Never push on your own.
- Bash heredocs in this environment can mangle backslashes: write patch scripts with the Write tool (or build backslashes with `chr(92)`) and test string replacements before relying on them.
- Close `.docx` files in Word before regenerating them (a lock makes the write fail).
