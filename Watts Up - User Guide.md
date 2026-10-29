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
  files (see §7.6). Everything else works offline.
- Nothing is installed. Open the `watts-up.html` file in the browser.
- **Keep `watts-up.html` on your own computer.** Save it to a local folder such as `C:\Users\<you>\Documents\Watts Up`
  and open it from there. Running it straight from a network drive, a mapped drive letter or a `\\server\share` path can stop
  the live Word connection from syncing (the browser refuses to ask for permission to write to the Word file). Your
  **Word reports and project files can stay on the network drive**; only the program file itself needs to be local.

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

1. **Toolbar** — New, Open, Export JSON, Print Report, Word Report, Changes, Settings, Help, Exit (§6, §7, §9, §5, §10). The program version is shown beside the title.
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
  loads): Capacity, Net Change, New Load and Remaining. It carries no row notes.
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
| **↳** | Insert a blank, editable child row under this item (see "Adding items from a grid" below). |
| **✎** | Open the full Edit Item dialog (for overrides, notes and references). |
| **×** | Delete. |
| **↻** (beside a group of columns) | Clear that group of values. Clearing is required before you can change the values in an AC group; for DC values it is optional. |
| **↑ ↓** | Reorder. |
| **Share / Unshare** | When a Previous & Concurrent Modifications analysis exists (§4.4). |

The status badge in a row toggles an item between Existing and Removed (in the Existing / Removed grid) when clicked; the
keyboard focus stays on the badge, so Tab and Shift+Tab continue to the next or previous cell in the same row.

**Adding items from a grid.** There are three ways, and they are not all obvious:

- **↳** (in a row) inserts a blank child row directly under that item and puts the cursor in its Description cell. The new row starts
  with a default type for that parent (change it in the row if you need another) and takes its voltage and AC / DC from the item
  above it; you type its values straight into the row's cells. Nothing else opens.
- **+ Item** (bottom of the grid) opens the **Add Item(s)** dialog with no parent chosen yet (§4.3).
- **A TRU cannot be typed into a row** — it is always created as an IN / OUT pair by the Add Item(s) dialog. To add a TRU as a
  child of an item from a grid, open that item's **Item Type** drop-down in its row and choose the last entry, **+ TRU (opens Add
  Item)**. The row itself does not change; the Add Item(s) dialog opens with that item already chosen as the parent and **TRU**
  already chosen as the type (§4.3). The entry appears only on rows whose type can be changed.

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
  inputs (the formula with the TRU's own names, efficiency, power factor and, when the TRU has more than one input phase, the
  number of phases — for example "VA = Wdc / (0.85 eff. x 0.95 pf x 3 Ø)"). It fills in
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
  calculate automatically. An item with a manually entered Net Change Override should not have children: the override
  replaces the total of whatever is beneath it, so children added under it do not change the total (and an Installed item with
  an override is not offered **+ Child** at all). Clear the override first if you want the item to total its children.
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

### 4.3 The Add Item(s) dialog
Open it with **+ Child** (a tree row), **+ Root** (above the tree), **+ Item** (bottom of either grid), or — to add a TRU from a
grid — the **+ TRU (opens Add Item)** entry in a grid row's Item Type drop-down (§3.2). Several items of one kind can be added at once:

- **Parent Item** — where the new items go (preselected when you start from a tree row or a grid row; choose *No Parent (New Root)*
  for a top-level item).
- **Item Settings** — **Item Type**, **Volts**, **AC / DC** and **Status**, chosen once for every row below.
- **Items to Add** — one row per item: a description, an optional reference designator, and the capacity, existing-load or load
  values that suit the type. Use **+ Add Another Row** for more.
- **TRU** — a TRU row also takes the efficiency (default 0.85), the output voltage, and the capacity and load of its input (IN) and
  output (OUT) sides. Saving creates the linked IN / OUT pair and its transfer row note (§3.3). Extra input phases are added
  afterward in the Edit dialog with **+ Parent** (§4.2).
- **Save** adds the items; **Cancel** closes the dialog without adding anything.

New items inherit the parent's voltage, AC / DC and (where used) phase.

### 4.4 Previous & Concurrent Modifications
Sometimes it is necessary or advantageous to account for previous and concurrent modifications separate from the active project. Click **+ Create Previous & Concurrent
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
  browser asks permission to write to the file. If the document lacks some of the available content controls (§7.4), a
  message says so; those parts are simply not updated.
