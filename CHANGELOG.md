# Watts Up — Changelog

Changes that matter to people using the program, newest first. Version numbers are `MAJOR.MINOR.PATCH`:

- **MAJOR** — saved files or results change in a way older copies cannot follow.
- **MINOR** — new features; older files still open.
- **PATCH** — fixes only.

The "Revision NN" numbers are the internal development history (see `watts-up-unified-requirements.md`);
each release below lists the revisions it contains. How to publish a release is in `RELEASING.md`.

## 0.9.12 — 2026-10-25 (testing build)

Word content controls.

- **Four unavailable controls are switched off:** `wu-preparedby`, `wu-intro`, `wu-general-notes` and `wu-compliance` (their fields are hidden in the program) are no longer
  filled at sync, not reported as missing, and not read back at Load. A document that still has them is left as it is.
- **New message after a sync that finds controls missing:** "Synced, but some content controls were not found in this document.  See Help file for a list of
  available content controls, or use the "Create New Report…" option to create a file with all the available content controls."
- **User guide:** new §7.4 "Content controls" lists every available tag and what it holds (and how to add one to your own document); §7.4–7.5 became §7.5–7.6.

## 0.9.11 — 2026-10-24 (testing build)

Fix.

- **Moving an item that has split (multi-phase) items below it:** moving an item that isn't itself split — for example a generator whose bus is
  split into phases — to the top level or under another unlabeled item used to erase the phase structure of everything beneath it, in
  both analyses when the item is shared. The phases are now kept. (An item that does carry a phase label still loses it, and its branch's
  labels, when it is moved out from under its split.)

## 0.9.10 — 2026-10-24 (testing build)

User guide / Help only (plus one wording change in a dialog):
- §3.2: the ↻ button note (required to change AC value groups, optional for DC); a new "Adding items from a grid" passage explaining the ↳ row
  button, the **+ Item** button and — for a TRU — the **+ TRU (opens Add Item)** entry at the bottom of a row's Item Type drop-down.
- §4.1: the sentence about older converter types removed. §4.2: Net Change Override note about items with children. §4.3 is now "The Add Item(s)
  dialog", in parallel with §4.2. §4.4: new opening sentence. §7.3: the sentence about introduction / compliance / general notes removed. §9: references
  to general notes removed (and the same words in the Reject All confirmation).

## 0.9.9 — 2026-10-24 (testing build)

- **Power Distribution Summary:** no row notes (no Notes column and no notes under the tables), on screen and in Word.
- **TRU transfer note:** the formula now reads "VA = Wdc / (0.85 eff. x 0.95 pf x 3 Ø)", and for a TRU with a single input phase the
  number of phases is left out: "VA = Wdc / (0.85 eff. x 0.95 pf)".
- **Notes column heading** in the Load Analysis Summary, both Load Analysis Detail layouts and Print (screen and Word): "Notes" over "[Ref.]".
- **Change tracking:** when a reference is changed, a row note that only cites it (with a comment) is no longer underlined; it is underlined
  only when the citation comment itself is new or changed. The change still shows in the References list.

## 0.9.8 — 2026-10-23 (testing build)

Revision 84, item 7 (change tracking), final stage.

- **Reject All** (Changes dialog): puts items, values, names, statuses, row notes and references in both analyses back to the baseline.
  The confirmation counts what it will remove, restore and reset and lists what it does not revert (document properties, Settings
  and the VA method, general notes, the Word connection).
- **Per item:** the Edit dialog has **Accept Change** and **Reject Change** for an item that differs from the baseline (a new item
  has Accept only).
- **Tracked Changes** section in the Document tab: items deleted since the baseline (**Restore** or **Accept deletion**) and notes and
  references removed from items.

## 0.9.7 — 2026-10-23 (testing build)

Revision 84, item 7 (change tracking), second stage.

