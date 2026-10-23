# Watts Up — User Guide

*Version {{VERSION}} — released {{DATE}}. This guide is built into the program: click **Help** on the toolbar to open it in a new tab.*

Watts Up is an aircraft electrical load-analysis tool. You build a tree of the aircraft's power system
(generators, buses, breakers, converters, loads), mark each item as **Existing**, **Installed** or
**Removed**, and the program works out the net change, the new load and the reserve at every level. It
then produces the standard reports: on screen, as a printed/PDF report, and as a Word document.

## 1. Getting started

### 1.1 What you need
- A current desktop browser. **Chrome or Edge** give the full feature set (real Open/Save dialogs and the
  live Word connection). Firefox and Safari work, but save by downloading files and cannot keep a live link to a
  Word file.
- An Internet connection the first time the page loads, for the small library that creates and reads Word
  files (see §7.5). Everything else works offline.
- Nothing is installed. Open the `watts-up.html` file in the browser.

### 1.2 The start-up dialog
Every time the program opens it asks what you want to do:

| Button | What it does |
|---|---|
| **New** | Starts an empty analysis (asks you to confirm if there is unsaved work). |
| **Resume Previous** | Appears when the browser has an auto-saved session. Continues where you left off. A resumed session is *not* connected to a Word file; use **Open** if you want that. |
| **Open…** | Opens a saved project (`.json`) or a Word report (`.docx`) made by Watts Up. |
| **Exit** | Closes the tab (the browser may ask you to confirm). |

### 1.3 Your work is saved automatically — but only in this browser
Every change is saved to the browser's own storage, so a page reload or an accidental close does not lose
it. The small "saved" note beside the title shows when. **This is not a substitute for saving a file:**
the auto-save belongs to one browser on one computer, and clearing the browser's site data erases it. Use
**Export JSON** (§6) or a connected Word report (§7) for the copy you keep.

## 2. The main screen

From top to bottom:

1. **Toolbar** — New, Open, Export JSON, Print Report, Word Report, Settings, Help, Exit (§6, §7, §5, §9). The program version is shown beside the title.
2. **Analysis switch and aircraft details** — choose **Active Project** or **Previous & Concurrent
   Modifications** (§4.4); type the aircraft **Make, Model, Designation, Serial #, Flight Phase** and
   **Interval**. These appear on the reports.
3. **Tabs** — **Analysis**, **Existing / Removed**, **Installed**, **Document** (§3).
4. **Warnings banner** — appears when something needs attention (§4.7). Click its title to collapse or expand it.
5. **Workspace** — depends on the tab you are on.

## 3. The tabs

### 3.1 Analysis tab
Two panes side by side.

**Left — Power Distribution Tree.** The aircraft's power system as a tree. Each row shows the item
description (with its reference designator in brackets), a colored badge with its net change, and buttons:

| Control | Use |
|---|---|
| **Edit** | Opens the Edit Item dialog (§4.2). |
| **+ Child** | Adds one or more items beneath this one (§4.3). Not offered on loads or removed items, which cannot have children. |
| **↑ ↓ arrows** | Move the item up or down among its siblings of the same status. Siblings always stay grouped Existing, then Removed, then Installed; you choose the order within each group. |
| **Collapse/expand arrow** | Fold the branch. **Expand All / Collapse All** at the top do the whole tree. |
| **+ Root** | Starts another independent top-level item. |

Row colors help you read the tree: DC items have a tinted background and an accent bar; a positive net change
is orange, a negative one green. Rows with a warning are highlighted yellow, overloaded rows red.

**Right — reports.** Three views, chosen by the buttons above the pane:

- **Load Analysis Summary** — the whole tree as one table (AC and DC sections): Capacity, Existing Load,
  Load, Net Change, New Load and Reserve.
- **Power Distribution Summary** — generation, conversion and distribution items only (no breakers, fuses or
  loads): Capacity, Net Change, New Load and Remaining.
- **Load Analysis Detail** — one small table for each item that has children, showing the item and its
  immediate children, with the distribution path above the table. A **Vertical / Horizontal** toggle chooses the
  layout (Vertical places sibling items side by side; see §5 for the options that control it). In the Horizontal
  layout a load's value is shown under **Net Change** (a removed load in parentheses); there is no separate
  "Installed (Removed)" column group there.