- **Load from Report** — replaces the current analysis with the project stored in the file (after a confirmation,
  because unsynced changes are lost).
- **Create New Report…** — as above.
- **Connect Different…** — pick another existing report and connect to it instead (then choose Sync or Load, as when
  connecting for the first time). Cancelling the file dialog leaves the current connection as it was.
- **Disconnect** — stops linking the analysis to the Word file (after a confirmation). Nothing in the analysis or in the
  file changes; you can connect again later.

**Important:** Word locks a file while it is open. Close the report in Word before syncing, otherwise the program
reports that the file is probably open and nothing is written.

### 7.4 Content controls
Watts Up writes into a Word document through **content controls** — fields in the document that carry a **tag**. Each time you
sync, every control whose tag is in the table below is refilled; anything else in the document is left exactly as you made it. A
control can appear more than once (for example the document number in the body and in every header), and text controls can sit in
headers and footers as well as in the body. A control that isn't in the document is simply not filled. **Create New Report…**
makes a document that contains all of them, which is the easiest way to see how they look.

To add one to your own document: in Word, insert a content control (Developer tab ▸ Rich Text Content Control), open its
**Properties** and type the tag exactly as shown (lower case).

| Tag | What it holds |
|---|---|
| `wu-docnumber` | Document number (Document tab). |
| `wu-revision` | Revision (Rev, Document tab). |
| `wu-revdate` | Revision date (Document tab), written out as a date. |
| `wu-make` | Aircraft make. |
| `wu-model` | Aircraft model. |
| `wu-designation` | Marketing designation. |
| `wu-serial` | Aircraft serial number. |
| `wu-flightphase` | Flight phase / scenario. |
| `wu-interval` | Interval. |
| `wu-references` | The numbered reference list (Document tab) of the Active Project. |
| `wu-tables` | Load Analysis Summary tables (AC and DC) of the Active Project, with their notes. |
| `wu-pds` | Power Distribution Summary of the Active Project. |
| `wu-lad-horizontal` | Load Analysis Detail, horizontal layout, of the Active Project. |
| `wu-lad-vertical` | Load Analysis Detail, vertical layout, of the Active Project. |
| `wu-references-pcm`, `wu-tables-pcm`, `wu-pds-pcm`, `wu-lad-horizontal-pcm`, `wu-lad-vertical-pcm` | The same five report sections for the **Previous & Concurrent Modifications** analysis (a short "no data" note when that analysis doesn't exist). |

The report sections follow the report choices in **Settings** (columns, rounding, layout options) and show change-tracking
underlines when tracking is on (§9). Watts Up also keeps these Word document properties up to date when the document has them
(File ▸ Info ▸ Properties ▸ Advanced ▸ Custom): `ReportNo`, `ReportRev`, `Make`, `Model`, `S/N`, `Flight Phase` and
`WattsUpVersion`.

### 7.5 Browsers without the connection feature
In Firefox and Safari there is no connection. **Word Report** simply downloads a new `.docx`; **Open** can still load
a `.docx` or `.json`.

### 7.6 Things to know
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
| Word sync fails with a message about permission or a "third-party context", or Connect Existing works but Sync does not | **Run `watts-up.html` from a local drive.** Copy it to a local folder (for example `C:\Users\<you>\Documents\Watts Up`), close the tab, and open the local copy. Opening the program from a network drive, a mapped drive letter or a `\\server\share` path is a known cause. The Word report itself can stay on the network drive: a local copy of the program can read and write it there. After switching, use **Connect Existing…** to pick the report again. |
| Word sync does nothing, says permission was not granted, or "Sync failed" | Click **Sync to Report** and answer the browser's permission prompt promptly (it only works shortly after the click). If the browser refuses even to ask (a message mentioning a "third-party context"), Watts Up offers **Choose the File…**: pick the same Word file again and allow editing when asked; connecting with **Connect Existing…** already grants editing this way. Make sure `watts-up.html` is open from a local drive (§1.1) and directly in its own browser tab, not inside another page or app. Then check that the Word file is closed in Word, is not read-only, has no hidden `~$` lock file beside it, is not being held by OneDrive or a virus scanner, and is on a drive you can write to; try a copy in a plain local folder such as `C:\Temp`. Managed browsers can block file writes (look for "FileSystem" in `chrome://policy` or `edge://policy`). Press F12 and open the Console to see the detail. Firefox and Safari cannot keep a live connection; use Chrome or Edge. |
| Word functions say JSZip is not loaded | Reload the page while online. |
| Warning W3 on an item | The new load exceeds the capacity. Check the capacity entry, the loads below it, or any override. |
| A number you typed "disappeared" | If it began with `=` and contained anything but digits and `+ - * / . ( )`, it is left as typed; check for stray letters or commas. |
| "This file was repaired as it opened" | An older version let a shared TRU's phases get out of step between the two analyses. The program linked the matching phases (or un-shared that item) so the file could open. Save the file again to keep the repair. |
| Work is missing after reopening the browser | The auto-save is per browser and may have been cleared. Keep an exported `.json` or a connected Word report. |
| The Open/Save dialogs look different | You are in a browser without file-system access; files are downloaded instead. Use Chrome or Edge for the full feature set. |

## 9. Tracking changes

Use **Changes** on the toolbar to see what a revision has changed. Watts Up compares the project with a **baseline** — a copy of
the items, values, row notes and references taken when you turn tracking on — and **underlines** everything that differs from it.

- **Tracking On** (first time): takes the baseline and starts marking. From then on every number in the reports that differs from
  the baseline is underlined — including totals, new loads and reserves that changed *because* of an edit — and so is the name of
  every item that is new, renamed, moved, or has a different status or type. A row note or reference that is new or whose text
  changed is underlined in the notes and references lists (a changed reference is underlined in the References list, but a row
  note that merely cites it is underlined only when the citation comment is new or changed), and a note marker is underlined on an item that newly has that note or
  reference. This works in the Load Analysis Summary tab, the Power Distribution Summary, both Load Analysis Detail layouts, the
  Print Report and the Word report. On screen, hover over an underlined number to see what the baseline showed (or what an
  underlined name used to be). A small chip beside the version number shows **Tracking On**
  or **Tracking Off**, and a line above the on-screen reports says what the underlines mean.
- **Tracking Off**: stops marking new edits — they are accepted as you make them. Marks that already exist stay. If you overwrite an
  entry that was marked, its mark goes away, and so do the marks on the values that were recalculated because of it; other marks
  stay. Use it for tidying that should not be flagged.
- **Tracking On** (again): keeps the earlier marks and resumes marking.
- **Accept All**: clears every underline and makes the current state the new baseline. Use it when the revision is approved.
- **Reject All**: puts the items and their values, names, statuses, row notes and references back to the baseline, in both
  analyses: items added since are removed, items deleted since come back. A confirmation first says how many items it will remove,
  restore and reset, and what it does **not** revert: document properties (number, revision, date), report Settings and the VA
  calculation method, and the Word-file connection. If the Previous and Concurrent Modifications analysis was created
  after the baseline, it is left as it is.
- **One item at a time:** in an item's Edit dialog, **Accept Change** makes that item's current values (and the notes and references it
  cites) part of the baseline, and **Reject Change** puts that item's values, name, status and notes back to the baseline (not its
  place in the tree or its type). A new item has only **Accept Change** (to undo a new item, delete it), and an item can only be
  accepted after the item it sits under. A TRU is accepted or rejected together with its inputs and output. Totals follow from the
  items beneath them, so accept or reject those items.
- **Undoing a change by hand:** hover over the underlined number to see the baseline value and type it back — the underline
  disappears by itself once a number matches the baseline again.
- **Deleted items:** the **Document** tab has a **Tracked Changes** section listing what was deleted since the baseline, with
  **Restore** (puts the item and what was under it back, when it is a plain item) and **Accept deletion**, and the notes and
  references that were removed from items. A TRU, a set of phases or a shared item can only be brought back with Reject All.

Notes:
- The underlines are drawn by Watts Up each time a report is built, so they are rewritten at every Word sync; Word's own Track
  Changes is not used.
- Document properties and report settings are not tracked, and Reject All does not change them.
- The baseline is a second copy of the project's items, so a file saved while tracking is on is larger.

## 10. Versions and getting help

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
