# Watts Up — Changelog

Changes that matter to people using the program, newest first. Version numbers are `MAJOR.MINOR.PATCH`:

- **MAJOR** — saved files or results change in a way older copies cannot follow.
- **MINOR** — new features; older files still open.
- **PATCH** — fixes only.

The "Revision NN" numbers are the internal development history (see `watts-up-unified-requirements.md`);
each release below lists the revisions it contains. How to publish a release is in `RELEASING.md`.

## 0.9.0 — 2026-10-18 (testing build)

First numbered version. Everything built through Revision 78, plus formal versioning. This is the build
being tested before `1.0.0` is declared.

**New in this build**
- The version number is shown in the program header (hover for the release date), on the printed report, and
  in Word reports (document property `WattsUpVersion`).
- Saved project files (`.json`) and Word reports now carry the version of the program that made them. Opening a
  file made by a *newer* version asks for confirmation first; files made before versioning open as before.

**What the program does (Revisions 1–78)**
- Load-analysis tree with Existing / Installed / Removed items, Net Change, New Load and Reserve at every level.
- Previous & Concurrent Modifications analysis, with item, reference and note sharing.
- Three-phase support (phase-mates, TRU phase-mates, whole-group sharing) and the phase-unbalance warning (W6).
- TRUs with multi-phase inputs; conversion pairs.
- Reports on screen, as Print/PDF and as Word: Load Analysis Summary, Power Distribution Summary, Load Analysis Detail
  (vertical with sibling tables, and horizontal). Revision 78: distribution path above each detail table, algebraic
  VA option, report rounding options.
- Word integration: create/connect/sync/load a Word report in place (Chrome/Edge); project data embedded in the file.
- Security review and hardening of file loading and the print report (2026-10-17); IT summary document.
