# Watts Up — Changelog

Changes that matter to people using the program, newest first. Version numbers are `MAJOR.MINOR.PATCH`:

- **MAJOR** — saved files or results change in a way older copies cannot follow.
- **MINOR** — new features; older files still open.
- **PATCH** — fixes only.

The "Revision NN" numbers are the internal development history (see `watts-up-unified-requirements.md`);
each release below lists the revisions it contains. How to publish a release is in `RELEASING.md`.

## 0.9.3 — 2026-10-18 (testing build)

- **Vertical Load Analysis Detail, Word:** the label column is now 30 % of the table when the section's widest table has 6 or
  fewer value columns (20 % for 7–10, 12 % above 10).
- **Vertical report headers (Word):** each sibling's header shows the item name on the first line and, only when there is
  more to say, the reference designator, CB rating and "Installed" on a second line.

## 0.9.2 — 2026-10-18 (testing build)

Revision 83 follow-up.

- **Vertical Load Analysis Detail, Word column widths:** the label column is now 20 % of the table by default and 12 % when
  the section's widest table has more than 10 value columns (AC sections usually do; DC sections usually don't, so their item
  names wrap less). The CB rating column is 6.5 % and the Notes column 5 %, so "(7.5 A)", "(999 A)" and the Notes heading
  no longer wrap on a portrait page; the Notes heading is 7 pt.

## 0.9.1 — 2026-10-18 (testing build)

Revision 83.

- **Vertical Load Analysis Detail:** row labels (CAPACITY, EXISTING LOAD, NET CHANGE, NEW LOAD, RESERVE) are all capitals,
  and flush left in Word. In Word the label column is a fixed 12 % of the table, the CB rating column 5.5 % and the Notes
  column 4.5 %, with the value columns sharing the rest. "Auto" siblings per table is never below 3 (4 for up to 3 value
  columns, otherwise 3). Empty cells no longer inflate the rows. An Existing item with a net change override but no children now
  gets its own table, so its New Load and Reserve are reported.
- **Word Summary tables** (Load Analysis Summary and Power Distribution Summary): each section is one table instead of
  one per group of siblings. Word keeps a group together where it can and breaks between groups; notes follow their group
  inside the table; the column headings repeat on each page. One empty paragraph (not two) between the AC and DC sections.
- **Existing / Removed grid:** after toggling a row's status badge the keyboard focus stays on the badge, so Tab / Shift+Tab move
  to the next / previous cell in that row.
- **Word Report dialog (when connected):** new **Connect Different…** and **Disconnect** choices, so you can switch reports or
  stop syncing without starting or loading an analysis.

## 0.9.0 — 2026-10-18 (testing build)

First numbered version. Everything built through Revision 78, plus formal versioning. This is the build
being tested before `1.0.0` is declared.

**New in this build**
- **Help** button on the toolbar opens the user guide in a new tab. The guide is built into the program, so it always
  matches the version you are running; it can be printed or saved as PDF from the browser.
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
