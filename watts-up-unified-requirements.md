# Watts Up — Unified Requirements
Supersedes: watts-up-requirements.txt, watts-up-revision-1- through revision-9-requirements.txt
Last updated: 2026-07-11 (through Revision 22)

---

## 1. Program Overview

Single-file browser application for aircraft electrical load analysis. Organizes the aircraft
power distribution system as a hierarchical tree. Documents load changes associated with an
aircraft modification and calculates net changes, new loads, and remaining capacity for each
affected item.

---

## 2. Aircraft Metadata

Fields collected at startup and editable thereafter:
- Aircraft Make
- Aircraft Model
- Marketing Designation
- Serial Number
- Flight Phase / Scenario — free text, default: **Cruise**

---

## 3. Item Types

### 3.1 Root
- **Aircraft Total** — available only when Parent = "No Parent (New Root)"

### 3.2 Generation
- Generator
- Alternator
- Battery

### 3.3 Conversion (Paired IN/OUT)
Each conversion device is added as two linked nodes: the **IN** node (input side) is the parent;
the **OUT** node (output side) is its child. Labels are suffixed "(IN)" and "(OUT)".

Efficiency factor: default **0.85**; input = output / efficiency; output = input × efficiency.

| Type | IN side | OUT side | Default convPf |
|---|---|---|---|
| TRU | AC | DC | **0.95** |
| Inverter | DC | AC | 1.0 |
| Transformer | AC | AC | 1.0 |
| DC-DC Converter | DC | DC | 1.0 |
| Frequency Converter | AC | AC | 1.0 |

Power conversion input formulas:
- W(IN) = (V(OUT) × A(OUT)) / efficiency
- For AC input: VA(IN) = W(OUT) / (efficiency × convPf)

convPf applies to **all** AC conv-item calculations (capacity, existing load, load, net change,
new load). convPf field is visible in the dialog for TRU, Inverter, and Frequency Converter.

### 3.4 Distribution / Protection
- Feeder
- Bus
- Circuit Breaker
- Fuse

### 3.5 Load
Terminal node; has a Load Value field; no children allowed.

---

## 4. Power Units and Formulas

### 4.1 AC Items
**Capacity and Remaining Capacity:** Amps (A), Volt-Amps (VA)
**All load columns (Existing Load, Load, Net Change, New Load):** A, VA, W, VAR, pf

Formulas:
- VA = V × A = W / pf = √(W² + VAR²)
- W  = VA × pf = √(VA² − VAR²)
- pf = W / VA; valid range 0 ≤ pf ≤ 1
- VAR = √(VA² − W²) = √(VA² − (VA × pf)²)

Default on save (if user did not provide sufficient info): VAR = 0, pf = 1.
*(Applied only at save time; fields are left blank during entry.)*

**AC vector-sum aggregation:**
1. Add W and VAR algebraically across children
2. Recalculate VA = √(W² + VAR²)
3. Recalculate A = VA / V
4. Recalculate pf = W / VA

### 4.2 DC Items
**All columns (Capacity, Existing Load, Load, Net Change, New Load, Remaining):** Amps (A), Watts (W)

Formulas: A = W / V; W = V × A

**DC scalar-sum aggregation:** add amps; W = V × A.

---

## 5. Tree Display (Left-Hand Pane)

- Pre-order traversal; branches grouped under their parent node
- "Root" label suppressed from display
- Node label format: Description `[RefDes]` — RefDes in square brackets appended to description,
  rendered in subdued (secondary) text; RefDes omitted if blank
- Net change badge displayed per node:
  - AC items: VA value
  - DC items: A value
  - Positive NC: orange; Negative NC: green
- Collapse / expand toggle per node
- **Edit** button on each node
- **Add Child** button on each node — **hidden** for terminal nodes (Load type or Removed status)

---

## 6. Summary Table (Right-Hand Pane)

- Pre-order traversal matching the left-hand pane order
- Description column: same `Description [RefDes]` format; no separate RefDes column
- Column header units in parentheses, e.g., "Capacity (VA)"
- Rows color-coded for warnings (yellow) and overload (red)

### 6.1 DC Summary columns
| Capacity | Existing Load | Load | Net Change | New Load | Remaining |
|---|---|---|---|---|---|
| A, W | A, W | A, W | A, W | A, W | A, W |

### 6.2 AC Summary columns
| Capacity | Existing Load | Load | Net Change | New Load | Remaining |
|---|---|---|---|---|---|
| A, VA | A, VA, W, VAR, pf | A, VA, W, VAR, pf | A, VA, W, VAR, pf | A, VA, W, VAR, pf | A, VA |

### 6.3 Section ordering and labels
- Labels: **"DC Summary"** and **"AC Summary"**
- If the first root node is AC: AC Summary first, then DC Summary
- If the first root node is DC: DC Summary first, then AC Summary

---

## 7. Edit Item Dialog

*(Previously named "Edit Item(s)"; renamed to "Edit Item" in Revision 7.)*

### 7.1 Field layout
1. **Parent Item** dropdown (top of dialog)
   - Excludes children and descendants of the current item
   - Includes "No Parent (New Root)" option
2. **Item Type** dropdown
   - "Aircraft Total" visible only when Parent = "No Parent (New Root)"
3. **Status**: Existing / New / Removed
4. **Volts** and **AC / DC** (see §7.2 for locking rules)
5. Description (free text)
6. RefDes (optional)
7. Context-sensitive sections below (§7.3–7.9)

### 7.2 Volts and AC/DC locking rules
| Scenario | Volts | AC/DC |
|---|---|---|
| Parent exists; regular (non-conv) node | Locked to parent value | Locked to parent value |
| Conv IN node; parent exists | Locked to parent value | Locked to device type |
| Conv IN node; no parent | Editable | Locked to device type |
| Conv OUT node | Editable | Locked to device type |
| No parent (new root); regular node | Editable | Editable |

### 7.3 Capacity section (non-load items)
- DC: A, W
- AC: A, VA
- **Reset button**: Clears all fields in this section (A and W for DC; A and VA for AC)

### 7.4 Existing Load section
- DC: A, W
- AC: Row 1 — A, VA; Row 2 — W, VAR, pf
- For **new** non-load items: replaced by a **Load** field; Load field hidden if item has children
- **Reset button**: Clears all fields in this section (A and W for DC; A, VA, W, VAR, pf for AC)