These on-screen reports use the same column choices and rounding as the printed and Word reports (§5).

### 3.2 Existing / Removed and Installed tabs
Spreadsheet-style grids for fast entry and review: **Existing / Removed** lists the items that are existing or
being removed; **Installed** lists the items being added. Click a cell to edit it in place. Each row has small
buttons:

| Button | Action |
|---|---|
| **∑** | Recalculate this row's AC values (W, VAR, VA, A, pf) from whatever you have filled in. |
| **⧉** | Duplicate the row. |
| **↳** | Add a child item. |
| **✎** | Open the full Edit Item dialog (for overrides, notes and references). |
| **×** | Delete. |
| **↻** (beside a group of columns) | Clear that group of values. |
| **↑ ↓** | Reorder. |
| **Share / Unshare** | When a Previous & Concurrent Modifications analysis exists (§4.4). |

The status badge in a row toggles an item between Existing and Removed (in the Existing / Removed grid) when clicked; the
keyboard focus stays on the badge, so Tab and Shift+Tab continue to the next or previous cell in the same row.

Above each grid are **filters**: AC / DC, and a **Branch** list (an item and everything beneath it). **Clear
Filters** appears while a filter is active. The filters are shared between the two grids and are not saved
with the project.

### 3.3 Document tab
Report information that is not part of the power tree:

- **Document Properties** — document number, revision and revision date.
- **References** — the documents the analysis relies on (title, organization, document number, and so on).
  Reference entries can be reordered and, where two analyses exist, shared.