- **More reports show the marks:** the vertical Load Analysis Detail (screen and Word) and the Power Distribution Summary (screen).
- **Row notes and references are tracked:** a note or reference that is new or whose text changed is underlined in the notes and
  references lists (Word, on-screen reports and Print), and a note marker is underlined on an item that newly has that note or
  reference.
- **Hover tooltips** on screen: an underlined number shows "Baseline: …" (the value it had), an underlined name shows what it was,
  and a new item says "New item".
- Still to come in 0.9.8: Reject All, the list of deleted items, per-item accept and reject.

## 0.9.6 — 2026-10-23 (testing build)

Revision 84, item 7 (change tracking), first stage.

- **Changes** button (toolbar) with **Tracking On / Off** and **Accept All**; a **Tracking On / Tracking Off** chip beside the version
  number; a legend line above the on-screen reports.
- **Underlines for what changed since the baseline** in the Load Analysis Summary tab, the horizontal Load Analysis Detail, the Print
  Report and the Word report: any number whose displayed value differs from the baseline (including recalculated totals), and the
  name of any item that is new, renamed, moved, or changed in status or type.
- While Tracking is Off, edits are accepted as you make them (no marks); overwriting a marked entry clears its mark and the marks on
  values recalculated from it. Tracking On resumes and keeps the earlier marks. Accept All clears all marks.
- The baseline is saved in project files and Word reports (it roughly doubles the item data); damaged tracking data in a file is dropped
  with a message.
- Coming next: the vertical detail and Power Distribution Summary, marks for row notes and references, a pop-up with each baseline value
  (0.9.7); Reject All and per-item accept/reject (0.9.8).

## 0.9.5 — 2026-10-22 (testing build)

Revision 84 (items 1–6 of the next round of requests).

- **Word row notes** use a hanging indent (0.15 inch): the number at the margin, a tab, and wrapped lines under the text.
- **Horizontal Load Analysis Detail** (screen and Word): the "Installed (Removed)" column group is gone; a Load's value shows under
  **Net Change** (a removed load in parentheses). The Summary tables and the vertical report are unchanged.
- **DC rows in the Existing / Removed and Installed grids:** a square accent bar at the left edge, the indent space tinted a step
  brighter and ending at the item-type badge; the identity columns are no longer tinted.
- **Report presets** in Settings: **VA** (VA only, algebraic sums) is now the default for new projects and for Reset to Defaults;
  **Vector** is the previous AC default (VA, W, VAR, pf with vector sums); **Custom** shows when you change either by hand. Existing
  projects keep their settings.
- **Report rounding:** "Significant digits" is now **Dynamic**, with a lower limit (0.001 / 0.01 / 0.1) and an upper limit
  (1 / 10 / 100). New projects use 0.001 and 1; projects saved earlier keep their old result (upper limit 10).
- **TRU transfer note:** adding a TRU creates a row note on its inputs and output — "[TRU out] DC loads transferred to [TRU in]
  using the formula VA = Wdc / (efficiency x pf x number of input phases)" — that updates with the TRU's names, efficiency, pf and
  phases; editing its text makes it an ordinary note. Shared and duplicated TRUs get their own copy.

## 0.9.4 — 2026-10-19 (testing build)

Fixes.

- **Shared TRU, adding or removing input phases:** in the Edit dialog, adding an input phase to a TRU that is shared with the
  other analysis now adds the matching phase there too (and removing one removes it there too), after a confirmation. Before, only
  the side being edited changed, which left the TRU "partly shared" and made the saved file impossible to reopen.
- **Opening a file with a partly shared TRU (or other phase group):** instead of refusing, the program links the unlinked phases to
  their matching phases (same label, same bus) in the other analysis, or — when they don't match up — un-shares that item, and says
  what it did. Save the file again to keep the repair.
- **Vertical Load Analysis Detail:** a breaker under the phase C feeder no longer appears in the table headed by the phase B feeder's
  path. Items under different phases' parents now get a table of their own (with their own path); true phase groups still sit side
  by side in one table.

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