### 7.5 Load section (Load-type items only)
- DC: A, W
- AC: Row 1 — A, VA; Row 2 — W, VAR, pf
- **Reset button**: Clears all fields in this section (A and W for DC; A, VA, W, VAR, pf for AC)

### 7.6 Net Change Override section
- DC: W field + A field (A and W auto-derive from each other)
- AC: W field + VAR field (VAR defaults to 0 on save if left blank)
- **Hidden** when the item has children
- **Reset button**: Clears all fields in this section

### 7.7 AC field derivation formulas
Used by the Calculate button (§7.12). Applies to all AC field groups (Existing Load, Load).
Requires VA to be set for W/VAR/pf derivations; requires V > 0 for A/VA derivations.
No-op if prerequisite values are missing.

| Field entered | Fields derived | Formulas |
|---|---|---|
| **A** | VA, W, VAR | VA = V×A; W = VA×pf; VAR = √(VA²−W²) |
| **VA** | A, W, VAR | A = VA/V; W = VA×pf; VAR = √(VA²−W²) |
| **W** | VAR, pf | VAR = √(VA²−W²); pf = W/VA |
| **VAR** | W, pf | W = √(VA²−VAR²); pf = W/VA |
| **pf** | W, VAR | W = VA×pf; VAR = √(VA²−W²) |

### 7.8 Auto-clear on first entry (Revision 9)
When the user types into any field in a section (Capacity, Existing Load, Load, Net Change Override)
for the first time after opening the dialog, all other fields in that section are automatically
cleared. This fires once per section per dialog open session, enabling a clean Calculate workflow
without requiring a manual Reset first.

### 7.9 Conversion parameters section (conversion items only)
- **Efficiency** input (default 0.85)
- **convPf** input — visible for TRU, Inverter, and Frequency Converter
  (default: TRU = 0.95, Inverter = 1.0, FC = 1.0)
- Three-row layout with Reset button per row:

| Row | DC-side fields | AC-side fields |
|---|---|---|
| Row 1 — Capacity | Input Cap (A), Input Cap (W) | Input Cap (A), Input Cap (VA) |
| Row 2 — Existing Load | Input Exist. Load (A), Input Exist. Load (W) | Input Exist. Load (A), Input Exist. Load (VA) |
| Row 3 — Efficiency/PF | Efficiency, Conv. Power Factor (Reset) | — |

Each row's Reset button clears all fields in that row.
Input/output capacity and existing load auto-derive via efficiency and convPf; see §7.12.

### 7.10 Duplicate button
- Copies the current node; appends "(copy)" to the description
- For Conv IN nodes: also copies the paired OUT child node (child of the copy)

### 7.11 Formula entry
All numeric fields accept Excel-style expressions starting with `=` (e.g., `=28*2` → `56`).

### 7.12 Calculate button
Fills blank fields from entered values using power formulas. Applies on button press; also applies
automatically on save for any remaining blank fields.
- **AC sections**: derives per the field table in §7.7
- **DC sections**: derives missing A or W using A = W/V or W = V×A
- **Conversion items**: derives input/output capacity and existing load via efficiency and convPf

---

## 8. Add Item(s) Dialog

### 8.1 Field layout
1. **Parent Item** dropdown (top)
   - Excludes children/descendants of any selected item
   - Includes "No Parent (New Root)" option
2. **Item Type** dropdown — "Aircraft Total" only when Parent = "No Parent"
3. **Status**: Existing / New / Removed
4. **AC / DC** selector — locked to parent's AC/DC when parent is selected
5. Master-detail table (§8.3)
6. **Duplicate row button** per row — copies the row and appends "(copy)" to the description

### 8.2 State memory
- On open: fully reset the table (clear DOM and row data) and display one blank row
- Remember last-used Item Type and Status; restore on next open

### 8.3 Table columns (context-sensitive)
All row types include: Description, RefDes (optional)

| Item / Status | Additional columns |
|---|---|
| DC, any | Capacity (A or W), Existing Load (A, W), Load (A, W) |
| AC, any | Capacity (A, VA), Existing Load (A, VA, W, VAR, pf), Load (A, VA, W, VAR, pf) |
| Conv item | IN Volts column + OUT Volts column |
| Non-load, New | Load field replaces Existing Load; leave blank if item will have children |

Formula entry applies to all numeric columns.

### 8.4 Volts and AC/DC locking
Same rules as Edit Item §7.2; applied per row based on selected parent and item type.

### 8.5 Root creation shortcut
**"+ Root" button** in the tree panel header opens the Add Item(s) dialog with
Parent pre-set to "No Parent (New Root)".

---

## 9. Multiple Root Nodes

- Any number of independent root nodes allowed
- Default root: type "Aircraft Total", Volts 115, AC
- Last remaining root node cannot be deleted
- Changing a node's parent to "No Parent (New Root)" promotes it to a root node
- "+ Root" button (§8.5) and Duplicate button (§7.10) are additional creation paths

---

## 10. Calculations

### 10.1 Net Change (bottom-up propagation)
| Node condition | Net Change value |
|---|---|
| Load, status = New | loadValue |
| Load, status = Removed | −loadValue |
| Load, status = Existing | zero |
| Non-load, status = Removed | −existingLoad |
| Non-load with netChangeOverride | override value |
| Non-load, standard | sum of children NCs (passing through efficiency for conv children) |
| Conv IN node | derived from conv OUT NC via efficiency and convPf |

### 10.2 Derived totals
- **New Load** = existingLoad + netChange
- **Remaining Capacity** = capacity − newLoad

---

## 11. Warnings

| Condition | Warning |
|---|---|
| Negative load value entered | Warn on entry |
| New load is negative after net changes applied | Warn |
| New load exceeds item capacity | Warn |
| User adds children to a Load or Removed item | Warn |
| User adds children after manually entering a net change override | Warn |
| Non-load Removed item | Existing load entered as negative net change |

---

## 12. Data Persistence

- **Export JSON**: metadata + full node tree → file named `WattsUp_{make}_{model}_{serial}_{date}.json`
- **Import JSON**: restores a previously exported analysis
- **Auto-save to localStorage**: state persisted across page refreshes