- **Row Notes** — reusable notes that you attach to items from the Edit dialog. Edit the text here and it
  changes everywhere it is used. Buttons share or copy all of them to the other analysis. Adding a TRU also
  creates a row note, attached to its inputs and output, that explains how the TRU's DC loads were transferred to its
  inputs (the formula with the TRU's own names, efficiency, power factor and number of input phases). It fills in
  and updates by itself; edit its text and it becomes an ordinary note.

## 4. Building an analysis

### 4.1 Item types and statuses

| Type | Notes |
|---|---|
| **Aircraft Total** | The root. Only available as a new top-level item. |
| **Generator, Alternator, Battery** | Sources. |
| **TRU** | A transformer-rectifier: AC in, DC out. Created as a linked **IN / OUT** pair; the IN side is the parent of the OUT side. The efficiency (default 0.85) and conversion power factor (default 0.95) are set in its dialog. |
| **Feeder, Bus, Circuit Breaker, Fuse** | Distribution and protection. Breakers and fuses show their ampere rating beside the name in reports. |
| **Load** | A terminal item with a load value; it cannot have children. |

*(Other converter types — inverter, transformer, DC-DC and frequency converter — exist only in older files and
cannot be created in new items.)*

| Status | Meaning |
|---|---|
| **Existing** | Already on the aircraft. |
| **Installed** | Being added by this change. (Older files and some screens may call this "New".) |
| **Removed** | Being taken off. Its load counts as a negative change. Removed items cannot have children. |

### 4.2 The Edit Item dialog
Open it with **Edit** (tree) or **✎** (grids). Sections appear according to the type and status:

- **Parent Item** — move the item to another parent, or choose *No Parent (New Root)* to make it a top-level item.
- **Identity** — Item Type, Status, Volts, AC / DC, Description, optional Ref Des (reference designator).
  Volts and AC / DC are inherited from the parent and fixed where the parent decides them.
- **Capacity** — Cap (A) and Cap (W) for DC; Cap (A) and Cap (VA) for AC. Optional, but needed for the
  overload warning and the Reserve.
- **Existing Load** — the load the item already carries (non-load items).
- **Net Change Override** — type a value here to replace the sum calculated from the children. Leave blank to
  calculate automatically.
- **Load Value** — for Load items (A, W, and for AC also VA, VAR, pf).
- **Conversion Parameters / TRU** — efficiency and conversion power factor. A TRU has **Input** and
  **Output** panes with their own capacity and existing-load fields. Extra input phases can be added with
  **+ Parent**.
- **Phases** — the **Multi-phase** option splits an eligible AC item into phase-mates (§4.5).
- **Siblings** — shows the item's siblings for reference.
- **Notes & References** — row notes and row references for this item (click to expand).

Each section has its own **Reset** button. The bottom buttons are **Delete**, **Calculate**, **Cancel**,
**Duplicate** and **Save**. **Calculate** fills in the empty fields of the item from the ones you have already entered
(for example VA from A and volts, or W from VA and pf) without overwriting anything you typed; **Save** also fills in what it can.

**Typing numbers.** Number fields accept ordinary numbers or a calculation that starts with `=`, such as
`=12*3.5` or `=(28+1.5)/2`. Only digits and `+ − × ÷ . ( )` are allowed; the result replaces what you typed when you
leave the field. For AC items you can supply any usable combination of A, VA, W, VAR and pf and the rest are
worked out. With nothing else given, VAR defaults to 0 and pf to 1.

### 4.3 Adding items
**+ Child** (or ↳ in a grid) and **+ Root** open the **Add Item(s)** dialog. Choose the parent, the item type,
the voltage, AC / DC and status once, then fill in as many rows as you need, using **+ Add Another Row**. Each row
takes a description, optional reference designator and the capacity/load values appropriate to the type. New
items inherit the parent's voltage, AC / DC and (where used) phase.

### 4.4 Previous & Concurrent Modifications
Often an aircraft has changes already approved but not yet installed. Click **+ Create Previous & Concurrent
Modifications** to add a second analysis. The switch then toggles between **Active Project** and
**Previous & Concurrent Modifications**; each has its own tree, grids and reports, and its own Document tab
content.

Items that exist in both can be **shared**: a shared item keeps its key fields in step in both analyses, and the
Active Project's existing load for such an item can be taken from the other analysis' new load. Use **Share** /
**Unshare** in a grid for items, and the Share buttons on the Document tab for references and notes.
A shared item (or a shared ancestor) cannot be deleted until it is unshared. For a shared TRU, input phases you add or
remove in its Edit dialog are added or removed in the other analysis as well (after a confirmation); a new input phase needs a
shared bus to sit under.

### 4.5 Three-phase systems
An AC item can be split into up to three **phase-mates** so the phases of one real item stay together in the
reports. In **Edit Item**, tick **Multi-phase** on an eligible AC item (generators, buses, feeders and so on; not the
top-level item, loads or converters). The item becomes phase A and you add B and C; labels (default A, B, C, up to 8
characters) can be changed at the point of the split. Items below follow their own phase and are shown with the phase in
the name, for example `Bus 1 (ØA)`. Deleting or duplicating a phase-mate asks whether to act on **this phase only**
or **all phases**. A TRU can be fed from several phases; its total input is divided evenly between them.

### 4.6 How the numbers are worked out
- **Net Change** flows up the tree: an Installed load adds its value, a Removed one subtracts its existing
  load, and a parent sums its children (a Net Change Override replaces the sum). A TRU's input change follows from its
  output through the efficiency and conversion power factor.
- **New Load** = Existing Load + Net Change.
- **Reserve** = Capacity − New Load.
- **AC totals** add W and VAR across children, then recalculate VA, A and pf. (An alternative, the algebraic VA sum,
  is chosen in Settings — §5.)
- **DC totals** add amps, with W = volts × amps.

### 4.7 Warnings
Warnings appear in the banner and as yellow (or, for overloads, red) rows. They never stop you working.

| Code | Meaning |
|---|---|
| W1 | A load value is negative. |
| W2 | An item's new load is negative. |
| W3 | **Overloaded:** the new load is greater than the capacity (a blank capacity counts as zero). |
| W4 | An existing or removed item has no existing load entered. |
| W5 | The existing/removed children's existing loads add up to more than the parent's own existing load. |
| W6 | **Phase load unbalance** on a generator or alternator: the spread between the heaviest and lightest phase exceeds 3.33 % of one phase of the generator's rating (MIL-E-7016F). |

## 5. Settings

Click **Settings** to open **Report Settings**. These choices apply to the on-screen reports, **Print Report** and
the **Word report**, and they are saved with the project.

| Setting | What it does |
|---|---|
| **Report preset** | **VA** (the default for new projects): the AC reports show VA only and VA is summed algebraically. **Vector**: VA, W, VAR and pf, with vector sums (the earlier default). **Custom** appears when you change an AC column or the VA calculation by hand. DC columns are not part of the preset. |
| **AC Summary — Columns to Include** | For each group (Capacity, Existing Load, Installed (Removed), Net Change, New Load, Reserve) tick the units to show: A, VA, W, VAR, pf. The **Select All** row toggles a whole unit column. |
| **DC Summary — Columns to Include** | The same for DC: A and W. |
| **Show conversion input (IN) side with Net Change only** | By default a converter's input side shows values only under Net Change. Untick to show all columns. |
| **Vertical Load Analysis Detail — siblings per table** | How many sibling items are placed side by side in one table before continuing in another. *Auto* chooses 4 siblings for up to 3 value columns and 3 otherwise. A set of phases is never split. |
| **…treat TRU outputs as siblings** | Show the DC outputs of several TRUs side by side in one table. |
| **…treat multiple top-level items as siblings** | Show several root items side by side. |
| **Table for each TRU output / top-level item** | Shown when there are at least two such items. For each one choose *Default* (follow the two options above), *Own table*, or *Group 1–4*; items given the same group number are shown side by side in one table. |
| **Report rounding** | *Dynamic* (3, 4 or 5 significant digits; the default is 4) with a **lower limit** (the finest rounding, 0.001, 0.01 or 0.1; default 0.001) and an **upper limit** (values from 10^digits up are rounded to the nearest 1, 10 or 100; default 1), or *Fixed decimal* (nearest 0.001, 0.01, 0.1, 1 or 10). Projects saved before the limits existed open with an upper limit of 10, so their reports don't change. Breaker/fuse ratings and power factors are not affected. |
| **VA calculation (whole project)** | *Algebraic sum* (the default for new projects): the VA of children is added directly. *Vector sum*: VA is derived from the summed W and VAR. |

**Reset to Defaults** restores all settings (and clears the per-item sibling choices); **Cancel** discards your edits;
**Done** applies and saves them.

## 6. Saving, opening and exporting a project

### 6.1 Export JSON (save your project)
**Export JSON** saves the whole project — both analyses, the document information, notes, references and the report
settings — to a `.json` file named like `WattsUp_<make>_<model>_<serial>_<date>.json`. In Chrome and Edge you choose
the location in a normal Save dialog (and are asked before replacing a file). In other browsers the file goes to the
Downloads folder.

### 6.2 Open
**Open** (toolbar or start-up dialog) reads either a project `.json` or a Word `.docx` that Watts Up made. Opening
replaces what is on screen, so the program warns first. The file is checked before it is accepted; a damaged or
unexpected file is refused with a message, and your current work is left alone. Opening a `.docx` in Chrome or Edge also
connects the program to that Word file (§7).

### 6.3 Print Report
**Print Report** builds a formatted report using the current Settings and opens the browser's print dialog, from which
you can print or choose "Save as PDF".

### 6.4 New
**New** discards the current analysis (after asking) and starts an empty one. If a Word file is connected, it is
disconnected.

## 7. The Word interface

### 7.1 What it does
The **Word Report** button produces a Word document containing the tables of your analysis, laid out from a built-in
template with content controls in the cover page, headers and body. The document also carries a **hidden copy of the whole
project**, so the same file can be loaded back into Watts Up. In Chrome and Edge the program can stay **connected** to your
own Word file, updating it in place without disturbing anything else in it.

### 7.2 Creating or connecting a report
Click **Word Report**. When no Word file is connected, choose:

- **Create New Report…** — pick a name and location; the program writes a new report there and connects to it.
- **Connect Existing…** — pick a report you made before (or your own file built from the template). The program
  then asks whether to **Sync to Report** (write the current analysis into the file) or **Load from Report** (replace the
  current analysis with what is in the file).

While connected, the toolbar shows **Connected: *file name***.

### 7.3 Sync and Load
With a file connected, **Word Report** offers:

- **Sync to Report** — updates the document's content controls and the hidden project copy from the current analysis,
  leaving the rest of your document (extra pages, letterhead, your own edits) untouched. The first time in a session the
  browser asks permission to write to the file. A message lists any content controls the document is missing;
  those items are simply not updated.
- **Load from Report** — replaces the current analysis with the project stored in the file (after a confirmation,
  because unsynced changes are lost). Text you typed in Word into the introduction, compliance statement and general
  notes controls is brought back too.
- **Create New Report…** — as above.
- **Connect Different…** — pick another existing report and connect to it instead (then choose Sync or Load, as when
  connecting for the first time). Cancelling the file dialog leaves the current connection as it was.
- **Disconnect** — stops linking the analysis to the Word file (after a confirmation). Nothing in the analysis or in the
  file changes; you can connect again later.

**Important:** Word locks a file while it is open. Close the report in Word before syncing, otherwise the program
reports that the file is probably open and nothing is written.

### 7.4 Browsers without the connection feature
In Firefox and Safari there is no connection. **Word Report** simply downloads a new `.docx`; **Open** can still load
a `.docx` or `.json`.

### 7.5 Things to know
- Creating and reading Word files uses a small library that the page loads from the Internet. If the page was opened
  without an Internet connection, the program says so and the Word functions are unavailable until it is reloaded online.
- A Word report holds the full project in hidden form. Anyone who has the `.docx` can extract it, even if the visible
  report shows only part of the data. Send a PDF instead if you do not want to share the project.
- Opening a different project, or clicking **New**, disconnects the Word file (the program tells you first). You can also
  disconnect or switch to another report at any time without touching the analysis (§7.3).
- The report uses the same column choices, rounding and layout options as **Settings**.
- In the Word Summary tables, each section (AC and DC) is one table. Word keeps the rows of one group of siblings together
  where it can and breaks the page between groups; the column headings repeat at the top of each page.

## 8. Tips and troubleshooting

| Situation | What to do |
|---|---|
| "Import failed" or "refused" on opening a file | The file is damaged, not from Watts Up, or edited by hand. Use an earlier copy. |
| A Word sync says the file is probably open | Close it in Word and try again. |
| Word functions say JSZip is not loaded | Reload the page while online. |
| Warning W3 on an item | The new load exceeds the capacity. Check the capacity entry, the loads below it, or any override. |
| A number you typed "disappeared" | If it began with `=` and contained anything but digits and `+ - * / . ( )`, it is left as typed; check for stray letters or commas. |
| "This file was repaired as it opened" | An older version let a shared TRU's phases get out of step between the two analyses. The program linked the matching phases (or un-shared that item) so the file could open. Save the file again to keep the repair. |
| Work is missing after reopening the browser | The auto-save is per browser and may have been cleared. Keep an exported `.json` or a connected Word report. |
| The Open/Save dialogs look different | You are in a browser without file-system access; files are downloaded instead. Use Chrome or Edge for the full feature set. |

## 9. Versions and getting help

- **Version.** The version number (for example `v1.0.0`) is shown beside the title on the toolbar; hover over it for the
  release date. The printed report shows it in its header, and a Word report records it in its document properties
  (`WattsUpVersion`).
- **Version numbers.** `MAJOR.MINOR.PATCH`. A change in the first number means saved files or results changed in a way
  older copies cannot follow; the second means new features (older files still open); the third means fixes only. A
  version starting `0.` is a testing build.
- **Files remember their version.** Project files and Word reports record the version that made them. If you open a file
  made by a *newer* version than the one you are running, the program warns you first, because an older copy can misread
  or drop data. Close the tab and open the current copy of the program instead.
- **Staying current.** The program never checks for updates by itself. Use the copy your administrator publishes, and
  compare the version in the header with the one in the latest release note. If yours is older, close the tab and open
  the published copy again.
- **This guide.** Click **Help** on the toolbar to open this guide in a new tab. It matches the version of the program
  you are running. Use your browser's print command to print it or save it as a PDF.