---

## 13. Print / Export Report (Revisions 10–13)

### 13.1 Print Settings Dialog
Clicking "Print Report" opens a settings dialog before printing. The dialog contains:
- **AC Summary — Columns to Include**: checkboxes for each sub-unit under each group (§13.2)
- **DC Summary — Columns to Include**: checkboxes for each sub-unit under each group (§13.3)
- **Options**: Conv IN NC-only toggle
- Buttons: Reset to Defaults | Cancel | Print

### 13.2 AC Report Column Groups and Defaults
All AC groups offer A, VA, W, VAR, pf for selection.

| Group | Default units selected |
|---|---|
| Rating / Capacity | VA |
| Existing Load | VA, W, VAR, pf |
| Added (Removed) | W, VAR |
| Net Change | W, VAR |
| New Load | VA, W, VAR, pf |
| Remaining | VA |

### 13.3 DC Report Column Groups and Defaults
A and W selected by default for all groups: Rating/Capacity, Existing Load, Added (Removed),
Net Change, New Load, Remaining.

### 13.4 Ampere Rating in Name (Protection Devices)
If the user deselects "A" from Rating/Capacity, Circuit Breakers and Fuses still show their
ampere rating right-justified within the description cell: `FWD UPPER CB [581CB1]  (7.5 A)`.
The amp text floats to the right side of the cell.

### 13.5 Conversion Input (IN) Nodes — Net Change Only
By default, Conv IN nodes (TRU input side, etc.) display values only in the Net Change columns;
all other columns show "—". This reflects that the input side change is driven by output loading.
Togglable via the "Conv IN NC-only" option in the Print Settings dialog.

### 13.6 Negative Values and Removed Loads
Negative values and removed-load entries are shown in parentheses instead of with a minus sign.
For example, a removed 2.5 A load displays as `(2.5)`.

### 13.7 Adaptive Number Rounding
| Range | Format |
|---|---|
| pf | X.XX (exactly 2 decimals) |
| \|n\| < 10 | X.XXX (trailing zeros suppressed) |
| 10 ≤ \|n\| < 100 | XX.XX |
| 100 ≤ \|n\| < 1,000 | XXX.X |
| 1,000 ≤ \|n\| < 10,000 | X,XXX |
| 10,000 ≤ \|n\| < 100,000 | round to nearest 10 |

Zero-valued cells (< 0.0005 absolute) display as "—".

### 13.8 Report Header
Includes: Make, Model, Marketing Designation, Serial #, Flight Phase, and print date.

### 13.9 Section Ordering and Labels
AC section first if the first root node is AC; DC section first otherwise. Warnings section
follows. Section labels include voltage: e.g., "115 VAC Summary" or "28 VDC Summary" (derived
from the root node voltage; falls back to "AC Summary" / "DC Summary" if no root voltage).

### 13.10 Tree Grouping, Layout, and Visual Hierarchy

Within each parent's children, items are ordered: existing first, then a "Removed" label row
followed by removed items, then an "Added" label row followed by new items. Label rows span
the full table width at the same indentation as the items they introduce.

**Label suppression**: once a "Removed" or "Added" label has been emitted for a given parent,
all descendants in that branch inherit the label context — no additional labels are inserted
for their children.

**Depth-based font sizes**: row font size = max(6.5, 8.5 − depth × 0.5) pt. Depth 0 rows
render at 8.5 pt; each additional level reduces by 0.5 pt, with a floor of 6.5 pt (reached at
depth ≥ 4). The font size applies to the entire row — description and all numeric cells.

**Branch-transition spacer rows**: when the tree traversal returns to a shallower depth (a new
sibling branch starts), a blank spacer row is inserted before the first node at the shallower
level. Spacer height = max(1.5, 7 − depth × 1.5) pt; bottom border weight =
max(0.75, 3 − depth × 0.5) pt solid. Spacer rows are not inserted before "Removed" or "Added"
label rows.

**Parent-child separator border**: when a parent node and its first child both have non-zero
net changes (the child contributes to the parent's net change), a 0.75 pt top border is drawn
on the child's row to visually separate the parent-child boundary.

**Header**: the top-left header cell (description column) is blank — no "Component" label.

### 13.11 Status Formatting and Column Suppression

**Row text formatting:**
- Removed items: description in italic, black font
- New items: description in bold
- No strikethrough

**Column suppression by status** (live summary table and print report):

| Item status | Existing Load | New Load | Remaining |
|---|---|---|---|
| Existing | shown | shown | shown |
| New | — | shown | shown |
| Removed | shown | — | — |

New items have no pre-modification load to display; removed items have no post-modification
state to display.

---

## 14. Revision 14 — Document Metadata, References, and Notes

### 14.1 New `meta` fields

**Document identity:**
- `documentNumber` — e.g., "RPT1234"
- `revisionLevel` — e.g., "A", "B", "1"
- `preparedBy` — free text
- `approvedBy` — free text
- `revisionDate` — free text (e.g., "Jun-20-2026"; not a date picker)

**Document section prose** (editable in Watts Up; later round-tripped via Word content controls):
- `introText` — multi-line free text. Default: blank.
- `generalNotes` — ordered array of strings (bulleted in report). Default: `[]`.
- `complianceText` — multi-line free text. Default: blank.

**Reference list:**
- `references` — ordered array of reference objects (see §14.2). Default: `[]`.

### 14.2 Reference object schema

```json
{
  "key": "<uuid>",
  "organization": "Gulfstream",
  "docNumber": "GC514696308",
  "title": "Supplementary Electrical Load Analysis",
  "revision": "–",
  "date": "September 20, 2006"
}
```
- `key` — internal stable UUID; used by per-node `rowRefs` to survive reordering
- `organization`, `docNumber`, `title` — required
- `revision`, `date` — optional; omit or blank if not applicable
- Display number (1, 2, 3…) is derived from list order at render time, not stored

### 14.3 New per-node fields

Added to every node:
- `rowNotes` — ordered array of strings (0–N short notes tied to this row)
- `rowRefs` — ordered array of `{ key: "<uuid>", comment: "<string>" }` objects
  - `key` references an entry in `meta.references`
  - `comment` is optional; blank = no comment

### 14.4 Top-level tab layout

The app gains two top-level tabs replacing the current single-panel layout:

- **Analysis** tab — the current tree + summary table view (unchanged)
- **Document** tab — all document metadata, references, notes, and section prose

The aircraft metadata bar (Make, Model, Designation, Serial #, Flight Phase) moves into the
Document tab. The toolbar (New, Import, Export JSON, Print Report) remains always visible.

### 14.5 Document tab layout

Four sub-sections within the Document tab:

**A. Aircraft & Document Identity** — compact inline fields:
`Make` | `Model` | `Designation` | `Serial #` | `Flight Phase` | `Doc #` | `Rev` | `Prepared by` | `Approved by` | `Rev Date`

**B. References** — managed ordered list. Each entry shows:
```
[1]  Organization  [Gulfstream              ]
     Doc Number    [GC514696308             ]
     Title         [Supplementary Electrical Load Analysis     ]
     Revision      [–        ]   Date  [September 20, 2006]
     [↑] [↓] [✕]
```
- `+ Add Reference` button appends a blank entry
- Numbers are display-only, derived from list position
- Revision and Date fields are visually de-emphasized (optional)

**C. General Notes** — managed ordered list of text inputs with `[↑] [↓] [✕]` controls.
`+ Add Note` button. Notes are bulleted (not numbered) in the report.

**D. Section Text** — two labeled textareas:
- `Introduction` (maps to `introText`)
- `Compliance Statement` (maps to `complianceText`)

### 14.6 Per-row Notes & References in Edit Item dialog

New collapsible section **"Notes & References"** added below numeric fields:

**Row Notes:** `+ Add Note` list — each entry is a text input with a remove button.

**Row References:** checklist of all entries in `meta.references`, shown as:
```
☑  [1] Gulfstream GC514696308 — Supplementary Electrical Load Analysis
        Comment: [Load calculated using values from Table 3-2          ]
☐  [2] Nextant NT0078-ELA0-0200 — ELA Supplement for SpaceX Starlink
```
- Comment field appears only when the checkbox is checked
- If no references exist in `meta`, shows dimmed message:
  *"No references defined — add them in the Document tab."*

Same section added to the Add Item(s) dialog; comment/note fields are shared across all rows
in a batch-add session (per-row differentiation deferred).

### 14.7 Print report additions

**Notes column:** if any node has `rowNotes` or `rowRefs`, a narrow rightmost column is added
to the load table showing superscript-style markers (e.g., `¹` or `¹·³`).

**Note numbering:** assigned by DFS tree-walk order across the entire report. Row notes are
numbered sequentially (1, 2, 3…). Reference citations use the reference's display number from
`meta.references`.

**Sections added to the report** (between the report header and the load tables):

1. **General Notes** — bulleted list from `meta.generalNotes`
2. **References** — numbered list, each entry rendered as:
   `N. Organization. DocNumber. Title. Revision. Date.`
   (Revision and Date omitted if blank)

**Notes section** appended after load tables — two parts:
- Numbered list of row notes, number matching the superscript
- Row reference comments, cited as: `¹ Ref. [1]: comment text.`

### 14.8 Migration / backward compatibility

Existing JSON files load normally. Missing fields default:
- All new `meta` string fields → `''`
- `generalNotes`, `references` → `[]`
- Per-node `rowNotes` → `[]`, `rowRefs` → `[]`

---

## 15. Revision 15 — Word (.docx) Export (Phase 1)

*Last updated: 2026-06-20*

### 15.1 Overview

Add a **"Word Report"** button to the toolbar that generates and downloads a `.docx` file
containing a complete ELAA-format report. One-way export only; no JSON state is embedded and
the file cannot be re-imported in this revision. (Round-trip import deferred to Revision 16.)

The `.docx` is assembled in the browser using JSZip (loaded from CDN at runtime) by
constructing OOXML XML parts and packaging them into a ZIP archive — no server required.
JSZip requires an internet connection; the button shows an alert if JSZip is unavailable.

### 15.2 Document structure

Two sections with different page orientations:

**Section 1 — Portrait** (Letter, 1-inch margins, 9360 DXA usable width):

| Element | Content |
|---|---|
| Title | "Aircraft Electrical Load Analysis" — Heading 1 style, centered |
| Identity table | 4-column, 3-row table; each field is an inline plain-text content control |
| §1.0 Introduction | Heading 1 + block content control `wu-intro` |
| §2.0 General Notes | Heading 1 + block content control `wu-general-notes` |
| §3.0 References | Heading 1 + block content control `wu-references` |
| §4.0 Compliance Statement | Heading 1 + block content control `wu-compliance` |

**Section 2 — Landscape** (Letter, 0.75-inch margins, 13680 DXA usable width):

| Element | Content |
|---|---|
| Appendix A heading | Heading 1 |
| AC Summary (if present) | Heading 2 + load table |
| DC Summary (if present) | Heading 2 + load table |
| Notes (if any annotations) | Heading 2 + numbered list |

A continuous section break between §4 and Appendix A triggers the orientation change.

### 15.3 Identity header (content controls for field round-trip)

A 4-column table (4 × 2340 DXA columns) with three rows:

| Row | Fields |
|---|---|
| 1 | Make · Model · Designation · Serial # |
| 2 | Doc # · Rev · Prepared By · Approved By |
| 3 | Flight Phase · Rev Date · Report Date (spanning cols 3–4) |

Each field is an inline plain-text content control (`<w:sdt><w:text/>`), tagged:
`wu-make`, `wu-model`, `wu-designation`, `wu-serial`, `wu-docnumber`, `wu-revision`,
`wu-preparedby`, `wu-approvedby`, `wu-flightphase`, `wu-revdate`, `wu-reportdate`.

### 15.4 Prose sections (block content controls)

Each prose section is wrapped in a block-level `<w:sdt>` content control tagged with a stable
identifier. The tag enables Phase 2 (round-trip import) to locate and read back edits made
in Word.

| Section | Tag | Source data | When empty |
|---|---|---|---|
| Introduction | `wu-intro` | `meta.introText` | Empty paragraph placeholder |
| General Notes | `wu-general-notes` | `meta.generalNotes[]` | Empty paragraph placeholder |
| References | `wu-references` | `meta.references[]` | Empty paragraph placeholder |
| Compliance | `wu-compliance` | `meta.complianceText` | Empty paragraph placeholder |

Content controls are always present even when the source data is blank, so the document
structure is consistent regardless of fill state.

**References formatting:** each entry renders as:

```
N. Organization.  DocNumber.  Title (italic).  Rev. X.  Date.
```

Title is a separate italic run (`<w:i/>`); other fields are plain weight.

### 15.5 Load table format

Tables use `defaultPrintCfg()` column defaults (independent of the Print Settings dialog).

**Column widths** (landscape section, 13680 DXA total usable):

| Column | DXA |
|---|---|
| Description | 2880 |
| Notes (if any annotations exist) | 480 |
| Each numeric sub-column | (13680 − 2880 − 480*) ÷ column count |

*Notes column only present when at least one node has `rowNotes` or `rowRefs`.

**Row formatting** (identical rules to print report):
- New items: bold description
- Removed items: italic description
- Depth-based font size: `max(6.5, 8.5 − depth × 0.5)` pt, applied per run
- Removed / Added label rows: italic / bold text, single cell spanning full width
- Branch-transition spacer rows: 56 DXA (≈ 4 pt) exact-height empty row
- Parent-child separator: thin top border when both parent and first child have non-zero NC

**Table header:** two-row header with vertical merge on Description and Notes columns;
group labels span sub-columns horizontally; left border on first sub-column of each group.

### 15.6 Word styles defined

| Style ID | Name | Appearance |
|---|---|---|
| `Normal` | Normal | Calibri 10 pt, 0 pt before/after |
| `Heading1` | heading 1 | Calibri 13 pt bold, #2E4057, bottom border rule, keep-with-next |
| `Heading2` | heading 2 | Calibri 11 pt bold, #2E4057, keep-with-next |
| `TableGrid` | Table Grid | Standard grid borders (used by load tables) |

### 15.7 File naming

`WattsUp_{make}_{model}_{serial}_{YYYY-MM-DD}.docx`
(spaces replaced with underscores; special characters stripped)

### 15.8 OOXML parts

```
[Content_Types].xml
_rels/.rels
word/document.xml
word/_rels/document.xml.rels
word/styles.xml
word/settings.xml
```

### 15.9 Deferred to Revision 16

- Embedding JSON state as a Custom XML Part for round-trip project save/open
- "Open .docx Project" import
- Round-trip reading of prose content controls on import
- User-designed template support (base64-embedded template replacing generated structure)
- Cover page, Log of Revisions table, Table of Contents

---

## 16. Revision 16 — Word Round-Trip (Phase 2)

### 16.1 Overview

Make the `.docx` file the primary project save format by embedding the full Watts Up JSON
state as a Word Custom XML Part inside the ZIP. The existing **Open** button now also accepts
`.docx` files. On import, prose sections edited directly in Word (Introduction, General Notes,
Compliance) override the JSON-embedded values, so Word edits survive the round-trip.
References are not read back from Word; they are regenerated from JSON state.

### 16.2 Custom XML Part (JSON state)

Three new parts are added to the `.docx` ZIP at the **package root** (not inside `word/`):

```
customXml/item1.xml           — JSON state wrapped in a CDATA root element
customXml/itemProps1.xml      — declares the part's URI/namespace
customXml/_rels/item1.xml.rels — relationship from item1.xml to itemProps1.xml
word/_rels/document.xml.rels  — rId3 relationship to ../customXml/item1.xml
[Content_Types].xml           — overrides for item1.xml and itemProps1.xml
```

Format of `item1.xml` (as-built — XML entity encoding, not CDATA; CDATA was found to
truncate JSON containing `]]>` sequences and was replaced in the Revision 16 bugfix):
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<wuData xmlns="urn:watts-up:v1">
  <json>{ ... full JSON state, &amp;/&lt;/&gt; entity-escaped ... }</json>
</wuData>
```

### 16.3 Export flow (updated)

1. Build document XML (same as Revision 15)
2. Serialize current `state` to JSON, escaping `&`, `<`, `>` as XML entities
3. Write JSON into `customXml/item1.xml` (package root, not `word/customXml/`)
4. Assemble ZIP and download

### 16.4 Import flow ("Open .docx Project")

1. User selects a `.docx` file via file picker
2. JSZip opens the ZIP
3. Read `customXml/item1.xml` → extract text between `<json>...</json>` → decode XML
   entities → parse JSON → restore `state`
4. Read each prose content control by tag from `word/document.xml`:
   - `wu-intro` → `state.meta.introText`
   - `wu-general-notes` → `state.meta.generalNotes[]` (split on paragraph boundaries)
   - `wu-references` → ignored (references are authoritative in JSON state)
   - `wu-compliance` → `state.meta.complianceText`
5. Call `recalc()` and `renderAll()`

Step 4 means prose edits made in Word override the JSON-embedded values on import.
References are not read back from Word (the numbered list is regenerated from JSON state).

### 16.5 UI changes

- Existing **"Open"** button and hidden file picker updated to accept both `.json` and `.docx`
- File type detected by extension on change: `.docx` → Word import path; `.json` → existing path
- No new toolbar button required

### 16.6 Constraints and edge cases

- If `customXml/item1.xml` is missing (file was created externally or is a plain Word doc),
  import fails gracefully with a clear error message
- JSON schema version mismatch handled by `migrateLegacy()` (same as JSON import)
- Prose content-control extraction uses a lightweight XML text scan (not a full DOM parser);
  handles single-paragraph and multi-paragraph controls; ignores nested SDTs

---

## 17. Revision 17 — Template-Based Word Export

*Last updated: 2026-06-22*

### 17.1 Overview

Replace the generated-from-scratch document XML (Revisions 15–16) with a user-designed
Word template. `generateDocx()` no longer builds OOXML structure, styles, headers, footers,
TOC, or page numbering programmatically — it loads a template `.docx` (embedded in
`watts-up.html` as a base64 constant, `DOCX_TEMPLATE_B64`) and fills tagged content
controls with data from `state`. The template, not Watts Up code, controls layout,
typography, headers/footers, table of contents, and page numbering.

The template file is `Watts Up ELA Template.docx`, designed by the user in Word and
committed to the project root. It is expected to be revised iteratively; each new
template version must be re-embedded as the base64 constant.

### 17.2 Template structure

Three document sections, each its own page setup:

| Section | Orientation | Page size | Contents |
|---|---|---|---|
| Cover page | Portrait | Letter | Title block, identity fields, vertically centered |
| Body | Portrait | Letter | Header (`header2.xml`), intro/notes/references/compliance prose, log of revisions |
| Appendix | Landscape | Ledger/Tabloid (24480 × 15840 DXA) | Load tables, 22032 DXA usable width |

Footers use Word native field codes (`{ PAGE }`, `{ PAGEREF end }`) and are never modified
by Watts Up — page numbering is managed entirely in Word.

### 17.3 Content control tags

| Tag | Fill method | Source | Notes |
|---|---|---|---|
| `wu-docnumber` | inline | `meta.documentNumber` | Appears multiple times (cover + log of revisions) |
| `wu-revision` | inline | `meta.revisionNumber` / `revisionLevel` | Appears multiple times |
| `wu-make` | inline | `meta.make` | |
| `wu-model` | inline | `meta.model` | |
| `wu-designation` | inline | `meta.marketingDesignation` / `designation` | |
| `wu-serial` | inline | `meta.serialNumber` | |
| `wu-flightphase` | inline | `meta.flightPhase` | Nested SDT (inner SDT inside an untagged outer SDT) |
| `wu-preparedby` | inline | `meta.preparedBy` | |
| `wu-revdate` | block | `meta.revisionDate` | Multi-run paragraph (Word spellcheck splits text); filled via explicit replacement paragraph, not inline text substitution |
| `wu-intro` | block | `meta.introText` | One paragraph per newline |
| `wu-general-notes` | block | `meta.generalNotes[]` | Bulleted |
| `wu-references` | block | `meta.references[]` | Numbered, italic titles — added by user, not in original Revision 15/16 tag list |
| `wu-compliance` | block | `meta.complianceText` | One paragraph per newline |
| `wu-tables` | block | node tree | Ledger-width OOXML tables |

`wu-approvedby` and `wu-reportdate` are defined in the tag vocabulary but unused in the
current template.

`header2.xml` (body section header) independently carries `wu-docnumber`, `wu-revision`,
`wu-make`, `wu-model`, `wu-serial` and is filled separately from `word/document.xml`.

### 17.4 Fill mechanics

- `fillSdtText(xml, tag, value)` — locates `<w:tag w:val="...">`, walks back to the
  enclosing `<w:sdt>`, and replaces the first `<w:t>` run inside `<w:sdtContent>`.
  **Loops over every occurrence of the tag in the XML** (fixed in 17.1 — see below),
  so a tag repeated on the cover page and in the log of revisions is filled consistently.
- `fillSdtBlock(xml, tag, contentXml)` — same lookup, but replaces the entire
  `<w:sdtContent>...</w:sdtContent>` with caller-supplied XML. Also loops over every
  occurrence.
- `updateDocProp(xml, name, value)` — updates `docProps/custom.xml` custom document
  properties (`ReportNo`, `ReportRev`, `Make`, `Model`, `S/N`, `Flight Phase`) by name.

### 17.5 Export flow

1. Decode `DOCX_TEMPLATE_B64` into a JSZip instance
2. Fill identity fields and prose blocks in `word/document.xml`
3. Fill identity fields in `word/header2.xml`
4. Write `customXml/item1.xml` with full JSON state (same format as Revision 16)
5. Update `docProps/custom.xml` custom properties
6. Assemble ZIP and download as `WattsUp_{make}_{model}_{serial}_{YYYY-MM-DD}.docx`

### 17.6 Revision 17.1 — fill-all-occurrences fix

**Bug:** `fillSdtText` and `fillSdtBlock` used `indexOf`, which finds only the first
match. Tags appearing more than once in the same XML part (e.g. `wu-docnumber` on both
the cover page and the log of revisions) were only filled at their first occurrence;
later occurrences were left as template placeholder text.

**Fix:** both functions now loop, advancing a `searchFrom` cursor past each replaced
`<w:sdtContent>` block, until no further instances of the tag's `<w:tag w:val="...">`
marker remain in the XML string.

### 17.7 Superseded from Revisions 15–16

- Programmatic OOXML assembly (`buildDocumentXml` and related per-section builders) is
  replaced by template loading; helper functions retained are `buildBodyTextParas`,
  `buildGeneralNotesParas`, `buildRefsParas`, `buildTablesContent`, now used to produce
  *content* for `fillSdtBlock` rather than full document XML
- Letter landscape (13680 DXA usable) superseded by Ledger landscape (22032 DXA usable)
  for the Appendix, per the user's template design
- Generated cover page / log of revisions / TOC (deferred items from §15.9) are now
  provided by the template itself, not generated by Watts Up

### 17.8 Open items

- Template is expected to undergo further iteration; each revision requires
  re-embedding `DOCX_TEMPLATE_B64`
- Content-control locking (see §18) not yet implemented — currently nothing prevents a
  user from manually editing or deleting Watts-Up-managed content controls in Word

---

## 18. Revision 18 — Template Rev 1, Heading8 Table Titles, Word Export Settings

*Last updated: 2026-06-29*

### 18.1 Template Rev 1

The embedded template was replaced with `Watts Up ELA Template Rev 1.docx`
(`DOCX_TEMPLATE_B64`). Two changes from the original Revision 17 template:

- **Appendix orientation/size:** changed from Ledger/Tabloid landscape (24480×15840 DXA,
  22032 DXA usable) back to **Letter landscape** (15840×12240 DXA, margins L=1440 R=1008,
  **13392 DXA usable**). `buildTablesContent()`'s `TOTAL_W` constant updated accordingly.
- **New paragraph style `Heading8`** added to the template for use as the load-table
  title style (see §18.2).

All content control tags are unchanged from Revision 17 (§17.3) — confirmed identical
between the two template files.

### 18.2 Table title style

Load table titles generated by `buildTablesContent()` — e.g. "115 VAC Summary",
"28 VDC Summary" — now use the template's `Heading8` paragraph style instead of
`Heading2`. Only the table-title paragraphs changed; the "Notes" sub-heading inside
the tables block still uses `Heading2`.

### 18.3 Word Export Settings (column selection)

The Print/Export Settings dialog (`#print-opts`) is now mode-aware and shared between
the on-screen Print Report and the Word export, with **independent column-selection
state** for each:

- `printCfg` — column selection for `window.print()` / `buildPrintR10()` (unchanged
  from prior revisions)
- `wordCfg` — column selection for `buildTablesContent()` / the Appendix load tables
  in `generateDocx()`

`openPrintOpts(mode)` takes `'print'` or `'word'`, sets module-level `printOptsMode`,
retitles the dialog (`#print-opts-title`) and the action button (`#print-opts-go`)
accordingly ("Print / Export Settings" / "Print" vs. "Word Export Settings" /
"Export Word"), and populates checkboxes from the matching config object.
`applyPrintOpts()` and the "Reset to Defaults" button likewise operate on whichever
config matches the current mode.

Clicking **"Word Report"** now opens this dialog (mode `'word'`) instead of calling
`generateDocx()` directly; `generateDocx()` runs only after the user clicks
"Export Word" in the dialog.

**Rounding** is not separately configurable per export target — `fmtRpt()` /
`fmtPfRpt()` are shared by `buildRptRow` (print), `buildWordSectionRows`, and
`buildWordRptTable` (Word). A user-configurable rounding schedule remains a future
enhancement (§23).

---

## 19. Revision 19 — Word Export Fixes (pf rounding, header wrap, Notes column)

*Last updated: 2026-06-30*

Four defects reported after Revision 18 testing, all fixed:

### 19.1 Power factor rounding

`buildWordDataRow()`'s numeric-cell loop previously called `fmtRpt(val, isPf)` —
`fmtRpt()` takes a single argument and silently ignored `isPf`, so pf values got
generic magnitude-based rounding instead of the fixed 2-decimal pf format. Fixed by
branching explicitly: `isPf ? fmtPfRpt(val) : fmtRpt(val)`, matching the print path's
`rptTxt()`. pf values now render as e.g. `0.87`, `0.93`.

### 19.2 Column header word-wrap

Replaced the single uniform `numW` (one width applied to every numeric column) with a
**per-column `colWidths` array**, threaded through `buildWordTblHeader`,
`buildWordDataRow`, `buildWordSectionRows`, and `buildWordRptTable` in place of `numW`.

`computeColWidths(groups, cols, avail, pt)`:
1. Computes an even-share baseline width: `Math.floor(avail / cols.length)`.
2. For each column group present in `cols`, estimates the DXA width needed for the
   group label's **longest single unbreakable word** (split on whitespace only — e.g.
   "Rating / Capacity" → "Capacity", "Added (Removed)" → "(Removed)", "Remaining" →
   "Remaining" itself) at the header font size (7.5pt bold), divided across however many
   sub-columns that group has selected.
3. Each column's width is `Math.max(baseline, thatGroup'sMinPerCol)`.

Only groups whose selected-column count is too small to absorb their longest word get
widened; other columns stay at the even-share baseline. This avoids the bloat of
widening *every* column to satisfy the narrowest one (an earlier draft of this fix did
that and pushed total table width well past the page's usable width — rejected).
Multi-word labels may still wrap between words/hyphens (acceptable per spec); only a
hard mid-word break is treated as a defect.

The word-width heuristic (`Math.ceil(longestWordChars * pt * 9.5) + 160`) is an
approximation (~9.5 DXA per character per point for bold text, plus ~160 DXA for cell
padding) — not exact font metrics. Verified against a default-config AC table: total
width came to 13520 DXA (target usable width 13392), with only the `cap` (Rating /
Capacity, 1 selected column) and `rem` (Remaining, 1 selected column) groups widened
above the 699 DXA baseline, to 730 and 802 DXA respectively.

### 19.3 Notes column left divider

`buildWordTblHeader()`'s Notes header cells (row 1 and row 2) and
`buildWordDataRow()`'s Notes data cell now pass `leftBdr:true` to `wxTc()`, matching the
left border (`<w:left w:val="single" w:sz="12" w:color="777777"/>`) already used between
numeric column groups.

### 19.4 "Notes" sub-heading style

`buildTablesContent()`'s annotation-list heading (distinct from the per-column Notes
header in §19.3 and from the `wu-general-notes` content control) no longer sets
`style:'Heading2'`. It now renders as a Normal paragraph with a bold, 11pt run
(`wxRun('Notes',{b:true,sz:11})`), with no `w:pStyle` element.

---

## 20. Revision 20 — Sibling Reordering, Status Grouping, and New Report Tabs

*Last updated: 2026-07-08*

### 20.1 Sibling ordering and status grouping

Each node now carries an explicit ordered list of its children, rather than relying on
whatever order the nodes happened to be saved in. Within a given parent, siblings are
grouped in a fixed macro order — **Existing, then Removed, then New** — while preserving
the user's own custom order within each status group.

Up/down reorder controls appear on each tree row, letting the user move an item earlier
or later among its same-status siblings. The controls are disabled at the top/bottom of
that status group (an item cannot be reordered past a sibling with a different status).

This ordering is the single source of truth for sibling sequence everywhere in the
app — the tree, the Load Analysis Summary table (§6), Print Report (§13), and Word
export (§15–19) all reflect the same order and the same Existing → Removed → New
grouping.

Legacy save files (predating this revision) have their sibling order backfilled on load
from whatever order the nodes were previously stored in, so existing projects open with
their visual order unchanged.

### 20.2 AC/DC visual differentiation in the tree

DC-flagged tree rows are visually distinguished from AC rows with a background tint and
a left accent bar. This is a styling-only change — the tree is **not** structurally split
by AC/DC, since a conversion item's DC output can sit several levels beneath an AC
ancestor (e.g. a TRU's DC side under an AC bus); splitting the tree would break that
parent/child nesting and the "+ Child" workflow.

### 20.3 Power Distribution Summary (new tab)

A new read-only report, filtered to **Total Aircraft Load, Generation, Conversion, and
Distribution** items only — Circuit Breakers, Fuses, and terminal Loads are excluded.

Columns: **Capacity, Net Change, New Load, Remaining** (Existing Load and Load are
dropped from this report, since those columns are specific to Load-status rows).
Otherwise organized the same way as the Load Analysis Summary table (§6): AC/DC split
into separate sections, same indentation and section ordering rules.

### 20.4 Load Analysis Detail (new tab)

A new read-only report: one small table per non-Load item that has children, showing
just that item plus its immediate children, in the same column format as the current
Print Report configuration (§13).

Each table is preceded by a breadcrumb line showing the distribution path from the top
of that item's AC/DC system down to its immediate parent — e.g. `RH Main > Galley AC >`
for an item two levels under an AC bus, or `RH Main TRU > RH ACC #1 >` for an item past
a TRU conversion boundary onto a DC bus. The breadcrumb is omitted for root items and for
the entry point of each AC/DC system (an item whose immediate parent is on the other side
of a conversion boundary), since there is no useful same-system path to show for those.

Tables are presented in the same order the items appear in the Load Analysis Summary
table, grouped AC then DC (or DC then AC, matching whichever comes first at the root).

---

## 21. Revision 21 — Inline-Editable Existing/Removed and New Grids

*Last updated: 2026-07-09*

### 21.1 Overview

Two new tabs provide spreadsheet-style inline editing as an alternative to the Edit Item
(§7) and Add Item(s) (§8) dialogs for routine data entry — adding, editing, reordering,
duplicating, and deleting items without opening a modal for every change.

### 21.2 Existing/Removed tab

One row per item with status Existing or Removed, in the same hierarchical order as the
tree (§20.1).

**Editable columns:** Item Type, Description, Ref Des, Status, Efficiency, Power Factor,
then Capacity / Existing Load / Load column groups (same units per AC/DC as §6.1/§6.2).

Item Type changes are restricted to **same-shape swaps** — e.g. Bus ↔ Feeder, Generator
↔ Alternator ↔ Battery, Circuit Breaker ↔ Fuse. Type changes that would require
restructuring an item's capacity/load fields (switching into or out of a Load type or a
conversion role) are not offered in the grid.

Cells that don't apply to a given row (e.g. VA/VAR/pf for a DC item, or the Load columns
for a non-Load item) are shown disabled/dashed rather than hidden, so the column layout
stays consistent across rows.

**Row actions:** reorder (same up/down mechanism as the tree), **Duplicate**, **Delete**,
**+ Child** (opens the Add Item(s) dialog), and **Edit** (opens the full Edit Item
dialog, for Net Change Override and Notes/References — the two things this grid doesn't
expose inline). Duplicate and Delete prompt for confirmation when the item has children,
since both actions then apply to the entire branch — Duplicate deep-copies the item and
every descendant (with fresh internal identities); declining the prompt cancels the
action rather than falling back to a shallow copy.

### 21.3 New tab

Shows both **Existing**-status items (read-only, for context — so the user can see where
in the tree to attach a new item) and **New**-status items (fully editable). Status
cannot be changed from this grid in either direction.

**Editable columns for New rows:** Item Type (same restriction as §21.2), Description,
Ref Des, Efficiency, Power Factor, then Capacity / Load / Net Change column groups. Net
Change is a read-only computed display here (matching how it's shown in the Load
Analysis Summary table, §6), not a directly editable field.

### 21.4 Editing model

Edits commit immediately — changing a cell recalculates and re-renders right away, using
the same underlying calculation logic as the dialogs (no separate "apply"/"calculate"
step). A **Cancel** button reverts every change made since the tab was last opened (a
snapshot is taken each time the tab is entered); a **Save** button re-baselines that
snapshot.

### 21.5 AC/DC visual differentiation

Same tint/accent-bar treatment as the tree (§20.2), applied per grid row.

---

## 22. Revision 22 — Tab Reorganization, Voltage/AC-DC Grid Columns, DC Tint Intensity

*Last updated: 2026-07-11*

### 22.1 Tab reorganization

- **Power Distribution Summary** and **Load Analysis Detail** (§20.3–20.4) moved from
  top-level tabs to sub-tabs of the right-hand pane, positioned after Load Analysis
  Summary — alongside the Power Distribution Tree, which stays visible while viewing
  either report.
- **Existing/Removed** and **New** (§21) moved from right-hand-pane sub-tabs to
  top-level tabs, positioned next to Document. Full width; the Power Distribution Tree
  is hidden while either is active, matching the Document tab's existing layout.

### 22.2 Voltage and AC/DC columns in the Existing/Removed and New grids

Added immediately after the Status column, matching the Load Analysis Summary table's
column order (§6). Editability follows the same locking rules as the Edit Item and Add
Item(s) dialogs (§7.2/§8.4) exactly:

| Scenario | Volts | AC/DC |
|---|---|---|
| Parent exists; regular (non-conv) node | Locked to parent value | Locked to parent value |
| Conv IN node; parent exists | Locked to parent value | Locked to device type |
| Conv IN node; no parent | Editable | Locked to device type |
| Conv OUT node | Editable | Locked to device type |
| No parent (root); regular node | Editable | Editable |

In the New tab, Existing-status context rows force both columns read-only regardless of
the table above, consistent with every other column on those rows (§21.3).

### 22.3 DC row highlight intensity

Background tint opacity and accent-bar width increased in the Existing/Removed and New
grids specifically, to improve AC/DC differentiation. The tree's DC-row styling (§20.2)
is unchanged.

---

## 23. Future Enhancements

- Three-phase AC circuit support
- Multiple flight phases / scenarios (Takeoff, Cruise, Approach and Landing, Emergency,
  generator failure, etc.)
- Load intervals (instantaneous, 5-sec, 5-min, 15-min, continuous)
- Print settings: user-defined rounding schedule
- Restrict Watts-Up-exclusive sections in the Word document so users can adjust formatting
  but cannot overwrite generated content (references list, analysis tables). Mechanism:
  `<w:lock w:val="sdtContentLocked"/>` on the relevant content controls, optionally combined
  with `<w:documentProtection>` allowing formatting-only changes in those regions.
- Incorporate the Power Distribution Summary and Load Analysis Detail reports (§20.3–20.4)
  into the Word document export.
